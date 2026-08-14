const { Queue } = require('bullmq');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

const deploymentQueue = new Queue('deployment-queue', {
    connection: {
        host: 'localhost',
        port: 6379,
    },
});


async function sendTestJob() {
    try {
        console.log("���� Creating test user...");
        const hashedPassword = await bcrypt.hash("testpassword", 10);
        let user = await prisma.user.findUnique({
            where: { email: "test@cloudscale.dev" }
        });
        if (!user) {
            user = await prisma.user.create({
                data: {
                    email: "test@cloudscale.dev",
                    name: "Test User",
                    password: hashedPassword,
                }
            });
        }
        console.log("��� User ready:", user.id);

        console.log("���� Creating test project...");
        const project = await prisma.project.create({
            data: {
                name: `worker-test-app-${Date.now()}`,
                githubRepo: "https://github.com/JainMehul05/cloudscale-test-app",
                branch: "main",
                port: 3000 + Math.floor(Math.random() * 900) + 1,
                userId: user.id
            }
        });


        console.log("��� Project created:");
        console.log(project.id);


        console.log("���� Creating deployment...");

        const deployment = await prisma.deployment.create({
            data: {
                projectId: project.id,
                status: "PENDING"
            }
        });


        console.log("��� Deployment created:");
        console.log(deployment.id);


        console.log("���� Sending job to Redis...");


        const job = await deploymentQueue.add(
            "build-job",
            {
                deploymentId: deployment.id,
                projectId: project.id,
                projectName: project.name,
                repoUrl: project.githubRepo,
                branch: project.branch,
                assignedPort: project.port
            }
        );


        console.log("��� Job queued");
        console.log("Job ID:", job.id);
        console.log("Project ID:", project.id);
        console.log("Deployment ID:", deployment.id);
        console.log("Assigned Port:", project.port);

    } catch (err) {
        console.error(err);
        process.exit(1);
    } finally {
        await deploymentQueue.close();
        await prisma.$disconnect();
    }
}


sendTestJob()
.catch(err => {
    console.error(err);
    process.exit(1);
});