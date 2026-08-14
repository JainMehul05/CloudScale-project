const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const deployments = await prisma.deployment.findMany({
    orderBy: { createdAt: 'desc' },
    take: 5
  });
  for (const d of deployments) {
    console.log('---');
    console.log('ID:', d.id);
    console.log('Status:', d.status);
    console.log('Live URL:', d.liveUrl);
    console.log('Container:', d.containerName);
    console.log('Logs:', d.logs?.substring(0, 500));
  }
}

main().finally(() => prisma.$disconnect());