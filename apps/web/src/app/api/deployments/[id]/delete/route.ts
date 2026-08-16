import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Docker from "dockerode";

const docker = new Docker();

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

    // Stop and remove container if running
    if (deployment.containerId) {
      try {
        const container = docker.getContainer(deployment.containerId);
        await container.stop({ t: 10 }).catch(() => {});
        await container.remove({ force: true }).catch(() => {});
      } catch (dockerError) {
        console.error("Docker container removal error:", dockerError);
      }
    }

    // Remove Docker image if exists
    if (deployment.imageName) {
      try {
        const image = docker.getImage(deployment.imageName);
        await image.remove({ force: true }).catch(() => {});
      } catch (dockerError) {
        console.error("Docker image removal error:", dockerError);
      }
    }

    // Clean up deployment directory
    const fs = await import("fs-extra");
    const path = await import("path");
    const deploymentDir = path.join(process.cwd(), "apps", "worker", "deployments", deploymentId);
    await fs.remove(deploymentDir).catch(() => {});

    // Delete the deployment record (cascade will delete DeploymentLogs)
    await prisma.deployment.delete({
      where: { id: deploymentId },
    });

    return NextResponse.json({ success: true, message: "Deployment deleted successfully" });
  } catch (error: unknown) {
    console.error("Error deleting deployment:", error);
    return NextResponse.json(
      { error: "Failed to delete deployment" },
      { status: 500 }
    );
  }
}