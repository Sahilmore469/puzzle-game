// app/api/sync/daily-scores/route.ts
// Minimal sync endpoint — validates + stores daily scores

import { NextRequest, NextResponse } from 'next/server';

interface SyncEntry {
  date: string;
  score: number;
  timeTaken: number;
  difficulty: number;
}

// In-memory store for demo (replace with Prisma + PostgreSQL in production)
const scores: Map<string, SyncEntry> = new Map();

function isValidDate(dateStr: string): boolean {
  const date = new Date(dateStr);
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  return !isNaN(date.getTime()) && date <= today;
}

function isValidScore(score: number, difficulty: number): boolean {
  const maxPossible = difficulty * 100 + 300;
  return score >= 0 && score <= maxPossible;
}

function isValidTime(timeTaken: number): boolean {
  return timeTaken >= 5 && timeTaken <= 3600; // 5 seconds to 1 hour
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { entries } = body as { entries: SyncEntry[] };

    if (!Array.isArray(entries)) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    const results = [];

    for (const entry of entries) {
      // Security validations
      if (!isValidDate(entry.date)) {
        results.push({ date: entry.date, status: 'rejected', reason: 'Invalid or future date' });
        continue;
      }

      if (!isValidScore(entry.score, entry.difficulty)) {
        results.push({ date: entry.date, status: 'rejected', reason: 'Score out of bounds' });
        continue;
      }

      if (!isValidTime(entry.timeTaken)) {
        results.push({ date: entry.date, status: 'rejected', reason: 'Unrealistic completion time' });
        continue;
      }

      // Upsert (in production: prisma.dailyScore.upsert)
      scores.set(entry.date, entry);
      results.push({ date: entry.date, status: 'synced' });
    }

    return NextResponse.json({
      success: true,
      results,
      synced: results.filter(r => r.status === 'synced').length,
    });
  } catch (error) {
    console.error('Sync error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'DailyPuzzle Sync API',
    version: '1.0.0',
    status: 'online',
  });
}
