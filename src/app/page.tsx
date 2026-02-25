'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import dayjs from 'dayjs';
import { useGameState } from '@/hooks/useGameState';
import Heatmap from '@/components/heatmap/Heatmap';
import StreakDisplay from '@/components/streak/StreakDisplay';
import SequencePuzzleComponent from '@/components/puzzle/SequencePuzzle';
import MathPuzzleComponent from '@/components/puzzle/MathPuzzle';
import HangmanPuzzle from '@/components/puzzle/HangmanPuzzle';
import WordlePuzzle from '@/components/puzzle/WordlePuzzle';
import CompletionScreen from '@/components/puzzle/CompletionScreen';

const difficultyColors = {
  1: 'text-green-400 bg-green-500/10 border-green-500/30',
  2: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30',
  3: 'text-red-400 bg-red-500/10 border-red-500/30',
};
const difficultyLabel = { 1: 'Easy', 2: 'Medium', 3: 'Hard' };

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

export default function Home() {
  const game = useGameState();

  if (game.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-primary">
        <motion.div animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-8 h-8 border-2 border-accent-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  const diff = game.todayPuzzles.difficulty as 1 | 2 | 3;

  return (
    <div className="min-h-screen bg-bg-primary relative overflow-x-hidden">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-accent-primary/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 py-8">

        {/* Header */}
        <motion.header initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-2xl font-display font-bold text-white tracking-tight">
              Daily<span className="text-accent-primary">Puzzle</span>
            </h1>
            <p className="text-xs text-gray-500 font-mono mt-0.5">{dayjs().format('dddd, MMMM D')}</p>
          </div>
          <div className="flex items-center gap-4">
            <AnimatePresence>
              {game.syncStatus === 'synced' && (
                <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}
                  className="text-xs text-green-400">✓ Synced</motion.div>
              )}
            </AnimatePresence>
            <StreakDisplay streak={game.streakInfo} compact />
          </div>
        </motion.header>

        {/* Achievement toast */}
        <AnimatePresence>
          {game.newAchievement && (
            <motion.div initial={{ opacity: 0, y: -20, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.9 }}
              className="fixed top-4 right-4 z-50 bg-bg-card border border-accent-primary/50 rounded-2xl p-4 shadow-2xl max-w-xs">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{game.newAchievement.icon}</span>
                <div>
                  <p className="text-white font-bold text-sm">{game.newAchievement.name}</p>
                  <p className="text-gray-400 text-xs">{game.newAchievement.description}</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

          {/* Puzzle Panel */}
          <div className="lg:col-span-3">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="bg-bg-secondary border border-bg-border rounded-2xl p-6 min-h-[500px] flex flex-col">

              <div className="flex items-center justify-between mb-6">
                <span className={`text-xs font-mono px-2 py-1 rounded-lg border ${difficultyColors[diff]}`}>
                  {difficultyLabel[diff]}
                </span>
                {game.phase === 'playing' && (
                  <div className="flex items-center gap-3">
                    <div className="text-sm font-mono text-gray-400">{formatTime(game.timeTaken)}</div>
                    {/* 4 progress dots */}
                    <div className="flex gap-1.5">
                      {['sequence', 'math', 'hangman', 'wordle'].map((step) => (
                        <div key={step} className={`w-2 h-2 rounded-full transition-colors ${
                          (step === 'sequence' && game.sequenceSolved) ||
                          (step === 'math' && game.mathSolved) ||
                          (step === 'hangman' && game.hangmanSolved) ||
                          (step === 'wordle' && game.wordleSolved)
                            ? 'bg-green-400'
                            : game.currentStep === step ? 'bg-accent-primary' : 'bg-bg-border'
                        }`} />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex-1 flex flex-col justify-center">
                <AnimatePresence mode="wait">

                  {/* IDLE */}
                  {game.phase === 'idle' && (
                    <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="text-center space-y-6">
                      <div className="text-6xl">🧩</div>
                      <div>
                        <h2 className="text-2xl font-display font-bold text-white">Today's Challenge</h2>
                        <p className="text-gray-500 text-sm mt-2">4 puzzles · Sequence → Math → Hangman → Wordle</p>
                      </div>
                      <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                        onClick={game.startGame}
                        className="px-10 py-4 bg-accent-primary rounded-xl text-white font-bold text-lg shadow-[0_0_30px_rgba(108,99,255,0.4)]">
                        Start Puzzle
                      </motion.button>
                    </motion.div>
                  )}

                  {/* SEQUENCE */}
                  {game.phase === 'playing' && game.currentStep === 'sequence' && (
                    <motion.div key="sequence" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}>
                      <SequencePuzzleComponent puzzle={game.todayPuzzles.sequence as any}
                        onSolved={() => game.handlePuzzleSolved('sequence')}
                        showHint={game.showHint} hintsRemaining={game.hintsRemaining} onUseHint={game.useHint} />
                    </motion.div>
                  )}

                  {/* MATH */}
                  {game.phase === 'playing' && game.currentStep === 'math' && (
                    <motion.div key="math" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}>
                      <MathPuzzleComponent puzzle={game.todayPuzzles.math as any}
                        onSolved={() => game.handlePuzzleSolved('math')}
                        showHint={game.showHint} hintsRemaining={game.hintsRemaining} onUseHint={game.useHint} />
                    </motion.div>
                  )}

                  {/* HANGMAN */}
                  {game.phase === 'playing' && game.currentStep === 'hangman' && (
                    <motion.div key="hangman" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}>
                      <HangmanPuzzle difficulty={game.todayPuzzles.difficulty} date={game.today}
                        onSolved={() => game.handlePuzzleSolved('hangman')}
                        onFailed={() => game.handlePuzzleSolved('hangman')}
                        showHint={game.showHint} hintsRemaining={game.hintsRemaining} onUseHint={game.useHint} />
                    </motion.div>
                  )}

                  {/* WORDLE */}
                  {game.phase === 'playing' && game.currentStep === 'wordle' && (
                    <motion.div key="wordle" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}>
                      <WordlePuzzle
                        difficulty={game.todayPuzzles.difficulty}
                        date={game.today}
                        onSolved={() => game.handlePuzzleSolved('wordle')}
                        onFailed={game.handleWordleFailed}
                        showHint={game.showHint}
                        hintsRemaining={game.hintsRemaining}
                        onUseHint={game.useHint}
                      />
                    </motion.div>
                  )}

                  {/* COMPLETED */}
                  {(game.phase === 'completed' || game.phase === 'already_done') && game.todayActivity && (
                    <motion.div key="completed" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                      <CompletionScreen activity={game.todayActivity} streak={game.streakInfo} />
                    </motion.div>
                  )}

                </AnimatePresence>
              </div>
            </motion.div>
          </div>

          {/* Stats Panel */}
          <div className="lg:col-span-2 space-y-5">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="bg-bg-secondary border border-bg-border rounded-2xl p-5">
              <h3 className="text-sm font-mono text-gray-500 uppercase tracking-widest mb-4">Streak</h3>
              <StreakDisplay streak={game.streakInfo} />
            </motion.div>

            {/* Today's 4 puzzles */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
              className="bg-bg-secondary border border-bg-border rounded-2xl p-5">
              <h3 className="text-sm font-mono text-gray-500 uppercase tracking-widest mb-3">Today's Puzzles</h3>
              <div className="space-y-2">
                {[
                  { icon: '🔢', label: 'Number Sequence', done: game.sequenceSolved },
                  { icon: '➗', label: 'Math Challenge',  done: game.mathSolved },
                  { icon: '🪢', label: 'Hangman',         done: game.hangmanSolved },
                  { icon: '🟩', label: 'Wordle',          done: game.wordleSolved },
                ].map(({ icon, label, done }) => (
                  <div key={label} className="flex items-center gap-2">
                    <span className="text-lg">{icon}</span>
                    <span className={`text-sm flex-1 ${done ? 'text-green-400 line-through' : 'text-gray-300'}`}>{label}</span>
                    {done && <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-green-400 text-xs">✓</motion.span>}
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Achievements */}
            {game.achievements.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                className="bg-bg-secondary border border-bg-border rounded-2xl p-5">
                <h3 className="text-sm font-mono text-gray-500 uppercase tracking-widest mb-4">Achievements</h3>
                <div className="flex flex-wrap gap-2">
                  {game.achievements.map((a: any) => (
                    <motion.div key={a.id} whileHover={{ scale: 1.1 }} title={`${a.name}: ${a.description}`}
                      className="w-10 h-10 bg-bg-card border border-bg-border rounded-xl flex items-center justify-center text-xl cursor-default">
                      {a.icon}
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* Heatmap */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="mt-6 bg-bg-secondary border border-bg-border rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-sm font-mono text-gray-500 uppercase tracking-widest">Activity</h3>
              <p className="text-white font-display font-semibold mt-0.5">
                {game.streakInfo.totalDays} days played this year
              </p>
            </div>
            <div className="text-2xl">
              {game.streakInfo.totalDays >= 30 ? '🌟' : game.streakInfo.totalDays >= 7 ? '⭐' : '🌱'}
            </div>
          </div>
          <Heatmap weeks={game.heatmapData.weeks} months={game.heatmapData.months} todayDate={game.today} />
        </motion.div>

      </div>
    </div>
  );
}