// app/api/alerts/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@repo/db";

type Params = Promise<{ id: string }>;

export async function GET(
  request: NextRequest,
  segmentData: { params: Params },
): Promise<NextResponse> {
  const params = await segmentData.params;
  const { id } = params;

  try {
    const alert = await prisma.alert.findUnique({
      where: { id },
      include: {
        zone: true,
        city: true,
        sensors: true,
        sensorData: {
          orderBy: { timestamp: "desc" },
          take: 100,
        },
        actions: {
          orderBy: { timestamp: "desc" },
        },
      },
    });

    if (!alert) {
      return NextResponse.json({ error: "Alert not found" }, { status: 404 });
    }

    return NextResponse.json(alert);
  } catch (error) {
    console.error("Error fetching alert:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Failed to fetch alert data";

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
