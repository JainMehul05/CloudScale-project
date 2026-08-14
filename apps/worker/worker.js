require("dotenv").config();

const { Worker } = require('bullmq');
const Docker = require('dockerode');
const { PrismaClient } = require('@prisma/client');
const simpleGit = require('simple-git');
const fs = require('fs-extra');
const path = require('path');
const tar = require('tar-stream');
const cron = require('node-cron');

const prisma = new PrismaClient();
const docker = new Docker();

function cleanLogs(logs) {
  return String(logs).replace(/\0/g, "");
}

function publishLog(deploymentId, message) {
  const Redis = require('ioredis');
  const redis = new Redis({ host: 'localhost', port: 6379, lazyConnect: true });
  redis.connect().then(() => {
    redis.publish(`logs:${deploymentId}`, cleanLogs(message)).catch(() => {});
    redis.quit().catch(() => {});
  }).catch(() => {});
}

const redisConnection = {
  host: 'localhost',
  port: 6379,
};

// Directory where repositories will be cloned
const deploymentsDir = path.join(__dirname, 'deployments');

fs.ensureDirSync(deploymentsDir);

// Cleanup configuration
const CLEANUP_DAYS = 7;
const CLEANUP_SCHEDULE = '0 3 * * *';

async function cleanupOldDeployments() {
  console.log('[Cleanup] Starting deployment cleanup...');

  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - CLEANUP_DAYS);

  try {
    const oldDeployments = await prisma.deployment.findMany({
      where: {
        status: { in: ['DEPLOYED', 'FAILED'] },
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

function checkDockerfileExists(dir) {
  const dockerfilePath = path.join(dir, 'Dockerfile');
  if (!fs.existsSync(dockerfilePath)) {
    throw new Error('Dockerfile not found at repository root. A Dockerfile is required for deployment.');
  }
  return true;
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

console.log('���� CloudScale Worker Engine Initialized...');
console.log(
  '���� Listening for deployment jobs on queue: "deployment-queue"...\n'
);

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
    console.log(
      '���� [Job ID: ' +
        job.id +
        '] Received deployment job for: "' +
        projectName +
        '"'
    );
    console.log('   • Project ID: ' + projectId);
    console.log('   • Repo: ' + repoUrl);
    console.log('   • Branch: ' + branch);
    console.log('   • Target Host Port: ' + assignedPort);
    console.log('==================================================');

    publishLog(deploymentId, `[0/4] Validating repository URL...`);
    
    validateRepoUrl(repoUrl);
    
    publishLog(deploymentId, `[0/4] Repository URL validated.`);

    await prisma.deployment.update({
      where: {
        id: deploymentId,
      },
      data: {
        status: 'BUILDING',
        logs: cleanLogs(`Deployment started for ${projectName}`),
      },
    });

    const deploymentDir = path.join(
      deploymentsDir,
      deploymentId
    );

    try {
      publishLog(deploymentId, '[1/4] Cloning GitHub repository...');

      await fs.remove(deploymentDir);

      await simpleGit().clone(
        repoUrl,
        deploymentDir,
        [
          '--branch',
          branch,
          '--single-branch',
        ]
      );

      publishLog(deploymentId, '[1/4] Repository cloned successfully.');

      publishLog(deploymentId, '[1.5/4] Checking for Dockerfile...');
      checkDockerfileExists(deploymentDir);
      publishLog(deploymentId, '[1.5/4] Dockerfile found.');

      publishLog(deploymentId, '[1.6/4] Detecting framework...');
      const frameworkInfo = detectFramework(deploymentDir);
      publishLog(deploymentId, '[1.6/4] Framework detection complete.');

      publishLog(deploymentId, '[1.7/4] Removing .git directory...');
      await fs.remove(path.join(deploymentDir, '.git'));
      publishLog(deploymentId, '[1.7/4] .git directory removed.');

      await job.updateProgress(25);

      publishLog(deploymentId, '[2/4] Building Docker image...');

      let buildLogs = '';
      const imageTag = `cloudscale/${projectName}:latest`;

      try {
        const tarStream = await createTarStream(deploymentDir);

        const buildStream = await docker.buildImage(tarStream, {
          t: imageTag,
        });

        await new Promise((resolve, reject) => {
          buildStream.on('data', (chunk) => {
            const chunkStr = chunk.toString();
            buildLogs += chunkStr;
            publishLog(deploymentId, `[Docker Build] ${chunkStr.trim()}`);
          });

          buildStream.on('end', resolve);
          buildStream.on('error', reject);
        });

        publishLog(deploymentId, '[2/4] Docker image built successfully.');
      } catch (buildError) {
        const errorMsg = `Docker build failed: ${buildError.message}\nBuild logs:\n${cleanLogs(buildLogs)}`;
        throw new Error(errorMsg);
      }

      await job.updateProgress(50);

      publishLog(deploymentId, '[3/4] Creating and starting container...');

      let container;
      const containerName = `app-${projectName}-${deploymentId.slice(0, 8)}`;

      try {
        container = await docker.createContainer({
          Image: imageTag,
          HostConfig: {
            PortBindings: {
              '3000/tcp': [{ HostPort: String(assignedPort) }],
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
          Env: ['PORT=3000', ...Object.entries(environmentVariables).map(([k, v]) => `${k}=${v}`)],
          Labels: {
            'cloudscale.projectId': projectId,
            'cloudscale.deploymentId': deploymentId,
          },
          name: containerName,
        });

        publishLog(deploymentId, `[3/4] Container created: ${containerName} (hardened, readonly rootfs)`);

        await container.start();
        publishLog(deploymentId, `[3/4] Container started`);

        await new Promise((resolve) => setTimeout(resolve, 2000));
        const inspect = await container.inspect();

        if (!inspect.State.Running) {
          const logs = await container.logs({ stdout: true, stderr: true });
          throw new Error(`Container failed to start. Logs: ${cleanLogs(logs)}`);
        }

        publishLog(deploymentId, '[3/4] Container verified running');
      } catch (containerError) {
        if (container) {
          await container.remove({ force: true }).catch(() => {});
        }
        throw new Error(`Container creation/start failed: ${containerError.message}`);
      }

      await job.updateProgress(75);

      publishLog(deploymentId, '[4/4] Container successfully provisioned! App live on port ' + assignedPort + '.');

      await prisma.deployment.update({
        where: {
          id: deploymentId,
        },
        data: {
          status: 'DEPLOYED',
          containerId: container.id,
          containerName: containerName,
          containerPort: 3000,
          imageName: imageTag,
          liveUrl: `http://localhost:${assignedPort}`,
          logs:
            cleanLogs(`Deployment completed successfully. ` +
            `Repository cloned to ${deploymentDir}. ` +
            `Docker image built: ${imageTag}.\n` +
            `Container: ${containerName} (${container.id.slice(0, 12)})\n` +
            `Port mapping: ${assignedPort} -> 3000\n` +
            `Framework: ${frameworkInfo.name}${frameworkInfo.version ? ` v${frameworkInfo.version}` : ''}${frameworkInfo.packageManager ? ` (${frameworkInfo.packageManager})` : ''}\n` +
            `Build logs:\n${cleanLogs(buildLogs)}`),
        },
      });

      await job.updateProgress(100);

      publishLog(deploymentId, '[4/4] Deployment completed successfully!');

      return {
        status: 'DEPLOYED',
        imageTag: imageTag,
        containerId: container.id,
        containerName: containerName,
        containerPort: 3000,
        hostPort: assignedPort,
        liveUrl: `http://localhost:${assignedPort}`,
        framework: frameworkInfo,
      };
    } catch (error) {
      console.error(
        '��� Deployment failed:',
        error.message
      );

      publishLog(deploymentId, `Deployment failed: ${error.message}`);

      try {
        await fs.remove(deploymentDir);
        console.log(`���� Cleaned up deployment directory: ${deploymentDir}`);
      } catch (cleanupError) {
        console.error('������ Failed to cleanup deployment directory:', cleanupError.message);
      }

      await prisma.deployment.update({
        where: {
          id: deploymentId,
        },
        data: {
          status: 'FAILED',
          logs: cleanLogs(error.message),
        },
      });

      throw error;
    }
  },
  {
    connection: redisConnection,
  }
);

worker.on(
  'completed',
  (job, returnvalue) => {
    console.log(
      '��� [Job ID: ' +
        job.id +
        '] COMPLETED SUCCESSFULLY!'
    );

    console.log(
      '   Result:',
      returnvalue
    );
    
    if (job.data?.deploymentId) {
      publishLog(job.data.deploymentId, 'Job completed successfully');
    }
  }
);

worker.on(
  'failed',
  (job, err) => {
    console.error(
      '��� [Job ID: ' +
        job?.id +
        '] FAILED: ' +
        err.message
    );
    
    if (job?.data?.deploymentId) {
      publishLog(job.data.deploymentId, `Job failed: ${err.message}`);
    }
  }
);