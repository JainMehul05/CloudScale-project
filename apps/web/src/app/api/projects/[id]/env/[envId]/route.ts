import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { encrypt, serializeEncrypted } from "@/lib/encryption";

async function checkProjectOwnership(projectId: string, userId: string) {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { userId: true },
  });
  return project?.userId === userId;
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; envId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: projectId, envId } = await params;

    if (!(await checkProjectOwnership(projectId, session.user.id))) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const envVar = await prisma.environmentVariable.findUnique({
      where: { id: envId },
    });

    if (!envVar || envVar.projectId !== projectId) {
      return NextResponse.json(
        { error: "Environment variable not found" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { key, value } = body;

    if (key) {
      if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(key)) {
        return NextResponse.json(
          {
            error:
              "Invalid key format. Use only letters, numbers, and underscores, starting with a letter or underscore.",
          },
          { status: 400 }
        );
      }

      if (key !== envVar.key) {
        const existing = await prisma.environmentVariable.findUnique({
          where: {
            projectId_key: {
              projectId,
              key,
            },
          },
        });

        if (existing) {
          return NextResponse.json(
            { error: "Environment variable with this key already exists" },
            { status: 409 }
          );
        }
      }
    }

    const updateData: { key?: string; valueEncrypted?: string } = {};

    if (key && key !== envVar.key) {
      updateData.key = key;
    }

    if (value) {
      const encrypted = await encrypt(value);
      updateData.valueEncrypted = serializeEncrypted(encrypted);
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "No changes provided" },
        { status: 400 }
      );
    }

    const updated = await prisma.environmentVariable.update({
      where: { id: envId },
      data: updateData,
      select: {
        id: true,
        key: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(updated);
  } catch (error: unknown) {
    console.error("Error updating environment variable:", error);
    if (error instanceof Error && error.message.includes("ENV_ENCRYPTION_KEY")) {
      return NextResponse.json(
        { error: "Encryption configuration error" },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { error: "Failed to update environment variable" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; envId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: projectId, envId } = await params;

    if (!(await checkProjectOwnership(projectId, session.user.id))) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const envVar = await prisma.environmentVariable.findUnique({
      where: { id: envId },
    });

    if (!envVar || envVar.projectId !== projectId) {
      return NextResponse.json(
        { error: "Environment variable not found" },
        { status: 404 }
      );
    }

    await prisma.environmentVariable.delete({
      where: { id: envId },
    });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error("Error deleting environment variable:", error);
    return NextResponse.json(
      { error: "Failed to delete environment variable" },
      { status: 500 }
    );
  }
}