// lib/db.ts - IndexedDB wrapper using idb

import { openDB, DBSchema, IDBPDatabase } from 'idb';

export interface DailyActivity {
  date: string; // "YYYY-MM-DD"
  solved: boolean;
  score: number;
  timeTaken: number; // seconds
  difficulty: number; // 1=easy, 2=medium, 3=hard
  hintsUsed: number;
  synced: boolean;
  completedAt?: number; // timestamp
}

export interface PuzzleProgress {
  date: string;
  puzzleType: string;
  currentState: unknown;
  startedAt: number;
  timerStart: number;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  unlockedAt: number;
  icon: string;
}

interface PuzzleDB extends DBSchema {
  dailyActivity: {
    key: string;
    value: DailyActivity;
  };
  puzzleProgress: {
    key: string;
    value: PuzzleProgress;
  };
  achievements: {
    key: string;
    value: Achievement;
  };
}

let dbInstance: IDBPDatabase<PuzzleDB> | null = null;

export async function getDB(): Promise<IDBPDatabase<PuzzleDB>> {
  if (dbInstance) return dbInstance;
  
  dbInstance = await openDB<PuzzleDB>('puzzle-game-db', 1, {
    upgrade(db) {
      db.createObjectStore('dailyActivity', { keyPath: 'date' });
      db.createObjectStore('puzzleProgress', { keyPath: 'date' });
      db.createObjectStore('achievements', { keyPath: 'id' });
    },
  });

  return dbInstance;
}

// Daily Activity Operations
export async function saveDailyActivity(activity: DailyActivity): Promise<void> {
  const db = await getDB();
  await db.put('dailyActivity', activity);
}

export async function getDailyActivity(date: string): Promise<DailyActivity | undefined> {
  const db = await getDB();
  return db.get('dailyActivity', date);
}

export async function getAllActivities(): Promise<DailyActivity[]> {
  const db = await getDB();
  return db.getAll('dailyActivity');
}

export async function getUnsyncedActivities(): Promise<DailyActivity[]> {
  const all = await getAllActivities();
  return all.filter(a => !a.synced);
}

export async function markAsSynced(date: string): Promise<void> {
  const db = await getDB();
  const activity = await db.get('dailyActivity', date);
  if (activity) {
    await db.put('dailyActivity', { ...activity, synced: true });
  }
}

// Puzzle Progress Operations
export async function savePuzzleProgress(progress: PuzzleProgress): Promise<void> {
  const db = await getDB();
  await db.put('puzzleProgress', progress);
}

export async function getPuzzleProgress(date: string): Promise<PuzzleProgress | undefined> {
  const db = await getDB();
  return db.get('puzzleProgress', date);
}

// Achievements
export async function saveAchievement(achievement: Achievement): Promise<void> {
  const db = await getDB();
  const existing = await db.get('achievements', achievement.id);
  if (!existing) {
    await db.put('achievements', achievement);
  }
}

export async function getAllAchievements(): Promise<Achievement[]> {
  const db = await getDB();
  return db.getAll('achievements');
}
