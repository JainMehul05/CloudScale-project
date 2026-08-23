const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const deployments = await prisma.deployment.findMany({ 
    where: { status: { in: ['RUNNING', 'DEPLOYED'] } },
    take: 5,
    orderBy: { createdAt: 'desc' } 
  });
  console.log(JSON.stringify(deployments, null, 2));
  await prisma.$disconnect();
}

check();