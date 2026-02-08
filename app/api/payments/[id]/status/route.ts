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
      const expectedAmount = parseFloat(payment.amountExpected);
      const expectedSompi = Math.round(expectedAmount * 1e8);
      const initialBalance = parseFloat(payment.initialBalance || "0");

      // Fetch UTXOs and try exact amount matching first (most reliable)
      const utxos = await kaspaAPI.getUtxosByAddress(payment.kaspaAddress);

      // Try to find a UTXO matching the exact expected sompi amount
      const matchingUtxo = utxos.find((u: any) => {
        const utxoAmount = parseInt(u.utxoEntry?.amount || "0");
        return utxoAmount === expectedSompi;
      });

      // Fallback: check total balance if no exact UTXO match
      let confirmed = false;
      let txId = "";
      let amountReceived = 0;

      if (matchingUtxo) {
        // Exact UTXO match — this is definitely our payment
        confirmed = true;
        txId = matchingUtxo.outpoint?.transactionId || "";
        amountReceived = expectedAmount;
        console.log(
          `[Payment ${payment.id.slice(0, 8)}] UTXO match! ${expectedSompi} sompi, txId=${txId}`
        );
      } else {
        // Fallback: balance-based check (for legacy payments without nonce)
        const balance = await kaspaAPI.getBalance(payment.kaspaAddress);
        const requiredBalance = initialBalance + expectedAmount;

        console.log(
          `[Payment ${payment.id.slice(0, 8)}] balance=${balance} KAS, initial=${initialBalance} KAS, expected=${expectedAmount} KAS, required=${requiredBalance} KAS`
        );

        if (balance >= requiredBalance && utxos.length > 0) {
          confirmed = true;
          txId = utxos[0]?.outpoint?.transactionId || utxos[0]?.transactionId || "";
          amountReceived = balance - initialBalance;
        }
      }

      if (confirmed) {
        console.log(`[Payment ${payment.id.slice(0, 8)}] CONFIRMED! txId=${txId}`);

        // Fetch sender address from transaction inputs
        let senderAddress = "";
        if (txId) {
          try {
            const tx = await kaspaAPI.getTransaction(txId);
            senderAddress =
              tx.inputs?.[0]?.previous_outpoint_address ||
              tx.inputs?.[0]?.previousOutpointAddress ||
              "";
          } catch (err) {
            console.error("Failed to fetch sender address:", err);
          }
        }

        // Update payment record
        await db
          .update(payments)
          .set({
            status: "confirmed",
            amountReceived: amountReceived.toString(),
            senderAddress: senderAddress || null,
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
            amountReceived: amountReceived.toString(),
            kaspaAddress: payment.kaspaAddress,
            senderAddress: senderAddress || null,
            txId,
            customerEmail: payment.customerEmail,
            customerName: payment.customerName,
            confirmedAt: new Date().toISOString(),
          },
        }).catch((err) =>
          console.error("Webhook delivery error:", err)
        );

        return NextResponse.json({
          id: payment.id,
          status: "confirmed",
          amountReceived,
          senderAddress: senderAddress || null,
          txId,
          confirmations: 1,
          confirmedAt: new Date(),
        });
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
