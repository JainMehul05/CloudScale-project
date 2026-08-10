require("dotenv").config();

const { Worker } = require('bullmq');
const Docker = require('dockerode');
const { PrismaClient } = require('@prisma/client');
const simpleGit = require('simple-git');
const fs = require('fs-extra');
const path = require('path');
const tar = require('tar-stream');

const prisma = new PrismaClient();
const docker = new Docker();

const redisConnection = {
  host: 'localhost',
  port: 6379,
};

// Directory where repositories will be cloned
const deploymentsDir = path.join(__dirname, 'deployments');

fs.ensureDirSync(deploymentsDir);

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

function createTarStream(dir) {
  return new Promise((resolve, reject) => {
    const pack = tar.pack();
    const entries = [];

    function addFiles(currentDir, relativePath = '') {
      const items = fs.readdirSync(currentDir);
      for (const item of items) {
        const fullPath = path.join(currentDir, item);
        const relPath = path.join(relativePath, item);
        
        // Skip excluded directories/files
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

console.log('🚀 CloudScale Worker Engine Initialized...');
console.log(
  '📡 Listening for deployment jobs on queue: "deployment-queue"...\n'
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
    } = job.data;

    console.log('==================================================');
    console.log(
      '📦 [Job ID: ' +
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

    // Validate repository URL (security)
    console.log('[0/4] 🔒 Validating repository URL...');
    validateRepoUrl(repoUrl);
    console.log('[0/4] ✅ Repository URL validated.');

    // Mark deployment as BUILDING
    await prisma.deployment.update({
      where: {
        id: deploymentId,
      },
      data: {
        status: 'BUILDING',
        logs: `Deployment started for ${projectName}`,
      },
    });

    const deploymentDir = path.join(
      deploymentsDir,
      deploymentId
    );

    try {
      // ==================================================
      // STEP 1: REAL GITHUB REPOSITORY CLONE
      // ==================================================

      console.log('[1/4] 📥 Cloning GitHub repository...');

      // Remove an old clone if one exists
      await fs.remove(deploymentDir);

      // Clone the requested branch
      await simpleGit().clone(
        repoUrl,
        deploymentDir,
        [
          '--branch',
          branch,
          '--single-branch',
        ]
      );

      console.log(
        '[1/4] ✅ Repository cloned successfully.'
      );

      // Check for Dockerfile
      console.log('[1.5/4] 🔍 Checking for Dockerfile...');
      checkDockerfileExists(deploymentDir);
      console.log('[1.5/4] ✅ Dockerfile found.');

      // Remove .git directory to reduce image size and avoid leaking git history
      console.log('[1.7/4] 🧹 Removing .git directory...');
      await fs.remove(path.join(deploymentDir, '.git'));
      console.log('[1.7/4] ✅ .git directory removed.');

      await job.updateProgress(25);

      // ==================================================
      // STEP 2: DOCKER BUILD
      // ==================================================

      console.log(
        '[2/4] 🐳 Building Docker image "cloudscale/' +
          projectName +
          ':latest"...'
      );

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
            console.log(`[Docker Build] ${chunkStr.trim()}`);
          });

          buildStream.on('end', resolve);
          buildStream.on('error', reject);
        });

        console.log('[2/4] ✅ Docker image built successfully.');
      } catch (buildError) {
        const errorMsg = `Docker build failed: ${buildError.message}\nBuild logs:\n${buildLogs}`;
        throw new Error(errorMsg);
      }

      await job.updateProgress(50);

      // ==================================================
      // STEP 3: CREATE AND START CONTAINER
      // ==================================================

      console.log('[3/4] 📦 Creating and starting container...');

      let container;
      const containerName = `app-${projectName}-${deploymentId.slice(0, 8)}`;

      try {
        container = await docker.createContainer({
          Image: imageTag,
          HostConfig: {
            PortBindings: {
              '3000/tcp': [{ HostPort: String(assignedPort) }],
            },
            Memory: 512 * 1024 * 1024,      // 512MB
            MemorySwap: 512 * 1024 * 1024,  // No swap
            CpuPeriod: 100000,
            CpuQuota: 50000,                // 0.5 CPU
            AutoRemove: false,
          },
          ExposedPorts: {
            '3000/tcp': {},
          },
          Env: ['PORT=3000'],
          Labels: {
            'cloudscale.projectId': projectId,
            'cloudscale.deploymentId': deploymentId,
          },
          name: containerName,
        });

        console.log(`[3/4] ✅ Container created: ${containerName}`);

        await container.start();
        console.log(`[3/4] ✅ Container started`);

        // Verify container is running
        await new Promise((resolve) => setTimeout(resolve, 2000));
        const inspect = await container.inspect();
        
        if (!inspect.State.Running) {
          const logs = await container.logs({ stdout: true, stderr: true });
          throw new Error(`Container failed to start. Logs: ${logs}`);
        }

        console.log('[3/4] ✅ Container verified running');
      } catch (containerError) {
        if (container) {
          await container.remove({ force: true }).catch(() => {});
        }
        throw new Error(`Container creation/start failed: ${containerError.message}`);
      }

      await job.updateProgress(75);

      // ==================================================
      // STEP 4: DEPLOYMENT COMPLETE
      // ==================================================

      console.log(
        '[4/4] ✅ Container successfully provisioned! ' +
          'App live on port ' +
          assignedPort +
          '.'
      );

      await prisma.deployment.update({
        where: {
          id: deploymentId,
        },
        data: {
          status: 'DEPLOYED',
          logs:
            `Deployment completed successfully. ` +
            `Repository cloned to ${deploymentDir}. ` +
            `Docker image built: ${imageTag}.\n` +
            `Container: ${containerName} (${container.id.slice(0, 12)})\n` +
            `Port mapping: ${assignedPort} -> 3000\n` +
            `Build logs:\n${buildLogs}`,
        },
      });

      await job.updateProgress(100);

      return {
        status: 'DEPLOYED',
        imageTag: imageTag,
        containerId: container.id,
        containerName: containerName,
        containerPort: 3000,
        hostPort: assignedPort,
        liveUrl: `http://localhost:${assignedPort}`,
      };
    } catch (error) {
      console.error(
        '❌ Deployment failed:',
        error.message
      );

      // Cleanup deployment directory on failure
      try {
        await fs.remove(deploymentDir);
        console.log(`🧹 Cleaned up deployment directory: ${deploymentDir}`);
      } catch (cleanupError) {
        console.error('⚠️ Failed to cleanup deployment directory:', cleanupError.message);
      }

      await prisma.deployment.update({
        where: {
          id: deploymentId,
        },
        data: {
          status: 'FAILED',
          logs: error.message,
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
      '✅ [Job ID: ' +
        job.id +
        '] COMPLETED SUCCESSFULLY!'
    );

    console.log(
      '   Result:',
      returnvalue
    );
  }
);

worker.on(
  'failed',
  (job, err) => {
    console.error(
      '❌ [Job ID: ' +
        job?.id +
        '] FAILED: ' +
        err.message
    );
  }
);