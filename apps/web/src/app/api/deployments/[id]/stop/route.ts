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

export async function POST(
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

    if (deployment.status !== "DEPLOYED" || !deployment.containerId) {
      return NextResponse.json(
        { error: "Deployment is not running or has no container" },
        { status: 400 }
      );
    }

    // Call worker to stop container (via a job queue or direct Docker API)
    // For now, we'll update the status and the worker will handle it
    await prisma.deployment.update({
      where: { id: deploymentId },
      data: { status: "STOPPED" },
    });

    return NextResponse.json({ success: true, message: "Deployment stop requested" });
  } catch (error: unknown) {
    console.error("Error stopping deployment:", error);
    return NextResponse.json(
      { error: "Failed to stop deployment" },
      { status: 500 }
    );
  }
}