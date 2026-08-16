import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: projectId } = await params;

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        deployments: {
          orderBy: { createdAt: "desc" },
          take: 10,
        },
        envVars: {
          select: {
            id: true,
            key: true,
            createdAt: true,
            updatedAt: true,
          },
          orderBy: { key: "asc" },
        },
      },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    if (project.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const latestDeployment = project.deployments[0];

    return NextResponse.json({
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
      deployments: project.deployments.map((d) => ({
        id: d.id,
        status: d.status,
        createdAt: d.createdAt,
        liveUrl: d.liveUrl,
        containerId: d.containerId,
        containerName: d.containerName,
        containerPort: d.containerPort,
        imageName: d.imageName,
        logs: d.logs,
      })),
    });
  } catch (error: unknown) {
    console.error("Error fetching project:", error);
    return NextResponse.json(
      { error: "Failed to fetch project" },
      { status: 500 }
    );
  }
}