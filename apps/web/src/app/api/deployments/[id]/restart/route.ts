import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Queue } from "bullmq";
import { decryptEnvVarsForDeployment } from "@/lib/encryption";

const deploymentQueue = new Queue("deployment-queue", {
  connection: { host: "localhost", port: 6379 },
});

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

    // Create a new deployment for the restart
    const newDeployment = await prisma.deployment.create({
      data: {
        projectId: deployment.projectId,
        status: "PENDING",
      },
    });

    // Fetch environment variables
    const envVars = await prisma.environmentVariable.findMany({
      where: { projectId: deployment.projectId },
      select: { key: true, valueEncrypted: true },
    });
    const environmentVariables = await decryptEnvVarsForDeployment(envVars);

    // Get project details
    const project = await prisma.project.findUnique({
      where: { id: deployment.projectId },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Queue new deployment job
    await deploymentQueue.add("build-job", {
      deploymentId: newDeployment.id,
      projectId: project.id,
      projectName: project.name,
      repoUrl: project.githubRepo,
      branch: project.branch,
      assignedPort: project.port,
      environmentVariables,
    });

    return NextResponse.json({ 
      success: true, 
      message: "Deployment restart queued",
      newDeploymentId: newDeployment.id,
    });
  } catch (error: unknown) {
    console.error("Error restarting deployment:", error);
    return NextResponse.json(
      { error: "Failed to restart deployment" },
      { status: 500 }
    );
  }
}