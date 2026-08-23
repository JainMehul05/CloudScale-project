const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const d = await prisma.deployment.findUnique({ 
    where: { id: '9ec98a32-9da5-48de-bd76-f0f784d6e4a5' }, 
    include: { deploymentLogs: { orderBy: { timestamp: 'asc' } } } 
  });
  console.log('Status:', d.status);
  console.log('Container ID:', d.containerId);
  console.log('Live URL:', d.liveUrl);
  console.log('Deployment URL:', d.deploymentUrl);
  console.log('Logs count:', d.deploymentLogs.length);
  d.deploymentLogs.forEach(l => console.log(' ', l.stage, '-', l.message.substring(0, 80)));
}
main().catch(console.error).finally(() => prisma.$disconnect());