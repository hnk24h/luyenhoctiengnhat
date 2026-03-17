-- CreateEnum
CREATE TYPE "SubscriptionTier" AS ENUM ('free', 'basic', 'premium');

-- AlterTable
ALTER TABLE "LearningLesson" ADD COLUMN     "requiredTier" "SubscriptionTier" NOT NULL DEFAULT 'free';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "subscriptionTier" "SubscriptionTier" NOT NULL DEFAULT 'free';

-- CreateTable
CREATE TABLE "UserLessonAccess" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "grantedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),
    "note" TEXT,

    CONSTRAINT "UserLessonAccess_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LevelPost" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "levelCode" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LevelPost_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "UserLessonAccess_lessonId_idx" ON "UserLessonAccess"("lessonId");

-- CreateIndex
CREATE INDEX "UserLessonAccess_userId_idx" ON "UserLessonAccess"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "UserLessonAccess_userId_lessonId_key" ON "UserLessonAccess"("userId", "lessonId");

-- CreateIndex
CREATE INDEX "LevelPost_levelCode_createdAt_idx" ON "LevelPost"("levelCode", "createdAt" DESC);

-- AddForeignKey
ALTER TABLE "UserLessonAccess" ADD CONSTRAINT "UserLessonAccess_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserLessonAccess" ADD CONSTRAINT "UserLessonAccess_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "LearningLesson"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LevelPost" ADD CONSTRAINT "LevelPost_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
