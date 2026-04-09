# 09 — Admin Module

> Source: `src/app/admin/`, `src/app/api/admin/`

---

## Admin Guard

Tất cả admin routes đều kiểm tra:
```typescript
const session = await getServerSession(authOptions)
if (session?.user?.role !== 'admin') → 403 Forbidden
```

⚠️ Admin API routes còn dùng `getServerSession` (chưa có `getApiUser` support).

---

## Seed System

### `POST /api/admin/seed` — Basic seed trigger
```typescript
// Disabled in production (NODE_ENV === 'production' → 403)
// Auth: admin cookie

Logic:
  1. Upsert JLPT levels: N5, N4, N3, N2, N1
  2. Seed mẫu ExamSet nghe N5 + questions nếu chưa tồn tại
  3. Seed mẫu ExamSet đọc N5
  4. Seed admin user (email: admin@example.com, password: admin123)
     via bcrypt.hash(password, 10)
```

**CLI alternative (không cần server):**
```bash
pnpm db:seed-basic
# hoặc: npx tsx scripts/seed/seed-basic.ts
```

### Other seed routes
| Route | Dữ liệu |
|-------|---------|
| `POST /api/admin/seed-minna` | みんなの日本語 vocab/lessons |
| `POST /api/admin/seed-mimikara` | 耳から覚える vocab/lessons |
| `POST /api/admin/seed-listening` | Listening content từ listeningContent.ts |
| `POST /api/admin/seed-learning` | Learning categories + lessons |

### Seed scripts (CLI)
```
scripts/seed/
  seed-basic.ts       ← Levels + sample exam sets + admin user
  seed-minna.ts       ← みんなの日本語
  seed-mimikara.ts    ← 耳から覚える
  seed-listening.ts   ← Listening
  seed-learning.ts    ← Learning categories

prisma/
  seed*.ts            ← 15+ seed files for various data
```

---

## Exam Management

### Admin ExamSets page: `/admin/examsets`
- List all exam sets với filter by level/skill
- Create new ExamSet (form: title, level, skill, timeLimit)
- Edit questions inline

### `GET/POST /api/admin/examsets`
```typescript
// Auth: admin
GET output: ExamSet[] with question count
POST input: { title, levelId, skill, description?, timeLimit? }
POST output: ExamSet (201)
```

### `GET/PATCH/DELETE /api/admin/examsets/[id]`
```typescript
PATCH input: { title?, description?, timeLimit?, skill? }
DELETE: cascades questions, sessions, answers, progress
```

### `GET/POST/PATCH/DELETE /api/admin/questions/[id]`
```typescript
POST input: {
  examSetId, type, content,
  options?: string[],   // JSON stringified for tracnghiem
  answer, explain?,
  audioUrl?, imageUrl?,
  order?
}
```

### `POST /api/admin/import-questions`
```typescript
// Body: Question[]
// Creates many questions in bulk
// Output: { imported: n }
```

### `GET /api/admin/export-questions`
```typescript
// Query: ?examSetId
// Output: JSON download of questions (with correct answers for admin use)
```

---

## User Management

### `/admin/users` page
- List all users
- Filter by role / subscription tier
- Click → `/admin/users/[id]`

### `GET /api/admin/users/[id]`
```typescript
// Auth: admin
Output: User + stats (examCount, lessonCount, flashcardCount)
```

### `PATCH /api/admin/users/[id]`
```typescript
// Auth: admin
Input: { role?: UserRole, subscriptionTier?: SubscriptionTier }
Output: Updated User
```

---

## Level Management

### `GET/POST /api/admin/levels`
```typescript
GET output: Level[] ordered by order asc
POST input: { code, name, description?, order?, subject? }
POST output: Level (201)
```

---

## Learning Content Admin

### `/admin/learning` page
- Manage LearningCategory + LearningLesson

### `/admin/learning/[categoryId]/lessons`
- Manage lessons trong category
- Create/edit lesson (title, type, order, requiredTier)
- Manage lesson items (Content[])

### `POST /api/admin/seed-learning`
Seed learning categories + lessons từ hardcoded data.

---

## Listening Content Admin

### `/admin/listening` page
- View/manage listening lessons

### `POST /api/admin/seed-listening`
Import từ `LISTENING_PRACTICES` static array → tạo LearningCategory + LearningLesson với type=audio.

---

## User Access Admin

### `/admin/user-access` page
- Cấp quyền truy cập lesson premium cho user cụ thể

### API
```typescript
POST /api/admin/user-access
Input: { userId, lessonId, expiresAt?: string, note?: string }
Output: UserLessonAccess
```

---

## Normalize Utility

### `/admin/normalize` page
Công cụ normalize data:
- Trim whitespace từ term/pronunciation fields
- Fix duplicate entries
- Reorder items

---

## Import Tool

### `/admin/import` page
Bulk import từ file JSON/CSV:
- Reading passages (`POST /api/reading/import`)
- Questions (`POST /api/admin/import-questions`)
- Learning content

---

## Admin Page Structure

```
src/app/admin/
  examsets/              ← CRUD exam sets + questions
    AdminExamSetsClient.tsx
    page.tsx
    [id]/
  import/                ← Bulk import UI
  learning/              ← Learning content management
  levels/                ← Level management
  listening/             ← Listening content management
  normalize/             ← Data normalization
  reading/               ← Reading passage management
  seed/                  ← Seed trigger UI
  theme/                 ← Theme settings
  user-access/           ← Grant lesson access
  users/                 ← User list + [id] detail
```

---

## Security Notes

1. Mọi admin route đều check `role === 'admin'` — không dùng middleware-level guard
2. Seed endpoints bị disabled trong production
3. Admin API chưa dùng `getApiUser()` — không hỗ trợ Bearer token auth
