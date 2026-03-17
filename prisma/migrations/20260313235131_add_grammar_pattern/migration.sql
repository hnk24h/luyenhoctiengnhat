/*
  Warnings:

  - You are about to drop the column `subject` on the `Course` table. All the data in the column will be lost.
  - You are about to drop the column `answers` on the `ExamSession` table. All the data in the column will be lost.
  - The `type` column on the `LearningLesson` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `subject` column on the `Level` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `difficulty` column on the `PMPExamQuestion` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `options` column on the `Question` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `tags` column on the `ReadingPassage` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `japanese` on the `SavedWord` table. All the data in the column will be lost.
  - You are about to drop the column `meaning` on the `SavedWord` table. All the data in the column will be lost.
  - You are about to drop the column `reading` on the `SavedWord` table. All the data in the column will be lost.
  - You are about to drop the column `sourceId` on the `SavedWord` table. All the data in the column will be lost.
  - The `role` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - A unique constraint covering the columns `[userId,contentId]` on the table `SavedWord` will be added. If there are existing duplicate values, this will fail.
  - Changed the type of `type` on the `Content` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `skill` on the `ExamSet` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `skill` on the `LearningCategory` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `type` on the `Question` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `contentId` to the `SavedWord` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `type` on the `StudyEvent` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "Subject" AS ENUM ('JLPT', 'HSK', 'PMP');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('user', 'admin');

-- CreateEnum
CREATE TYPE "Skill" AS ENUM ('nghe', 'noi', 'doc', 'viet', 'vocab', 'grammar');

-- CreateEnum
CREATE TYPE "QuestionType" AS ENUM ('tracnghiem', 'dien_tu', 'nghe_audio', 'ghi_am', 'upload_file');

-- CreateEnum
CREATE TYPE "LessonType" AS ENUM ('text', 'vocab', 'grammar', 'audio');

-- CreateEnum
CREATE TYPE "ContentType" AS ENUM ('vocab', 'character', 'grammar', 'example', 'phrase', 'tone', 'idiom');

-- CreateEnum
CREATE TYPE "StudyEventType" AS ENUM ('lesson_open', 'lesson_complete', 'flashcard_review', 'exam_start', 'exam_finish', 'vocab_view');

-- CreateEnum
CREATE TYPE "Difficulty" AS ENUM ('easy', 'medium', 'hard');

-- AlterEnum
ALTER TYPE "Language" ADD VALUE 'ko';

-- DropIndex
DROP INDEX "SavedWord_userId_japanese_key";

-- AlterTable
ALTER TABLE "ChinesePassage" ADD COLUMN     "levelId" TEXT;

-- AlterTable
ALTER TABLE "Content" DROP COLUMN "type",
ADD COLUMN     "type" "ContentType" NOT NULL;

-- AlterTable
ALTER TABLE "Course" DROP COLUMN "subject";

-- AlterTable
ALTER TABLE "ExamSession" DROP COLUMN "answers";

-- AlterTable
ALTER TABLE "ExamSet" DROP COLUMN "skill",
ADD COLUMN     "skill" "Skill" NOT NULL;

-- AlterTable
ALTER TABLE "Flashcard" ADD COLUMN     "contentId" TEXT;

-- AlterTable
ALTER TABLE "LearningCategory" DROP COLUMN "skill",
ADD COLUMN     "skill" "Skill" NOT NULL;

-- AlterTable
ALTER TABLE "LearningLesson" DROP COLUMN "type",
ADD COLUMN     "type" "LessonType" NOT NULL DEFAULT 'text';

-- AlterTable
ALTER TABLE "Level" DROP COLUMN "subject",
ADD COLUMN     "subject" "Subject" NOT NULL DEFAULT 'JLPT';

-- AlterTable
ALTER TABLE "PMPExamQuestion" DROP COLUMN "difficulty",
ADD COLUMN     "difficulty" "Difficulty" NOT NULL DEFAULT 'medium';

-- AlterTable
ALTER TABLE "Question" DROP COLUMN "type",
ADD COLUMN     "type" "QuestionType" NOT NULL,
DROP COLUMN "options",
ADD COLUMN     "options" JSONB;

-- AlterTable
ALTER TABLE "ReadingPassage" ADD COLUMN     "levelId" TEXT,
DROP COLUMN "tags",
ADD COLUMN     "tags" JSONB;

-- AlterTable
ALTER TABLE "SavedWord" DROP COLUMN "japanese",
DROP COLUMN "meaning",
DROP COLUMN "reading",
DROP COLUMN "sourceId",
ADD COLUMN     "contentId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "StudyEvent" DROP COLUMN "type",
ADD COLUMN     "type" "StudyEventType" NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "role",
ADD COLUMN     "role" "UserRole" NOT NULL DEFAULT 'user';

-- CreateTable
CREATE TABLE "ExamAnswer" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "isCorrect" BOOLEAN NOT NULL,

    CONSTRAINT "ExamAnswer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GrammarPattern" (
    "id" TEXT NOT NULL,
    "lang" TEXT NOT NULL,
    "levelCode" TEXT NOT NULL,
    "pattern" TEXT NOT NULL,
    "reading" TEXT,
    "meaning" TEXT NOT NULL,
    "example" TEXT NOT NULL,
    "exampleReading" TEXT,
    "exampleVi" TEXT NOT NULL,
    "searchIn" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "GrammarPattern_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PMPExamSession" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "areaCode" TEXT,
    "score" DOUBLE PRECISION,
    "totalQ" INTEGER NOT NULL DEFAULT 0,
    "correctQ" INTEGER NOT NULL DEFAULT 0,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" TIMESTAMP(3),

    CONSTRAINT "PMPExamSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PMPExamAnswer" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "isCorrect" BOOLEAN NOT NULL,

    CONSTRAINT "PMPExamAnswer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ExamAnswer_sessionId_idx" ON "ExamAnswer"("sessionId");

-- CreateIndex
CREATE INDEX "ExamAnswer_questionId_idx" ON "ExamAnswer"("questionId");

-- CreateIndex
CREATE INDEX "GrammarPattern_lang_levelCode_idx" ON "GrammarPattern"("lang", "levelCode");

-- CreateIndex
CREATE INDEX "GrammarPattern_lang_levelCode_searchIn_idx" ON "GrammarPattern"("lang", "levelCode", "searchIn");

-- CreateIndex
CREATE INDEX "PMPExamSession_userId_startedAt_idx" ON "PMPExamSession"("userId", "startedAt");

-- CreateIndex
CREATE INDEX "PMPExamAnswer_sessionId_idx" ON "PMPExamAnswer"("sessionId");

-- CreateIndex
CREATE INDEX "PMPExamAnswer_questionId_idx" ON "PMPExamAnswer"("questionId");

-- CreateIndex
CREATE INDEX "ChinesePassage_level_idx" ON "ChinesePassage"("level");

-- CreateIndex
CREATE INDEX "ChinesePassage_topic_idx" ON "ChinesePassage"("topic");

-- CreateIndex
CREATE INDEX "Content_lessonId_type_idx" ON "Content"("lessonId", "type");

-- CreateIndex
CREATE INDEX "Content_lessonId_language_idx" ON "Content"("lessonId", "language");

-- CreateIndex
CREATE INDEX "Content_japanese_idx" ON "Content"("japanese");

-- CreateIndex
CREATE INDEX "ContentExample_learning_item_id_idx" ON "ContentExample"("learning_item_id");

-- CreateIndex
CREATE INDEX "ExamSession_userId_startedAt_idx" ON "ExamSession"("userId", "startedAt");

-- CreateIndex
CREATE INDEX "ExamSession_examSetId_idx" ON "ExamSession"("examSetId");

-- CreateIndex
CREATE INDEX "ExamSet_levelId_skill_idx" ON "ExamSet"("levelId", "skill");

-- CreateIndex
CREATE INDEX "Flashcard_deckId_order_idx" ON "Flashcard"("deckId", "order");

-- CreateIndex
CREATE INDEX "Flashcard_contentId_idx" ON "Flashcard"("contentId");

-- CreateIndex
CREATE INDEX "FlashcardDeck_userId_idx" ON "FlashcardDeck"("userId");

-- CreateIndex
CREATE INDEX "FlashcardProgress_userId_dueAt_idx" ON "FlashcardProgress"("userId", "dueAt");

-- CreateIndex
CREATE INDEX "FlashcardProgress_userId_lastReview_idx" ON "FlashcardProgress"("userId", "lastReview");

-- CreateIndex
CREATE INDEX "LearningCategory_levelId_skill_idx" ON "LearningCategory"("levelId", "skill");

-- CreateIndex
CREATE INDEX "LearningLesson_categoryId_order_idx" ON "LearningLesson"("categoryId", "order");

-- CreateIndex
CREATE INDEX "LearningLesson_type_idx" ON "LearningLesson"("type");

-- CreateIndex
CREATE INDEX "PMPExamQuestion_area_difficulty_idx" ON "PMPExamQuestion"("area", "difficulty");

-- CreateIndex
CREATE INDEX "PMPExamQuestion_processId_idx" ON "PMPExamQuestion"("processId");

-- CreateIndex
CREATE INDEX "PMPProcess_knowledgeAreaId_idx" ON "PMPProcess"("knowledgeAreaId");

-- CreateIndex
CREATE INDEX "PMPProcess_processGroupId_idx" ON "PMPProcess"("processGroupId");

-- CreateIndex
CREATE INDEX "Question_examSetId_order_idx" ON "Question"("examSetId", "order");

-- CreateIndex
CREATE INDEX "ReadingPassage_level_published_idx" ON "ReadingPassage"("level", "published");

-- CreateIndex
CREATE INDEX "ReadingPassage_published_createdAt_idx" ON "ReadingPassage"("published", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "SavedWord_userId_contentId_key" ON "SavedWord"("userId", "contentId");

-- CreateIndex
CREATE INDEX "StudyEvent_userId_type_idx" ON "StudyEvent"("userId", "type");

-- AddForeignKey
ALTER TABLE "ExamAnswer" ADD CONSTRAINT "ExamAnswer_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "ExamSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Flashcard" ADD CONSTRAINT "Flashcard_contentId_fkey" FOREIGN KEY ("contentId") REFERENCES "Content"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReadingPassage" ADD CONSTRAINT "ReadingPassage_levelId_fkey" FOREIGN KEY ("levelId") REFERENCES "Level"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SavedWord" ADD CONSTRAINT "SavedWord_contentId_fkey" FOREIGN KEY ("contentId") REFERENCES "Content"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChinesePassage" ADD CONSTRAINT "ChinesePassage_levelId_fkey" FOREIGN KEY ("levelId") REFERENCES "Level"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PMPExamSession" ADD CONSTRAINT "PMPExamSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PMPExamAnswer" ADD CONSTRAINT "PMPExamAnswer_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "PMPExamSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PMPExamAnswer" ADD CONSTRAINT "PMPExamAnswer_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "PMPExamQuestion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
