// lib/sync.ts - Backend sync logic

import { getUnsyncedActivities, markAsSynced, DailyActivity } from './db';

export async function syncToServer(activities: DailyActivity[]): Promise<boolean> {
  try {
    const entries = activities.map(a => ({
      date: a.date,
      score: a.score,
      timeTaken: a.timeTaken,
      difficulty: a.difficulty,
    }));

    const response = await fetch('/api/sync/daily-scores', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ entries }),
    });

    return response.ok;
  } catch {
    return false;
  }
}

export async function performSync(): Promise<{ synced: number; failed: boolean }> {
  const unsynced = await getUnsyncedActivities();
  if (unsynced.length === 0) return { synced: 0, failed: false };

  const success = await syncToServer(unsynced);

  if (success) {
    for (const activity of unsynced) {
      await markAsSynced(activity.date);
    }
    return { synced: unsynced.length, failed: false };
  }

  return { synced: 0, failed: true };
}

// Listen for online events and auto-sync
export function setupAutoSync(onSync: (count: number) => void) {
  if (typeof window === 'undefined') return;

  const handleOnline = async () => {
    const result = await performSync();
    if (result.synced > 0) {
      onSync(result.synced);
    }
  };

  window.addEventListener('online', handleOnline);
  return () => window.removeEventListener('online', handleOnline);
}
