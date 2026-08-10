const { Queue } = require('bullmq');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const deploymentQueue = new Queue('deployment-queue', {
    connection: {
        host: 'localhost',
        port: 6379,
    },
});


async function sendTestJob() {

    console.log("📦 Creating test project...");

    const project = await prisma.project.create({
        data: {
            name: `worker-test-app-${Date.now()}`,
            githubRepo: "https://github.com/expressjs/express",
            branch: "master",
            port: 3000 + Math.floor(Math.random() * 900) + 1
        }
    });


    console.log("✅ Project created:");
    console.log(project.id);


    console.log("📦 Creating deployment...");

    const deployment = await prisma.deployment.create({
        data: {
            projectId: project.id,
            status: "PENDING"
        }
    });


    console.log("✅ Deployment created:");
    console.log(deployment.id);



    console.log("🚀 Sending job to Redis...");


    const job = await deploymentQueue.add(
        "build-and-deploy",
        {
            deploymentId: deployment.id,
            projectId: project.id,
            projectName: project.name,
            repoUrl: project.githubRepo,
            branch: project.branch,
            assignedPort: project.port
        }
    );


    console.log("✅ Job queued");
    console.log("Job ID:", job.id);


    await deploymentQueue.close();
    await prisma.$disconnect();
}


sendTestJob()
.catch(err => {
    console.error(err);
    process.exit(1);
});