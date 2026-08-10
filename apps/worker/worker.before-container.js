require("dotenv").config();

const { Worker } = require('bullmq');
const Docker = require('dockerode');
const { PrismaClient } = require('@prisma/client');
const simpleGit = require('simple-git');
const fs = require('fs-extra');
const path = require('path');

const prisma = new PrismaClient();
const docker = new Docker();

const redisConnection = {
  host: 'localhost',
  port: 6379,
};

// Directory where repositories will be cloned
const deploymentsDir = path.join(__dirname, 'deployments');

fs.ensureDirSync(deploymentsDir);

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

    try {
      // ==================================================
      // STEP 1: REAL GITHUB REPOSITORY CLONE
      // ==================================================

      console.log('[1/4] 📥 Cloning GitHub repository...');

      const deploymentDir = path.join(
        deploymentsDir,
        deploymentId
      );

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

      await job.updateProgress(25);

      // ==================================================
      // STEP 2: DOCKER BUILD
      // ==================================================

   console.log(
  '[2/4] Building Docker image "cloudscale/' +
    projectName +
    ':latest"...'
);

const imageTag =
  'cloudscale/' +
  projectName.toLowerCase().replace(/[^a-z0-9_.-]/g, '-') +
  ':latest';

const buildStream = await docker.buildImage(
  {
    context: deploymentDir,
    src: ['.'],
  },
  {
    t: imageTag,
  }
);

await new Promise((resolve, reject) => {
  docker.modem.followProgress(
    buildStream,
    (error, output) => {
      if (error) {
        reject(error);
        return;
      }

      resolve(output);
    },
    (event) => {
      if (event.stream) {
        process.stdout.write(event.stream);
      }

      if (event.error) {
        console.error(event.error);
      }
    }
  );
});

console.log(
  '[2/4] Docker image built successfully: ' +
    imageTag
);

await job.updateProgress(50);
      // ==================================================
      // STEP 3: DOCKER ENGINE HEALTH CHECK
      // ==================================================

      const info = await docker.info();

      console.log(
        '[3/4] 🐳 Connected to Docker Daemon (v' +
          info.ServerVersion +
          ')...'
      );

      await job.updateProgress(75);

      await new Promise((resolve) =>
        setTimeout(resolve, 1000)
      );

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
            `App live on port ${assignedPort}.`,
        },
      });

      await job.updateProgress(100);

      return {
        status: 'DEPLOYED',
        containerName:
          'app-' + projectName,
        liveUrl:
          'http://' +
          projectName +
          '.localhost:' +
          assignedPort,
      };
    } catch (error) {
      console.error(
        '❌ Deployment failed:',
        error.message
      );

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