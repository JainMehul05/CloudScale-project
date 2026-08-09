const { Worker } = require('bullmq');
const Docker = require('dockerode');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const docker = new Docker();

const redisConnection = {
  host: 'localhost',
  port: 6379,
};

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
      // Step 1: Simulate GitHub Repository Cloning
      console.log('[1/4] 📥 Cloning repository snapshot...');
      await job.updateProgress(25);

      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Step 2: Simulate Docker Image Build
      console.log(
        '[2/4] 🐳 Building Docker image "cloudscale/' +
          projectName +
          ':latest"...'
      );
      await job.updateProgress(50);

      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Step 3: Verify Docker Engine Health
      const info = await docker.info();

      console.log(
        '[3/4] 🐳 Connected to Docker Daemon (v' +
          info.ServerVersion +
          ')...'
      );

      await job.updateProgress(75);

      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Step 4: Finish
      console.log(
        '[4/4] ✅ Container successfully provisioned! App live on port ' +
          assignedPort +
          '.'
      );

      // Update PostgreSQL deployment
      await prisma.deployment.update({
        where: {
          id: deploymentId,
        },
        data: {
          status: 'DEPLOYED',
          logs:
            `Deployment completed successfully. ` +
            `App live on port ${assignedPort}.`,
        },
      });

      await job.updateProgress(100);

      return {
        status: 'DEPLOYED',
        containerName: 'app-' + projectName,
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

      // Update PostgreSQL deployment as FAILED
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

worker.on('completed', (job, returnvalue) => {
  console.log(
    '✅ [Job ID: ' +
      job.id +
      '] COMPLETED SUCCESSFULLY!'
  );

  console.log('   Result:', returnvalue);
});

worker.on('failed', (job, err) => {
  console.error(
    '❌ [Job ID: ' +
      job?.id +
      '] FAILED: ' +
      err.message
  );
});