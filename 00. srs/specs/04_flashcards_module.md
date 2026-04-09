# 04 — Flashcards Module

> Source: `src/app/api/flashcards/`, `src/app/[locale]/[lang]/practice/`

---

## Data Model

```
User → FlashcardDeck (1:N)
FlashcardDeck → Flashcard (1:N)
Flashcard ←→ FlashcardProgress (1:N, indexed by userId+cardId)
Flashcard → Content (optional FK, for system-generated cards)
```

---

## SRS Algorithm — `computeNextSRS`

**File:** `src/app/api/flashcards/cards/[cardId]/review/route.ts`

```typescript
function computeNextSRS(
  rating: 0 | 1 | 2 | 3,       // 0=Again, 1=Hard, 2=Good, 3=Easy
  repetitions: number,           // current consecutive correct count
  interval: number,              // current interval (days)
  easeFactor: number,            // SM-2 ease multiplier (min 1.3)
): { repetitions, interval, easeFactor, dueAt: Date }
```

**Logic per rating:**

| Rating | Label | repetitions | interval | easeFactor |
|--------|-------|-------------|----------|------------|
| 0 | Again | reset to 0 | reset to 1 | unchanged |
| 1 | Hard | +1 | `max(1, round(interval * 1.2))` | `max(1.3, ef - 0.15)` |
| 2 | Good | +1 | rep=0→1, rep=1→4, else→`round(interval * ef)` | unchanged |
| 3 | Easy | +1 | rep=0→4, else→`round(interval * ef * 1.3)` | `min(3.0, ef + 0.15)` |

`dueAt = now + interval days`

Initial state: `{ repetitions: 0, interval: 1, easeFactor: 2.5 }`

---

## API Functions

### GET `/api/flashcards`
```
Auth: user (web+mobile)
Query: ?page=1&limit=20 (optional — paginated if ?limit present)

Logic:
  1. getApiUser(req) → userId
  2. flashcardDeck.findMany({ userId, include: _count.cards, orderBy: updatedAt.desc })
  3. Cho mỗi deck: đếm dueCount (cards chưa có progress HOẶC progress.dueAt <= now)
  4. Nếu paginated → { data, total, page, limit, hasMore }
     Nếu không → array

Output field thêm: dueCount (số thẻ cần ôn hôm nay)
```

### POST `/api/flashcards`
```
Auth: user
Body: { title: string, description?: string, color?: string }
Validation: title required
Output: FlashcardDeck (201)
Default color: "#4F46E5"
```

### GET `/api/flashcards/[deckId]`
```
Auth: user
Logic: Verify deck belongs to user
Output: FlashcardDeck + cards[] (ordered by order asc) + progress per card for userId
```

### PATCH `/api/flashcards/[deckId]`
```
Auth: user
Body: { title?, description?, color? }
Output: Updated FlashcardDeck
```

### DELETE `/api/flashcards/[deckId]`
```
Auth: user
Logic: Cascades → deletes all cards and their progress
Output: { ok: true }
```

### GET `/api/flashcards/[deckId]/cards`
```
Auth: user
Query: ?page&limit (optional pagination)
Output: Flashcard[] each with progress field (user's SRS state)
```

### POST `/api/flashcards/[deckId]/cards`
```
Auth: user
Body: { front, back, reading?, example?, imageUrl?, contentId? }
Output: Flashcard (201)
```

### POST `/api/flashcards/[deckId]/import`
```
Auth: user
Body: { cards: Array<{ front, back, reading?, example? }> }
Logic: prisma.flashcard.createMany()
Output: { created: n }
```

### PATCH `/api/flashcards/cards/[cardId]`
```
Auth: user
Body: { front?, back?, reading?, example? }
Logic: Verify card.deck.userId === user.id
Output: Updated Flashcard
```

### DELETE `/api/flashcards/cards/[cardId]`
```
Auth: user
Logic: Verify ownership then delete (cascades progress)
Output: { ok: true }
```

### POST `/api/flashcards/cards/[cardId]/review`
```
Auth: user
Body: { rating: 0 | 1 | 2 | 3 }

Logic:
  1. Verify card ownership (card.deck.userId === user.id)
  2. Load existing FlashcardProgress for userId+cardId (if any)
  3. computeNextSRS(rating, existing.repetitions, existing.interval, existing.easeFactor)
  4. prisma.flashcardProgress.upsert({
       where: { userId_cardId: { userId, cardId } },
       update: { repetitions, interval, easeFactor, dueAt, lastReview: now, totalReviews: +1 },
       create: { cardId, userId, repetitions, interval, easeFactor, dueAt, lastReview: now, totalReviews: 1 }
     })

Output: Updated FlashcardProgress
```

### POST `/api/flashcards/upload`
```
Auth: user
Body: multipart/form-data (image file)
Output: { url: string }  ← public file URL
```

---

## Front-end Pages

| Route | Page | Chức năng |
|-------|------|-----------|
| `/[locale]/[lang]/practice` | Deck list | Danh sách decks + dueCount badge |
| `/[locale]/[lang]/practice/[deckId]` | Deck detail | Xem cards trong deck |
| `/[locale]/[lang]/practice/[deckId]/study` | Study session | Flip card + rating buttons |

---

## Business Rules

1. **Ownership check**: Mọi card/deck operation đều verify `deck.userId === user.id`
2. **Due queue**: `dueAt <= now || progress.none` → thẻ cần ôn
3. **SRS initial state**: FlashcardProgress được tạo lần đầu khi user review lần đầu (không tạo sẵn)
4. **Multi-user**: Mỗi user có `FlashcardProgress` riêng cho cùng một card (unique: userId+cardId)
5. **Content link**: `contentId` optional — cho phép link thẻ về `Content` trong learning system
