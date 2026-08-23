-- CreateEnum
CREATE TYPE "DeploymentStatus" AS ENUM ('QUEUED', 'VALIDATING', 'CLONING', 'DETECTING', 'BUILDING', 'STARTING', 'RUNNING', 'FAILED', 'STOPPED');

-- Add new columns first
ALTER TABLE "Deployment" ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "Deployment" ADD COLUMN "startedAt" TIMESTAMP(3);
ALTER TABLE "Deployment" ADD COLUMN "completedAt" TIMESTAMP(3);

-- Remove default first, then convert
ALTER TABLE "Deployment" ALTER COLUMN "status" DROP DEFAULT;

-- Update status values and convert to enum
ALTER TABLE "Deployment" 
  ALTER COLUMN "status" TYPE "DeploymentStatus" USING 
    CASE 
      WHEN "status" = 'PENDING' THEN 'QUEUED'::"DeploymentStatus"
      WHEN "status" = 'BUILDING' THEN 'BUILDING'::"DeploymentStatus"
      WHEN "status" = 'DEPLOYED' THEN 'RUNNING'::"DeploymentStatus"
      WHEN "status" = 'FAILED' THEN 'FAILED'::"DeploymentStatus"
      WHEN "status" = 'STOPPED' THEN 'STOPPED'::"DeploymentStatus"
      ELSE 'QUEUED'::"DeploymentStatus"
    END;

-- Update default for status column
ALTER TABLE "Deployment" ALTER COLUMN "status" SET DEFAULT 'QUEUED';

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