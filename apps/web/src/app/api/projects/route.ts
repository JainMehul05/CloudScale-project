import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Queue } from 'bullmq';

// Connect to the local Redis instance running in root docker-compose
const deploymentQueue = new Queue('deployment-queue', {
  connection: { host: 'localhost', port: 6379 },
});

// GET /api/projects - Fetch all projects with their deployments
export async function GET() {
  try {
    const projects = await prisma.project.findMany({
      include: { deployments: true },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(projects);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/projects - Create a new project and add a build job to BullMQ
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, githubRepo, branch } = body;

    if (!name || !githubRepo) {
      return NextResponse.json({ error: 'Name and GitHub Repo are required.' }, { status: 400 });
    }

    // Assign a dynamic internal host port between 3001 and 3999
    const assignedPort = Math.floor(Math.random() * 900) + 3001;

    // 1. Create Project in Neon PostgreSQL
    const project = await prisma.project.create({
      data: {
        name,
        githubRepo,
        branch: branch || 'main',
        port: assignedPort,
      },
    });

    // 2. Create Initial Pending Deployment Record
    const deployment = await prisma.deployment.create({
      data: {
        projectId: project.id,
        status: 'PENDING',
      },
    });

    // 3. Dispatch Job to BullMQ Queue
    await deploymentQueue.add('build-job', {
      deploymentId: deployment.id,
      projectId: project.id,
      projectName: project.name,
      repoUrl: project.githubRepo,
      branch: project.branch,
      assignedPort: project.port,
    });

    return NextResponse.json({ project, deployment }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}