const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const d = await prisma.deployment.findUnique({ 
    where: { id: '17b36423-aa31-4d8e-862f-3384b8aca6cc' } 
  });
  console.log(JSON.stringify(d, null, 2));
}
main().catch(console.error).finally(() => prisma.$disconnect());