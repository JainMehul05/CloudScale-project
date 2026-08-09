const { Queue } = require('bullmq');

const redisConnection = { host: 'localhost', port: 6379 };
const deploymentQueue = new Queue('deployment-queue', { connection: redisConnection });

async function sendTestJob() {
  console.log('?? Pushing a test deployment job into Redis queue...');

  const job = await deploymentQueue.add('build-and-deploy', {
    projectId: 'proj-101',
    projectName: 'my-first-app',
    githubRepo: 'https://github.com/expressjs/express',
    assignedPort: 3001,
  });

  console.log('? Test Job queued successfully with ID: ' + job.id);
  process.exit(0);
}

sendTestJob();
