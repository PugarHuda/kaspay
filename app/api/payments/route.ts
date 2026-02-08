import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { payments } from "@/lib/db/schema";
import { verifyToken, extractTokenFromHeader } from "@/lib/auth/jwt";
import { z } from "zod";
import { and, eq, gt } from "drizzle-orm";

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

    // Check for an existing pending payment for this link that hasn't expired
    const existingPayment = await db.query.payments.findFirst({
      where: (payments, { eq, and, gt }) =>
        and(
          eq(payments.paymentLinkId, link.id),
          eq(payments.status, "pending"),
          gt(payments.expiresAt, new Date())
        ),
      orderBy: (payments, { desc }) => [desc(payments.createdAt)],
    });

    if (existingPayment) {
      // Return existing pending payment instead of creating a new one
      return NextResponse.json({
        id: existingPayment.id,
        kaspaAddress: existingPayment.kaspaAddress,
        amountExpected: existingPayment.amountExpected,
        expiresAt: existingPayment.expiresAt,
        status: existingPayment.status,
        title: link.title,
        description: link.description,
      });
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

    // Create payment record - use merchant's address directly
    const [payment] = await db
      .insert(payments)
      .values({
        paymentLinkId: link.id,
        userId: link.userId,
        kaspaAddress: merchant.kaspaAddress,
        amountExpected: link.amount,
        customerEmail,
        customerName,
        metadata,
        expiresAt: new Date(Date.now() + 3600000), // 1 hour
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
