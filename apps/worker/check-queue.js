const { Queue } = require('bullmq');

async function checkQueue() {
  const queue = new Queue('deployment-queue', { connection: { host: 'localhost', port: 6379 } });
  
  const waiting = await queue.getWaiting();
  const active = await queue.getActive();
  const completed = await queue.getCompleted();
  const failed = await queue.getFailed();
  
  console.log('Waiting:', waiting.length);
  console.log('Active:', active.length);
  console.log('Completed:', completed.length);
  console.log('Failed:', failed.length);
  
  if (waiting.length > 0) {
    console.log('Waiting jobs:', waiting.map(j => ({ id: j.id, data: j.data })));
  }
  if (active.length > 0) {
    console.log('Active jobs:', active.map(j => ({ id: j.id, data: j.data })));
  }
  if (completed.length > 0) {
    console.log('Completed jobs:', completed.map(j => ({ id: j.id, returnvalue: j.returnvalue })));
  }
  if (failed.length > 0) {
    console.log('Failed jobs:', failed.map(j => ({ id: j.id, failedReason: j.failedReason })));
  }
  
  await queue.close();
}

checkQueue().catch(console.error);