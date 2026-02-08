import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { verifyToken, extractTokenFromHeader } from "@/lib/auth/jwt";
import { eq } from "drizzle-orm";
import { z } from "zod";

const updateSettingsSchema = z.object({
  paymentExpiry: z.number().int().min(5).max(1440).optional(),
  kaspaAddress: z.string().min(40).refine(
    (addr) => addr.startsWith("kaspa:") || addr.startsWith("kaspatest:"),
    { message: "Must be a valid Kaspa address (kaspa: or kaspatest:)" }
  ).optional(),
});

export async function PATCH(req: NextRequest) {
  try {
    const token = extractTokenFromHeader(req.headers.get("authorization"));
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = verifyToken(token);
    const body = await req.json();
    const data = updateSettingsSchema.parse(body);

    const updateFields: Record<string, any> = { updatedAt: new Date() };
    if (data.paymentExpiry !== undefined) updateFields.paymentExpiry = data.paymentExpiry;
    if (data.kaspaAddress !== undefined) updateFields.kaspaAddress = data.kaspaAddress;

    const [updated] = await db
      .update(users)
      .set(updateFields)
      .where(eq(users.id, payload.userId))
      .returning();

    return NextResponse.json({
      paymentExpiry: updated.paymentExpiry,
      kaspaAddress: updated.kaspaAddress,
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
