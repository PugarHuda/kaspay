import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { payments } from "@/lib/db/schema";
import { kaspaAPI } from "@/lib/kaspa/rpc";
import { deliverWebhooks } from "@/lib/webhooks/deliver";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const payment = await db.query.payments.findFirst({
      where: (payments, { eq }) => eq(payments.id, params.id),
    });

    if (!payment) {
      return NextResponse.json(
        { error: "Payment not found" },
        { status: 404 }
      );
    }

    // If already confirmed, return immediately (no more API calls)
    if (payment.status === "confirmed") {
      return NextResponse.json({
        id: payment.id,
        status: "confirmed",
        amountReceived: payment.amountReceived,
        txId: payment.txId,
        confirmedAt: payment.confirmedAt,
      });
    }

    // If already expired, return immediately
    if (payment.status === "expired") {
      return NextResponse.json({
        id: payment.id,
        status: "expired",
      });
    }

    // Check if expired by time
    if (payment.expiresAt && new Date(payment.expiresAt) < new Date()) {
      await db
        .update(payments)
        .set({ status: "expired" })
        .where(eq(payments.id, payment.id));

      return NextResponse.json({
        id: payment.id,
        status: "expired",
      });
    }

    // Only check blockchain if still pending
    try {
      const balance = await kaspaAPI.getBalance(payment.kaspaAddress);
      const expectedAmount = parseFloat(payment.amountExpected);

      console.log(
        `[Payment ${payment.id.slice(0, 8)}] balance=${balance} KAS, expected=${expectedAmount} KAS`
      );

      if (balance >= expectedAmount) {
        const utxos = await kaspaAPI.getUtxosByAddress(payment.kaspaAddress);

        if (utxos.length > 0) {
          const txId =
            utxos[0]?.outpoint?.transactionId || utxos[0]?.transactionId || "";

          console.log(`[Payment ${payment.id.slice(0, 8)}] CONFIRMED! txId=${txId}`);

          // Update payment record
          await db
            .update(payments)
            .set({
              status: "confirmed",
              amountReceived: balance.toString(),
              txId,
              confirmations: 1,
              confirmedAt: new Date(),
            })
            .where(eq(payments.id, payment.id));

          // Deliver webhooks (async, don't block response)
          deliverWebhooks(payment.userId, payment.id, {
            event: "payment.confirmed",
            payment: {
              id: payment.id,
              status: "confirmed",
              amountExpected: payment.amountExpected,
              amountReceived: balance.toString(),
              kaspaAddress: payment.kaspaAddress,
              txId,
              customerEmail: payment.customerEmail,
              confirmedAt: new Date().toISOString(),
            },
          }).catch((err) =>
            console.error("Webhook delivery error:", err)
          );

          return NextResponse.json({
            id: payment.id,
            status: "confirmed",
            amountReceived: balance,
            txId,
            confirmations: 1,
            confirmedAt: new Date(),
          });
        }
      }
    } catch (error) {
      console.error("Error checking blockchain:", error);
    }

    // Still pending
    return NextResponse.json({
      id: payment.id,
      status: "pending",
      amountExpected: payment.amountExpected,
    });
  } catch (error) {
    console.error("Get payment status error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
