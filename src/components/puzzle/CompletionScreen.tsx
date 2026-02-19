'use client';

import React from 'react';
import { motion } from 'framer-motion';
import type { DailyActivity } from '@/lib/db';
import type { StreakInfo } from '@/lib/streak';

interface CompletionScreenProps {
  activity: DailyActivity;
  streak: StreakInfo;
}

const diffLabel = ['', 'Easy', 'Medium', 'Hard'];

export default function CompletionScreen({ activity, streak }: CompletionScreenProps) {
  const maxScore = activity.difficulty * 100 + 300;
  const pct = Math.round((activity.score / maxScore) * 100);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 200 }}
      className="text-center space-y-6"
    >
      {/* Trophy */}
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 300, delay: 0.1 }}
        className="text-7xl"
      >
        {pct >= 90 ? '🏆' : pct >= 60 ? '🥈' : '🥉'}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h2 className="text-3xl font-display font-bold text-white">
          {pct >= 90 ? 'Perfect!' : pct >= 60 ? 'Well Done!' : 'Completed!'}
        </h2>
        <p className="text-gray-400 mt-1">Today's puzzle solved</p>
      </motion.div>

      {/* Score circle */}
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4, type: 'spring' }}
        className="mx-auto w-32 h-32 rounded-full border-4 border-accent-glow flex items-center justify-center shadow-[0_0_30px_rgba(74,222,128,0.4)]"
      >
        <div>
          <div className="text-3xl font-mono font-bold text-accent-glow">{activity.score}</div>
          <div className="text-xs text-gray-500">points</div>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="grid grid-cols-3 gap-3"
      >
        {[
          { label: 'Time', value: `${Math.floor(activity.timeTaken / 60)}:${String(activity.timeTaken % 60).padStart(2, '0')}` },
          { label: 'Difficulty', value: diffLabel[activity.difficulty] },
          { label: 'Hints used', value: activity.hintsUsed },
        ].map(({ label, value }) => (
          <div key={label} className="bg-bg-card border border-bg-border rounded-xl p-3">
            <div className="text-white font-mono font-bold">{value}</div>
            <div className="text-xs text-gray-500 mt-0.5">{label}</div>
          </div>
        ))}
      </motion.div>

      {/* Streak */}
      {streak.current > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-4"
        >
          <div className="flex items-center justify-center gap-2">
            <motion.span
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="text-2xl"
            >
              🔥
            </motion.span>
            <span className="text-orange-400 font-mono font-bold text-xl">{streak.current}</span>
            <span className="text-orange-300 text-sm">day streak!</span>
          </div>
        </motion.div>
      )}

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="text-gray-500 text-sm"
      >
        Come back tomorrow for a new puzzle 📅
      </motion.p>
    </motion.div>
  );
}
