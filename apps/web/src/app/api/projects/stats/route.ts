import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    const [totalProjects, runningDeployments, successfulDeployments, failedDeployments, recentDeployments] = await Promise.all([
      prisma.project.count({ where: { userId } }),
      prisma.deployment.count({
        where: { project: { userId }, status: "RUNNING" },
      }),
      prisma.deployment.count({
        where: { project: { userId }, status: "RUNNING" },
      }),
      prisma.deployment.count({
        where: { project: { userId }, status: "FAILED" },
      }),
      prisma.deployment.findMany({
        where: { project: { userId } },
        orderBy: { createdAt: "desc" },
        take: 10,
        select: { status: true },
      }),
    ]);

    const totalDeployments = recentDeployments.length;
    const successRate = totalDeployments > 0
      ? Math.round((successfulDeployments / totalDeployments) * 100)
      : 0;

    return NextResponse.json({
      totalProjects,
      activeProjects: runningDeployments,
      totalDeployments,
      successfulDeployments,
      failedDeployments,
      successRate,
    });
  } catch (error: unknown) {
    console.error("Error fetching project stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch project stats" },
      { status: 500 }
    );
  }
}