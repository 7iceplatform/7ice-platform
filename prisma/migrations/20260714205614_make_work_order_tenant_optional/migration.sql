-- DropForeignKey
ALTER TABLE "WorkOrder" DROP CONSTRAINT "WorkOrder_tenantId_fkey";

-- DropForeignKey
ALTER TABLE "WorkOrderLog" DROP CONSTRAINT "WorkOrderLog_tenantId_fkey";

-- AlterTable
ALTER TABLE "WorkOrder" ALTER COLUMN "tenantId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "WorkOrderLog" ALTER COLUMN "tenantId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "WorkOrder" ADD CONSTRAINT "WorkOrder_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkOrderLog" ADD CONSTRAINT "WorkOrderLog_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;
