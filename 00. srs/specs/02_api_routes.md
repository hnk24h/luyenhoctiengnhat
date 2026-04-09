# 02 — API Routes Reference

> Tất cả API endpoints. Auth column: `none` = public, `user` = đăng nhập, `admin` = role admin.
> Phần lớn dùng `getApiUser(req)` (web+mobile). Một số route cũ dùng `getServerSession`.

---

## Auth endpoints

| Method | Path | Auth | Input | Output |
|--------|------|------|-------|--------|
| POST | `/api/auth/mobile/token` | none | `{ email, password }` | `{ token, user: ApiUser }` |
| GET | `/api/auth/mobile/me` | Bearer | — | `ApiUser` |
| `[...nextauth]` | `/api/auth/[...nextauth]` | — | NextAuth standard | NextAuth standard |

---

## Exam

| Method | Path | Auth | Input | Output |
|--------|------|------|-------|--------|
| GET | `/api/exam/[id]` | none | — | `ExamSet + questions[]` |
| POST | `/api/exam/submit` | user (cookie) | `{ examSetId, answers: Record<questionId, string> }` | `{ sessionId, score, correctQ, totalQ }` |

**Business logic `POST /api/exam/submit`:**
1. Chấm điểm từng câu: parse `q.answer` (JSON array hoặc string), so sánh với `answers[q.id]`
2. Tính `score = (correctQ / totalQ) * 100`
3. Tạo `ExamSession` + `ExamAnswer[]` records
4. Upsert `UserProgress`: tăng `attempts`, cập nhật `bestScore`, `lastAttempt`, `completed=true` nếu score >= 70

---

## Exam Plan

| Method | Path | Auth | Input | Output |
|--------|------|------|-------|--------|
| GET | `/api/exam-plan` | user | — | `UserExamPlan \| null` |
| POST | `/api/exam-plan` | user | `{ targetLevelCode, examDate, daysLeftAtSave, weeksLeftAtSave, examsPerWeek, studySessionsPerWeek, reviewDays }` | `UserExamPlan` |

---

## Learning

| Method | Path | Auth | Input | Output |
|--------|------|------|-------|--------|
| GET | `/api/learn/lesson/[lessonId]` | none* | — | `{ id, title, description, type, items[], isCompleted }` |
| POST | `/api/learn/progress` | user | `{ lessonId }` | `{ message: 'ok' }` |

*`isCompleted` = false nếu không auth

**`GET /api/learn/lesson/[lessonId]` output:**
```json
{
  "id": "...",
  "title": "Bài 1: Chào hỏi",
  "type": "vocab",
  "items": [{
    "id": "...",
    "type": "vocab",
    "language": "ja",
    "term": "こんにちは",
    "pronunciation": "konnichiwa",
    "meanings": [{ "language": "vi", "meaning": "Xin chào" }],
    "examples": [...]
  }],
  "isCompleted": false
}
```

---

## Learning (content management)

| Method | Path | Auth | Input | Output |
|--------|------|------|-------|--------|
| GET | `/api/learning` | none | `?levelId&skill&page&limit` | `{ data: LearningCategory[], total, page, limit }` |
| GET/POST/PATCH/DELETE | `/api/admin/learning/*` | admin | — | admin CRUD |

---

## Level Posts

| Method | Path | Auth | Input | Output |
|--------|------|------|-------|--------|
| GET | `/api/level-posts` | none | `?levelCode` | `LevelPost[]` |
| POST | `/api/level-posts` | user | `{ levelCode, content }` | `LevelPost` |

---

## JLPT Vocab

| Method | Path | Auth | Input | Output |
|--------|------|------|-------|--------|
| GET | `/api/jlpt/vocab` | none | `?level=N5&page=1&limit=50` | `{ data: Content[], total, page, limit }` |

---

## Alphabet

| Method | Path | Auth | Input | Output |
|--------|------|------|-------|--------|
| GET | `/api/alphabet` | none | `?lang=ja&type=hiragana` | `Content[]` |

---

## Grammar

| Method | Path | Auth | Input | Output |
|--------|------|------|-------|--------|
| GET | `/api/grammar` | none | `?lang=ja&level=N5` | `GrammarPattern[]` |

---

## Listening

| Method | Path | Auth | Input | Output |
|--------|------|------|-------|--------|
| GET | `/api/listening` | none | `?lang=ja&level=N5` | Lesson[] with content payload |

---

## Reading

| Method | Path | Auth | Input | Output |
|--------|------|------|-------|--------|
| GET | `/api/reading` | none* | `?level&type&lang` | `ReadingPassage[]` (no content field, has charCount) |
| GET | `/api/reading?export=1&admin=1` | admin | — | JSON file download |
| GET | `/api/reading?lang=zh` | none | `?level` | Chinese passages mapped to same shape |
| GET | `/api/reading/[id]` | none | — | Full `ReadingPassage` with `content` |
| POST | `/api/reading/import` | admin | `ReadingPassage[]` | `{ imported: n }` |

---

## Flashcards

| Method | Path | Auth | Input | Output |
|--------|------|------|-------|--------|
| GET | `/api/flashcards` | user | `?page&limit` | `Deck[] + dueCount` or paginated |
| POST | `/api/flashcards` | user | `{ title, description?, color? }` | `FlashcardDeck` (201) |
| GET | `/api/flashcards/[deckId]` | user | — | `Deck + cards[]` |
| PATCH | `/api/flashcards/[deckId]` | user | `{ title?, description?, color? }` | `FlashcardDeck` |
| DELETE | `/api/flashcards/[deckId]` | user | — | `{ ok: true }` |
| GET | `/api/flashcards/[deckId]/cards` | user | `?page&limit` | `Flashcard[]` + progress (per card) |
| POST | `/api/flashcards/[deckId]/cards` | user | `{ front, back, reading?, example?, imageUrl?, contentId? }` | `Flashcard` (201) |
| POST | `/api/flashcards/[deckId]/import` | user | `{ cards: [{front,back,...}] }` | `{ created: n }` |
| PATCH | `/api/flashcards/cards/[cardId]` | user | `{ front?, back?, reading?, example? }` | `Flashcard` |
| DELETE | `/api/flashcards/cards/[cardId]` | user | — | `{ ok: true }` |
| POST | `/api/flashcards/cards/[cardId]/review` | user | `{ rating: 0\|1\|2\|3 }` | Updated `FlashcardProgress` |
| POST | `/api/flashcards/upload` | user | `multipart/form-data (file)` | `{ url }` |

---

## Saved Words

| Method | Path | Auth | Input | Output |
|--------|------|------|-------|--------|
| GET | `/api/words` | user | `?page&limit` | `SavedWord[]` with content + collections |
| POST | `/api/words` | user | `{ contentId? } \| { term? }` | `SavedWord` (201) |
| DELETE | `/api/words/[wordId]` | user | — | `{ ok: true }` |

**POST /api/words:** supports legacy `{ term }` — looks up Content by term, then upserts SavedWord.

---

## Word Collections

| Method | Path | Auth | Input | Output |
|--------|------|------|-------|--------|
| GET | `/api/collections` | user | — | `WordCollection[]` with word count |
| POST | `/api/collections` | user | `{ name, color? }` | `WordCollection` (201) |
| PATCH | `/api/collections/[id]` | user | `{ name?, color? }` | `WordCollection` |
| DELETE | `/api/collections/[id]` | user | — | `{ ok: true }` |

---

## Dictionary

| Method | Path | Auth | Input | Output |
|--------|------|------|-------|--------|
| GET | `/api/dictionary` | none | `?term=こんにちは&lang=ja` | `Content + meanings + examples` or `null` |

---

## Study Profile

| Method | Path | Auth | Input | Output |
|--------|------|------|-------|--------|
| GET | `/api/study-profile` | user | — | `UserStudyProfile` |
| POST/PATCH | `/api/study-profile` | user | `{ weeklyGoal? }` | `UserStudyProfile` |

---

## Upload

| Method | Path | Auth | Input | Output |
|--------|------|------|-------|--------|
| POST | `/api/upload` | user | `multipart/form-data` | `{ url }` |

---

## PMP

| Method | Path | Auth | Input | Output |
|--------|------|------|-------|--------|
| GET | `/api/pmp` | none | `?area&group` | PMP processes / questions |
| POST | `/api/pmp/submit` | user | `{ answers }` | PMP session + score |

---

## Admin

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET/POST | `/api/admin/levels` | admin | Level CRUD |
| GET/POST/PATCH/DELETE | `/api/admin/examsets` | admin | ExamSet CRUD |
| GET/POST | `/api/admin/questions/[id]` | admin | Question CRUD |
| POST | `/api/admin/import-questions` | admin | Bulk import questions |
| GET | `/api/admin/export-questions` | admin | Export questions |
| GET/PATCH | `/api/admin/users/[id]` | admin | User detail + update role/tier |
| POST | `/api/admin/seed` | admin | Seed data trigger |
| POST | `/api/admin/seed-minna` | admin | Seed みんなの日本語 data |
| POST | `/api/admin/seed-mimikara` | admin | Seed 耳から覚える data |
| POST | `/api/admin/seed-listening` | admin | Seed listening data |
| POST | `/api/admin/seed-learning` | admin | Seed learning data |
| GET/POST | `/api/admin/listening` | admin | Listening content CRUD |
| GET/POST | `/api/admin/learning` | admin | Learning category CRUD |

---

## Error Response Format

```json
{
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Unauthorized"
  },
  "message": "Unauthorized"
}
```

## Success Response

- Single object: `{ ...object_fields }`
- Paginated: `{ data: [...], total, page, limit, hasMore }`
- Created: status 201
