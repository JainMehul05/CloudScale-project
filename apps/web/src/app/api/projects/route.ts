import { NextResponse } from "next/server";
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

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    let projects: Array<{ id: string; name: string; githubRepo: string; branch: string; port: number; userId: string; createdAt: Date; deployments: { id: string; status: string; liveUrl: string | null }[] }> = [];
    try {
      projects = await prisma.project.findMany({
        where: { userId },
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
    } catch (dbError) {
      throw dbError;
    }

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

    const userId = session.user.id;

    const body = await request.json();
    const { name, githubRepo, branch, framework } = body;

    if (!name || !githubRepo) {
      return NextResponse.json(
        { error: "Name and GitHub Repo are required." },
        { status: 400 }
      );
    }

    const assignedPort = Math.floor(Math.random() * 900) + 3001;

    let project;
    try {
      project = await prisma.project.create({
        data: {
          name,
          githubRepo,
          branch: branch || "main",
          port: assignedPort,
          userId,
        },
      });
    } catch (dbError) {
      throw dbError;
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