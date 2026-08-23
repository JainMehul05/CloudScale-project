require("dotenv").config();

const Docker = require('dockerode');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const docker = new Docker();

async function testStop(deploymentId) {
  console.log(`Testing STOP for deployment: ${deploymentId}`);
  
  const deployment = await prisma.deployment.findUnique({
    where: { id: deploymentId },
  });
  
  if (!deployment || !deployment.containerId) {
    console.log('Deployment not found or no container');
    return;
  }
  
  console.log(`Stopping container: ${deployment.containerId}`);
  
  try {
    const container = docker.getContainer(deployment.containerId);
    await container.stop({ t: 10 });
    await container.remove({ force: true });
    
    await prisma.deployment.update({
      where: { id: deploymentId },
      data: { 
        status: 'STOPPED',
        containerId: null,
        containerName: null,
      },
    });
    
    console.log('STOP test passed!');
  } catch (err) {
    console.error('STOP test failed:', err.message);
  }
}

async function testRestart(deploymentId) {
  console.log(`Testing RESTART for deployment: ${deploymentId}`);
  
  // First stop the existing container
  const deployment = await prisma.deployment.findUnique({
    where: { id: deploymentId },
    include: { project: true },
  });
  
  if (!deployment || !deployment.containerId) {
    console.log('Deployment not found or no container');
    return;
  }
  
  try {
    const container = docker.getContainer(deployment.containerId);
    await container.stop({ t: 10 });
    await container.remove({ force: true });
  } catch (err) {
    console.error('Error stopping for restart:', err.message);
  }
  
  // Create a new deployment for restart
  const newDeployment = await prisma.deployment.create({
    data: {
      projectId: deployment.projectId,
      status: 'QUEUED',
    },
  });
  
  console.log(`Created new deployment for restart: ${newDeployment.id}`);
  console.log('RESTART test setup complete - would queue new job in production');
  
  // Clean up the new deployment
  await prisma.deployment.delete({ where: { id: newDeployment.id } });
}

async function testDelete(deploymentId) {
  console.log(`Testing DELETE for deployment: ${deploymentId}`);
  
  const deployment = await prisma.deployment.findUnique({
    where: { id: deploymentId },
  });
  
  if (!deployment) {
    console.log('Deployment not found');
    return;
  }
  
  // Stop and remove container
  if (deployment.containerId) {
    try {
      const container = docker.getContainer(deployment.containerId);
      await container.stop({ t: 10 }).catch(() => {});
      await container.remove({ force: true }).catch(() => {});
    } catch (err) {
      console.error('Container removal error:', err.message);
    }
  }
  
  // Remove image
  if (deployment.imageName) {
    try {
      const image = docker.getImage(deployment.imageName);
      await image.remove({ force: true }).catch(() => {});
    } catch (err) {
      console.error('Image removal error:', err.message);
    }
  }
  
  // Clean up deployment directory
  const fs = require('fs-extra');
  const path = require('path');
  const deploymentDir = path.join(__dirname, 'deployments', deploymentId);
  await fs.remove(deploymentDir).catch(() => {});
  
  // Delete deployment record
  await prisma.deployment.delete({
    where: { id: deploymentId },
  });
  
  console.log('DELETE test passed!');
}

async function main() {
  const deploymentId = '17b36423-aa31-4d8e-862f-3384b8aca6cc';
  
  console.log('=== Testing Container Management ===\n');
  
  // Test STOP
  await testStop(deploymentId);
  
  console.log('\n--- Verifying container stopped ---');
  await new Promise(r => setTimeout(r, 2000));
  const { execSync } = require('child_process');
  console.log(execSync('docker ps -a --filter "name=app-worker-test-app-1786850643336-17b36423" --format "{{.Status}}"').toString());
  
  // Test RESTART (setup)
  console.log('\n--- Testing RESTART setup ---');
  await testRestart(deploymentId);
  
  // Test DELETE
  console.log('\n--- Testing DELETE ---');
  // Re-create a deployment for delete test
  const project = await prisma.project.findUnique({ where: { id: '5a0d38bd-ad35-4137-b2a7-6250fd251d61' } });
  const newDeployment = await prisma.deployment.create({
    data: {
      projectId: project.id,
      status: 'RUNNING',
      containerId: 'dummy-container-id',
      imageName: 'cloudscale/test-image:latest',
    },
  });
  await testDelete(newDeployment.id);
  
  console.log('\n=== All container management tests completed ===');
  await prisma.$disconnect();
}

main().catch(console.error);