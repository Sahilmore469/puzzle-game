// lib/heatmap.ts - Heatmap data processing

import dayjs from 'dayjs';
import { DailyActivity } from './db';

export interface HeatmapDay {
  date: string;
  intensity: 0 | 1 | 2 | 3 | 4;
  activity?: DailyActivity;
  isToday: boolean;
  isFuture: boolean;
  isCurrentMonth: boolean;
}

export interface HeatmapWeek {
  days: (HeatmapDay | null)[];
}

export function getIntensity(activity?: DailyActivity): 0 | 1 | 2 | 3 | 4 {
  if (!activity || !activity.solved) return 0;
  const { difficulty, score } = activity;
  if (score >= 400) return 4;
  if (difficulty === 3) return 3;
  if (difficulty === 2) return 2;
  return 1;
}

export function processHeatmapData(activities: DailyActivity[]): {
  weeks: HeatmapWeek[];
  months: { name: string; weekIndex: number }[];
} {
  const activityMap = new Map<string, DailyActivity>();
  activities.forEach(a => activityMap.set(a.date, a));

  const today = dayjs();
  const startOfYear = today.startOf('year');
  const isLeapYear = today.year() % 4 === 0 && (today.year() % 100 !== 0 || today.year() % 400 === 0);
  const totalDays = isLeapYear ? 366 : 365;

  // Build array of all days
  const allDays: HeatmapDay[] = [];
  for (let i = 0; i < totalDays; i++) {
    const date = startOfYear.add(i, 'day');
    const dateStr = date.format('YYYY-MM-DD');
    const activity = activityMap.get(dateStr);

    allDays.push({
      date: dateStr,
      intensity: getIntensity(activity),
      activity,
      isToday: dateStr === today.format('YYYY-MM-DD'),
      isFuture: date.isAfter(today, 'day'),
      isCurrentMonth: date.month() === today.month(),
    });
  }

  // Group into weeks (columns of 7)
  // First week: pad from Sunday
  const firstDay = startOfYear.day(); // 0=Sun
  const weeks: HeatmapWeek[] = [];
  let currentWeek: (HeatmapDay | null)[] = Array(firstDay).fill(null);

  for (const day of allDays) {
    currentWeek.push(day);
    if (currentWeek.length === 7) {
      weeks.push({ days: currentWeek });
      currentWeek = [];
    }
  }

  if (currentWeek.length > 0) {
    while (currentWeek.length < 7) currentWeek.push(null);
    weeks.push({ days: currentWeek });
  }

  // Build month labels
  const months: { name: string; weekIndex: number }[] = [];
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  let lastMonth = -1;

  weeks.forEach((week, weekIndex) => {
    const firstDayOfWeek = week.days.find(d => d !== null);
    if (firstDayOfWeek) {
      const month = dayjs(firstDayOfWeek.date).month();
      if (month !== lastMonth) {
        months.push({ name: monthNames[month], weekIndex });
        lastMonth = month;
      }
    }
  });

  return { weeks, months };
}
