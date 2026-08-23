ALTER TABLE "DeploymentLog" DROP CONSTRAINT IF EXISTS "DeploymentLog_deploymentId_fkey";
ALTER TABLE "DeploymentLog" ALTER COLUMN "deploymentId" TYPE text USING "deploymentId"::text;
ALTER TABLE "DeploymentLog" ADD CONSTRAINT "DeploymentLog_deploymentId_fkey" FOREIGN KEY ("deploymentId") REFERENCES "Deployment"("id") ON DELETE CASCADE ON UPDATE CASCADE;