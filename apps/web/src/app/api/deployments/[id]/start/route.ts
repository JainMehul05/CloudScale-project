import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Queue } from "bullmq";
import { decryptEnvVarsForDeployment } from "@/lib/encryption";

function getDeploymentQueue() {
  return new Queue("deployment-queue", {
    connection: {
      host: process.env.REDIS_HOST || "localhost",
      port: parseInt(process.env.REDIS_PORT || "6379", 10),
    },
  });
}

export const dynamic = "force-dynamic";

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

    const userId = session.user.id;
    const { id: deploymentId } = await params;

    const deployment = await checkDeploymentOwnership(deploymentId, userId);
    if (!deployment) {
      return NextResponse.json({ error: "Deployment not found or access denied" }, { status: 404 });
    }

    if (deployment.status !== "STOPPED") {
      return NextResponse.json(
        { error: "Deployment is not in STOPPED state" },
        { status: 400 }
      );
    }

    // Create a new deployment for the start
    const newDeployment = await prisma.deployment.create({
      data: {
        projectId: deployment.projectId,
        status: "QUEUED",
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
    await getDeploymentQueue().add("build-job", {
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
      message: "Deployment start queued",
      newDeploymentId: newDeployment.id,
    });
  } catch (error: unknown) {
    console.error("Error starting deployment:", error);
    return NextResponse.json(
      { error: "Failed to start deployment" },
      { status: 500 }
    );
  }
}