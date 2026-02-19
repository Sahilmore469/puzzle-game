'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { MathPuzzle } from '@/lib/puzzleEngine';

interface MathPuzzleProps {
  puzzle: MathPuzzle;
  onSolved: () => void;
  showHint: boolean;
  hintsRemaining: number;
  onUseHint: () => void;
}

export default function MathPuzzleComponent({ puzzle, onSolved, showHint, hintsRemaining, onUseHint }: MathPuzzleProps) {
  const [selected, setSelected] = useState<number | null>(null);
  const [status, setStatus] = useState<'idle' | 'wrong' | 'correct'>('idle');

  const handleChoice = (choice: number) => {
    if (status === 'correct') return;
    setSelected(choice);

    if (choice === puzzle.answer) {
      setStatus('correct');
      setTimeout(onSolved, 800);
    } else {
      setStatus('wrong');
      setTimeout(() => {
        setStatus('idle');
        setSelected(null);
      }, 700);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="text-center">
        <span className="text-xs font-mono uppercase tracking-widest text-accent-secondary bg-accent-secondary/10 px-3 py-1 rounded-full">
          Puzzle 2/2 · Math Challenge
        </span>
      </div>

      <p className="text-gray-400 text-sm text-center">Select the correct answer</p>

      {/* Expression display */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-bg-card border border-bg-border rounded-2xl p-8 text-center mx-auto max-w-xs"
      >
        <p className="text-4xl font-mono text-white font-bold tracking-wide">{puzzle.expression}</p>
        <p className="text-gray-500 text-2xl mt-2">= ?</p>
      </motion.div>

      {/* Choices */}
      <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto">
        {puzzle.choices.map((choice, i) => {
          const isSelected = selected === choice;
          const isCorrect = isSelected && status === 'correct';
          const isWrong = isSelected && status === 'wrong';

          return (
            <motion.button
              key={i}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.08, type: 'spring', stiffness: 300 }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => handleChoice(choice)}
              className={`
                py-4 rounded-xl border-2 font-mono text-2xl font-bold transition-all
                ${isCorrect ? 'bg-green-500/20 border-green-500 text-green-400 shadow-[0_0_20px_rgba(34,197,94,0.4)]' : ''}
                ${isWrong ? 'bg-red-500/20 border-red-500 text-red-400' : ''}
                ${!isSelected || status === 'idle' ? 'bg-bg-card border-bg-border text-white hover:border-accent-primary hover:text-accent-primary' : ''}
              `}
            >
              {choice}
            </motion.button>
          );
        })}
      </div>

      {/* Hint section */}
      <div className="flex items-center justify-center">
        <button
          onClick={onUseHint}
          disabled={hintsRemaining === 0}
          className="text-xs text-gray-500 hover:text-yellow-400 transition-colors flex items-center gap-1 disabled:opacity-30"
        >
          💡 Use hint ({hintsRemaining} left)
        </button>
      </div>

      <AnimatePresence>
        {showHint && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-3 text-center"
          >
            <p className="text-yellow-400 text-sm">💡 {puzzle.hint}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
