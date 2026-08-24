import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function checkProjectOwnership(projectId: string, userId: string) {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { userId: true, name: true },
  });
  return project?.userId === userId ? project : null;
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

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: projectId } = await params;
    const project = await checkProjectOwnership(projectId, session.user.id);

    if (!project) {
      return NextResponse.json({ error: "Project not found or access denied" }, { status: 404 });
    }

    const body = await request.json();
    const { name } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ error: "Project name is required" }, { status: 400 });
    }

    if (!/^[a-zA-Z0-9_-]+$/.test(name.trim())) {
      return NextResponse.json(
        { error: "Use only letters, numbers, hyphens, and underscores" },
        { status: 400 }
      );
    }

    const existingProject = await prisma.project.findFirst({
      where: {
        name: name.trim(),
        NOT: { id: projectId },
      },
    });

    if (existingProject) {
      return NextResponse.json(
        { error: "A project with this name already exists" },
        { status: 409 }
      );
    }

    const updatedProject = await prisma.project.update({
      where: { id: projectId },
      data: { name: name.trim() },
      select: {
        id: true,
        name: true,
        githubRepo: true,
        branch: true,
        createdAt: true,
      },
    });

    return NextResponse.json(updatedProject);
  } catch (error: unknown) {
    console.error("Error updating project:", error);
    return NextResponse.json(
      { error: "Failed to update project" },
      { status: 500 }
    );
  }
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

    const { id: projectId } = await params;
    const project = await checkProjectOwnership(projectId, session.user.id);

    if (!project) {
      return NextResponse.json({ error: "Project not found or access denied" }, { status: 404 });
    }

    await prisma.project.delete({
      where: { id: projectId },
    });

    return NextResponse.json({ success: true, message: "Project deleted successfully" });
  } catch (error: unknown) {
    console.error("Error deleting project:", error);
    return NextResponse.json(
      { error: "Failed to delete project" },
      { status: 500 }
    );
  }
}