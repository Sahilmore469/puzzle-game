'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import dayjs from 'dayjs';
import { getAllActivities, getDailyActivity, saveDailyActivity, saveAchievement, getAllAchievements } from '@/lib/db';
import { generateDailyPuzzle, calculateScore } from '@/lib/puzzleEngine';
import { calculateStreak, checkAchievements } from '@/lib/streak';
import { processHeatmapData } from '@/lib/heatmap';
import { setupAutoSync } from '@/lib/sync';
import type { DailyActivity } from '@/lib/db';

export type GamePhase = 'idle' | 'playing' | 'completed' | 'already_done';
export type PuzzleStep = 'sequence' | 'math' | 'hangman' | 'wordle';

export function useGameState() {
  const today = dayjs().format('YYYY-MM-DD');
  const [activities, setActivities] = useState<DailyActivity[]>([]);
  const [todayActivity, setTodayActivity] = useState<DailyActivity | null>(null);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'synced'>('idle');
  const [newAchievement, setNewAchievement] = useState<any | null>(null);

  const [phase, setPhase] = useState<GamePhase>('idle');
  const [currentStep, setCurrentStep] = useState<PuzzleStep>('sequence');
  const [sequenceSolved, setSequenceSolved] = useState(false);
  const [mathSolved, setMathSolved] = useState(false);
  const [hangmanSolved, setHangmanSolved] = useState(false);
  const [wordleSolved, setWordleSolved] = useState(false);
  const [wordleFailed, setWordleFailed] = useState(false);
  const [timerStart, setTimerStart] = useState<number | null>(null);
  const [timeTaken, setTimeTaken] = useState(0);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [hintsRemaining, setHintsRemaining] = useState(4);
  const [showHint, setShowHint] = useState(false);

  const todayPuzzles = useMemo(() => generateDailyPuzzle(today), [today]);

  useEffect(() => {
    async function load() {
      const [allActivities, todayAct, allAchievements] = await Promise.all([
        getAllActivities(), getDailyActivity(today), getAllAchievements(),
      ]);
      setActivities(allActivities);
      setTodayActivity(todayAct || null);
      setAchievements(allAchievements);
      if (todayAct?.solved) setPhase('already_done');
      setIsLoading(false);
    }
    load();
  }, [today]);

  useEffect(() => {
    const cleanup = setupAutoSync(() => {
      setSyncStatus('synced');
      setTimeout(() => setSyncStatus('idle'), 3000);
    });
    return cleanup;
  }, []);

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
    setCurrentStep('sequence');
    setSequenceSolved(false);
    setMathSolved(false);
    setHangmanSolved(false);
    setWordleSolved(false);
    setWordleFailed(false);
    setHintsUsed(0);
    setHintsRemaining(4);
    setShowHint(false);
  }, []);

  const handlePuzzleSolved = useCallback(async (step: PuzzleStep) => {
    if (step === 'sequence') { setSequenceSolved(true); setCurrentStep('math'); setShowHint(false); }
    else if (step === 'math') { setMathSolved(true); setCurrentStep('hangman'); setShowHint(false); }
    else if (step === 'hangman') { setHangmanSolved(true); setCurrentStep('wordle'); setShowHint(false); }
    else if (step === 'wordle') { setWordleSolved(true); await finishGame(true); }
  }, [timerStart, hintsUsed, todayPuzzles, today, activities]);

  const handleWordleFailed = useCallback(async () => {
    setWordleFailed(true);
    await finishGame(false);
  }, [timerStart, hintsUsed, todayPuzzles, today, activities]);

  const finishGame = async (wordleWon: boolean) => {
    const elapsed = timerStart ? Math.floor((Date.now() - timerStart) / 1000) : 0;
    const score = Math.floor(calculateScore(todayPuzzles.difficulty, elapsed, hintsUsed) * (wordleWon ? 1 : 0.7));
    const newActivity: DailyActivity = {
      date: today, solved: true, score, timeTaken: elapsed,
      difficulty: todayPuzzles.difficulty, hintsUsed, synced: false, completedAt: Date.now(),
    };
    await saveDailyActivity(newActivity);
    setTodayActivity(newActivity);
    const updatedActivities = [...activities.filter(a => a.date !== today), newActivity];
    setActivities(updatedActivities);
    const streak = calculateStreak(updatedActivities);
    const newAchievements = checkAchievements(streak, updatedActivities);
    for (const achievement of newAchievements) {
      await saveAchievement(achievement);
      setAchievements(await getAllAchievements());
      setNewAchievement(achievement);
      setTimeout(() => setNewAchievement(null), 4000);
    }
    setPhase('completed');
  };

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

  return {
    today, phase, isLoading, todayActivity, activities, achievements,
    streakInfo, heatmapData, syncStatus, newAchievement, todayPuzzles,
    currentStep, sequenceSolved, mathSolved, hangmanSolved, wordleSolved, wordleFailed,
    timeTaken, hintsRemaining, showHint,
    startGame, handlePuzzleSolved, handleWordleFailed, useHint,
  };
}