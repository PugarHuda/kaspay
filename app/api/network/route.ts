import { NextResponse } from "next/server";
import { kaspaAPI } from "@/lib/kaspa/rpc";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [blockdag, network] = await Promise.all([
      kaspaAPI.getBlockDagInfo(),
      kaspaAPI.getNetworkInfo(),
    ]);

    return NextResponse.json({
      blockCount: blockdag.blockCount,
      headerCount: blockdag.headerCount,
      difficulty: blockdag.difficulty,
      pastMedianTime: blockdag.pastMedianTime,
      virtualDaaScore: blockdag.virtualDaaScore,
      networkName: network.networkName || blockdag.networkName,
      subnetworkId: network.subnetworkId,
    });
  } catch (error) {
    console.error("Network stats error:", error);
    return NextResponse.json(
      { error: "Failed to fetch network stats" },
      { status: 500 }
    );
  }
}
