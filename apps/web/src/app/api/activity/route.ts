import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getActivityLogs, ActivityAction } from "@/lib/activity";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const offset = parseInt(searchParams.get("offset") || "0", 10);
    const action = searchParams.get("action") as ActivityAction | null;

    const logs = await getActivityLogs(userId, { limit, offset, action: action || undefined });

    return NextResponse.json({ logs });
  } catch (error: unknown) {
    console.error("Error fetching activity logs:", error);
    return NextResponse.json(
      { error: "Failed to fetch activity logs" },
      { status: 500 }
    );
  }
}