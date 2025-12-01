/*
  Warnings:

  - A unique constraint covering the columns `[weClappUserId]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateTable
CREATE TABLE "weclapp_parties" (
    "id" TEXT NOT NULL,
    "partyType" TEXT,
    "company" TEXT,
    "company2" TEXT,
    "firstName" TEXT,
    "lastName" TEXT,
    "middleName" TEXT,
    "salutation" TEXT,
    "email" TEXT,
    "emailHome" TEXT,
    "phone" TEXT,
    "mobilePhone1" TEXT,
    "fax" TEXT,
    "website" TEXT,
    "birthDate" TIMESTAMP(3),
    "customer" BOOLEAN NOT NULL DEFAULT false,
    "customerNumber" TEXT,
    "customerBlocked" BOOLEAN NOT NULL DEFAULT false,
    "customerCreditLimit" DECIMAL(65,30),
    "supplier" BOOLEAN NOT NULL DEFAULT false,
    "supplierNumber" TEXT,
    "primaryAddressId" TEXT,
    "invoiceAddressId" TEXT,
    "deliveryAddressId" TEXT,
    "addresses" JSONB,
    "bankAccounts" JSONB,
    "contacts" JSONB,
    "tags" JSONB,
    "customAttributes" JSONB,
    "createdDate" TIMESTAMP(3),
    "lastModifiedDate" TIMESTAMP(3),
    "lastSyncAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "weclapp_parties_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "weclapp_users" (
    "id" TEXT NOT NULL,
    "email" TEXT,
    "firstName" TEXT,
    "lastName" TEXT,
    "username" TEXT,
    "title" TEXT,
    "birthDate" TIMESTAMP(3),
    "phoneNumber" TEXT,
    "mobilePhoneNumber" TEXT,
    "faxNumber" TEXT,
    "imageId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "userRoles" JSONB,
    "licenses" JSONB,
    "customAttributes" JSONB,
    "createdDate" TIMESTAMP(3),
    "lastModifiedDate" TIMESTAMP(3),
    "lastSyncAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "weclapp_users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "weclapp_tasks" (
    "id" TEXT NOT NULL,
    "subject" TEXT,
    "description" TEXT,
    "identifier" TEXT,
    "taskStatus" TEXT NOT NULL,
    "taskPriority" TEXT NOT NULL,
    "taskVisibilityType" TEXT,
    "dateFrom" TIMESTAMP(3),
    "dateTo" TIMESTAMP(3),
    "plannedEffort" INTEGER,
    "positionNumber" INTEGER,
    "creatorUserId" TEXT,
    "parentTaskId" TEXT,
    "previousTaskId" TEXT,
    "orderItemId" TEXT,
    "customerId" TEXT,
    "articleId" TEXT,
    "ticketId" TEXT,
    "calendarEventId" TEXT,
    "userOfLastStatusChangeId" TEXT,
    "allowOverBooking" BOOLEAN NOT NULL DEFAULT false,
    "allowTimeBooking" BOOLEAN NOT NULL DEFAULT true,
    "billableStatus" BOOLEAN,
    "invoicingStatus" TEXT,
    "createdDate" TIMESTAMP(3) NOT NULL,
    "lastModifiedDate" TIMESTAMP(3) NOT NULL,
    "assignees" JSONB,
    "watchers" JSONB,
    "entityReferences" JSONB,
    "taskLists" JSONB,
    "taskTopics" JSONB,
    "taskTypes" JSONB,
    "customAttributes" JSONB,
    "weClappLastModified" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastSyncAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "weclapp_tasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "weclapp_orders" (
    "id" TEXT NOT NULL,
    "orderNumber" TEXT,
    "orderNumberAtCustomer" TEXT,
    "orderStatus" TEXT,
    "orderDate" TIMESTAMP(3),
    "customerId" TEXT,
    "invoiceRecipientId" TEXT,
    "totalAmount" DECIMAL(65,30),
    "currency" TEXT,
    "note" TEXT,
    "invoiced" BOOLEAN NOT NULL DEFAULT false,
    "paid" BOOLEAN NOT NULL DEFAULT false,
    "shipped" BOOLEAN NOT NULL DEFAULT false,
    "servicesFinished" BOOLEAN NOT NULL DEFAULT false,
    "projectModeActive" BOOLEAN NOT NULL DEFAULT false,
    "warehouseId" TEXT,
    "quotationId" TEXT,
    "plannedProjectStartDate" TIMESTAMP(3),
    "plannedProjectEndDate" TIMESTAMP(3),
    "createdDate" TIMESTAMP(3) NOT NULL,
    "lastModifiedDate" TIMESTAMP(3) NOT NULL,
    "billingAddress" JSONB,
    "shippingAddress" JSONB,
    "orderItems" JSONB,
    "payments" JSONB,
    "projectMembers" JSONB,
    "statusHistory" JSONB,
    "customAttributes" JSONB,
    "weClappLastModified" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastSyncAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "weclapp_orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "weclapp_time_entries" (
    "id" TEXT NOT NULL,
    "taskId" TEXT,
    "userId" TEXT,
    "customerId" TEXT,
    "projectId" TEXT,
    "salesOrderId" TEXT,
    "articleId" TEXT,
    "ticketId" TEXT,
    "description" TEXT,
    "startDate" TIMESTAMP(3),
    "durationSeconds" INTEGER,
    "billableDurationSeconds" INTEGER,
    "billable" BOOLEAN NOT NULL DEFAULT false,
    "billableInvoiceStatus" TEXT,
    "hourlyRate" DECIMAL(65,30),
    "printOnPerformanceRecord" BOOLEAN NOT NULL DEFAULT false,
    "createdDate" TIMESTAMP(3) NOT NULL,
    "lastModifiedDate" TIMESTAMP(3) NOT NULL,
    "customAttributes" JSONB,
    "weClappLastModified" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastSyncAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "weclapp_time_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "weclapp_webhook_logs" (
    "id" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "entityId" TEXT,
    "payload" JSONB NOT NULL,
    "processed" BOOLEAN NOT NULL DEFAULT false,
    "error" TEXT,
    "processedAt" TIMESTAMP(3),
    "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "weclapp_webhook_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sync_logs" (
    "id" TEXT NOT NULL,
    "syncType" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT,
    "action" TEXT NOT NULL,
    "direction" TEXT NOT NULL,
    "changesBefore" JSONB,
    "changesAfter" JSONB,
    "changedFields" TEXT[],
    "success" BOOLEAN NOT NULL DEFAULT true,
    "errorMessage" TEXT,
    "triggeredBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sync_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "tableName" TEXT NOT NULL,
    "recordId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "oldValues" JSONB,
    "newValues" JSONB,
    "changedFields" TEXT[],
    "userId" TEXT,
    "userEmail" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sync_status" (
    "id" TEXT NOT NULL,
    "syncType" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "totalRecords" INTEGER NOT NULL DEFAULT 0,
    "successCount" INTEGER NOT NULL DEFAULT 0,
    "failedCount" INTEGER NOT NULL DEFAULT 0,
    "skippedCount" INTEGER NOT NULL DEFAULT 0,
    "usersSync" JSONB,
    "partiesSync" JSONB,
    "tasksSync" JSONB,
    "ordersSync" JSONB,
    "timeEntriesSync" JSONB,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "durationMs" INTEGER,
    "errorMessage" TEXT,
    "errorDetails" JSONB,

    CONSTRAINT "sync_status_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "sync_logs_entityType_entityId_idx" ON "sync_logs"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "sync_logs_syncType_idx" ON "sync_logs"("syncType");

-- CreateIndex
CREATE INDEX "sync_logs_createdAt_idx" ON "sync_logs"("createdAt");

-- CreateIndex
CREATE INDEX "audit_logs_tableName_recordId_idx" ON "audit_logs"("tableName", "recordId");

-- CreateIndex
CREATE INDEX "audit_logs_userId_idx" ON "audit_logs"("userId");

-- CreateIndex
CREATE INDEX "audit_logs_createdAt_idx" ON "audit_logs"("createdAt");

-- CreateIndex
CREATE INDEX "sync_status_status_idx" ON "sync_status"("status");

-- CreateIndex
CREATE INDEX "sync_status_startedAt_idx" ON "sync_status"("startedAt");

-- CreateIndex
CREATE UNIQUE INDEX "users_weClappUserId_key" ON "users"("weClappUserId");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_weClappUserId_fkey" FOREIGN KEY ("weClappUserId") REFERENCES "weclapp_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_data_scopes" ADD CONSTRAINT "role_data_scopes_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "weclapp_tasks" ADD CONSTRAINT "weclapp_tasks_creatorUserId_fkey" FOREIGN KEY ("creatorUserId") REFERENCES "weclapp_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "weclapp_tasks" ADD CONSTRAINT "weclapp_tasks_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "weclapp_parties"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "weclapp_tasks" ADD CONSTRAINT "weclapp_tasks_parentTaskId_fkey" FOREIGN KEY ("parentTaskId") REFERENCES "weclapp_tasks"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "weclapp_tasks" ADD CONSTRAINT "weclapp_tasks_previousTaskId_fkey" FOREIGN KEY ("previousTaskId") REFERENCES "weclapp_tasks"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "weclapp_orders" ADD CONSTRAINT "weclapp_orders_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "weclapp_parties"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "weclapp_time_entries" ADD CONSTRAINT "weclapp_time_entries_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "weclapp_tasks"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "weclapp_time_entries" ADD CONSTRAINT "weclapp_time_entries_userId_fkey" FOREIGN KEY ("userId") REFERENCES "weclapp_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "weclapp_time_entries" ADD CONSTRAINT "weclapp_time_entries_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "weclapp_parties"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "weclapp_time_entries" ADD CONSTRAINT "weclapp_time_entries_salesOrderId_fkey" FOREIGN KEY ("salesOrderId") REFERENCES "weclapp_orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;
