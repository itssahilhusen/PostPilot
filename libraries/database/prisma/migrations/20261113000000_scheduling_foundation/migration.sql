-- CreateTable
CREATE TABLE "PostDelivery" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "content" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "scheduledAt" TIMESTAMP(3),
    "queuePosition" INTEGER,
    "attemptCount" INTEGER NOT NULL DEFAULT 0,
    "nextAttemptAt" TIMESTAMP(3),
    "claimToken" TEXT,
    "claimedUntil" TIMESTAMP(3),
    "externalPostId" TEXT,
    "externalUrl" TEXT,
    "failureReason" TEXT,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PostDelivery_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PublishingAttempt" (
    "id" TEXT NOT NULL,
    "deliveryId" TEXT NOT NULL,
    "attemptNumber" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "error" TEXT,
    "response" JSONB,
    "externalPostId" TEXT,

    CONSTRAINT "PublishingAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PostHistory" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "actorUserId" TEXT,
    "details" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PostHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QueueSchedule" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "timezone" TEXT NOT NULL,
    "paused" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "QueueSchedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QueueScheduleSlot" (
    "id" TEXT NOT NULL,
    "scheduleId" TEXT NOT NULL,
    "weekday" INTEGER NOT NULL,
    "minute" INTEGER NOT NULL,

    CONSTRAINT "QueueScheduleSlot_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PostDelivery_workspaceId_status_scheduledAt_idx" ON "PostDelivery"("workspaceId", "status", "scheduledAt");

-- CreateIndex
CREATE INDEX "PostDelivery_status_nextAttemptAt_idx" ON "PostDelivery"("status", "nextAttemptAt");

-- CreateIndex
CREATE INDEX "PostDelivery_accountId_queuePosition_idx" ON "PostDelivery"("accountId", "queuePosition");

-- CreateIndex
CREATE UNIQUE INDEX "PostDelivery_postId_accountId_key" ON "PostDelivery"("postId", "accountId");

-- CreateIndex
CREATE UNIQUE INDEX "PostDelivery_accountId_scheduledAt_key" ON "PostDelivery"("accountId", "scheduledAt");

-- CreateIndex
CREATE INDEX "PublishingAttempt_deliveryId_startedAt_idx" ON "PublishingAttempt"("deliveryId", "startedAt");

-- CreateIndex
CREATE UNIQUE INDEX "PublishingAttempt_deliveryId_attemptNumber_key" ON "PublishingAttempt"("deliveryId", "attemptNumber");

-- CreateIndex
CREATE INDEX "PostHistory_postId_createdAt_idx" ON "PostHistory"("postId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "QueueSchedule_accountId_key" ON "QueueSchedule"("accountId");

-- CreateIndex
CREATE INDEX "QueueSchedule_workspaceId_idx" ON "QueueSchedule"("workspaceId");

-- CreateIndex
CREATE UNIQUE INDEX "QueueSchedule_accountId_workspaceId_key" ON "QueueSchedule"("accountId", "workspaceId");

-- CreateIndex
CREATE UNIQUE INDEX "QueueScheduleSlot_scheduleId_weekday_minute_key" ON "QueueScheduleSlot"("scheduleId", "weekday", "minute");

-- CreateIndex
CREATE UNIQUE INDEX "SocialAccount_id_workspaceId_key" ON "SocialAccount"("id", "workspaceId");

-- CreateIndex
CREATE UNIQUE INDEX "Post_id_workspaceId_key" ON "Post"("id", "workspaceId");

-- AddForeignKey
ALTER TABLE "PostDelivery" ADD CONSTRAINT "PostDelivery_postId_workspaceId_fkey" FOREIGN KEY ("postId", "workspaceId") REFERENCES "Post"("id", "workspaceId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostDelivery" ADD CONSTRAINT "PostDelivery_accountId_workspaceId_fkey" FOREIGN KEY ("accountId", "workspaceId") REFERENCES "SocialAccount"("id", "workspaceId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PublishingAttempt" ADD CONSTRAINT "PublishingAttempt_deliveryId_fkey" FOREIGN KEY ("deliveryId") REFERENCES "PostDelivery"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostHistory" ADD CONSTRAINT "PostHistory_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QueueSchedule" ADD CONSTRAINT "QueueSchedule_accountId_workspaceId_fkey" FOREIGN KEY ("accountId", "workspaceId") REFERENCES "SocialAccount"("id", "workspaceId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QueueScheduleSlot" ADD CONSTRAINT "QueueScheduleSlot_scheduleId_fkey" FOREIGN KEY ("scheduleId") REFERENCES "QueueSchedule"("id") ON DELETE CASCADE ON UPDATE CASCADE;


-- Queue slots are local wall-clock minutes, with Sunday represented by 0.
ALTER TABLE "QueueScheduleSlot" ADD CONSTRAINT "QueueScheduleSlot_weekday_check" CHECK ("weekday" BETWEEN 0 AND 6), ADD CONSTRAINT "QueueScheduleSlot_minute_check" CHECK ("minute" BETWEEN 0 AND 1439);
