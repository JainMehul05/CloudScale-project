const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  // Check if test user exists
  let user = await prisma.user.findUnique({
    where: { email: 'test@cloudscale.dev' }
  });
  
  if (!user) {
    const hashedPassword = await bcrypt.hash('test1234', 12);
    user = await prisma.user.create({
      data: {
        email: 'test@cloudscale.dev',
        name: 'Test User',
        password: hashedPassword,
      }
    });
    console.log('Created test user:', user.id);
  } else {
    console.log('Test user exists:', user.id);
  }
  
  // Check if test project exists
  let project = await prisma.project.findFirst({
    where: { 
      userId: user.id,
      githubRepo: 'https://github.com/JainMehul05/cloudscale-test-app'
    }
  });
  
  if (!project) {
    project = await prisma.project.create({
      data: {
        name: 'phase2-test-app',
        githubRepo: 'https://github.com/JainMehul05/cloudscale-test-app',
        branch: 'main',
        port: 3000,
        userId: user.id,
      }
    });
    console.log('Created test project:', project.id);
  } else {
    console.log('Test project exists:', project.id);
  }
  
  // Add environment variable
  const { encrypt, serializeEncrypted } = require('../web/src/lib/encryption.ts');
  // We can't import TS directly, so let's use the worker's encryption approach
  const crypto = require('crypto');
  const { promisify } = require('util');
  const scryptAsync = promisify(crypto.scrypt);
  
  const ENCRYPTION_KEY = 'dev-encryption-key-change-in-production-must-be-32-chars-min';
  const salt = Buffer.from('cloudscale-salt-v1', 'utf8');
  const key = await scryptAsync(ENCRYPTION_KEY, salt, 32);
  
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const encrypted = Buffer.concat([cipher.update('phase2-success', 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  
  const serialized = JSON.stringify({
    iv: iv.toString('base64'),
    tag: tag.toString('base64'),
    data: encrypted.toString('base64')
  });
  
  const existingEnv = await prisma.environmentVariable.findUnique({
    where: {
      projectId_key: {
        projectId: project.id,
        key: 'TEST_KEY'
      }
    }
  });
  
  if (!existingEnv) {
    await prisma.environmentVariable.create({
      data: {
        projectId: project.id,
        key: 'TEST_KEY',
        valueEncrypted: serialized
      }
    });
    console.log('Created TEST_KEY environment variable');
  } else {
    console.log('TEST_KEY already exists');
  }
  
  // Create deployment
  const deployment = await prisma.deployment.create({
    data: {
      projectId: project.id,
      status: 'PENDING',
    }
  });
  console.log('Created deployment:', deployment.id);
  
  // Queue deployment job
  const { Queue } = require('bullmq');
  const deploymentQueue = new Queue('deployment-queue', {
    connection: { host: 'localhost', port: 6379 }
  });
  
  // Get env vars for deployment
  const envVars = await prisma.environmentVariable.findMany({
    where: { projectId: project.id },
    select: { key: true, valueEncrypted: true }
  });
  
  // Decrypt env vars
  const environmentVariables = {};
  for (const env of envVars) {
    try {
      const decryptedData = JSON.parse(env.valueEncrypted);
      const decipher = crypto.createDecipheriv('aes-256-gcm', key, Buffer.from(decryptedData.iv, 'base64'));
      decipher.setAuthTag(Buffer.from(decryptedData.tag, 'base64'));
      const decrypted = Buffer.concat([decipher.update(Buffer.from(decryptedData.data, 'base64')), decipher.final()]);
      environmentVariables[env.key] = decrypted.toString('utf8');
    } catch (e) {
      console.error('Failed to decrypt env var:', env.key);
    }
  }
  
  await deploymentQueue.add('build-job', {
    deploymentId: deployment.id,
    projectId: project.id,
    projectName: project.name,
    repoUrl: project.githubRepo,
    branch: project.branch,
    assignedPort: project.port,
    environmentVariables
  });
  
  console.log('Deployment job queued');
  
  await deploymentQueue.close();
}

main().finally(() => prisma.$disconnect());