-- CreateEnum
CREATE TYPE "DeckShareMode" AS ENUM ('private', 'public', 'specific');

-- AlterEnum
ALTER TYPE "Subject" ADD VALUE 'BJT';

-- AlterTable
ALTER TABLE "FlashcardDeck" ADD COLUMN     "shareMode" "DeckShareMode" NOT NULL DEFAULT 'private';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "emailVerified" TIMESTAMP(3),
ADD COLUMN     "image" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "name" DROP NOT NULL;

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuthSession" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AuthSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "DeckShare" (
    "id" TEXT NOT NULL,
    "deckId" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DeckShare_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MockExam" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "subject" "Subject" NOT NULL DEFAULT 'JLPT',
    "levelCode" TEXT NOT NULL,
    "year" INTEGER,
    "totalTime" INTEGER NOT NULL,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MockExam_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MockExamSection" (
    "id" TEXT NOT NULL,
    "mockExamId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "titleVi" TEXT,
    "skill" TEXT NOT NULL,
    "timeLimit" INTEGER NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "MockExamSection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MockExamQuestion" (
    "id" TEXT NOT NULL,
    "sectionId" TEXT NOT NULL,
    "partLabel" TEXT,
    "partTitle" TEXT,
    "passageText" TEXT,
    "passageAudio" TEXT,
    "passageImage" TEXT,
    "content" TEXT NOT NULL,
    "options" JSONB,
    "answer" TEXT NOT NULL,
    "explain" TEXT,
    "audioUrl" TEXT,
    "imageUrl" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "MockExamQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MockExamSession" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "mockExamId" TEXT NOT NULL,
    "sectionTimes" JSONB,
    "currentSection" INTEGER NOT NULL DEFAULT 0,
    "score" DOUBLE PRECISION,
    "totalQ" INTEGER NOT NULL DEFAULT 0,
    "correctQ" INTEGER NOT NULL DEFAULT 0,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" TIMESTAMP(3),

    CONSTRAINT "MockExamSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MockExamAnswer" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "sectionId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "isCorrect" BOOLEAN NOT NULL,

    CONSTRAINT "MockExamAnswer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Account_userId_idx" ON "Account"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "AuthSession_sessionToken_key" ON "AuthSession"("sessionToken");

-- CreateIndex
CREATE INDEX "AuthSession_userId_idx" ON "AuthSession"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- CreateIndex
CREATE INDEX "DeckShare_targetId_idx" ON "DeckShare"("targetId");

-- CreateIndex
CREATE INDEX "DeckShare_deckId_idx" ON "DeckShare"("deckId");

-- CreateIndex
CREATE UNIQUE INDEX "DeckShare_deckId_targetId_key" ON "DeckShare"("deckId", "targetId");

-- CreateIndex
CREATE INDEX "MockExam_subject_levelCode_idx" ON "MockExam"("subject", "levelCode");

-- CreateIndex
CREATE INDEX "MockExam_published_idx" ON "MockExam"("published");

-- CreateIndex
CREATE INDEX "MockExamSection_mockExamId_order_idx" ON "MockExamSection"("mockExamId", "order");

-- CreateIndex
CREATE INDEX "MockExamQuestion_sectionId_order_idx" ON "MockExamQuestion"("sectionId", "order");

-- CreateIndex
CREATE INDEX "MockExamSession_userId_startedAt_idx" ON "MockExamSession"("userId", "startedAt");

-- CreateIndex
CREATE INDEX "MockExamSession_mockExamId_idx" ON "MockExamSession"("mockExamId");

-- CreateIndex
CREATE INDEX "MockExamAnswer_sessionId_idx" ON "MockExamAnswer"("sessionId");

-- CreateIndex
CREATE INDEX "MockExamAnswer_questionId_idx" ON "MockExamAnswer"("questionId");

-- CreateIndex
CREATE INDEX "FlashcardDeck_shareMode_idx" ON "FlashcardDeck"("shareMode");

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuthSession" ADD CONSTRAINT "AuthSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeckShare" ADD CONSTRAINT "DeckShare_deckId_fkey" FOREIGN KEY ("deckId") REFERENCES "FlashcardDeck"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeckShare" ADD CONSTRAINT "DeckShare_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeckShare" ADD CONSTRAINT "DeckShare_targetId_fkey" FOREIGN KEY ("targetId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MockExamSection" ADD CONSTRAINT "MockExamSection_mockExamId_fkey" FOREIGN KEY ("mockExamId") REFERENCES "MockExam"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MockExamQuestion" ADD CONSTRAINT "MockExamQuestion_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "MockExamSection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MockExamSession" ADD CONSTRAINT "MockExamSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MockExamSession" ADD CONSTRAINT "MockExamSession_mockExamId_fkey" FOREIGN KEY ("mockExamId") REFERENCES "MockExam"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MockExamAnswer" ADD CONSTRAINT "MockExamAnswer_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "MockExamSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MockExamAnswer" ADD CONSTRAINT "MockExamAnswer_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "MockExamSection"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MockExamAnswer" ADD CONSTRAINT "MockExamAnswer_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "MockExamQuestion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
