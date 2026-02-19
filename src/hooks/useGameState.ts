// hooks/useGameState.ts

'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import dayjs from 'dayjs';
import { getAllActivities, getDailyActivity, saveDailyActivity, getPuzzleProgress, savePuzzleProgress, saveAchievement, getAllAchievements } from '@/lib/db';
import { generateDailyPuzzle, calculateScore } from '@/lib/puzzleEngine';
import { calculateStreak, checkAchievements } from '@/lib/streak';
import { processHeatmapData } from '@/lib/heatmap';
import { setupAutoSync } from '@/lib/sync';
import type { DailyActivity } from '@/lib/db';
import type { Puzzle } from '@/lib/puzzleEngine';

export type GamePhase = 'idle' | 'playing' | 'completed' | 'already_done';

export function useGameState() {
  const today = dayjs().format('YYYY-MM-DD');
  const [activities, setActivities] = useState<DailyActivity[]>([]);
  const [todayActivity, setTodayActivity] = useState<DailyActivity | null>(null);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'synced'>('idle');
  const [newAchievement, setNewAchievement] = useState<any | null>(null);

  // Game state
  const [phase, setPhase] = useState<GamePhase>('idle');
  const [currentPuzzleType, setCurrentPuzzleType] = useState<'sequence' | 'math'>('sequence');
  const [sequenceSolved, setSequenceSolved] = useState(false);
  const [mathSolved, setMathSolved] = useState(false);
  const [timerStart, setTimerStart] = useState<number | null>(null);
  const [timeTaken, setTimeTaken] = useState(0);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [hintsRemaining, setHintsRemaining] = useState(3);
  const [showHint, setShowHint] = useState(false);

  const todayPuzzles = useMemo(() => generateDailyPuzzle(today), [today]);

  // Load data on mount
  useEffect(() => {
    async function load() {
      const [allActivities, todayAct, allAchievements] = await Promise.all([
        getAllActivities(),
        getDailyActivity(today),
        getAllAchievements(),
      ]);
      setActivities(allActivities);
      setTodayActivity(todayAct || null);
      setAchievements(allAchievements);
      if (todayAct?.solved) setPhase('already_done');
      setIsLoading(false);
    }
    load();
  }, [today]);

  // Auto sync
  useEffect(() => {
    const cleanup = setupAutoSync((count) => {
      setSyncStatus('synced');
      setTimeout(() => setSyncStatus('idle'), 3000);
    });
    return cleanup;
  }, []);

  // Timer
  useEffect(() => {
    if (phase !== 'playing' || !timerStart) return;
    const interval = setInterval(() => {
      setTimeTaken(Math.floor((Date.now() - timerStart) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [phase, timerStart]);

  const startGame = useCallback(() => {
    setPhase('playing');
    setTimerStart(Date.now());
    setCurrentPuzzleType('sequence');
    setSequenceSolved(false);
    setMathSolved(false);
    setHintsUsed(0);
    setHintsRemaining(3);
    setShowHint(false);
  }, []);

  const handlePuzzleSolved = useCallback(async (puzzleType: 'sequence' | 'math') => {
    if (puzzleType === 'sequence') {
      setSequenceSolved(true);
      setCurrentPuzzleType('math');
      setShowHint(false);
    } else {
      setMathSolved(true);

      // Both solved — complete!
      const elapsed = timerStart ? Math.floor((Date.now() - timerStart) / 1000) : 0;
      const score = calculateScore(todayPuzzles.difficulty, elapsed, hintsUsed);

      const newActivity: DailyActivity = {
        date: today,
        solved: true,
        score,
        timeTaken: elapsed,
        difficulty: todayPuzzles.difficulty,
        hintsUsed,
        synced: false,
        completedAt: Date.now(),
      };

      await saveDailyActivity(newActivity);
      setTodayActivity(newActivity);

      const updatedActivities = [...activities.filter(a => a.date !== today), newActivity];
      setActivities(updatedActivities);

      const streak = calculateStreak(updatedActivities);
      const newAchievements = checkAchievements(streak, updatedActivities);

      for (const achievement of newAchievements) {
        await saveAchievement(achievement);
        const existing = await getAllAchievements();
        setAchievements(existing);
        setNewAchievement(achievement);
        setTimeout(() => setNewAchievement(null), 4000);
      }

      setPhase('completed');
    }
  }, [timerStart, hintsUsed, todayPuzzles.difficulty, today, activities]);

  const useHint = useCallback(() => {
    if (hintsRemaining > 0) {
      setHintsUsed(h => h + 1);
      setHintsRemaining(h => h - 1);
      setShowHint(true);
      setTimeout(() => setShowHint(false), 5000);
    }
  }, [hintsRemaining]);

  const heatmapData = useMemo(() => processHeatmapData(activities), [activities]);
  const streakInfo = useMemo(() => calculateStreak(activities), [activities]);

  const currentPuzzle: Puzzle = currentPuzzleType === 'sequence'
    ? todayPuzzles.sequence
    : todayPuzzles.math;

  return {
    today,
    phase,
    isLoading,
    todayActivity,
    activities,
    achievements,
    streakInfo,
    heatmapData,
    syncStatus,
    newAchievement,
    todayPuzzles,
    currentPuzzle,
    currentPuzzleType,
    sequenceSolved,
    mathSolved,
    timeTaken,
    hintsRemaining,
    showHint,
    startGame,
    handlePuzzleSolved,
    useHint,
  };
}
