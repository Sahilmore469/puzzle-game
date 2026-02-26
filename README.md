# 🧩 DailyPuzzle — Think Sharp Every Day

<div align="center">

![DailyPuzzle Banner](https://img.shields.io/badge/DailyPuzzle-Think%20Sharp-6c63ff?style=for-the-badge&logo=puzzle-piece)
![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38bdf8?style=for-the-badge&logo=tailwind-css)
![Prisma](https://img.shields.io/badge/Prisma-5-2D3748?style=for-the-badge&logo=prisma)

**A production-ready daily puzzle game with 4 unique games, streak tracking, GitHub-style activity heatmap, offline-first architecture, and Google authentication.**

[Live Demo](#) · [Report Bug](#) · [Request Feature](#)

</div>

---

## 📸 Preview

> Solve 4 daily puzzles, build your streak, and watch your activity heatmap grow!

---

## ✨ Features

- 🎯 **4 Daily Puzzles** — Number Sequence → Math Challenge → Hangman → Wordle
- 🔥 **Streak Tracking** — Current streak, best streak, total days played
- 📊 **GitHub-style Heatmap** — 365-day activity visualization
- 🔐 **Google OAuth + Guest Mode** — Sign in with Google or play as Guest
- 💾 **Offline-First** — Works without internet using IndexedDB
- 🔄 **Auto Backend Sync** — Syncs to PostgreSQL when online
- 🏆 **Achievements** — Unlock badges for milestones
- 🪢 **Hangman** — Animated rope cuts, man falls on game over
- 🟩 **Wordle** — Flip tile animations, color-coded keyboard
- 📱 **Mobile Responsive** — Works on all screen sizes
- ⚡ **Deterministic Puzzles** — Same puzzle for all users each day

---

## 🎮 How It Works

```
Every day you get 4 puzzles in order:

Puzzle 1 → 🔢 Number Sequence   (find the next number)
Puzzle 2 → ➗ Math Challenge     (solve the equation)
Puzzle 3 → 🪢 Hangman           (guess the word, save the man)
Puzzle 4 → 🟩 Wordle            (guess 5-letter word in 6 tries)

All 4 puzzles count toward your daily streak!
```

---

## 🛠 Tech Stack

| Category | Technology |
|----------|-----------|
| Frontend | Next.js 14, React 18, TypeScript |
| Styling | Tailwind CSS, Framer Motion |
| Auth | NextAuth.js (Google + Guest) |
| Database | PostgreSQL (Neon) via Prisma ORM |
| Offline Storage | IndexedDB (idb library) |
| Deployment | Vercel |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Git

### Installation

**1. Clone the repository**
```bash
git clone https://github.com/YOUR_USERNAME/daily-puzzle-game.git
cd daily-puzzle-game
```

**2. Install dependencies**
```bash
npm install
```

**3. Set up environment variables**
```bash
cp .env.example .env.local
```

Fill in your `.env.local`:
```env
DATABASE_URL="postgresql://..."
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

**4. Set up database**
```bash
npm run db:push
```

**5. Run development server**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) 🎉

---

## 🔐 Environment Setup Guides

### A) Free Database — Neon PostgreSQL
1. Go to [neon.tech](https://neon.tech) → Sign up free
2. Create new project → name it `daily-puzzle`
3. Copy the **Connection String**
4. Paste as `DATABASE_URL` in `.env.local`

### B) Google OAuth
1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Create new project → **APIs & Services** → **Credentials**
3. Create **OAuth 2.0 Client ID** → Web application
4. Add redirect URIs:
   - `http://localhost:3000/api/auth/callback/google`
   - `https://your-app.vercel.app/api/auth/callback/google`
5. Copy **Client ID** + **Secret** → paste in `.env.local`

### C) NextAuth Secret
Generate one instantly:
```bash
openssl rand -base64 32
```

---

## 🌐 Deploy to Vercel

```bash
# Push to GitHub first
git add .
git commit -m "Deploy DailyPuzzle"
git push origin main
```

Then:
1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repo
3. Add all environment variables
4. Click **Deploy** ✅

Your app will be live at `https://your-app.vercel.app`

---

## 📁 Project Structure

```
src/
├── app/
│   ├── page.tsx                         # Main game UI
│   ├── layout.tsx                       # Root layout
│   ├── globals.css                      # Global styles
│   ├── auth/signin/page.tsx             # Sign in page
│   └── api/
│       ├── auth/[...nextauth]/route.ts  # NextAuth handler
│       └── sync/daily-scores/route.ts  # Backend sync API
├── components/
│   ├── AuthProvider.tsx                 # Session provider
│   ├── UserMenu.tsx                     # User avatar + logout
│   ├── puzzle/
│   │   ├── SequencePuzzle.tsx           # Number sequence game
│   │   ├── MathPuzzle.tsx               # Math challenge game
│   │   ├── HangmanPuzzle.tsx            # Hangman game
│   │   ├── WordlePuzzle.tsx             # Wordle game
│   │   └── CompletionScreen.tsx         # End screen
│   ├── heatmap/Heatmap.tsx              # Activity heatmap
│   └── streak/StreakDisplay.tsx         # Streak stats
├── hooks/
│   └── useGameState.ts                  # Central game state
└── lib/
    ├── prisma.ts                        # Prisma client
    ├── db.ts                            # IndexedDB (offline)
    ├── puzzleEngine.ts                  # Deterministic puzzles
    ├── streak.ts                        # Streak calculation
    ├── heatmap.ts                       # Heatmap data processing
    └── sync.ts                          # Backend sync utilities
prisma/
└── schema.prisma                        # Database schema
```

---

## 🏗 Architecture

```
User visits app
      ↓
Sign In (Google OAuth / Guest)
      ↓
IndexedDB ← Primary storage (instant, offline)
      ↓
Puzzle solved → Save to IndexedDB immediately
      ↓
If online + logged in → POST /api/sync/daily-scores
      ↓
Prisma upsert → Neon PostgreSQL (cloud backup)
```

---

## 🎯 Score Formula

```
Base Score  = (difficulty × 100) + max(0, 300 - timeTaken) - (hintsUsed × 50)
Final Score = Base Score × multiplier

Multipliers:
  All puzzles solved    → ×1.0  (100%)
  Wordle failed         → ×0.7  (70%)
```

---

## 🏆 Achievements

| Badge | Name | Requirement |
|-------|------|-------------|
| 🔥 | On Fire | 7 day streak |
| ⚡ | Lightning | Complete in under 60 seconds |
| 🌟 | Star Player | 30 day streak |
| 💎 | Diamond | 100 day streak |
| 🎯 | Perfect | Score 400+ points |

---

## 📜 Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run db:push      # Push schema to database
npm run db:generate  # Generate Prisma client
```

---

## 🤝 Contributing

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

Distributed under the MIT License.

---

## 👨‍💻 Author

**Sahil More**
- GitHub: [@Sahilmore469](https://github.com/Sahilmore469)

---

## 🙏 Acknowledgments

- Inspired by [Wordle](https://www.nytimes.com/games/wordle/index.html)
- Built for **Bluestock Fintech Capstone Project** — February 2026
- Powered by [Next.js](https://nextjs.org), [Prisma](https://prisma.io), [Neon](https://neon.tech)

---

<div align="center">
  Made with ❤️ by Sahil More
</div>
