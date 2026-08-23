import { PrismaClient } from '@prisma/client';
import { Queue } from 'bullmq';

const prisma = new PrismaClient();

async function test() {
  const user = await prisma.user.findUnique({ where: { email: 'test@test.com' } });
  console.log('User:', user?.id);
  
  const port = 3001 + Math.floor(Math.random() * 900);
  
  const project = await prisma.project.create({
    data: {
      name: 'test-app-' + Date.now(),
      githubRepo: 'https://github.com/JainMehul05/cloudscale-test-app',
      branch: 'main',
      port: port,
      userId: user.id
    }
  });
  console.log('Project:', project.id);
  
  const deployment = await prisma.deployment.create({
    data: {
      projectId: project.id,
      status: 'QUEUED'
    }
  });
  console.log('Deployment:', deployment.id);
  
  const queue = new Queue('deployment-queue', { connection: { host: 'localhost', port: 6379 } });
  const job = await queue.add('build-job', {
    deploymentId: deployment.id,
    projectId: project.id,
    projectName: project.name,
    repoUrl: project.githubRepo,
    branch: project.branch,
    assignedPort: project.port,
    environmentVariables: {}
  });
  console.log('Job queued:', job.id);
  await queue.close();
  await prisma.$disconnect();
}

test().catch(console.error);