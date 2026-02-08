import { NextResponse } from "next/server";
import { getKaspaPrice } from "@/lib/kaspa/rpc";

export async function GET() {
  try {
    const price = await getKaspaPrice();
    return NextResponse.json({ price, currency: "USD" });
  } catch {
    return NextResponse.json({ error: "Failed to fetch price" }, { status: 500 });
  }
}
