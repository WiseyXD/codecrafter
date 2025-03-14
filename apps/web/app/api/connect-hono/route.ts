import { NextRequest, NextResponse } from "next/server";
import { auth } from "../../../auth";

export async function GET(request: NextRequest) {
  const honoUrl = process.env.NEXT_PUBLIC_BACKEND_URL_LOCAL;
  const session: any = await auth();
  const newToken = session?.user?.jwt!;

  if (!honoUrl) {
    throw new Error("Backend URL is not defined in environment variables.");
  }

  try {
    const honoResponse = await fetch(`${honoUrl}/auth/protected`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${newToken}`,
        Accept: "application/json",
      },
    });

    const contentType = honoResponse.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      const data = await honoResponse.json();
      return NextResponse.json(data);
    } else {
      const errorText = await honoResponse.text();
      console.error("Non-JSON response from Hono backend:", errorText);
      return NextResponse.json(
        { error: errorText },
        { status: honoResponse.status },
      );
    }
  } catch (error: any) {
    console.error("Error fetching from Hono backend:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
