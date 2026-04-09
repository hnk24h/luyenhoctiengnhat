# 01 — Database Schema

> Tất cả Prisma models. Source: `prisma/schema.prisma`

---

## Enums

| Enum | Values |
|------|--------|
| `Language` | `ja` `zh` `ko` `en` `vi` |
| `Subject` | `JLPT` `HSK` `PMP` |
| `UserRole` | `user` `admin` |
| `Skill` | `nghe` `noi` `doc` `viet` `vocab` `grammar` |
| `QuestionType` | `tracnghiem` `dien_tu` `nghe_audio` `ghi_am` `upload_file` |
| `LessonType` | `text` `vocab` `grammar` `audio` |
| `ContentType` | `vocab` `character` `grammar` `example` `phrase` `tone` `idiom` |
| `StudyEventType` | `lesson_open` `lesson_complete` `flashcard_review` `exam_start` `exam_finish` `vocab_view` |
| `Difficulty` | `easy` `medium` `hard` |
| `SubscriptionTier` | `free` `basic` `premium` |

---

## Models

### User
```
id              String (cuid)
name            String?
email           String @unique
password        String?              ← null nếu OAuth
role            UserRole @default(user)
subscriptionTier SubscriptionTier @default(free)
createdAt       DateTime
updatedAt       DateTime
```
**Relations:** sessions, progress (UserProgress[]), flashcardDecks, savedWords,
lessonProgress, studyProfile, examPlan, studyEvents, courseEnrollments,
pmpSessions, levelPosts, userLessonAccesses

---

### Level
```
id          String (cuid)
code        String @unique    ← N5, N4, N3, N2, N1 | HSK1-HSK6
name        String
description String?
order       Int @default(0)
subject     Subject @default(JLPT)
```
**Relations:** examSets, learningCategories, courses, readingPassages, chinesePassages

---

### ExamSet
```
id          String (cuid)
levelId     String → Level
skill       Skill
title       String
description String?
timeLimit   Int?        ← seconds, null = unlimited
createdAt   DateTime
updatedAt   DateTime
```
**Relations:** questions (Question[]), sessions (ExamSession[]), progress (UserProgress[])
**Index:** (levelId, skill)

---

### Question
```
id        String (cuid)
examSetId String → ExamSet (cascade delete)
type      QuestionType
content   String         ← question text
options   Json?          ← array of strings cho tracnghiem
answer    String         ← correct answer hoặc JSON array cho multi-answer
explain   String?
audioUrl  String?
imageUrl  String?
order     Int @default(0)
```
**Index:** (examSetId, order)

---

### ExamSession
```
id         String (cuid)
userId     String → User
examSetId  String → ExamSet
score      Float?
totalQ     Int @default(0)
correctQ   Int @default(0)
startedAt  DateTime @default(now())
finishedAt DateTime?
```
**Relations:** answers (ExamAnswer[])
**Index:** (userId, startedAt), (examSetId)

---

### ExamAnswer
```
id         String (cuid)
sessionId  String → ExamSession (cascade)
questionId String
answer     String
isCorrect  Boolean
```

---

### UserProgress
```
id          String (cuid)
userId      String → User
examSetId   String → ExamSet
completed   Boolean @default(false)
bestScore   Float?
attempts    Int @default(0)
lastAttempt DateTime?
```
**Unique:** (userId, examSetId)

---

### LearningCategory
```
id          String (cuid)
levelId     String → Level
skill       Skill
name        String
description String?
icon        String?
order       Int @default(0)
```
**Relations:** lessons (LearningLesson[])
**Index:** (levelId, skill)

---

### LearningLesson
```
id           String (cuid)
categoryId   String → LearningCategory (cascade)
title        String
description  String?
content      String?    ← JSON blob (ListeningContentPayload | markdown)
type         LessonType @default(text)
order        Int @default(0)
requiredTier SubscriptionTier @default(free)
```
**Relations:** items (Content[]), progress (LessonProgress[]),
modules (LessonsOnModule[]), lessonAccesses (UserLessonAccess[])
**Index:** (categoryId, order), (type)

---

### Content (learning item)
```
id            String (cuid)
lessonId      String → LearningLesson (cascade)
type          ContentType
language      Language
term          String @map("japanese")       ← target language word
pronunciation String? @map("reading")       ← furigana / pinyin
audioUrl      String?
imageUrl      String?
order         Int @default(0)
```
**Relations:** meanings (ContentMeaning[]), examples (ContentExample[]),
flashcards (Flashcard[]), savedBy (SavedWord[])
**Index:** (lessonId, type), (lessonId, language), (term)

---

### ContentMeaning
```
id        String (cuid)
contentId String → Content (cascade)
language  Language
meaning   String
```
**Unique:** (contentId, language)

---

### ContentExample
```
id                  String (cuid)
contentId           String → Content (cascade)   @map("learning_item_id")
exampleText         String  @map("example_text")
translation         String?
language            Language
translationLanguage Language?  @map("translation_language")
```

---

### LessonProgress
```
id          String (cuid)
userId      String → User
lessonId    String → LearningLesson
completed   Boolean @default(false)
completedAt DateTime?
```
**Unique:** (userId, lessonId)

---

### GrammarPattern
```
id             String (cuid)
lang           String         ← "ja" | "zh"
levelCode      String         ← "N5" | "HSK2" etc.
pattern        String         ← display pattern e.g. 〜ています
reading        String?        ← furigana / pinyin
meaning        String         ← Vietnamese meaning
example        String
exampleReading String?
exampleVi      String
searchIn       String         ← substring match trong transcript
order          Int @default(0)
```
**Index:** (lang, levelCode), (lang, levelCode, searchIn)

---

### FlashcardDeck
```
id          String (cuid)
userId      String → User (cascade)
title       String
description String?
color       String @default("#4F46E5")
createdAt   DateTime
updatedAt   DateTime
```
**Relations:** cards (Flashcard[])
**Index:** (userId)

---

### Flashcard
```
id        String (cuid)
deckId    String → FlashcardDeck (cascade)
front     String       ← question / Japanese word
back      String       ← answer / meaning
reading   String?      ← furigana
example   String?
imageUrl  String?
contentId String?      ← optional FK → Content (system-generated)
createdAt DateTime
order     Int @default(0)
```
**Relations:** progress (FlashcardProgress[])
**Index:** (deckId, order), (contentId)

---

### FlashcardProgress (SM-2 SRS state per user-card pair)
```
id           String (cuid)
cardId       String → Flashcard (cascade)
userId       String → User (cascade)
repetitions  Int @default(0)    ← consecutive correct reviews
interval     Int @default(1)    ← days until next review
easeFactor   Float @default(2.5) ← multiplier (min 1.3)
dueAt        DateTime @default(now())
lastReview   DateTime?
totalReviews Int @default(0)
```
**Unique:** (userId, cardId)
**Index:** (userId, dueAt), (userId, lastReview)

---

### ReadingPassage
```
id        String (cuid)
title     String                        ← Japanese title
titleVi   String?                       ← Vietnamese title
content   String                        ← Full text
summary   String?
level     String                        ← N5–N1 (simple filter)
levelId   String? → Level
type      String @default("short")     ← "short" | "long" | "news"
source    String?
sourceUrl String?
tags      Json?                         ← array of strings
published Boolean @default(true)
createdAt DateTime
updatedAt DateTime
```
**Index:** (level, published), (published, createdAt)

---

### SavedWord
```
id        String (cuid)
userId    String → User (cascade)
contentId String → Content (cascade)
context   String?     ← sentence the word appeared in
createdAt DateTime
```
**Unique:** (userId, contentId)
**Relations:** collections (SavedWordsOnCollections[])

---

### WordCollection
```
id        String (cuid)
userId    String → User (cascade)
name      String
color     String @default("#4F46E5")
createdAt DateTime
```
**Unique:** (userId, name)
**Relations:** words (SavedWordsOnCollections[])

---

### SavedWordsOnCollections (join table)
```
wordId       String → SavedWord (cascade)
collectionId String → WordCollection (cascade)
addedAt      DateTime
```
**PK:** (wordId, collectionId)

---

### ChinesePassage
```
id          String (cuid)
title       String
titleVi     String?
level       String            ← HSK1–HSK6
levelId     String? → Level
content     String            ← Simplified Chinese
pinyin      String?           ← JSON or plain
translation String?           ← Vietnamese
audioUrl    String?
topic       String?
createdAt   DateTime
updatedAt   DateTime
```
**Index:** (level), (topic)

---

### PMP Models

#### PMPKnowledgeArea
```
id          String (cuid)
code        String @unique    ← "integration" | "scope" | ...
name        String
nameVi      String
description String?
order       Int
```
**Relations:** processes (PMPProcess[])

#### PMPProcessGroup
```
code     String @unique    ← initiating | planning | executing | monitoring | closing
name     String
nameVi   String
order    Int
```
**Relations:** processes (PMPProcess[])

#### PMPProcess
```
id              String (cuid)
knowledgeAreaId String → PMPKnowledgeArea
processGroupId  String → PMPProcessGroup
name            String
nameVi          String
description     String?
inputs          Json?     ← array of strings
tools           Json?     ← array of strings
outputs         Json?     ← array of strings
keyPoints       String?   ← Markdown notes
order           Int
```
**Relations:** examQuestions (PMPExamQuestion[])

#### PMPExamQuestion
```
id         String (cuid)
processId  String? → PMPProcess
area       String?   ← knowledge area code (question-level)
group      String?   ← process group code (question-level)
content    String    ← question text (Vietnamese)
optionA–D  String
answer     String    ← "A"|"B"|"C"|"D"
explain    String?
difficulty Difficulty @default(medium)
tags       Json?
createdAt  DateTime
```
**Relations:** answers (PMPExamAnswer[])

#### PMPExamSession
```
id         String (cuid)
userId     String → User
areaCode   String?    ← null = mixed
score      Float?
totalQ     Int
correctQ   Int
startedAt  DateTime
finishedAt DateTime?
```
**Relations:** answers (PMPExamAnswer[])

#### PMPExamAnswer
```
sessionId  String → PMPExamSession (cascade)
questionId String → PMPExamQuestion
answer     String    ← "A"|"B"|"C"|"D"
isCorrect  Boolean
```

#### PMPUserProgress
```
userId              String → User (cascade)
knowledgeArea       String      ← knowledge area code
questionsAttempted  Int @default(0)
questionsCorrect    Int @default(0)
updatedAt           DateTime
```
**Unique:** (userId, knowledgeArea)

---

### Analytics

#### StudyEvent
```
id         String (cuid)
userId     String → User (cascade)
type       StudyEventType
targetId   String?    ← lessonId | flashcardId | examSetId | contentId
targetType String?    ← "lesson" | "flashcard" | "exam" | "item"
score      Float?     ← exam_finish: score%; flashcard_review: ease 1-5
duration   Int?       ← seconds
createdAt  DateTime
```
**Index:** (userId, createdAt), (userId, type)

---

### User Sub-profiles

#### UserStudyProfile
```
id               String (cuid)
userId           String @unique → User (cascade)
weeklyGoal       Int @default(12)
currentStreak    Int @default(0)
longestStreak    Int @default(0)
lastActivityDate DateTime?
```

#### UserExamPlan
```
id                   String (cuid)
userId               String @unique → User (cascade)
targetLevelCode      String
examDate             DateTime
daysLeftAtSave       Int
weeksLeftAtSave      Int
examsPerWeek         Int
studySessionsPerWeek Int
reviewDays           Int
```

#### UserLessonAccess
```
id        String (cuid)
userId    String → User
lessonId  String → LearningLesson
grantedAt DateTime @default(now())
expiresAt DateTime?
note      String?
```

#### LevelPost
```
id        String (cuid)
userId    String → User (cascade)
levelCode String
content   String @db.Text
createdAt DateTime
```
**Index:** (levelCode, createdAt DESC)

---

### LMS Layer (Course/Module wrapping LearningLesson)

#### Course
```
id          String (cuid)
levelId     String → Level
title       String
description String?
coverUrl    String?
order       Int
published   Boolean @default(false)
```
**Relations:** modules (Module[]), enrollments (CourseEnrollment[])

#### Module
```
id          String (cuid)
courseId    String → Course (cascade)
title       String
description String?
order       Int
```
**Relations:** lessons (LessonsOnModule[])

#### LessonsOnModule (join table)
```
moduleId String → Module (cascade)
lessonId String → LearningLesson (cascade)
order    Int
```
**PK:** (moduleId, lessonId)

#### CourseEnrollment
```
userId      String → User (cascade)
courseId    String → Course (cascade)
enrolledAt  DateTime
completedAt DateTime?
```
**Unique:** (userId, courseId)
