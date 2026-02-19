# 🧩 DailyPuzzle — Capstone Project

A **daily logic puzzle game** with GitHub-style activity heatmap, streak tracking, offline support, and minimal backend sync.

---

## 🏗 Architecture Overview

```
Client-First Architecture
├── IndexedDB (Primary data store — offline-first)
├── Next.js App Router (React frontend + API routes)
├── Framer Motion (Animations)
├── Tailwind CSS (Styling)
└── Backend Sync API (POST /api/sync/daily-scores)
```

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 3. Build for Production
```bash
npm run build
npm start
```

---

## 📦 Project Structure

```
src/
├── app/
│   ├── page.tsx              # Main game UI
│   ├── layout.tsx            # Root layout
│   ├── globals.css           # Global styles
│   └── api/
│       └── sync/
│           └── daily-scores/ # Backend sync endpoint
│               └── route.ts
├── components/
│   ├── puzzle/
│   │   ├── SequencePuzzle.tsx   # Number sequence puzzle
│   │   ├── MathPuzzle.tsx       # Math expression puzzle
│   │   └── CompletionScreen.tsx # Post-completion view
│   ├── heatmap/
│   │   └── Heatmap.tsx          # GitHub-style activity grid
│   └── streak/
│       └── StreakDisplay.tsx    # Streak stats UI
├── hooks/
│   └── useGameState.ts          # Central game state hook
└── lib/
    ├── db.ts                    # IndexedDB operations (idb)
    ├── puzzleEngine.ts          # Deterministic puzzle generation
    ├── streak.ts                # Streak calculation logic
    ├── heatmap.ts               # Heatmap data processing
    └── sync.ts                  # Backend sync utilities
```

---

## 🎮 Modules

### MODULE 1 — Puzzle Engine
- **Deterministic seed**: Same date → same puzzle for all users
- **2 puzzle types**: Number Sequence + Math Expression
- **Client-side validation**: No server round-trips
- **Timer tracking**: Starts on first interaction
- **Hint system**: 3 hints/day with score penalty
- **Auto-save progress**: Stored in IndexedDB

### MODULE 2 — Daily Unlock & Streak
- Only today's puzzle is playable
- Streak resets if a day is missed
- Local midnight timezone handling
- Streak data: Current, Longest, Total Days

### MODULE 3 — Heatmap (365 days)
- GitHub-style 7-row grid
- 5 intensity levels (0–4)
- Hover tooltips with stats
- Today highlighted with ring
- Leap year safe (366 days)
- Animated cell reveals

### MODULE 4 — Backend Sync
- `POST /api/sync/daily-scores`
- Server-side validation (date, score bounds, time bounds)
- Upsert logic (no duplicates)
- Auto-sync on internet reconnect
- Demo uses in-memory store (replace with Prisma + PostgreSQL)

### MODULE 5 — Offline First
- **IndexedDB** for all local storage
  - `dailyActivity` — solved state, score, time
  - `puzzleProgress` — in-progress saves
  - `achievements` — unlocked badges
- Sync flag: marks records as synced/unsynced
- Works 100% without internet

### MODULE 6 — UI Polish
- Dark theme with purple accent
- Smooth Framer Motion animations
- Completion animation with trophy
- Achievement toast notifications
- Streak fire indicator
- Mobile responsive layout
- Space Mono + Sora fonts

---

## 🔌 Connecting Real Database (Production)

Replace the in-memory store in `src/app/api/sync/daily-scores/route.ts`:

```bash
npm install prisma @prisma/client
npx prisma init
```

Prisma schema:
```prisma
model DailyScore {
  id        String   @id @default(uuid())
  userId    String
  date      DateTime @db.Date
  score     Int
  timeTaken Int
  difficulty Int
  createdAt DateTime @default(now())

  @@unique([userId, date])
}
```

Then use:
```typescript
await prisma.dailyScore.upsert({
  where: { userId_date: { userId, date } },
  create: { userId, date, score, timeTaken, difficulty },
  update: { score, timeTaken, difficulty },
});
```

---

## 🏆 Intensity Levels

| Level | Condition         | Color        |
|-------|-------------------|--------------|
| 0     | Not played        | Dark gray    |
| 1     | Solved Easy       | Light green  |
| 2     | Solved Medium     | Medium green |
| 3     | Solved Hard       | Bright green |
| 4     | Perfect score     | Glowing green|

---

## 🎯 Score Formula

```
score = (difficulty × 100) + max(0, 300 - timeTaken) - (hintsUsed × 50)
```

---

## 🔐 Security

- All sync requests validated server-side
- Future dates rejected
- Score out-of-bounds rejected  
- Unrealistic completion times (<5s or >1hr) rejected

---

## 🧪 Key Test Cases

| Case | Result |
|------|--------|
| Same date = same puzzle | ✅ Deterministic seed |
| Wrong sequence answer | ✅ Shake animation, no advance |
| Reload during game | ✅ Progress restored from IndexedDB |
| Offline play | ✅ Full functionality |
| Online reconnect | ✅ Auto-sync triggers |
| Leap year | ✅ 366 days generated |
| Missed day | ✅ Streak resets to 0 |

---

## 📈 Scalability

- **0 read requests/day** from heatmap (all client-side)
- **1 write/day** per active user for sync
- At 1M DAU: only 1M writes/day
- Serverless-ready (Vercel + Neon PostgreSQL)

---

## 🚀 Deployment (Vercel)

```bash
npm i -g vercel
vercel
```

Set environment variable:
```
PUZZLE_SECRET_KEY=your_secret_key_here
```

---

Built for **Bluestock Fintech Capstone Project** · Feb 2026
