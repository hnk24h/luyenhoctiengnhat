/*
  Warnings:

  - The `translation_language` column on the `ContentExample` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Changed the type of `language` on the `Content` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `language` on the `ContentExample` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `language` on the `ContentMeaning` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "Language" AS ENUM ('ja', 'zh', 'en', 'vi');

-- AlterTable
ALTER TABLE "Content" DROP COLUMN "language",
ADD COLUMN     "language" "Language" NOT NULL;

-- AlterTable
ALTER TABLE "ContentExample" DROP COLUMN "language",
ADD COLUMN     "language" "Language" NOT NULL,
DROP COLUMN "translation_language",
ADD COLUMN     "translation_language" "Language";

-- AlterTable
ALTER TABLE "ContentMeaning" DROP COLUMN "language",
ADD COLUMN     "language" "Language" NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "ContentMeaning_contentId_language_key" ON "ContentMeaning"("contentId", "language");
