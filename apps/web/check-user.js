const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findUnique({ where: { email: 'test@cloudscale.dev' } });
  console.log('User:', user);
}
main().catch(console.error).finally(() => prisma.$disconnect());