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

export async function DELETE(
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

    // Delete the deployment record
    await prisma.deployment.delete({
      where: { id: deploymentId },
    });

    return NextResponse.json({ success: true, message: "Deployment deleted" });
  } catch (error: unknown) {
    console.error("Error deleting deployment:", error);
    return NextResponse.json(
      { error: "Failed to delete deployment" },
      { status: 500 }
    );
  }
}