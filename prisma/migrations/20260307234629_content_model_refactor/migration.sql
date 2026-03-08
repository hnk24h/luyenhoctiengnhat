/*
  Warnings:

  - You are about to drop the `LearningItem` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "LearningItem" DROP CONSTRAINT "LearningItem_lessonId_fkey";

-- DropTable
DROP TABLE "LearningItem";

-- CreateTable
CREATE TABLE "Content" (
    "id" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "japanese" TEXT NOT NULL,
    "reading" TEXT,
    "audioUrl" TEXT,
    "imageUrl" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Content_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContentMeaning" (
    "id" TEXT NOT NULL,
    "contentId" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "meaning" TEXT NOT NULL,

    CONSTRAINT "ContentMeaning_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContentExample" (
    "id" TEXT NOT NULL,
    "learning_item_id" TEXT NOT NULL,
    "example_text" TEXT NOT NULL,
    "translation" TEXT,
    "language" TEXT NOT NULL,
    "translation_language" TEXT,

    CONSTRAINT "ContentExample_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ContentMeaning_contentId_language_key" ON "ContentMeaning"("contentId", "language");

-- AddForeignKey
ALTER TABLE "Content" ADD CONSTRAINT "Content_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "LearningLesson"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentMeaning" ADD CONSTRAINT "ContentMeaning_contentId_fkey" FOREIGN KEY ("contentId") REFERENCES "Content"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentExample" ADD CONSTRAINT "ContentExample_learning_item_id_fkey" FOREIGN KEY ("learning_item_id") REFERENCES "Content"("id") ON DELETE CASCADE ON UPDATE CASCADE;
