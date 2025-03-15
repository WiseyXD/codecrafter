// app/api/user/city/route.ts
import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@repo/db";

export async function GET(request: NextRequest) {
  try {
    // Get authenticated session
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get email from query params or use session email
    const searchParams = request.nextUrl.searchParams;
    const email = searchParams.get("email") || session.user.email;

    // Get user's city
    const user = await prisma.user.findUnique({
      where: { email },
      select: { cityId: true },
    });

    if (!user || !user.cityId) {
      return NextResponse.json(
        { error: "User has no assigned city" },
        { status: 404 },
      );
    }

    return NextResponse.json({ cityId: user.cityId });
  } catch (error) {
    console.error("Error fetching user city:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
