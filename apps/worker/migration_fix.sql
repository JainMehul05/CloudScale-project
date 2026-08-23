-- Fix DeploymentLog deploymentId type
ALTER TABLE "DeploymentLog" DROP CONSTRAINT IF EXISTS "DeploymentLog_deploymentId_fkey";
DROP TABLE IF EXISTS "DeploymentLog";

-- CreateTable: DeploymentLog with correct UUID type
CREATE TABLE "DeploymentLog" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "deploymentId" UUID NOT NULL,
    "stage" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "DeploymentLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DeploymentLog_deploymentId_timestamp_idx" ON "DeploymentLog"("deploymentId", "timestamp");

-- AddForeignKey
ALTER TABLE "DeploymentLog" ADD CONSTRAINT "DeploymentLog_deploymentId_fkey" FOREIGN KEY ("deploymentId") REFERENCES "Deployment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Fix status default
ALTER TABLE "Deployment" ALTER COLUMN "status" SET DEFAULT 'QUEUED';