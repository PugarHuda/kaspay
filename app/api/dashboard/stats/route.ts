import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { payments, paymentLinks } from "@/lib/db/schema";
import { verifyToken, extractTokenFromHeader } from "@/lib/auth/jwt";
import { eq, sql, and, gte } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const token = extractTokenFromHeader(req.headers.get("authorization"));
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = verifyToken(token);

    // Get total payments count and volume
    const [totals] = await db
      .select({
        totalPayments: sql<number>`count(*)::int`,
        totalVolume: sql<string>`coalesce(sum(${payments.amountReceived}::numeric), 0)`,
        confirmedPayments: sql<number>`count(*) filter (where ${payments.status} = 'confirmed')::int`,
        pendingPayments: sql<number>`count(*) filter (where ${payments.status} = 'pending')::int`,
      })
      .from(payments)
      .where(eq(payments.userId, payload.userId));

    // Get active payment links count
    const [linkStats] = await db
      .select({
        totalLinks: sql<number>`count(*)::int`,
        activeLinks: sql<number>`count(*) filter (where ${paymentLinks.status} = 'active')::int`,
      })
      .from(paymentLinks)
      .where(eq(paymentLinks.userId, payload.userId));

    // Get recent payments (last 30 days, grouped by day)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const dailyPayments = await db
      .select({
        date: sql<string>`date_trunc('day', ${payments.createdAt})::date::text`,
        count: sql<number>`count(*)::int`,
        volume: sql<string>`coalesce(sum(${payments.amountReceived}::numeric), 0)`,
      })
      .from(payments)
      .where(
        and(
          eq(payments.userId, payload.userId),
          gte(payments.createdAt, thirtyDaysAgo)
        )
      )
      .groupBy(sql`date_trunc('day', ${payments.createdAt})`)
      .orderBy(sql`date_trunc('day', ${payments.createdAt})`);

    // Get recent payments list
    const recentPayments = await db.query.payments.findMany({
      where: (payments, { eq }) => eq(payments.userId, payload.userId),
      orderBy: (payments, { desc }) => [desc(payments.createdAt)],
      limit: 10,
      with: { paymentLink: true },
    });

    return NextResponse.json({
      totals: {
        totalPayments: totals.totalPayments,
        totalVolume: totals.totalVolume,
        confirmedPayments: totals.confirmedPayments,
        pendingPayments: totals.pendingPayments,
      },
      links: {
        totalLinks: linkStats.totalLinks,
        activeLinks: linkStats.activeLinks,
      },
      dailyPayments,
      recentPayments,
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
