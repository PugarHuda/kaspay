import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { hashPassword, generateToken } from "@/lib/auth/jwt";
import { z } from "zod";

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().optional(),
  kaspaAddress: z
    .string()
    .refine(
      (addr) =>
        (addr.startsWith("kaspa:") || addr.startsWith("kaspatest:")) &&
        addr.length > 40,
      { message: "Invalid Kaspa address" }
    ),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, name, kaspaAddress } = registerSchema.parse(body);

    const existingUser = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.email, email),
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 400 }
      );
    }

    const passwordHash = await hashPassword(password);

    const [newUser] = await db
      .insert(users)
      .values({ email, passwordHash, name, kaspaAddress })
      .returning();

    const token = generateToken({
      userId: newUser.id,
      email: newUser.email,
    });

    return NextResponse.json({
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        kaspaAddress: newUser.kaspaAddress,
        apiKey: newUser.apiKey,
      },
      token,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
