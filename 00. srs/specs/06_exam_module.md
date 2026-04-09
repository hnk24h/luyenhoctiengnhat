# 06 — Exam Module

> Source: `src/app/api/exam/`, `src/app/[locale]/[lang]/exam/`, `src/app/[locale]/[lang]/levels/`

---

## Data Model

```
Level (N5–N1, HSK1–HSK6)
└── ExamSet (skill: nghe|doc|viet|vocab|grammar)
    ├── Question[] (ordered)
    └── ExamSession[] (user attempts)
        └── ExamAnswer[] (per question)

User
└── UserProgress (best score, attempts per ExamSet)
```

---

## API Functions

### `GET /api/exam/[id]`
```typescript
// Auth: none (public)
// ⚠️ answer và explain bị STRIP ra để tránh cheat

Output: {
  id: string,
  title: string,
  skill: Skill,
  timeLimit: number | null,  // seconds, null = unlimited
  levelCode: string,
  questions: [{
    id, type, content, options, audioUrl, imageUrl, order
    // answer và explain bị omit
  }]
}
```

### `POST /api/exam/submit`
```typescript
// Auth: user (cookie — chưa migrate sang getApiUser)
// ⚠️ Dùng getServerSession, chưa hỗ trợ Bearer token

Input: {
  examSetId: string,
  answers: Record<questionId, userAnswerString>
}

Logic:
  1. Tải ExamSet + questions
  2. Chấm từng câu:
     - Parse q.answer: thử JSON.parse, nếu fail thì dùng string thuần
     - isCorrect = Array.isArray(correctAns)
         ? correctAns.includes(userAns.trim())
         : userAns.trim() === correctAns.trim()
  3. correctQ = số câu đúng
  4. score = (correctQ / totalQ) * 100 → parseFloat(toFixed(1))
  5. prisma.examSession.create({ userId, examSetId, score, totalQ, correctQ,
       finishedAt: now, answers: { create: [...] } })
  6. Upsert UserProgress:
     - Nếu đã tồn tại: attempts++, cập nhật bestScore (nếu score > bestScore),
       lastAttempt = now, completed = true nếu score >= 70
     - Nếu chưa tồn tại: create với attempts=1

Output: {
  sessionId: string,
  score: number,       // 0–100
  correctQ: number,
  totalQ: number,
  // ...optional: answers detail
}
```

---

## Question Types

| QuestionType | Mô tả |
|-------------|-------|
| `tracnghiem` | Multiple choice — options là JSON array, answer là 1 option string |
| `dien_tu` | Điền từ — answer là string hoặc JSON array |
| `nghe_audio` | Nghe audio + chọn đáp án — có audioUrl |
| `ghi_am` | Ghi âm upload — chưa implement tự động chấm |
| `upload_file` | Upload file — chưa implement tự động chấm |

---

## Answer Validation Logic

```typescript
// Chấm điểm cho 1 câu
let correctAns: string | string[]
try {
  correctAns = JSON.parse(q.answer)   // try parse as JSON array
} catch {
  correctAns = q.answer               // plain string
}

const isCorrect = Array.isArray(correctAns)
  ? correctAns.includes(userAns.trim())   // multi-answer
  : userAns.trim() === correctAns.trim()  // single answer
```

---

## UserProgress Rules

| Điều kiện | Hành động |
|-----------|-----------|
| Lần đầu | create { attempts=1, completed=(score>=70), bestScore=score, lastAttempt=now } |
| Đã tồn tại | attempts++, lastAttempt=now, bestScore=max(bestScore, score), completed=(score>=70 OR đã completed) |

---

## ExamPlan

Kế hoạch ôn tập của user:

```
GET /api/exam-plan    → UserExamPlan | null
POST /api/exam-plan   → create/update UserExamPlan
```

**Input fields:**
```typescript
{
  targetLevelCode: string   // N3, N2,...
  examDate: string          // ISO date
  daysLeftAtSave: number
  weeksLeftAtSave: number
  examsPerWeek: number
  studySessionsPerWeek: number
  reviewDays: number        // số ngày ôn lại trong tuần
}
```

---

## Front-end Pages

| Route | Chức năng |
|-------|-----------|
| `/[locale]/[lang]/levels` | Danh sách levels + ExamSets per level |
| `/[locale]/[lang]/levels/[levelCode]` | ExamSets của level đó |
| `/[locale]/[lang]/exam/[examSetId]` | Làm bài thi |
| `/[locale]/[lang]/results/[sessionId]` | Xem kết quả sau khi nộp bài |

---

## PMP Exam (xem thêm)

PMP có exam flow riêng:
- `PMPExamQuestion` thay vì `Question`
- `PMPExamSession` + `PMPExamAnswer`
- `PMPUserProgress` track per knowledge area
- Route: `/api/pmp/submit`

**PMPExamQuestion câu hỏi:** 4 options `optionA–D`, answer là `"A"|"B"|"C"|"D"`

---

## Exam Module Files

```
src/app/api/exam/
  [id]/route.ts        ← GET exam set (public, answer stripped)
  submit/route.ts      ← POST submit exam
src/app/api/exam-plan/
  route.ts             ← GET / POST exam plan
src/app/api/admin/
  examsets/            ← Admin CRUD examsets
  questions/[id]/      ← Admin question CRUD
  import-questions/    ← Bulk import
  export-questions/    ← Export
```
