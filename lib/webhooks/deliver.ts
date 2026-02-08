import crypto from "crypto";
import { db } from "@/lib/db";
import { webhooks, webhookLogs } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

interface WebhookPayload {
  event: string;
  payment: {
    id: string;
    status: string;
    amountExpected: string;
    amountReceived: string | null;
    kaspaAddress: string;
    senderAddress: string | null;
    txId: string | null;
    customerName: string | null;
    customerEmail: string | null;
    confirmedAt: string | null;
  };
}

function signPayload(payload: string, secret: string): string {
  return crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("hex");
}

export async function deliverWebhooks(
  userId: string,
  paymentId: string,
  payload: WebhookPayload
) {
  // Get all active webhooks for this user that listen to this event
  const userWebhooks = await db.query.webhooks.findMany({
    where: (wh, { eq, and }) =>
      and(eq(wh.userId, userId), eq(wh.isActive, true)),
  });

  const jsonPayload = JSON.stringify(payload);

  for (const webhook of userWebhooks) {
    // Check if webhook listens to this event
    if (!webhook.events.includes(payload.event) && !webhook.events.includes("*")) {
      continue;
    }

    const signature = signPayload(jsonPayload, webhook.secret);

    try {
      const response = await fetch(webhook.url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-KasPay-Signature": signature,
          "X-KasPay-Event": payload.event,
        },
        body: jsonPayload,
        signal: AbortSignal.timeout(10000), // 10s timeout
      });

      // Log the delivery
      await db.insert(webhookLogs).values({
        webhookId: webhook.id,
        paymentId,
        event: payload.event,
        payload: payload as any,
        statusCode: response.status,
        response: await response.text().catch(() => ""),
      });
    } catch (error: any) {
      // Log the failure
      await db.insert(webhookLogs).values({
        webhookId: webhook.id,
        paymentId,
        event: payload.event,
        payload: payload as any,
        error: error.message || "Unknown error",
      });
    }
  }
}
