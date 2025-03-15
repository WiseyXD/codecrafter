// app/api/zones/default/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@repo/db";

export async function GET(request: NextRequest) {
  try {
    // Get cityId from query parameters
    const searchParams = request.nextUrl.searchParams;
    const cityId = searchParams.get("cityId");

    if (!cityId) {
      return NextResponse.json(
        { error: "cityId is required" },
        { status: 400 },
      );
    }

    // Try to find an existing zone
    const zone = await prisma.zone.findFirst({
      where: { cityId },
      orderBy: { createdAt: "asc" },
    });

    // If we found a zone, return it
    if (zone) {
      return NextResponse.json({
        success: true,
        zoneId: zone.id,
        name: zone.name,
        isNew: false,
      });
    }

    // Otherwise, create a default zone
    const newZone = await prisma.zone.create({
      data: {
        name: "Default Zone",
        description: "Automatically created for security monitoring",
        status: "ACTIVE", // Make sure this matches your enum values
        cityId,
      },
    });

    return NextResponse.json({
      success: true,
      zoneId: newZone.id,
      name: newZone.name,
      isNew: true,
    });
  } catch (error) {
    console.error("Error in default zone API:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    );
  }
}
