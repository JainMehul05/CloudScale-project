import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Queue } from "bullmq";


// Redis Queue
const deploymentQueue = new Queue("deployment-queue", {
  connection: {
    host: "localhost",
    port: 6379,
  },
});


// GET /api/projects
export async function GET() {
  try {

    const projects = await prisma.project.findMany({
      include: {
        deployments: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });


    // Convert Prisma format -> Dashboard format
    const formattedProjects = projects.map((project) => {

      const latestDeployment =
        project.deployments[0];


      return {

        id: project.id,

        name: project.name,

        // IMPORTANT:
        // Dashboard expects repository
        repository: project.githubRepo,

        branch: project.branch,

        framework: "Next.js",

        status:
          latestDeployment?.status ?? "PENDING",

          url: null,

        createdAt:
          project.createdAt,

          updatedAt:
          project.createdAt,

        lastDeploymentId:
          latestDeployment?.id ?? null,

      };

    });


    return NextResponse.json(formattedProjects);


  } catch (error: unknown) {

    console.error(error);

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      {
        status: 500,
      }
    );

  }
}





// POST /api/projects
export async function POST(request: Request) {

  try {


    const body = await request.json();


    const {
      name,
      githubRepo,
      branch,
      framework,
    } = body;



    if (!name || !githubRepo) {

      return NextResponse.json(
        {
          error:
          "Name and GitHub Repo are required.",
        },
        {
          status:400,
        }
      );

    }



    // Assign internal port

    const assignedPort =
      Math.floor(Math.random() * 900) + 3001;



    // Create project

    const project =
      await prisma.project.create({

        data: {

          name,

          githubRepo,

          branch:
            branch || "main",

          port:
            assignedPort,

        },

      });




    // Create deployment

    const deployment =
      await prisma.deployment.create({

        data: {

          projectId:
            project.id,

          status:
            "PENDING",

        },

      });





    // Push job to Redis

    await deploymentQueue.add(

      "build-job",

      {

        deploymentId:
          deployment.id,


        projectId:
          project.id,


        projectName:
          project.name,


        repoUrl:
          project.githubRepo,


        branch:
          project.branch,


        assignedPort:
          project.port,

      }

    );





    // Return dashboard compatible object

    return NextResponse.json(

      {

        id:
          project.id,


        name:
          project.name,


        repository:
          project.githubRepo,


        branch:
          project.branch,


        framework:
          framework || "Next.js",


        status:
          deployment.status,


        url:
          null,


        createdAt:
          project.createdAt,


        updatedAt:
  project.createdAt,

        lastDeploymentId:
          deployment.id,

      },

      {
        status:201,
      }

    );



  } catch (error: unknown) {


    console.error(error);


    return NextResponse.json(

      {
        error: error instanceof Error ? error.message : "Unknown error",
      },

      {
        status:400,
      }

    );

  }

}