// app/api/onboarding/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@repo/db";
import { z } from "zod";
import { auth } from "@/auth";

// Validation schema for onboarding form
const onboardingSchema = z.object({
  // City Information
  cityName: z.string().min(1, "City name is required"),
  region: z.string().optional(),
  country: z.string().min(1, "Country is required"),
  population: z.string().optional(),

  // Admin Information
  adminName: z.string().min(1, "Admin name is required"),
  adminEmail: z.string().email("Invalid email address"),
  adminPhone: z.string().optional(),
  adminDepartment: z.string().min(1, "Department is required"),

  // System Configuration
  securityZones: z.array(
    z.object({
      id: z.string(),
      name: z.string().min(1, "Zone name is required"),
      description: z.string().optional(),
      priority: z.enum(["low", "medium", "high"]),
    }),
  ),
  initialSensors: z.string(),
  monitoringHours: z.string(),

  // Confirmation
  agreeToTerms: z.boolean().refine((val) => val === true, {
    message: "You must agree to the terms and conditions",
  }),
  notificationType: z.enum(["email", "sms", "both"]),
});

export async function POST(req: NextRequest) {
  try {
    // Get authenticated user
    const session = await auth();

    if (!session?.user || !session.user.email) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    // We now have the user ID directly from the session
    const userId = session.user.id;

    if (!userId) {
      return NextResponse.json(
        { error: "User ID not found in session" },
        { status: 401 },
      );
    }

    // Double-check user exists and fetch role/onboarding status
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        role: true,
        isOnboarded: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.role !== "ADMIN" && user.role !== "SYSTEM_ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized. Only admins can complete onboarding" },
        { status: 403 },
      );
    }

    if (user.isOnboarded) {
      return NextResponse.json(
        { error: "User has already completed onboarding" },
        { status: 400 },
      );
    }

    // Parse request body
    const body = await req.json();

    // Validate form data
    const validationResult = onboardingSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Invalid form data",
          details: validationResult.error.format(),
        },
        { status: 400 },
      );
    }

    const { cityName, region, country, securityZones, adminName, adminEmail } =
      validationResult.data;

    // Create all records in a transaction to ensure data consistency
    const result = await prisma.$transaction(async (tx) => {
      // Create the city record
      const city = await tx.city.create({
        data: {
          name: cityName,
          region,
          country,
        },
      });

      // Create security zones for the city
      const zonePromises = securityZones.map((zone) =>
        tx.zone.create({
          data: {
            name: zone.name,
            description: zone.description || "",
            status: "ACTIVE", // Default to active
            cityId: city.id,
          },
        }),
      );

      const createdZones = await Promise.all(zonePromises);

      // Update the user record, setting isOnboarded to true and linking to city
      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: {
          name: adminName,
          email: adminEmail,
          isOnboarded: true,
          cityId: city.id,
        },
      });

      return {
        city,
        zones: createdZones,
        user: updatedUser,
      };
    });

    return NextResponse.json(
      {
        success: true,
        message: "Onboarding completed successfully",
        data: {
          cityId: result.city.id,
          zoneCount: result.zones.length,
          isOnboarded: result.user.isOnboarded,
        },
      },
      { status: 201 },
    );
  } catch (error: any) {
    console.error("Onboarding error:", error);
    return NextResponse.json(
      { error: "Failed to complete onboarding", details: error.message },
      { status: 500 },
    );
  }
}

// GET endpoint to check onboarding status
export async function GET(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user || !session.user.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    const userId = session.user.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        isOnboarded: true,
        role: true,
        city: {
          select: {
            id: true,
            name: true,
            country: true,
            zones: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      isOnboarded: user.isOnboarded,
      role: user.role,
      city: user.city,
    });
  } catch (error) {
    console.error("Error checking onboarding status:", error);
    return NextResponse.json(
      { error: "Failed to check onboarding status" },
      { status: 500 },
    );
  }
}
