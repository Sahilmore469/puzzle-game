'use client';

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import dayjs from 'dayjs';
import type { HeatmapWeek } from '@/lib/heatmap';

interface HeatmapProps {
  weeks: HeatmapWeek[];
  months: { name: string; weekIndex: number }[];
  todayDate: string;
}

const intensityColors = [
  'bg-bg-border border border-bg-border',
  'bg-green-900 border border-green-800',
  'bg-green-700 border border-green-600',
  'bg-green-500 border border-green-400',
  'bg-green-400 border border-green-300',
];

const intensityGlow = [
  '',
  '',
  '',
  'shadow-[0_0_6px_rgba(34,197,94,0.5)]',
  'shadow-[0_0_10px_rgba(74,222,128,0.8)]',
];

const dayLabels = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export default function Heatmap({ weeks, months, todayDate }: HeatmapProps) {
  const [tooltip, setTooltip] = useState<{
    date: string;
    intensity: number;
    score: number;
    timeTaken: number;
    difficulty: number;
    x: number;
    y: number;
  } | null>(null);

  const difficultyLabel = (d: number) => ['', 'Easy', 'Medium', 'Hard'][d] || '';

  return (
    <div className="w-full">
      <div className="overflow-x-auto pb-2">
        <div className="inline-block min-w-full">
          {/* Month labels */}
          <div className="flex mb-1 ml-8">
            {months.map((month, i) => (
              <div
                key={i}
                className="text-xs text-gray-500 font-mono"
                style={{ 
                  marginLeft: i === 0 ? `${month.weekIndex * 14}px` : `${(months[i].weekIndex - months[i-1].weekIndex - 1) * 14}px`,
                  minWidth: '28px'
                }}
              >
                {month.name}
              </div>
            ))}
          </div>

          <div className="flex gap-0.5">
            {/* Day labels */}
            <div className="flex flex-col gap-0.5 mr-1">
              {dayLabels.map((d, i) => (
                <div key={i} className="w-3 h-3 flex items-center justify-center text-[8px] text-gray-600 font-mono">
                  {i % 2 === 1 ? d : ''}
                </div>
              ))}
            </div>

            {/* Grid */}
            {weeks.map((week, weekIdx) => (
              <div key={weekIdx} className="flex flex-col gap-0.5">
                {week.days.map((day, dayIdx) => {
                  if (!day) {
                    return <div key={dayIdx} className="w-3 h-3" />;
                  }

                  const isToday = day.date === todayDate;

                  return (
                    <motion.div
                      key={dayIdx}
                      initial={day.activity ? { scale: 0 } : false}
                      animate={{ scale: 1 }}
                      transition={{ delay: weekIdx * 0.005, type: 'spring', stiffness: 300 }}
                      className={`
                        w-3 h-3 rounded-sm cursor-pointer transition-all duration-200
                        ${intensityColors[day.intensity]}
                        ${intensityGlow[day.intensity]}
                        ${day.isFuture ? 'opacity-20' : ''}
                        ${isToday ? 'ring-1 ring-accent-primary ring-offset-1 ring-offset-bg-primary' : ''}
                        hover:ring-1 hover:ring-white/30 hover:scale-125
                      `}
                      onMouseEnter={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        setTooltip({
                          date: day.date,
                          intensity: day.intensity,
                          score: day.activity?.score || 0,
                          timeTaken: day.activity?.timeTaken || 0,
                          difficulty: day.activity?.difficulty || 0,
                          x: rect.left,
                          y: rect.top,
                        });
                      }}
                      onMouseLeave={() => setTooltip(null)}
                    />
                  );
                })}
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="flex items-center gap-2 mt-3 ml-8">
            <span className="text-xs text-gray-500 font-mono">Less</span>
            {[0, 1, 2, 3, 4].map(i => (
              <div key={i} className={`w-3 h-3 rounded-sm ${intensityColors[i]}`} />
            ))}
            <span className="text-xs text-gray-500 font-mono">More</span>
          </div>
        </div>
      </div>

      {/* Tooltip */}
      {tooltip && (
        <div
          className="fixed z-50 bg-bg-card border border-bg-border rounded-lg p-3 text-xs pointer-events-none shadow-xl"
          style={{ left: tooltip.x + 20, top: tooltip.y - 10 }}
        >
          <p className="text-gray-300 font-mono mb-1">{dayjs(tooltip.date).format('MMM D, YYYY')}</p>
          {tooltip.intensity === 0 ? (
            <p className="text-gray-500">No activity</p>
          ) : (
            <>
              <p className="text-green-400 font-semibold">Score: {tooltip.score}</p>
              <p className="text-gray-400">Time: {Math.floor(tooltip.timeTaken / 60)}m {tooltip.timeTaken % 60}s</p>
              <p className="text-gray-400">Difficulty: {difficultyLabel(tooltip.difficulty)}</p>
            </>
          )}
        </div>
      )}
    </div>
  );
}
