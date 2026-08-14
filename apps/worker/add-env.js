const { PrismaClient } = require('@prisma/client');
const { createCipheriv, createDecipheriv, randomBytes, scrypt } = require('crypto');
const { promisify } = require('util');

const scryptAsync = promisify(scrypt);
const ENCRYPTION_KEY = 'dev-encryption-key-change-in-production-must-be-32-chars-min';

const deriveKey = async (password) => {
  const salt = Buffer.from('cloudscale-salt-v1', 'utf8');
  return await scryptAsync(password, salt, 32);
};

let cachedKey = null;
const getKey = async () => {
  if (!cachedKey) {
    cachedKey = await deriveKey(ENCRYPTION_KEY);
  }
  return cachedKey;
};

const encrypt = async (plaintext) => {
  const key = await getKey();
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', key, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return {
    iv: iv.toString('base64'),
    tag: tag.toString('base64'),
    data: encrypted.toString('base64'),
  };
};

const serializeEncrypted = (encrypted) => {
  return JSON.stringify(encrypted);
};

const prisma = new PrismaClient();

async function addEnv() {
  const project = await prisma.project.findFirst({ where: { name: { startsWith: 'worker-test-app' } }, orderBy: { createdAt: 'desc' } });
  if (!project) { console.log('No project found'); return; }
  const encrypted = await encrypt('phase2-success');
  const serialized = serializeEncrypted(encrypted);
  await prisma.environmentVariable.create({
    data: { projectId: project.id, key: 'TEST_KEY', valueEncrypted: serialized }
  });
  console.log('Added TEST_KEY to project:', project.id);
}

addEnv().catch(console.error).finally(() => prisma.$disconnect());