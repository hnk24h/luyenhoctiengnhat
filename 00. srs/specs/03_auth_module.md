# 03 — Auth Module

> Source: `src/lib/auth.ts`, `src/lib/api-auth.ts`, `src/app/api/auth/`

---

## Overview

Hệ thống dùng 2 auth paths:
1. **Web** — NextAuth v4 JWT-strategy (cookie `next-auth.session-token`)
2. **Mobile** — Custom Bearer JWT (ký bằng cùng `NEXTAUTH_SECRET`)

Cùng một helper `getApiUser(req)` phục vụ cả hai paths.

---

## NextAuth Config (`src/lib/auth.ts`)

```typescript
export const authOptions: NextAuthOptions = {
  session: { strategy: 'jwt' },
  pages: { signIn: '/auth/login' },
  providers: [CredentialsProvider({...})],
  callbacks: { jwt, session }
}
```

### CredentialsProvider.authorize
```
Input:  { email: string, password: string }
Logic:  prisma.user.findUnique({ where: { email } })
        → bcrypt.compare(password, user.password)
Output: { id, name, email, role } | null
```

### jwt callback
```
if (user) → token.id = user.id; token.role = user.role
```

### session callback
```
session.user.id   = token.id
session.user.role = token.role
```

---

## Mobile Auth Flow

### `POST /api/auth/mobile/token`
```
Input:  { email: string, password: string }
Auth:   none (public)
RateLimit: 5 req / IP / 15 min (in-memory Map)

Logic:
  1. Rate check by X-Forwarded-For IP
  2. bcrypt.compare(password, user.password)
  3. SignJWT({ id, role, email, name }, NEXTAUTH_SECRET, '30d')

Output 200: { token: string, user: { id, name, email, role } }
Output 400: VALIDATION error
Output 401: UNAUTHORIZED error  
Output 429: RATE_LIMITED error
```

**JWT payload:**
```json
{ "id": "...", "role": "user", "email": "...", "name": "...", "exp": ... }
```

### `GET /api/auth/mobile/me`
```
Input:  Authorization: Bearer <token>
Output: ApiUser { id, role, email, name }
```

---

## `getApiUser(req)` — `src/lib/api-auth.ts`

```typescript
async function getApiUser(req: NextRequest): Promise<ApiUser | null>
```

**Logic flow:**
1. Check `Authorization: Bearer <token>` header
   - `jwtVerify(token, NEXTAUTH_SECRET)` via `jose`
   - Extract `payload.id` (or `payload.sub`) → return `ApiUser`
   - Bất kỳ lỗi verify → return `null`
2. Fallback: `getServerSession(authOptions)` (cookie)
   - `session.user.id` phải tồn tại
   - Return `ApiUser` từ session

```typescript
interface ApiUser {
  id: string
  role: string     // 'user' | 'admin'
  email?: string | null
  name?: string | null
}
```

### `getApiUserId(req)` — shortcut
```typescript
async function getApiUserId(req: NextRequest): Promise<string | null>
// → getApiUser(req) rồi lấy user?.id
```

---

## Rate Limiting (Mobile Login)

```typescript
// In-memory, không persist qua restart
const RATE_WINDOW_MS = 15 * 60 * 1000  // 15 phút
const RATE_MAX = 5                      // 5 attempts

rateLimitMap: Map<ip, { count: number, resetAt: number }>

function isRateLimited(ip: string): boolean
// → Tăng count, reset nếu quá window, return true nếu count > 5
```

⚠️ **Giới hạn:** In-memory rate limit — reset khi server restart, không scale ngang.

---

## Admin Guard Pattern

```typescript
// Trong route handler:
const user = await getApiUser(req);
if (!user)             return apiError(ApiCode.UNAUTHORIZED, '...', 401);
if (user.role !== 'admin') return apiError(ApiCode.FORBIDDEN, '...', 403);
```

---

## Session Type Augmentation (`src/types/next-auth.d.ts`)

NextAuth `User` và `Session.user` được augment thêm `id` và `role`:
```typescript
declare module 'next-auth' {
  interface User { id: string; role: string }
  interface Session { user: { id: string; role: string; ... } }
}
```

---

## Đăng ký người dùng

Không có `/api/auth/register` API route chuẩn. Xem `src/app/auth/` pages hoặc admin seed scripts để tạo user.

---

## Environment Variables

| Var | Mô tả |
|-----|-------|
| `NEXTAUTH_SECRET` | Ký JWT (cả NextAuth lẫn mobile token) |
| `NEXTAUTH_URL` | Base URL cho NextAuth redirects |
| `DATABASE_URL` | PostgreSQL connection string (Prisma) |
