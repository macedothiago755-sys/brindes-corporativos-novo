-- AlterTable
ALTER TABLE "tenants" ADD COLUMN "slack_workspace_id" TEXT;

-- AlterTable
ALTER TABLE "users" ADD COLUMN "whatsapp_phone" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "tenants_slack_workspace_id_key" ON "tenants"("slack_workspace_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_whatsapp_phone_key" ON "users"("whatsapp_phone");
