import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Queue } from "bullmq";
import { decryptEnvVarsForDeployment } from "@/lib/encryption";

const deploymentQueue = new Queue("deployment-queue", {
  connection: {
    host: "localhost",
    port: 6379,
  },
});

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const projects = await prisma.project.findMany({
      where: { userId: session.user.id },
      include: {
        deployments: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const formattedProjects = projects.map((project) => {
      const latestDeployment = project.deployments[0];

      return {
        id: project.id,
        name: project.name,
        repository: project.githubRepo,
        branch: project.branch,
        framework: "Next.js",
        status: latestDeployment?.status ?? "QUEUED",
        url: latestDeployment?.liveUrl ?? null,
        createdAt: project.createdAt,
        updatedAt: project.createdAt,
        lastDeploymentId: latestDeployment?.id ?? null,
      };
    });

    return NextResponse.json(formattedProjects);
  } catch (error: unknown) {
    console.error(error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, githubRepo, branch, framework } = body;

    if (!name || !githubRepo) {
      return NextResponse.json(
        { error: "Name and GitHub Repo are required." },
        { status: 400 }
      );
    }

    const assignedPort = Math.floor(Math.random() * 900) + 3001;

    const project = await prisma.project.create({
      data: {
        name,
        githubRepo,
        branch: branch || "main",
        port: assignedPort,
        userId: session.user.id,
      },
    });

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

    await deploymentQueue.add("build-job", {
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
        id: project.id,
        name: project.name,
        repository: project.githubRepo,
        branch: project.branch,
        framework: framework || "Next.js",
        status: "QUEUED",
        url: deployment.liveUrl ?? null,
        createdAt: project.createdAt,
        updatedAt: project.createdAt,
        lastDeploymentId: deployment.id,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error(error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 400 }
    );
  }
}