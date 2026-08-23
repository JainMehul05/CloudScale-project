const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const deployments = await prisma.deployment.findMany({
    include: { deploymentLogs: { orderBy: { timestamp: 'asc' } } }
  });
  console.log(JSON.stringify(deployments, null, 2));
}
main().catch(console.error).finally(() => prisma.$disconnect());