# 05 — Learning Module

> Source: `src/app/api/learn/`, `src/app/api/learning/`, `src/modules/listeningContent.ts`, `src/app/[locale]/[lang]/learn/`

---

## Data Hierarchy

```
Level (N5, N4, etc.)
└── LearningCategory (grouping by skill/topic)
    └── LearningLesson (type: text | vocab | grammar | audio)
        └── Content[] (learning items: vocab, character, grammar, etc.)
            ├── ContentMeaning[] (meanings per language)
            └── ContentExample[] (example sentences)
```

---

## LearningLesson Types

| type | Nội dung |
|------|---------|
| `text` | Markdown text content — `lesson.content` là markdown |
| `vocab` | Danh sách từ vựng — `lesson.items[]` là Content[] |
| `grammar` | Giải thích ngữ pháp — mix text + examples |
| `audio` | Bài nghe — `lesson.content` là `ListeningContentPayload` JSON |

---

## API Functions

### `GET /api/learn/lesson/[lessonId]`
```typescript
// src/app/api/learn/lesson/[lessonId]/route.ts
// Auth: không bắt buộc (isCompleted = false nếu chưa login)

Input: params.lessonId: string

Logic:
  prisma.learningLesson.findUnique({
    where: { id: lessonId },
    select: { id, title, description, type, items[...], progress[userId] }
  })

Output: {
  id, title, description, type,
  items: [{
    id, type, language, term, pronunciation, audioUrl, imageUrl, order,
    meanings: [{ id, language, meaning }],
    examples: [{ id, exampleText, translation, language, translationLanguage }]
  }],
  isCompleted: boolean  // true if userId has LessonProgress.completed=true
}
```

### `POST /api/learn/progress`
```typescript
// Auth: user (web+mobile)
// Body: { lessonId: string, completed?: boolean }
// Default: completed = false

Logic:
  prisma.lessonProgress.upsert({
    where: { userId_lessonId: { userId, lessonId } },
    update: { completed, completedAt },
    create: { userId, lessonId, completed, completedAt }
  })

Output: LessonProgress record
```

---

## Listening Content Module

**File:** `src/modules/listeningContent.ts`

Chứa STATIC data (không lấy từ DB) cho Listening practice.

### Types
```typescript
type ListeningLevel = 'N5' | 'N4' | 'N3' | 'N2' | 'N1'
type ListeningMondai = 'Mondai 1' | 'Mondai 2' | 'Mondai 3' | 'Mondai 4'

interface ListeningSegment {
  speaker: string
  text: string
  pinyin?: string
}

interface ListeningPractice {
  id: string
  level: ListeningLevel
  mondai: ListeningMondai
  title: string
  summary: string
  situation: string
  durationSec: number
  focus: string
  question: string
  options: string[]
  answer: string
  explanation: string
  audioUrl?: string | null
  segments: ListeningSegment[]
}
```

### Constants
```typescript
LISTENING_LEVEL_META: Record<ListeningLevel, { badgeBg, badgeText, accent, desc }>
LISTENING_MONDAI_LABELS: Record<ListeningMondai, string>
LISTENING_PRACTICES: ListeningPractice[]  // static array
```

**Mondai labels:**
- `Mondai 1` → "Chọn ý đúng trong hội thoại ngắn"
- `Mondai 2` → "Nhịp hỏi đáp và chọn hành động"
- `Mondai 3` → "Nghe thông báo và tìm thông tin"
- `Mondai 4` → "Nghe nội dung dài hơn và tổng hợp ý"

---

## Subscription Tier Gate

`LearningLesson.requiredTier` kiểm soát quyền truy cập:
- `free` — mở cho tất cả
- `basic` / `premium` — cần `UserLessonAccess` record hoặc đủ tier

**`UserLessonAccess`** — admin có thể cấp quyền thủ công:
```
lessonId + userId + grantedAt + expiresAt? + note?
```

---

## Content (Learning Item) Fields

```typescript
Content {
  term          // target language word (mapped from "japanese" column)
  pronunciation // furigana / pinyin (mapped from "reading" column)
  type          // vocab | character | grammar | example | phrase | tone | idiom
  language      // ja | zh | ko | en | vi
  audioUrl      // optional audio
  imageUrl      // optional image
  meanings[]    // ContentMeaning[] per language
  examples[]    // ContentExample[] with translation
}
```

---

## JLPT Vocab API

### `GET /api/jlpt/vocab`
```
Query: ?level=N5&page=1&limit=50
Output: { data: Content[], total, page, limit, hasMore }
```

## Alphabet API

### `GET /api/alphabet`
```
Query: ?lang=ja&type=hiragana|katakana|kanji
       ?lang=zh&type=tone|radical
Output: Content[]
```

---

## Grammar API

### `GET /api/grammar`
```
Query: ?lang=ja&level=N5
Output: GrammarPattern[] ordered by (lang, levelCode, order)

GrammarPattern {
  pattern      // 〜ています
  reading      // furigana
  meaning      // Vietnamese
  example      // target language sentence
  exampleReading
  exampleVi
  searchIn     // substring để match trong audio transcript
}
```

---

## Front-end Pages

| Route | Chức năng |
|-------|-----------|
| `/[locale]/[lang]/learn` | Danh sách levels + categories |
| `/[locale]/[lang]/learn/[levelCode]` | Categories trong level |
| `/[locale]/[lang]/learn/[levelCode]/[categoryId]` | Danh sách lessons |
| `/[locale]/[lang]/learn/[levelCode]/[categoryId]/[lessonId]` | Lesson detail |
| `/[locale]/[lang]/vocab` | Vocab viewer (jlpt vocab) |
| `/[locale]/[lang]/grammar` | Grammar patterns |
| `/[locale]/[lang]/listening` | Listening practice (static data) |
| `/[locale]/[lang]/alphabet` | Alphabet bảng chữ cái |
