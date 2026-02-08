import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { paymentLinks } from "@/lib/db/schema";
import { verifyToken, extractTokenFromHeader } from "@/lib/auth/jwt";
import { eq, and } from "drizzle-orm";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = extractTokenFromHeader(req.headers.get("authorization"));
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = verifyToken(token);

    const link = await db.query.paymentLinks.findFirst({
      where: (paymentLinks, { eq, and }) =>
        and(
          eq(paymentLinks.id, params.id),
          eq(paymentLinks.userId, payload.userId)
        ),
      with: { payments: true },
    });

    if (!link) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json(link);
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = extractTokenFromHeader(req.headers.get("authorization"));
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = verifyToken(token);
    const body = await req.json();

    const [updated] = await db
      .update(paymentLinks)
      .set({
        ...(body.title && { title: body.title }),
        ...(body.description !== undefined && { description: body.description }),
        ...(body.status && { status: body.status }),
        ...(body.redirectUrl !== undefined && { redirectUrl: body.redirectUrl }),
        ...(body.amount !== undefined && { amount: body.amount.toString() }),
        ...(body.currency && { currency: body.currency }),
        ...(body.successMessage !== undefined && { successMessage: body.successMessage }),
        ...(body.expiryMinutes !== undefined && { expiryMinutes: body.expiryMinutes }),
        ...(body.customerName !== undefined && { customerName: body.customerName || null }),
        ...(body.customerEmail !== undefined && { customerEmail: body.customerEmail || null }),
      })
      .where(
        and(
          eq(paymentLinks.id, params.id),
          eq(paymentLinks.userId, payload.userId)
        )
      )
      .returning();

    if (!updated) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = extractTokenFromHeader(req.headers.get("authorization"));
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = verifyToken(token);

    const [deleted] = await db
      .update(paymentLinks)
      .set({ status: "inactive" })
      .where(
        and(
          eq(paymentLinks.id, params.id),
          eq(paymentLinks.userId, payload.userId)
        )
      )
      .returning();

    if (!deleted) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
