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

async function checkProjectOwnership(projectId: string, userId: string) {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { userId: true, id: true, name: true, githubRepo: true, branch: true, port: true },
  });
  return project?.userId === userId ? project : null;
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
    const { id: projectId } = await params;

    const project = await checkProjectOwnership(projectId, userId);
    if (!project) {
      return NextResponse.json({ error: "Project not found or access denied" }, { status: 404 });
    }

    const deployment = await prisma.deployment.create({
      data: {
        projectId: project.id,
        status: "QUEUED",
      },
    });

    const envVars = await prisma.environmentVariable.findMany({
      where: { projectId: project.id },
      select: { key: true, valueEncrypted: true },
    });
    const environmentVariables = await decryptEnvVarsForDeployment(envVars);

    await getDeploymentQueue().add("build-job", {
      deploymentId: deployment.id,
      projectId: project.id,
      projectName: project.name,
      repoUrl: project.githubRepo,
      branch: project.branch,
      assignedPort: project.port,
      environmentVariables,
    });

    return NextResponse.json(
      {
        id: deployment.id,
        projectId: project.id,
        status: deployment.status,
        createdAt: deployment.createdAt,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("Error creating deployment:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create deployment" },
      { status: 500 }
    );
  }
}