# 07 — Reading & Vocabulary Module

> Source: `src/app/api/reading/`, `src/app/api/words/`, `src/app/api/collections/`, `src/app/api/dictionary/`

---

## Reading Module

### Data Model

```
Level (optional FK)
└── ReadingPassage (Japanese articles)
ChinesePassage (HSK Chinese articles — separate model)
```

### `GET /api/reading` — List passages
```typescript
// Auth: none (public). Admin query: getServerSession (chưa migrate)

Query params:
  level    ← N5|N4|...|HSK1|HSK2|...
  type     ← "short"|"long"|"news"
  lang     ← "ja" (default) | "zh"
  admin=1  ← show unpublished (requires admin session)
  export=1 ← download JSON file (requires admin session)

Logic [Japanese]:
  published = true (unless admin)
  findMany() → strip content field, add charCount = content.length

Logic [Chinese, lang=zh]:
  ChinesePassage.findMany()
  Map to unified shape: { id, title, titleVi, summary:null, level, type:"short", charCount }

Logic [Export]:
  Returns Response with Content-Disposition: attachment; filename="reading-passages-YYYY-MM-DD.json"
  Includes full content field

Output shape (list item):
{
  id, title, titleVi, summary, level, type, source, tags, createdAt,
  charCount    // content.length (no content field in list)
}
```

### `GET /api/reading/[id]` — Single passage
```typescript
// Auth: none (public)

Query: ?lang=ja|zh

Logic [Japanese]:
  ReadingPassage.findUnique({ id })
  Guard: !passage || !passage.published → 404
  Output: full ReadingPassage (includes content)

Logic [Chinese]:
  ChinesePassage.findUnique({ id })
  Map to unified shape + pinyin + translation fields
  Output: {
    id, title, titleVi, content, summary:null, level, type:'short',
    source:null, sourceUrl:null, tags, createdAt, pinyin, translation
  }
```

### `POST /api/reading/import` — Bulk import
```typescript
// Auth: admin (cookie)
// Body: ReadingPassage[]
// Logic: createMany()
// Output: { imported: n }
```

### `PUT /api/reading/[id]` — Update passage
```typescript
// Auth: admin (cookie)
// Body: ReadingPassage fields
// Output: Updated ReadingPassage
```

### Front-end
| Route | Chức năng |
|-------|-----------|
| `/[locale]/[lang]/reading` | Danh sách bài đọc theo level/type |
| `/[locale]/[lang]/reading/[id]` | Đọc bài + highlight vocabulary |

---

## Saved Words (Vocabulary) Module

### `GET /api/words`
```typescript
// Auth: user (web+mobile, getApiUser)
// Query: ?page&limit (optional pagination)

Output per word:
{
  id, userId, contentId, context, createdAt,
  content: {
    id, term, pronunciation, language,
    meanings: [{ language, meaning }],
    examples: [{ exampleText, translation }]
  },
  collections: [{ id, name, color }]  // flattened from join table
}
```

### `POST /api/words` — Save a word
```typescript
// Auth: user
// Body: { contentId?: string } | { term?: string, context?: string }

Logic:
  - Nếu có contentId → dùng trực tiếp
  - Nếu chỉ có term → Content.findFirst({ where: { term: term.trim() } })
    → 404 nếu không tìm thấy
  - SavedWord.upsert({ where: { userId_contentId }, update: { context }, create: {...} })

Output: SavedWord (201)
```

### `DELETE /api/words/[wordId]`
```typescript
// Auth: user
// Verify: word.userId === user.id
// Output: { ok: true }
```

---

## Word Collections Module

### `GET /api/collections`
```typescript
// Auth: user (getApiUser)
// Optional pagination: ?page&limit

Output: [{
  id, name, color,
  wordCount: number,    // from _count.words
  createdAt
}]
```

### `POST /api/collections` — Create collection
```typescript
// Body: { name: string, color?: string }
// Unique constraint: (userId, name) → CONFLICT error nếu trùng tên
// Output: WordCollection (201)
```

### `PATCH /api/collections/[id]` — Rename/recolor
```typescript
// Auth: user
// Body: { name?, color? }
// Verify: collection.userId === user.id
// Output: Updated WordCollection
```

### `DELETE /api/collections/[id]`
```typescript
// Auth: user
// Cascades via SavedWordsOnCollections
// Output: { ok: true }
```

### Adding/Removing Words from Collection
Thông qua các endpoint bổ sung (not explicitly routed above):
- `POST /api/collections/[id]/words` → add word to collection
- `DELETE /api/collections/[id]/words/[wordId]` → remove word

---

## Dictionary Lookup

### `GET /api/dictionary`
```typescript
// Auth: none (public)
// Query: ?term=こんにちは&lang=ja

Logic:
  Content.findFirst({
    where: { term: term.trim(), language: lang },
    include: { meanings, examples }
  })

Output: Content + meanings + examples | null (404 if not found)
```

---

## Business Rules

1. **Unique save:** User chỉ lưu mỗi từ 1 lần (`userId_contentId` unique) — POST words là upsert
2. **Term lookup:** POST words hỗ trợ cả `contentId` lẫn `term` string (backward compat)
3. **Collection color:** default `"#4F46E5"`, FE cho phép pick màu
4. **Reading list:** không expose `content` field trong list (chỉ `charCount`) để tiết kiệm bandwidth
5. **Chinese passage:** dùng `ChinesePassage` model riêng nhưng được map về cùng JSON shape với ReadingPassage để FE dùng chung component
