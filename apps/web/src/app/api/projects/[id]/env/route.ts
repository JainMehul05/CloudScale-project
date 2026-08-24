import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { encrypt, serializeEncrypted } from "@/lib/encryption";

type Environment = "DEVELOPMENT" | "PREVIEW" | "PRODUCTION";

async function checkProjectOwnership(projectId: string, userId: string) {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { userId: true },
  });
  return project?.userId === userId;
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
    const searchParams = request.nextUrl.searchParams;
    const environment = (searchParams.get("environment") as Environment) || "PRODUCTION";

    if (!(await checkProjectOwnership(projectId, session.user.id))) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        envVars: {
          where: { environment },
          select: {
            id: true,
            key: true,
            environment: true,
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

    return NextResponse.json({ envVars: project.envVars });
  } catch (error: unknown) {
    console.error("Error fetching environment variables:", error);
    return NextResponse.json(
      { error: "Failed to fetch environment variables" },
      { status: 500 }
    );
  }
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

    const { id: projectId } = await params;

    if (!(await checkProjectOwnership(projectId, session.user.id))) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const body = await request.json();
    const { key, value, environment = "PRODUCTION" } = body;

    if (!key || !value) {
      return NextResponse.json(
        { error: "Key and value are required" },
        { status: 400 }
      );
    }

    if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(key)) {
      return NextResponse.json(
        {
          error:
            "Invalid key format. Use only letters, numbers, and underscores, starting with a letter or underscore.",
        },
        { status: 400 }
      );
    }

    const validEnvironments: Environment[] = ["DEVELOPMENT", "PREVIEW", "PRODUCTION"];
    const env: Environment = validEnvironments.includes(environment as Environment) ? environment as Environment : "PRODUCTION";

    const existing = await prisma.environmentVariable.findUnique({
      where: {
        projectId_key_environment: {
          projectId,
          key,
          environment: env,
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Environment variable with this key already exists in this environment" },
        { status: 409 }
      );
    }

    const encrypted = await encrypt(value);
    const serialized = serializeEncrypted(encrypted);

    const envVar = await prisma.environmentVariable.create({
      data: {
        projectId,
        key,
        valueEncrypted: serialized,
        environment: env,
      },
      select: {
        id: true,
        key: true,
        environment: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(envVar, { status: 201 });
  } catch (error: unknown) {
    console.error("Error creating environment variable:", error);
    if (error instanceof Error && error.message.includes("ENV_ENCRYPTION_KEY")) {
      return NextResponse.json(
        { error: "Encryption configuration error" },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { error: "Failed to create environment variable" },
      { status: 500 }
    );
  }
}