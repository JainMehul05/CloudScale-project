const { Queue } = require('bullmq');

const redisConnection = {
  host: 'localhost',
  port: 6379,
};

const deploymentQueue = new Queue('deployment-queue', {
  connection: redisConnection,
});

async function sendTestJob() {
  console.log('📦 Pushing real deployment job into Redis queue...');

  const job = await deploymentQueue.add('build-and-deploy', {
    deploymentId: '01b7b8e2-f6f1-4897-ae43-69c4ae874bdc',
    projectId: 'aa907dff-cfb8-4e05-9bdf-1956a73f0946',
    projectName: 'worker-test-app',
    repoUrl: 'https://github.com/expressjs/express',
    branch: 'master',
    assignedPort: 3010,
  });

  console.log('✅ Deployment job queued successfully!');
  console.log('Job ID:', job.id);

  await deploymentQueue.close();
}

sendTestJob().catch((error) => {
  console.error('❌ Failed to queue deployment job:');
  console.error(error);
  process.exitCode = 1;
});