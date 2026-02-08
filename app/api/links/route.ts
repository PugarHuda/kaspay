import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { paymentLinks } from "@/lib/db/schema";
import { verifyToken, extractTokenFromHeader } from "@/lib/auth/jwt";
import { generateSlug } from "@/lib/utils";
import { z } from "zod";

const createLinkSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().optional(),
  amount: z.number().positive(),
  currency: z.enum(["KAS", "USD"]).default("KAS"),
  redirectUrl: z.string().url().optional().or(z.literal("")),
  successMessage: z.string().optional(),
  expiryMinutes: z.number().int().min(5).max(1440).default(30),
  expiresAt: z.string().datetime().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const token = extractTokenFromHeader(req.headers.get("authorization"));
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = verifyToken(token);
    const body = await req.json();
    const data = createLinkSchema.parse(body);

    const slug = generateSlug(data.title);

    const [link] = await db
      .insert(paymentLinks)
      .values({
        userId: payload.userId,
        title: data.title,
        description: data.description,
        amount: data.amount.toString(),
        currency: data.currency,
        slug,
        redirectUrl: data.redirectUrl || null,
        successMessage: data.successMessage,
        expiryMinutes: data.expiryMinutes,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
      })
      .returning();

    return NextResponse.json({
      ...link,
      url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/pay/${link.slug}`,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Create link error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const token = extractTokenFromHeader(req.headers.get("authorization"));
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = verifyToken(token);

    const links = await db.query.paymentLinks.findMany({
      where: (paymentLinks, { eq }) =>
        eq(paymentLinks.userId, payload.userId),
      orderBy: (paymentLinks, { desc }) => [desc(paymentLinks.createdAt)],
    });

    return NextResponse.json({ data: links });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
