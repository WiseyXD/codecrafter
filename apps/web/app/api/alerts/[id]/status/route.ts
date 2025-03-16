import { NextRequest, NextResponse } from "next/server";
import { PrismaClient, AlertStatus } from "@prisma/client";
import { auth } from "@/auth";

const prisma = new PrismaClient();

// Define params as a Promise type for segmentData structure
type Params = Promise<{ id: string }>;

type RequestBody = {
  status: AlertStatus;
  comment?: string;
};

export async function PATCH(
  request: NextRequest,
  segmentData: { params: Params },
): Promise<NextResponse> {
  // Correctly await the Promise params
  const params = await segmentData.params;
  const { id } = params;

  try {
    // Get the authenticated user session
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse the request body
    const body = (await request.json()) as RequestBody;
    const { status, comment } = body;

    // Validate the status (using type from Prisma client)
    if (
      !status ||
      !["UNRESOLVED", "INVESTIGATING", "RESOLVED"].includes(status)
    ) {
      return NextResponse.json(
        { error: "Invalid status value" },
        { status: 400 },
      );
    }

    // Update the alert status
    const updatedAlert = await prisma.alert.update({
      where: { id },
      data: { status },
    });

    // Create an action record for this status change
    await prisma.action.create({
      data: {
        alertId: id,
        actionType: "STATUS_CHANGE",
        description: comment || `Alert status changed to ${status}`,
        performedBy: session.user.email || "Unknown user",
      },
    });

    return NextResponse.json(updatedAlert);
  } catch (error) {
    console.error("Error updating alert status:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Failed to update alert status";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
