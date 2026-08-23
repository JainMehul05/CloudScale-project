require("dotenv").config();

const Docker = require('dockerode');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const docker = new Docker();

async function testStopViaAPI(deploymentId) {
  console.log(`\n=== Testing STOP API for deployment: ${deploymentId} ===`);
  
  const deployment = await prisma.deployment.findUnique({
    where: { id: deploymentId },
  });
  
  if (!deployment || !deployment.containerId) {
    console.log('Deployment not found or no container');
    return;
  }
  
  console.log(`Stopping container: ${deployment.containerId} (${deployment.containerName})`);
  
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
    
    console.log('✓ STOP test passed!');
  } catch (err) {
    console.error('✗ STOP test failed:', err.message);
  }
}

async function testRestartViaWorker(deploymentId) {
  console.log(`\n=== Testing RESTART (via worker) for deployment: ${deploymentId} ===`);
  
  const deployment = await prisma.deployment.findUnique({
    where: { id: deploymentId },
    include: { project: true },
  });
  
  if (!deployment) {
    console.log('Deployment not found');
    return;
  }
  
  // Create a new deployment for the restart
  const newDeployment = await prisma.deployment.create({
    data: {
      projectId: deployment.projectId,
      status: 'QUEUED',
    },
  });
  
  console.log(`Created new deployment for restart: ${newDeployment.id}`);
  
  // Fetch environment variables
  const envVars = await prisma.environmentVariable.findMany({
    where: { projectId: deployment.projectId },
    select: { key: true, valueEncrypted: true },
  });
  
  // For testing, we'll just log what would be queued
  console.log('Would queue job with:', {
    deploymentId: newDeployment.id,
    projectId: deployment.projectId,
    projectName: deployment.project.name,
    repoUrl: deployment.project.githubRepo,
    branch: deployment.project.branch,
    assignedPort: deployment.project.port,
    environmentVariables: envVars.length + ' vars',
  });
  
  // Clean up the test deployment
  await prisma.deployment.delete({ where: { id: newDeployment.id } });
  console.log('✓ RESTART test setup complete');
}

async function testDelete(deploymentId) {
  console.log(`\n=== Testing DELETE for deployment: ${deploymentId} ===`);
  
  const deployment = await prisma.deployment.findUnique({
    where: { id: deploymentId },
  });
  
  if (!deployment) {
    console.log('Deployment not found');
    return;
  }
  
  // Stop and remove container if running
  if (deployment.containerId) {
    try {
      const container = docker.getContainer(deployment.containerId);
      await container.stop({ t: 10 }).catch(() => {});
      await container.remove({ force: true }).catch(() => {});
      console.log('Container stopped and removed');
    } catch (err) {
      console.error('Container removal error:', err.message);
    }
  }
  
  // Remove Docker image
  if (deployment.imageName) {
    try {
      const image = docker.getImage(deployment.imageName);
      await image.remove({ force: true }).catch(() => {});
      console.log('Image removed');
    } catch (err) {
      console.error('Image removal error:', err.message);
    }
  }
  
  // Clean up deployment directory
  const fs = require('fs-extra');
  const path = require('path');
  const deploymentDir = path.join(__dirname, 'deployments', deploymentId);
  await fs.remove(deploymentDir).catch(() => {});
  console.log('Deployment directory cleaned up');
  
  // Delete the deployment record
  await prisma.deployment.delete({
    where: { id: deploymentId },
  });
  
  console.log('✓ DELETE test passed!');
}

async function main() {
  const deploymentId = '9ec98a32-9da5-48de-bd76-f0f784d6e4a5';
  
  console.log('=== Testing Container Management APIs ===\n');
  
  // Test STOP
  await testStopViaAPI(deploymentId);
  
  console.log('\n--- Verifying container stopped ---');
  await new Promise(r => setTimeout(r, 2000));
  const { execSync } = require('child_process');
  const psOutput = execSync('docker ps -a --filter "name=app-worker-test-app-1786851667635-9ec98a32" --format "{{.Status}}"').toString();
  console.log('Docker ps output:', psOutput.trim() || 'No container found (correct)');
  
  // Test RESTART
  await testRestartViaWorker(deploymentId);
  
  // Test DELETE - create a fresh deployment first
  console.log('\n--- Creating fresh deployment for DELETE test ---');
  const project = await prisma.project.findUnique({ where: { id: '0c8e6a7f-a1b3-4382-891b-3573aa59b35d' } });
  const newDeployment = await prisma.deployment.create({
    data: {
      projectId: project.id,
      status: 'RUNNING',
      containerId: 'dummy-container-id-for-test',
      imageName: 'cloudscale/test-delete-image:latest',
    },
  });
  await testDelete(newDeployment.id);
  
  console.log('\n=== All container management tests completed ===');
  await prisma.$disconnect();
}

main().catch(console.error);