'use client';

import React from 'react';
import { motion } from 'framer-motion';
import type { StreakInfo } from '@/lib/streak';

interface StreakDisplayProps {
  streak: StreakInfo;
  compact?: boolean;
}

export default function StreakDisplay({ streak, compact = false }: StreakDisplayProps) {
  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <motion.span
          animate={{ filter: streak.current > 0 ? ['hue-rotate(0deg)', 'hue-rotate(20deg)', 'hue-rotate(0deg)'] : 'none' }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-xl"
        >
          {streak.current > 0 ? '🔥' : '💤'}
        </motion.span>
        <span className="text-white font-mono font-bold">{streak.current}</span>
        <span className="text-gray-500 text-xs">day streak</span>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-4">
      <StatCard
        value={streak.current}
        label="Current Streak"
        icon="🔥"
        highlight={streak.current > 0}
      />
      <StatCard
        value={streak.longest}
        label="Best Streak"
        icon="⚡"
      />
      <StatCard
        value={streak.totalDays}
        label="Total Days"
        icon="📅"
      />
    </div>
  );
}

function StatCard({ value, label, icon, highlight = false }: {
  value: number;
  label: string;
  icon: string;
  highlight?: boolean;
}) {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      className={`
        bg-bg-card border rounded-xl p-4 text-center
        ${highlight ? 'border-orange-500/50 shadow-[0_0_15px_rgba(251,146,60,0.15)]' : 'border-bg-border'}
      `}
    >
      <div className="text-2xl mb-1">{icon}</div>
      <div className={`text-2xl font-mono font-bold ${highlight ? 'text-orange-400' : 'text-white'}`}>
        {value}
      </div>
      <div className="text-xs text-gray-500 mt-1">{label}</div>
    </motion.div>
  );
}
