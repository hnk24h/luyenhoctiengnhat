# 00 — System Overview

> **Mục đích:** Agent memory — đọc file này TRƯỚC khi làm bất kỳ tác vụ nào.

---

## 1. Giới thiệu ứng dụng

**LuyenThiTiengNhat** — nền tảng luyện thi ngôn ngữ hỗ trợ:
- JLPT (N5–N1) — tiếng Nhật
- HSK (HSK1–HSK6) — tiếng Trung
- PMP / PMBOK 6 — quản lý dự án

**URL pattern:** `/{locale}/{lang}/...` (ví dụ `/vi/ja/exam`, `/vi/zh/reading`)

---

## 2. Tech Stack

| Layer | Công nghệ |
|-------|-----------|
| Framework | Next.js 15.5.14 (App Router) |
| Language | TypeScript (strict) |
| Database | PostgreSQL via Prisma ORM |
| Auth | NextAuth v4 (JWT strategy) + custom Bearer JWT cho mobile |
| Styling | Tailwind CSS |
| i18n | next-intl — locale trong URL param `[locale]` |
| JWT mobile | `jose` (SignJWT / jwtVerify) |
| Password | `bcryptjs` |
| Package manager | yarn / npm |

---

## 3. Folder Structure

```
src/
  app/
    api/                 ← API Route Handlers (20 route groups)
    admin/               ← Admin UI pages (server & client components)
    [locale]/[lang]/     ← User-facing pages (i18n)
    auth/                ← NextAuth sign-in / sign-up pages
    dashboard/           ← Dashboard page
    chinese/ pmp/ results/
  lib/
    api-auth.ts          ← getApiUser(), getApiUserId()
    api-response.ts      ← apiError(), apiOk(), ApiCode
    auth.ts              ← authOptions (NextAuth config)
    db.ts                ← Prisma client singleton
    utils.ts             ← chung
  components/            ← Shared React components
  context/               ← React Context providers
  modules/               ← Business logic modules (non-route)
  types/                 ← TypeScript type declarations
  utils/                 ← Helper utilities
  middleware.ts          ← next-intl routing middleware
prisma/
  schema.prisma          ← Single source of truth cho DB
  seed*.ts               ← 15+ seed scripts
00. srs/
  specs/                 ← ← ← AGENT MEMORY FILES (bạn đang đọc)
  SRS_TONG_QUAN.md
  SRS_DETAIL.md
  PLAN_IMPLEMENT.md
scripts/
  seed/seed-basic.ts     ← CLI seed runner
```

---

## 4. Auth Architecture

### Web (cookie-based)
- NextAuth với JWT strategy — session lưu trong cookie `next-auth.session-token`
- `getServerSession(authOptions)` trong Server Components / Route Handlers

### Mobile (Bearer token)
- Login qua `POST /api/auth/mobile/token` → nhận `{ token, user }`
- Token là JWT ký bằng `NEXTAUTH_SECRET` chứa `{ id, role, email, name, exp }`
- Gửi kèm header: `Authorization: Bearer <token>`

### Hàm chính
```typescript
// src/lib/api-auth.ts
getApiUser(req: NextRequest): Promise<ApiUser | null>
// → Thử Bearer header trước, fallback cookie session
// → Trả null nếu không auth

getApiUserId(req: NextRequest): Promise<string | null>
// → Shortcut, chỉ lấy userId
```

### `ApiUser` interface
```typescript
interface ApiUser {
  id: string
  role: string          // 'user' | 'admin'
  email?: string | null
  name?: string | null
}
```

---

## 5. API Error/Response Standard

```typescript
// src/lib/api-response.ts

// Error response shape: { error: { code, message }, message }
apiError(code: string, message: string, status: number): NextResponse

// Success response shape: data wrapped in NextResponse
apiOk<T>(data: T, status?: number): NextResponse
```

### ApiCode constants
```typescript
ApiCode.UNAUTHORIZED    = 'UNAUTHORIZED'
ApiCode.FORBIDDEN       = 'FORBIDDEN'
ApiCode.NOT_FOUND       = 'NOT_FOUND'
ApiCode.BAD_REQUEST     = 'BAD_REQUEST'
ApiCode.INVALID_JSON    = 'INVALID_JSON'
ApiCode.CONFLICT        = 'CONFLICT'
ApiCode.VALIDATION      = 'VALIDATION'
ApiCode.INTERNAL        = 'INTERNAL'
ApiCode.RATE_LIMITED    = 'RATE_LIMITED'
ApiCode.GONE            = 'GONE'
```

### ⚠️ Lưu ý: Một số route cũ (exam/submit, learn/lesson) vẫn dùng `NextResponse.json()` trực tiếp chưa migrate sang `apiError()`.

---

## 6. Database — Enums

```typescript
Language    = ja | zh | ko | en | vi
Subject     = JLPT | HSK | PMP
UserRole    = user | admin
Skill       = nghe | noi | doc | viet | vocab | grammar
QuestionType = tracnghiem | dien_tu | nghe_audio | ghi_am | upload_file
LessonType  = text | vocab | grammar | audio
ContentType = vocab | character | grammar | example | phrase | tone | idiom
StudyEventType = lesson_open | lesson_complete | flashcard_review | exam_start | exam_finish | vocab_view
Difficulty  = easy | medium | hard
SubscriptionTier = free | basic | premium
```

---

## 7. Pagination Pattern (opt-in)

Áp dụng ở các list API:
- Không có `?limit` → trả toàn bộ (backward compat với web)
- Có `?limit=20&page=1` → paginated response:

```json
{
  "data": [...],
  "total": 100,
  "page": 1,
  "limit": 20,
  "hasMore": true
}
```

---

## 8. i18n Routing

`middleware.ts` dùng `next-intl` — tự động redirect theo locale.

URL pattern: `/{locale}/{lang}/section`
- `locale`: vi | ja | en
- `lang`: ja | zh (target language)

---

## 9. Module Index (đọc thêm)

| File | Nội dung |
|------|---------|
| `01_database_schema.md` | Toàn bộ Prisma models + relations |
| `02_api_routes.md` | Tất cả endpoints: method, path, auth, I/O |
| `03_auth_module.md` | NextAuth config, mobile JWT, session |
| `04_flashcards_module.md` | Deck CRUD + SRS algorithm |
| `05_learning_module.md` | Category → Lesson → Content hierarchy |
| `06_exam_module.md` | ExamSet, Questions, scoring |
| `07_reading_vocab_module.md` | Reading passages, SavedWords, Collections |
| `08_user_profile_module.md` | StudyProfile, ExamPlan, StudyEvent |
| `09_admin_module.md` | Seed routes, admin CRUD, user management |
