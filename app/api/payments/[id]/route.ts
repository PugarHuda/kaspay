import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const payment = await db.query.payments.findFirst({
      where: (payments, { eq }) => eq(payments.id, params.id),
      with: {
        paymentLink: {
          columns: { title: true, description: true, currency: true },
        },
      },
    });

    if (!payment) {
      return NextResponse.json(
        { error: "Payment not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      id: payment.id,
      status: payment.status,
      amountExpected: payment.amountExpected,
      amountReceived: payment.amountReceived,
      kaspaAddress: payment.kaspaAddress,
      senderAddress: payment.senderAddress,
      txId: payment.txId,
      customerName: payment.customerName,
      customerEmail: payment.customerEmail,
      confirmedAt: payment.confirmedAt,
      createdAt: payment.createdAt,
      expiresAt: payment.expiresAt,
      title: payment.paymentLink?.title || "Payment",
      description: payment.paymentLink?.description,
      currency: payment.paymentLink?.currency || "KAS",
    });
  } catch (error) {
    console.error("Get payment error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
