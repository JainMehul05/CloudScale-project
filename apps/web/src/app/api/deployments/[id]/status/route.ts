import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function checkDeploymentOwnership(deploymentId: string, userId: string) {
  const deployment = await prisma.deployment.findUnique({
    where: { id: deploymentId },
    include: { project: { select: { userId: true } } },
  });
  return deployment?.project.userId === userId ? deployment : null;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: deploymentId } = await params;

    const deployment = await checkDeploymentOwnership(deploymentId, session.user.id);
    if (!deployment) {
      return NextResponse.json({ error: "Deployment not found or access denied" }, { status: 404 });
    }

    const progressMap: Record<string, number> = {
      QUEUED: 0,
      VALIDATING: 20,
      CLONING: 35,
      DETECTING: 50,
      BUILDING: 70,
      STARTING: 85,
      HEALTH_CHECK: 95,
      RUNNING: 100,
      FAILED: -1,
      STOPPED: -1,
    };

    const stageMessages: Record<string, string> = {
      QUEUED: "Queued, waiting for worker...",
      VALIDATING: "Validating repository URL...",
      CLONING: "Cloning repository...",
      DETECTING: "Detecting framework...",
      BUILDING: "Building Docker image...",
      STARTING: "Starting container...",
      HEALTH_CHECK: "Running health checks...",
      RUNNING: "Deployment running",
      FAILED: "Deployment failed",
      STOPPED: "Deployment stopped",
    };

    return NextResponse.json({
      id: deployment.id,
      projectId: deployment.projectId,
      status: deployment.status,
      progress: progressMap[deployment.status] ?? 0,
      message: stageMessages[deployment.status] ?? deployment.status,
      createdAt: deployment.createdAt,
      startedAt: deployment.startedAt,
      completedAt: deployment.completedAt,
      failedAt: deployment.failedAt,
      containerId: deployment.containerId,
      containerName: deployment.containerName,
      containerPort: deployment.containerPort,
      imageName: deployment.imageName,
      liveUrl: deployment.liveUrl,
    });
  } catch (error: unknown) {
    console.error("Error fetching deployment status:", error);
    return NextResponse.json(
      { error: "Failed to fetch deployment status" },
      { status: 500 }
    );
  }
}