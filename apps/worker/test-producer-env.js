const { Queue } = require('bullmq');
const { PrismaClient } = require('@prisma/client');
const { createCipheriv, randomBytes, scrypt } = require('crypto');
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

const decrypt = async (encryptedData) => {
  const key = await getKey();
  const iv = Buffer.from(encryptedData.iv, 'base64');
  const tag = Buffer.from(encryptedData.tag, 'base64');
  const data = Buffer.from(encryptedData.data, 'base64');
  const decipher = createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(tag);
  const decrypted = Buffer.concat([decipher.update(data), decipher.final()]);
  return decrypted.toString('utf8');
};

const deserializeEncrypted = (serialized) => {
  return JSON.parse(serialized);
};

const prisma = new PrismaClient();

const deploymentQueue = new Queue('deployment-queue', {
    connection: {
        host: 'localhost',
        port: 6379,
    },
});


async function sendTestJob() {
    try {
        console.log("���� Creating test project...");
        const project = await prisma.project.create({
            data: {
                name: `worker-test-app-${Date.now()}`,
                githubRepo: "https://github.com/JainMehul05/cloudscale-test-app",
                branch: "main",
                port: 3000 + Math.floor(Math.random() * 900) + 1,
                userId: "5448f3ee-9a92-489b-a3bd-25af9d847064"
            }
        });


        console.log("��� Project created:");
        console.log(project.id);


        console.log("���� Adding environment variable...");

        const encrypted = await encrypt('phase2-success');
        const serialized = serializeEncrypted(encrypted);

        await prisma.environmentVariable.create({
            data: {
                projectId: project.id,
                key: 'TEST_KEY',
                valueEncrypted: serialized
            }
        });

        console.log("��� Environment variable added");


        console.log("���� Creating deployment...");

        const deployment = await prisma.deployment.create({
            data: {
                projectId: project.id,
                status: "PENDING"
            }
        });


        console.log("��� Deployment created:");
        console.log(deployment.id);


        console.log("���� Fetching and decrypting env vars...");

        const envVars = await prisma.environmentVariable.findMany({
            where: { projectId: project.id },
            select: { key: true, valueEncrypted: true },
        });

        const environmentVariables = {};
        for (const env of envVars) {
            if (env.valueEncrypted) {
                try {
                    const decryptedData = deserializeEncrypted(env.valueEncrypted);
                    environmentVariables[env.key] = await decrypt(decryptedData);
                } catch (e) {
                    console.error('Failed to decrypt:', env.key);
                }
            }
        }

        console.log("���� Decrypted env vars:", environmentVariables);


        console.log("���� Sending job to Redis...");


        const job = await deploymentQueue.add(
            "build-job",
            {
                deploymentId: deployment.id,
                projectId: project.id,
                projectName: project.name,
                repoUrl: project.githubRepo,
                branch: project.branch,
                assignedPort: project.port,
                environmentVariables
            }
        );


        console.log("��� Job queued");
        console.log("Job ID:", job.id);
        console.log("Project ID:", project.id);
        console.log("Deployment ID:", deployment.id);
        console.log("Assigned Port:", project.port);

    } catch (err) {
        console.error(err);
        process.exit(1);
    } finally {
        await deploymentQueue.close();
        await prisma.$disconnect();
    }
}


sendTestJob()
.catch(err => {
    console.error(err);
    process.exit(1);
});