// lib/streak.ts - Client-side streak logic

import dayjs from 'dayjs';
import { DailyActivity } from './db';

export interface StreakInfo {
  current: number;
  longest: number;
  totalDays: number;
}

export function calculateStreak(activities: DailyActivity[]): StreakInfo {
  if (activities.length === 0) return { current: 0, longest: 0, totalDays: 0 };

  // Build a set of solved dates
  const solvedDates = new Set(
    activities.filter(a => a.solved).map(a => a.date)
  );

  const totalDays = solvedDates.size;

  // Calculate current streak (going backwards from today)
  let current = 0;
  let check = dayjs();

  while (solvedDates.has(check.format('YYYY-MM-DD'))) {
    current++;
    check = check.subtract(1, 'day');
  }

  // If today is not solved yet, check from yesterday
  if (current === 0) {
    check = dayjs().subtract(1, 'day');
    while (solvedDates.has(check.format('YYYY-MM-DD'))) {
      current++;
      check = check.subtract(1, 'day');
    }
  }

  // Calculate longest streak
  const sortedDates = Array.from(solvedDates).sort();
  let longest = 0;
  let runLength = 0;
  let prevDate: dayjs.Dayjs | null = null;

  for (const dateStr of sortedDates) {
    const date = dayjs(dateStr);
    if (prevDate && date.diff(prevDate, 'day') === 1) {
      runLength++;
    } else {
      runLength = 1;
    }
    longest = Math.max(longest, runLength);
    prevDate = date;
  }

  return { current, longest, totalDays };
}

export function checkAchievements(streak: StreakInfo, activities: DailyActivity[]) {
  const achievements = [];

  if (streak.current >= 7) {
    achievements.push({
      id: 'streak_7',
      name: '🔥 Week Warrior',
      description: '7-day streak!',
      icon: '🔥',
      unlockedAt: Date.now(),
    });
  }

  if (streak.current >= 30) {
    achievements.push({
      id: 'streak_30',
      name: '💫 Monthly Master',
      description: '30-day streak!',
      icon: '💫',
      unlockedAt: Date.now(),
    });
  }

  if (streak.totalDays >= 100) {
    achievements.push({
      id: 'days_100',
      name: '🏆 Century Club',
      description: '100 days completed!',
      icon: '🏆',
      unlockedAt: Date.now(),
    });
  }

  const perfectDays = activities.filter(a => a.score >= 400).length;
  if (perfectDays >= 1) {
    achievements.push({
      id: 'perfect_score',
      name: '⭐ Perfectionist',
      description: 'Perfect score!',
      icon: '⭐',
      unlockedAt: Date.now(),
    });
  }

  return achievements;
}
