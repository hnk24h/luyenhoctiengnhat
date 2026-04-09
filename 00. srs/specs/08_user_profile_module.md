# 08 — User Profile Module

> Source: `src/app/api/study-profile/`, `src/app/api/exam-plan/`, `src/modules/user.ts`

---

## Data Model

```
User
├── UserStudyProfile (1:1) — streak, weekly goal
├── UserExamPlan (1:1) — target exam plan
├── StudyEvent[] — analytics events
├── UserProgress[] — exam set scores
├── LessonProgress[] — lesson completion
└── FlashcardProgress[] — SRS states
```

---

## Study Profile API

### `GET /api/study-profile`
```typescript
// Auth: user (getApiUser)

Output: {
  profile: {
    weeklyGoal: number,         // lessons per week (3–50)
    currentStreak: number,      // consecutive study days
    longestStreak: number,
    lastActivityDate: string | null,  // "YYYY-MM-DD"
    updatedAt: string           // ISO timestamp
  } | null   // null if profile not created yet
}
```

### `PATCH /api/study-profile`
```typescript
// Auth: user
// Body: { weeklyGoal: number }
// Validation: weeklyGoal must be 3–50 (integer)

Logic:
  upsert UserStudyProfile:
    update: { weeklyGoal }
    create: { userId, weeklyGoal, currentStreak: 0, longestStreak: 0 }

Output: { profile: { weeklyGoal, currentStreak, longestStreak, lastActivityDate, updatedAt } }
```

### Streak Logic

⚠️ **Hiện tại:** Streak chỉ được cập nhật thủ công qua admin hoặc trigger khác. Chưa có API tự động cập nhật streak khi user hoàn thành lesson/exam.

Fields:
- `currentStreak` — số ngày học liên tiếp
- `longestStreak` — kỷ lục streak dài nhất
- `lastActivityDate` — ngày cuối cùng có activity

---

## Exam Plan API

### `GET /api/exam-plan`
```typescript
// Auth: user

Output: UserExamPlan | null
```

### `POST /api/exam-plan`
```typescript
// Auth: user
// Body: {
//   targetLevelCode: string,    // N3 | N2 | N1 | HSK1...
//   examDate: string,           // ISO date
//   daysLeftAtSave: number,
//   weeksLeftAtSave: number,
//   examsPerWeek: number,
//   studySessionsPerWeek: number,
//   reviewDays: number
// }

Logic:
  upsert UserExamPlan (one per user)

Output: UserExamPlan
```

---

## StudyEvent (Analytics)

Ghi lại mọi học tương tác đáng kể.

```typescript
interface StudyEvent {
  type: StudyEventType
  targetId?: string    // lessonId | flashcardId | examSetId | contentId
  targetType?: string  // "lesson" | "flashcard" | "exam" | "item"
  score?: number       // exam_finish: 0-100%; flashcard_review: ease 1-5
  duration?: number    // seconds
}
```

**StudyEvent types:**
| type | Khi nào fired |
|------|--------------|
| `lesson_open` | Mở bài học |
| `lesson_complete` | Hoàn thành bài học (POST /api/learn/progress) |
| `flashcard_review` | Review 1 thẻ flashcard |
| `exam_start` | Bắt đầu làm bài |
| `exam_finish` | Nộp bài |
| `vocab_view` | Xem từ vựng |

⚠️ **Hiện trạng:** StudyEvent model tồn tại trong schema nhưng việc ghi events có thể chưa được implement đầy đủ ở mọi điểm.

---

## UserProgress (Exam)

Track điểm thi theo ExamSet:
```typescript
UserProgress {
  examSetId    // target exam set
  completed    // true if score >= 70 at least once
  bestScore    // highest score ever
  attempts     // total attempts
  lastAttempt  // DateTime of last attempt
}
```

Query: `prisma.userProgress.findUnique({ where: { userId_examSetId } })`

---

## LessonProgress

Track hoàn thành lesson:
```typescript
LessonProgress {
  lessonId
  completed    // true nếu đã hoàn thành
  completedAt  // DateTime khi completed=true
}
```

Upsert via `POST /api/learn/progress`

---

## Level Post (Community)

User có thể post hỏi/chia sẻ theo level:

```typescript
LevelPost {
  userId
  levelCode    // N5 | N4 | ... | HSK1...
  content      // text content
  createdAt
}
```

API: `GET /api/level-posts?levelCode=N5`, `POST /api/level-posts`

---

## Dashboard

`/dashboard` page tổng hợp:
- Streak info từ `UserStudyProfile`
- Exam progress từ `UserProgress[]`
- Recent `StudyEvent[]`
- Exam plan từ `UserExamPlan`
