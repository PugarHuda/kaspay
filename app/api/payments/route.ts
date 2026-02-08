import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { payments } from "@/lib/db/schema";
import { verifyToken, extractTokenFromHeader } from "@/lib/auth/jwt";
import { z } from "zod";
import { and, eq, gt } from "drizzle-orm";
import { usdToKas, kaspaAPI } from "@/lib/kaspa/rpc";

const createPaymentSchema = z.object({
  paymentLinkSlug: z.string(),
  customerEmail: z.string().email().optional(),
  customerName: z.string().optional(),
  metadata: z.record(z.string(), z.any()).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { paymentLinkSlug, customerEmail, customerName, metadata } =
      createPaymentSchema.parse(body);

    // Get payment link
    const link = await db.query.paymentLinks.findFirst({
      where: (paymentLinks, { eq }) => eq(paymentLinks.slug, paymentLinkSlug),
    });

    if (!link) {
      return NextResponse.json(
        { error: "Payment link not found" },
        { status: 404 }
      );
    }

    if (link.status !== "active") {
      return NextResponse.json(
        { error: "Payment link is not active" },
        { status: 400 }
      );
    }

    if (link.expiresAt && new Date(link.expiresAt) < new Date()) {
      return NextResponse.json(
        { error: "Payment link has expired" },
        { status: 400 }
      );
    }

    // Check for the most recent payment for this link (any status)
    const existingPayment = await db.query.payments.findFirst({
      where: (payments, { eq }) => eq(payments.paymentLinkId, link.id),
      orderBy: (payments, { desc }) => [desc(payments.createdAt)],
    });

    if (existingPayment) {
      let status = existingPayment.status;

      // Mark as expired if time has passed
      if (status === "pending" && existingPayment.expiresAt && new Date(existingPayment.expiresAt) < new Date()) {
        status = "expired";
        await db
          .update(payments)
          .set({ status: "expired" })
          .where(eq(payments.id, existingPayment.id));
      }

      // Return existing payment if still pending or already confirmed/expired
      if (status === "pending" || status === "confirmed" || status === "expired") {
        return NextResponse.json({
          id: existingPayment.id,
          kaspaAddress: existingPayment.kaspaAddress,
          amountExpected: existingPayment.amountExpected,
          expiresAt: existingPayment.expiresAt,
          status,
          title: link.title,
          description: link.description,
          currency: link.currency,
          originalUsdAmount: link.currency === "USD" ? link.amount : null,
          successMessage: link.successMessage,
          redirectUrl: link.redirectUrl,
          txId: existingPayment.txId,
          confirmedAt: existingPayment.confirmedAt,
        });
      }
    }

    // Get merchant's Kaspa address
    const merchant = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.id, link.userId),
    });

    if (!merchant) {
      return NextResponse.json(
        { error: "Merchant not found" },
        { status: 404 }
      );
    }

    // If link is priced in USD, convert to KAS at current rate
    let amountInKas = link.amount;
    let originalUsdAmount: string | null = null;

    if (link.currency === "USD") {
      const usdAmount = parseFloat(link.amount);
      const kasAmount = await usdToKas(usdAmount);
      if (kasAmount <= 0) {
        return NextResponse.json(
          { error: "Unable to fetch KAS/USD price for conversion" },
          { status: 503 }
        );
      }
      originalUsdAmount = link.amount;
      amountInKas = kasAmount.toFixed(8);
    }

    // Fetch current balance so we can detect new incoming funds
    let initialBalance = "0";
    try {
      const bal = await kaspaAPI.getBalance(merchant.kaspaAddress);
      initialBalance = bal.toString();
    } catch {
      // default to 0 if can't fetch
    }

    // Create payment record - use merchant's address directly
    const [payment] = await db
      .insert(payments)
      .values({
        paymentLinkId: link.id,
        userId: link.userId,
        kaspaAddress: merchant.kaspaAddress,
        amountExpected: amountInKas,
        initialBalance,
        customerEmail,
        customerName,
        metadata,
        expiresAt: new Date(Date.now() + (link.expiryMinutes || merchant.paymentExpiry || 30) * 60000),
      })
      .returning();

    return NextResponse.json({
      id: payment.id,
      kaspaAddress: payment.kaspaAddress,
      amountExpected: payment.amountExpected,
      expiresAt: payment.expiresAt,
      status: payment.status,
      title: link.title,
      description: link.description,
      currency: link.currency,
      originalUsdAmount,
      successMessage: link.successMessage,
      redirectUrl: link.redirectUrl,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Create payment error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// GET - List payments for authenticated merchant
export async function GET(req: NextRequest) {
  try {
    const token = extractTokenFromHeader(req.headers.get("authorization"));
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = verifyToken(token);

    const userPayments = await db.query.payments.findMany({
      where: (payments, { eq }) => eq(payments.userId, payload.userId),
      orderBy: (payments, { desc }) => [desc(payments.createdAt)],
      with: { paymentLink: true },
    });

    return NextResponse.json({ data: userPayments });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
