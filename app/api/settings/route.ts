import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { verifyToken, extractTokenFromHeader } from "@/lib/auth/jwt";
import { eq } from "drizzle-orm";
import { z } from "zod";

const updateSettingsSchema = z.object({
  paymentExpiry: z.number().int().min(5).max(1440),
});

export async function PATCH(req: NextRequest) {
  try {
    const token = extractTokenFromHeader(req.headers.get("authorization"));
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = verifyToken(token);
    const body = await req.json();
    const { paymentExpiry } = updateSettingsSchema.parse(body);

    const [updated] = await db
      .update(users)
      .set({ paymentExpiry, updatedAt: new Date() })
      .where(eq(users.id, payload.userId))
      .returning();

    return NextResponse.json({
      paymentExpiry: updated.paymentExpiry,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid value", details: error.issues },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
