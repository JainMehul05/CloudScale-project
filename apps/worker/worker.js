require("dotenv").config();

const { Worker, Queue } = require('bullmq');
const axios = require('axios');
const Docker = require('dockerode');
const { PrismaClient } = require('@prisma/client');
const simpleGit = require('simple-git');
const fs = require('fs-extra');
const path = require('path');
const tar = require('tar-stream');
const cron = require('node-cron');
const Redis = require('ioredis');

const prisma = new PrismaClient();

const dockerHost = process.env.DOCKER_HOST || 'unix:///var/run/docker.sock';
const docker = new Docker({ socketPath: dockerHost.replace('unix://', '') });

const redisHost = process.env.REDIS_HOST || 'localhost';
const redisPort = parseInt(process.env.REDIS_PORT || '6379', 10);

const redisConnection = {
  host: redisHost,
  port: redisPort,
};

const redis = new Redis({ host: redisHost, port: redisPort, lazyConnect: true });
redis.connect().catch(() => {});

const deploymentsDir = path.join(__dirname, 'deployments');
fs.ensureDirSync(deploymentsDir);

const CLEANUP_DAYS = 7;
const CLEANUP_SCHEDULE = '0 3 * * *';

const DEPLOYMENT_STAGES = {
  QUEUED: { progress: 0, message: 'Queued, waiting for worker...' },
  VALIDATING: { progress: 20, message: 'Validating repository URL...' },
  CLONING: { progress: 35, message: 'Cloning repository...' },
  DETECTING: { progress: 50, message: 'Detecting framework...' },
  BUILDING: { progress: 70, message: 'Building Docker image...' },
  STARTING: { progress: 85, message: 'Starting container...' },
  HEALTH_CHECK: { progress: 95, message: 'Running health checks...' },
  RUNNING: { progress: 100, message: 'Deployment running' },
  FAILED: { progress: -1, message: 'Deployment failed' },
  STOPPED: { progress: -1, message: 'Deployment stopped' },
};

function cleanLogs(logs) {
  return String(logs).replace(/\0/g, "");
}

async function publishLog(deploymentId, stage, message, progress = null) {
  try {
    const logEntry = {
      stage,
      message,
      progress,
      timestamp: new Date().toISOString(),
    };
    await redis.publish(`logs:${deploymentId}`, JSON.stringify(logEntry));
    
    await prisma.deploymentLog.create({
      data: {
        deploymentId,
        stage,
        message,
      },
    });
  } catch (err) {
    console.error(`[PublishLog] Failed for ${deploymentId}:`, err.message);
  }
}

async function updateDeploymentStatus(deploymentId, status, additionalData = {}) {
  const updateData = {
    status,
    updatedAt: new Date(),
    ...additionalData,
  };

  if (status === 'VALIDATING' || status === 'CLONING' || status === 'DETECTING' || status === 'BUILDING' || status === 'STARTING' || status === 'HEALTH_CHECK') {
    if (!additionalData.startedAt) {
      updateData.startedAt = new Date();
    }
  }

  if (status === 'RUNNING' || status === 'STOPPED') {
    updateData.completedAt = new Date();
  }

  if (status === 'FAILED') {
    updateData.completedAt = new Date();
    updateData.failedAt = new Date();
  }

  await prisma.deployment.update({
    where: { id: deploymentId },
    data: updateData,
  });
}

async function cleanupOldDeployments() {
  console.log('[Cleanup] Starting deployment cleanup...');

  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - CLEANUP_DAYS);

  try {
    const oldDeployments = await prisma.deployment.findMany({
      where: {
        status: { in: ['RUNNING', 'FAILED', 'STOPPED'] },
        createdAt: { lt: cutoffDate },
      },
      select: {
        id: true,
        containerId: true,
        containerName: true,
        projectId: true,
      },
    });

    console.log(`[Cleanup] Found ${oldDeployments.length} old deployments to clean up`);

    for (const deployment of oldDeployments) {
      try {
        if (deployment.containerId) {
          try {
            const container = docker.getContainer(deployment.containerId);
            await container.stop({ t: 10 }).catch(() => {});
            await container.remove({ force: true }).catch(() => {});
            console.log(`[Cleanup] Removed container: ${deployment.containerName || deployment.containerId}`);
          } catch (containerError) {
            console.error(`[Cleanup] Failed to remove container ${deployment.containerId}:`, containerError.message);
          }
        }

        const deploymentDir = path.join(deploymentsDir, deployment.id);
        await fs.remove(deploymentDir).catch(() => {});

        await prisma.deployment.delete({
          where: { id: deployment.id },
        });

        console.log(`[Cleanup] Cleaned up deployment: ${deployment.id}`);
      } catch (deploymentError) {
        console.error(`[Cleanup] Failed to clean up deployment ${deployment.id}:`, deploymentError.message);
      }
    }

    console.log('[Cleanup] Deployment cleanup completed');
  } catch (error) {
    console.error('[Cleanup] Error during cleanup:', error.message);
  }
}

cron.schedule(CLEANUP_SCHEDULE, () => {
  cleanupOldDeployments();
}, {
  scheduled: true,
  timezone: 'UTC',
});

console.log(`[Cleanup] Scheduled cleanup job to run daily at 3 AM UTC (keeping last ${CLEANUP_DAYS} days)`);

cleanupOldDeployments();

function validateRepoUrl(url) {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'https:') {
      throw new Error('Repository URL must use HTTPS');
    }
    if (!parsed.hostname.endsWith('github.com')) {
      throw new Error('Only GitHub repositories are allowed (github.com)');
    }
    const blocked = [
      'localhost',
      '127.0.0.1',
      '0.0.0.0',
      '10.',
      '172.16.',
      '172.17.',
      '172.18.',
      '172.19.',
      '172.20.',
      '172.21.',
      '172.22.',
      '172.23.',
      '172.24.',
      '172.25.',
      '172.26.',
      '172.27.',
      '172.28.',
      '172.29.',
      '172.30.',
      '172.31.',
      '192.168.',
    ];
    if (blocked.some((b) => parsed.hostname.startsWith(b))) {
      throw new Error('Private/internal IP addresses are not allowed');
    }
    return true;
  } catch (err) {
    if (err instanceof TypeError) {
      throw new Error('Invalid URL format');
    }
    throw err;
  }
}

function sanitizeEnvVars(envVars) {
  const sanitized = {};
  const dangerousKeys = [
    'PATH', 'HOME', 'USER', 'SHELL', 'LD_PRELOAD', 'LD_LIBRARY_PATH',
    'DOCKER_', 'KUBERNETES_', 'AWS_', 'GOOGLE_', 'AZURE_',
    'DATABASE_URL', 'REDIS_URL', 'SECRET', 'PASSWORD', 'TOKEN', 'KEY'
  ];
  
  for (const [key, value] of Object.entries(envVars)) {
    if (typeof key !== 'string' || typeof value !== 'string') continue;
    
    const upperKey = key.toUpperCase();
    const isDangerous = dangerousKeys.some(dk => upperKey.includes(dk));
    
    if (isDangerous) {
      console.warn(`[Security] Blocked potentially dangerous env var: ${key}`);
      continue;
    }
    
    if (key.length > 100 || value.length > 5000) {
      console.warn(`[Security] Env var too long, skipping: ${key}`);
      continue;
    }
    
    sanitized[key] = value;
  }
  
  return sanitized;
}

function checkDockerfileExists(dir) {
  const dockerfilePath = path.join(dir, 'Dockerfile');
  if (!fs.existsSync(dockerfilePath)) {
    throw new Error('Dockerfile not found at repository root. A Dockerfile is required for deployment.');
  }
  return true;
}

function getModelConfig(modelName) {
  const models = {
    glm52: {
      name: 'GLM 5.2',
      apiBase: 'https://open.bigmodel.cn/api/paas/v4',
      apiKeyEnv: 'GLM_API_KEY',
      defaultParams: {
        model: 'glm-5.2',
        temperature: 0.7,
        maxTokens: 4096,
      },
    },
    nemotron3: {
      name: 'Nemotron 3 Ultra 550B',
      apiBase: 'https://api.nvidia.com/v1',
      apiKeyEnv: 'NEMOTRON_API_KEY',
      defaultParams: {
        model: 'nemotron-3-ultras',
        temperature: 0.7,
        maxTokens: 8192,
      },
    },
  };

  return models[modelName] || null;
}

async function inferWithModel(modelName, messages, customParams = {}) {
  const config = getModelConfig(modelName);
  if (!config) {
    throw new Error(`Unknown model: ${modelName}`);
  }

  const apiKey = process.env[config.apiKeyEnv];
  if (!apiKey) {
    throw new Error(`Missing API key: ${config.apiKeyEnv}. Set it in .env file.`);
  }

  const params = {
    ...config.defaultParams,
    ...customParams,
  };

  const response = await axios.post(
    `${config.apiBase}/chat/completions`,
    {
      model: params.model,
      messages,
      temperature: params.temperature,
      max_tokens: params.maxTokens,
    },
    {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      timeout: 120000,
    }
  );

  return response.data.choices[0].message.content;
}

function detectFramework(dir) {
  const framework = {
    name: 'unknown',
    version: null,
    packageManager: null,
    hasDockerfile: fs.existsSync(path.join(dir, 'Dockerfile')),
    suggestedDockerfile: null,
  };

  try {
    const packageJsonPath = path.join(dir, 'package.json');
    if (fs.existsSync(packageJsonPath)) {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };

      if (deps.next) {
        framework.name = 'nextjs';
        framework.version = deps.next;
        framework.packageManager = packageJson.packageManager || (fs.existsSync(path.join(dir, 'pnpm-lock.yaml')) ? 'pnpm' :
                              fs.existsSync(path.join(dir, 'yarn.lock')) ? 'yarn' : 'npm');
        framework.suggestedDockerfile = 'nextjs';
      }
      else if (deps.react && deps.vite) {
        framework.name = 'react-vite';
        framework.version = deps.react;
        framework.packageManager = packageJson.packageManager || (fs.existsSync(path.join(dir, 'pnpm-lock.yaml')) ? 'pnpm' :
                              fs.existsSync(path.join(dir, 'yarn.lock')) ? 'yarn' : 'npm');
        framework.suggestedDockerfile = 'react-vite';
      }
      else if (deps.react) {
        framework.name = 'react';
        framework.version = deps.react;
        framework.packageManager = packageJson.packageManager || (fs.existsSync(path.join(dir, 'pnpm-lock.yaml')) ? 'pnpm' :
                              fs.existsSync(path.join(dir, 'yarn.lock')) ? 'yarn' : 'npm');
        framework.suggestedDockerfile = 'react';
      }
      else if (deps.vue) {
        framework.name = 'vue';
        framework.version = deps.vue;
        framework.packageManager = packageJson.packageManager || (fs.existsSync(path.join(dir, 'pnpm-lock.yaml')) ? 'pnpm' :
                              fs.existsSync(path.join(dir, 'yarn.lock')) ? 'yarn' : 'npm');
        framework.suggestedDockerfile = 'vue';
      }
      else if (deps.express || deps.fastify || deps.koa || deps.hapi) {
        framework.name = 'nodejs';
        framework.version = process.version;
        framework.packageManager = packageJson.packageManager || (fs.existsSync(path.join(dir, 'pnpm-lock.yaml')) ? 'pnpm' :
                              fs.existsSync(path.join(dir, 'yarn.lock')) ? 'yarn' : 'npm');
        framework.suggestedDockerfile = 'nodejs';
      }
      else {
        framework.name = 'nodejs';
        framework.version = process.version;
        framework.packageManager = packageJson.packageManager || (fs.existsSync(path.join(dir, 'pnpm-lock.yaml')) ? 'pnpm' :
                              fs.existsSync(path.join(dir, 'yarn.lock')) ? 'yarn' : 'npm');
        framework.suggestedDockerfile = 'nodejs';
      }
    }
    else if (fs.existsSync(path.join(dir, 'requirements.txt')) ||
             fs.existsSync(path.join(dir, 'pyproject.toml')) ||
             fs.existsSync(path.join(dir, 'setup.py'))) {
      framework.name = 'python';
      framework.packageManager = fs.existsSync(path.join(dir, 'poetry.lock')) ? 'poetry' : 'pip';
      framework.suggestedDockerfile = 'python';
    }
    else if (fs.existsSync(path.join(dir, 'go.mod'))) {
      framework.name = 'go';
      const goMod = fs.readFileSync(path.join(dir, 'go.mod'), 'utf8');
      const goVersionMatch = goMod.match(/go\s+(\d+\.\d+)/);
      framework.version = goVersionMatch ? goVersionMatch[1] : 'unknown';
      framework.packageManager = 'go modules';
      framework.suggestedDockerfile = 'go';
    }
    else if (fs.existsSync(path.join(dir, 'Cargo.toml'))) {
      framework.name = 'rust';
      framework.packageManager = 'cargo';
      framework.suggestedDockerfile = 'rust';
    }
    else if (fs.existsSync(path.join(dir, 'build.gradle')) || fs.existsSync(path.join(dir, 'pom.xml'))) {
      framework.name = 'java';
      framework.packageManager = fs.existsSync(path.join(dir, 'build.gradle')) ? 'gradle' : 'maven';
      framework.suggestedDockerfile = 'java';
    }
    else if (fs.existsSync(path.join(dir, 'index.html')) &&
             !fs.existsSync(path.join(dir, 'package.json'))) {
      framework.name = 'static';
      framework.suggestedDockerfile = 'static';
    }

    console.log(`[Framework Detection] Detected: ${framework.name}${framework.version ? ` v${framework.version}` : ''}${framework.packageManager ? ` (${framework.packageManager})` : ''}${framework.hasDockerfile ? ' [Dockerfile found]' : framework.suggestedDockerfile ? ` [Suggested: ${framework.suggestedDockerfile}]` : ' [No Dockerfile]'}`);
  } catch (err) {
    console.warn('[Framework Detection] Failed to detect framework:', err.message);
  }

  return framework;
}

function createTarStream(dir) {
  return new Promise((resolve, reject) => {
    const pack = tar.pack();
    const entries = [];

    function addFiles(currentDir, relativePath = '') {
      const items = fs.readdirSync(currentDir);
      for (const item of items) {
        const fullPath = path.join(currentDir, item);
        const relPath = path.join(relativePath, item);

        if (item === '.git' || item === 'node_modules' || item === '.env' || item.startsWith('.env.')) {
          continue;
        }

        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
          addFiles(fullPath, relPath);
        } else {
          entries.push({ path: relPath, fullPath });
        }
      }
    }

    addFiles(dir);

    for (const entry of entries) {
      const content = fs.readFileSync(entry.fullPath);
      pack.entry({ name: entry.path }, content);
    }

    pack.finalize();
    resolve(pack);
  });
}

async function stopAndRemoveContainer(containerId, containerName) {
  if (!containerId) return;
  try {
    const container = docker.getContainer(containerId);
    await container.stop({ t: 10 }).catch(() => {});
    await container.remove({ force: true }).catch(() => {});
    console.log(`[Container] Stopped and removed: ${containerName || containerId}`);
  } catch (err) {
    console.error(`[Container] Failed to stop/remove ${containerId}:`, err.message);
  }
}

async function removeDockerImage(imageName) {
  if (!imageName) return;
  try {
    const image = docker.getImage(imageName);
    await image.remove({ force: true }).catch(() => {});
    console.log(`[Image] Removed: ${imageName}`);
  } catch (err) {
    console.error(`[Image] Failed to remove ${imageName}:`, err.message);
  }
}

async function performHealthCheck(containerId, port, frameworkName = 'unknown', maxRetries = 10, intervalMs = 3000) {
  const isStaticSite = frameworkName === 'static';
  const healthPath = isStaticSite ? '/' : '/health';
  const expectJson = !isStaticSite;
  
  // Use host.docker.internal to reach host from within container
  const healthCheckHost = process.env.HEALTH_CHECK_HOST || 'host.docker.internal';

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const container = docker.getContainer(containerId);
      const inspect = await container.inspect();
      
      if (!inspect.State.Running) {
        throw new Error('Container is not running');
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      const response = await fetch(`http://${healthCheckHost}:${port}${healthPath}`, {
        method: 'GET',
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (response.ok) {
        if (expectJson) {
          const healthData = await response.json();
          if (healthData.status === 'healthy' || healthData.status === 'ok') {
            console.log(`[HealthCheck] Passed on attempt ${attempt}/${maxRetries}`);
            return true;
          }
        } else {
          // For static sites, any 2xx response is healthy
          console.log(`[HealthCheck] Passed on attempt ${attempt}/${maxRetries} (static site)`);
          return true;
        }
      }
      
      console.log(`[HealthCheck] Attempt ${attempt}/${maxRetries} failed with status ${response.status}, retrying in ${intervalMs}ms...`);
    } catch (err) {
      console.log(`[HealthCheck] Attempt ${attempt}/${maxRetries} error: ${err.message}`);
    }
    
    if (attempt < maxRetries) {
      await new Promise(resolve => setTimeout(resolve, intervalMs));
    }
  }
  
  throw new Error(`Health check failed after ${maxRetries} attempts`);
}

async function cleanupDeploymentResources(deploymentId, containerId, imageName, deploymentDir) {
  console.log(`[Cleanup] Cleaning up resources for deployment ${deploymentId}`);
  
  if (containerId) {
    try {
      const container = docker.getContainer(containerId);
      await container.stop({ t: 10 }).catch(() => {});
      await container.remove({ force: true }).catch(() => {});
      console.log(`[Cleanup] Removed container: ${containerId}`);
    } catch (err) {
      console.error(`[Cleanup] Failed to remove container ${containerId}:`, err.message);
    }
  }
  
  if (imageName) {
    try {
      const image = docker.getImage(imageName);
      await image.remove({ force: true }).catch(() => {});
      console.log(`[Cleanup] Removed image: ${imageName}`);
    } catch (err) {
      console.error(`[Cleanup] Failed to remove image ${imageName}:`, err.message);
    }
  }
  
  try {
    await fs.remove(deploymentDir).catch(() => {});
    console.log(`[Cleanup] Removed deployment directory: ${deploymentDir}`);
  } catch (err) {
    console.error(`[Cleanup] Failed to remove deployment directory:`, err.message);
  }
}

console.log('🚀 CloudScale Worker Engine Initialized...');
console.log('📡 Listening for deployment jobs on queue: "deployment-queue"...');

const worker = new Worker(
  'deployment-queue',
  async (job) => {
    const {
      deploymentId,
      projectId,
      projectName,
      repoUrl,
      branch,
      assignedPort,
      environmentVariables = {},
    } = job.data;

    console.log('==================================================');
    console.log(`📦 [Job ID: ${job.id}] Received deployment job for: "${projectName}"`);
    console.log(`   • Project ID: ${projectId}`);
    console.log(`   • Repo: ${repoUrl}`);
    console.log(`   • Branch: ${branch}`);
    console.log(`   • Target Host Port: ${assignedPort}`);
    console.log('==================================================');

    const deploymentDir = path.join(deploymentsDir, deploymentId);
    let container;
    let imageTag;
    let containerName;
    let buildLogs = '';
    let frameworkInfo;

    try {
      await updateDeploymentStatus(deploymentId, 'VALIDATING');
      await publishLog(deploymentId, 'VALIDATING', 'Validating repository URL...', DEPLOYMENT_STAGES.VALIDATING.progress);
      await job.updateProgress(DEPLOYMENT_STAGES.VALIDATING.progress);

      try {
        validateRepoUrl(repoUrl);
        await publishLog(deploymentId, 'VALIDATING', 'Repository URL validated.', DEPLOYMENT_STAGES.VALIDATING.progress);
      } catch (err) {
        throw new Error(`VALIDATING failed: ${err.message}`);
      }

      await updateDeploymentStatus(deploymentId, 'CLONING');
      await publishLog(deploymentId, 'CLONING', 'Cloning GitHub repository...', DEPLOYMENT_STAGES.CLONING.progress);
      await job.updateProgress(DEPLOYMENT_STAGES.CLONING.progress);

      try {
        await fs.remove(deploymentDir);
        await simpleGit().clone(
          repoUrl,
          deploymentDir,
          ['--branch', branch, '--single-branch']
        );
        await publishLog(deploymentId, 'CLONING', 'Repository cloned successfully.', DEPLOYMENT_STAGES.CLONING.progress);
      } catch (err) {
        throw new Error(`CLONING failed: ${err.message}`);
      }

      try {
        await publishLog(deploymentId, 'CLONING', 'Checking for Dockerfile...', DEPLOYMENT_STAGES.CLONING.progress);
        checkDockerfileExists(deploymentDir);
        await publishLog(deploymentId, 'CLONING', 'Dockerfile found.', DEPLOYMENT_STAGES.CLONING.progress);
      } catch (err) {
        throw new Error(`CLONING failed (Dockerfile check): ${err.message}`);
      }

      await updateDeploymentStatus(deploymentId, 'DETECTING');
      await publishLog(deploymentId, 'DETECTING', 'Detecting framework...', DEPLOYMENT_STAGES.DETECTING.progress);
      await job.updateProgress(DEPLOYMENT_STAGES.DETECTING.progress);

      try {
        frameworkInfo = detectFramework(deploymentDir);
        await publishLog(deploymentId, 'DETECTING', `Framework detected: ${frameworkInfo.name}${frameworkInfo.version ? ` v${frameworkInfo.version}` : ''}${frameworkInfo.packageManager ? ` (${frameworkInfo.packageManager})` : ''}`, DEPLOYMENT_STAGES.DETECTING.progress);
      } catch (err) {
        throw new Error(`DETECTING failed (framework detection): ${err.message}`);
      }

      try {
        await publishLog(deploymentId, 'DETECTING', 'Removing .git directory...', DEPLOYMENT_STAGES.DETECTING.progress);
        await fs.remove(path.join(deploymentDir, '.git'));
        await publishLog(deploymentId, 'DETECTING', '.git directory removed.', DEPLOYMENT_STAGES.DETECTING.progress);
      } catch (err) {
        throw new Error(`DETECTING failed (.git removal): ${err.message}`);
      }

      await updateDeploymentStatus(deploymentId, 'BUILDING');
      await publishLog(deploymentId, 'BUILDING', 'Building Docker image...', DEPLOYMENT_STAGES.BUILDING.progress);
      await job.updateProgress(DEPLOYMENT_STAGES.BUILDING.progress);

      buildLogs = '';
      imageTag = `cloudscale/${projectName}:latest`;

      try {
        const tarStream = await createTarStream(deploymentDir);

        const buildStream = await docker.buildImage(tarStream, {
          t: imageTag,
        });

        await new Promise((resolve, reject) => {
          buildStream.on('data', (chunk) => {
            const chunkStr = chunk.toString();
            buildLogs += chunkStr;
            publishLog(deploymentId, 'BUILDING', `[Docker Build] ${chunkStr.trim()}`, DEPLOYMENT_STAGES.BUILDING.progress);
          });

          buildStream.on('end', resolve);
          buildStream.on('error', reject);
        });

        await publishLog(deploymentId, 'BUILDING', 'Docker image built successfully.', DEPLOYMENT_STAGES.BUILDING.progress);
      } catch (buildError) {
        const errorMsg = `BUILDING failed: ${buildError.message}\nBuild logs:\n${cleanLogs(buildLogs)}`;
        throw new Error(errorMsg);
      }

      await updateDeploymentStatus(deploymentId, 'STARTING');
      await publishLog(deploymentId, 'STARTING', 'Creating and starting container...', DEPLOYMENT_STAGES.STARTING.progress);
      await job.updateProgress(DEPLOYMENT_STAGES.STARTING.progress);

      containerName = `app-${projectName}-${deploymentId.slice(0, 8)}`;
      container = undefined;

      const sanitizedEnvVars = sanitizeEnvVars(environmentVariables);

      try {
        try {
          const existingContainer = docker.getContainer(containerName);
          await existingContainer.remove({ force: true }).catch(() => {});
        } catch (e) {}

        container = await docker.createContainer({
          Image: imageTag,
          HostConfig: {
            PortBindings: {
              '3000/tcp': [{ HostPort: String(assignedPort), HostIp: '0.0.0.0' }],
            },

            Memory: 512 * 1024 * 1024,
            MemorySwap: 512 * 1024 * 1024,
            CpuPeriod: 100000,
            CpuQuota: 50000,
            PidsLimit: 100,

            Ulimits: [
              { Name: 'nofile', Soft: 1024, Hard: 1024 },
            ],

            SecurityOpt: [
              'no-new-privileges:true',
            ],

            ReadonlyRootfs: true,

            Tmpfs: {
              "/tmp": "rw,noexec,nosuid,size=64m",
              "/var/cache/nginx": "rw,size=64m",
              "/var/run": "rw,size=16m",
              "/var/lib/nginx": "rw,size=32m",
              "/var/cache/nginx/client_temp": "rw,size=16m",
              "/var/cache/nginx/proxy_temp": "rw,size=16m",
              "/var/cache/nginx/fastcgi_temp": "rw,size=16m",
              "/var/cache/nginx/uwsgi_temp": "rw,size=16m",
              "/var/cache/nginx/scgi_temp": "rw,size=16m"
            },

            CapDrop: ['ALL'],
            CapAdd: ['CHOWN', 'DAC_OVERRIDE', 'SETGID', 'SETUID'],
            AutoRemove: false,
          },
          ExposedPorts: {
            '3000/tcp': {},
          },
          Env: ['PORT=3000', ...Object.entries(sanitizedEnvVars).map(([k, v]) => `${k}=${v}`)],
          Labels: {
            'cloudscale.projectId': projectId,
            'cloudscale.deploymentId': deploymentId,
          },
          name: containerName,
        });

        await publishLog(deploymentId, 'STARTING', `Container created: ${containerName} (hardened, readonly rootfs)`, DEPLOYMENT_STAGES.STARTING.progress);

        await container.start();
        await publishLog(deploymentId, 'STARTING', 'Container started', DEPLOYMENT_STAGES.STARTING.progress);

        await new Promise((resolve) => setTimeout(resolve, 2000));
        const inspect = await container.inspect();

        if (!inspect.State.Running) {
          const logs = await container.logs({ stdout: true, stderr: true });
          throw new Error(`Container failed to start. Logs: ${cleanLogs(logs)}`);
        }

        await publishLog(deploymentId, 'STARTING', 'Container verified running', DEPLOYMENT_STAGES.STARTING.progress);
      } catch (containerError) {
        if (container) {
          await container.remove({ force: true }).catch(() => {});
        } else {
          // Try to remove by name if container variable not set
          try {
            const existingContainer = docker.getContainer(containerName);
            await existingContainer.remove({ force: true }).catch(() => {});
          } catch (e) {}
        }
        throw new Error(`STARTING failed: ${containerError.message}`);
      }

      await updateDeploymentStatus(deploymentId, 'HEALTH_CHECK');
      await publishLog(deploymentId, 'HEALTH_CHECK', 'Running application health checks...', DEPLOYMENT_STAGES.HEALTH_CHECK.progress);
      await job.updateProgress(DEPLOYMENT_STAGES.HEALTH_CHECK.progress);

      try {
        await performHealthCheck(container.id, assignedPort, frameworkInfo?.name);
        await publishLog(deploymentId, 'HEALTH_CHECK', 'Health check passed!', DEPLOYMENT_STAGES.HEALTH_CHECK.progress);
      } catch (healthError) {
        await cleanupDeploymentResources(deploymentId, container.id, imageTag, deploymentDir);
        throw new Error(`HEALTH_CHECK failed: ${healthError.message}`);
      }

      const deploymentUrl = `/deployments/${deploymentId}`;
      
      await updateDeploymentStatus(deploymentId, 'RUNNING', {
        containerId: container.id,
        containerName: containerName,
        containerPort: 3000,
        imageName: imageTag,
        liveUrl: `http://localhost:${assignedPort}`,
        deploymentUrl: deploymentUrl,
      });
      await publishLog(deploymentId, 'RUNNING', `Container successfully provisioned! App live on port ${assignedPort}.`, DEPLOYMENT_STAGES.RUNNING.progress);
      await job.updateProgress(DEPLOYMENT_STAGES.RUNNING.progress);

      await prisma.deployment.update({
        where: { id: deploymentId },
        data: {
          logs: cleanLogs(`Deployment completed successfully. 
Repository cloned to ${deploymentDir}. 
Docker image built: ${imageTag}.
Container: ${containerName} (${container.id.slice(0, 12)})
Port mapping: ${assignedPort} -> 3000
Framework: ${frameworkInfo.name}${frameworkInfo.version ? ` v${frameworkInfo.version}` : ''}${frameworkInfo.packageManager ? ` (${frameworkInfo.packageManager})` : ''}
Build logs:\n${cleanLogs(buildLogs)}`),
        },
      });

      await publishLog(deploymentId, 'RUNNING', 'Deployment completed successfully!', DEPLOYMENT_STAGES.RUNNING.progress);

      return {
        status: 'RUNNING',
        imageTag: imageTag,
        containerId: container.id,
        containerName: containerName,
        containerPort: 3000,
        hostPort: assignedPort,
        liveUrl: `http://localhost:${assignedPort}`,
        deploymentUrl: `/deployments/${deploymentId}`,
        framework: frameworkInfo,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      const errorStack = error instanceof Error ? error.stack : undefined;
      
      console.error('❌ Deployment failed:', {
        deploymentId,
        projectId,
        projectName,
        stage: 'unknown',
        error: errorMessage,
        stack: errorStack,
      });

      await publishLog(deploymentId, 'FAILED', `Deployment failed: ${errorMessage}`, DEPLOYMENT_STAGES.FAILED.progress);

      try {
        await cleanupDeploymentResources(deploymentId, container?.id, imageTag, deploymentDir);
      } catch (cleanupError) {
        console.error('🗑️⚠️ Failed to cleanup deployment resources:', {
          deploymentId,
          error: cleanupError.message,
        });
      }

      await updateDeploymentStatus(deploymentId, 'FAILED', {
        logs: cleanLogs(errorMessage),
      });

      throw error;
    }
  },
  {
    connection: redisConnection,
    maxStalledCount: 2,
    stalledInterval: 30000,
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 5000,
    },
    removeOnComplete: { count: 100 },
    removeOnFail: { count: 50 },
  }
);

worker.on('completed', (job, returnvalue) => {
  console.log(`✅ [Job ID: ${job.id}] COMPLETED SUCCESSFULLY!`);
  console.log('   Result:', returnvalue);
  
  if (job.data?.deploymentId) {
    publishLog(job.data.deploymentId, 'RUNNING', 'Job completed successfully', DEPLOYMENT_STAGES.RUNNING.progress);
  }
});

worker.on('failed', (job, err) => {
  const errorMessage = err instanceof Error ? err.message : String(err);
  const errorStack = err instanceof Error ? err.stack : undefined;
  
  console.error(`❌ [Job ID: ${job?.id}] FAILED:`, {
    jobId: job?.id,
    deploymentId: job?.data?.deploymentId,
    projectId: job?.data?.projectId,
    projectName: job?.data?.projectName,
    attempt: job?.attemptsMade,
    maxAttempts: job?.opts?.attempts,
    error: errorMessage,
    stack: errorStack,
  });
  
  if (job?.data?.deploymentId) {
    publishLog(job.data.deploymentId, 'FAILED', `Job failed: ${errorMessage}`, DEPLOYMENT_STAGES.FAILED.progress);
  }
});

worker.on('stalled', (jobId) => {
  console.warn(`⚠️ [Job ID: ${jobId}] STALLED - will be retried`);
  
  // Try to get job details for better logging
  const queue = new Queue('deployment-queue', { connection: redisConnection });
  queue.getJob(jobId).then(job => {
    if (job) {
      console.warn(`⚠️ Stalled job details:`, {
        jobId: job.id,
        deploymentId: job.data?.deploymentId,
        projectId: job.data?.projectId,
        attemptsMade: job.attemptsMade,
        maxAttempts: job.opts?.attempts,
      });
    }
    return queue.close();
  }).catch(() => {});
});

worker.on('error', (err) => {
  console.error('❌ Worker error:', {
    error: err instanceof Error ? err.message : String(err),
    stack: err instanceof Error ? err.stack : undefined,
  });
});

const gracefulShutdown = async (signal) => {
  console.log(`\n🛑 Received ${signal}. Shutting down gracefully...`);
  await worker.close();
  await redis.quit();
  await prisma.$disconnect();
  process.exit(0);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));