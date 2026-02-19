'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { SequencePuzzle } from '@/lib/puzzleEngine';

interface SequencePuzzleProps {
  puzzle: SequencePuzzle;
  onSolved: () => void;
  showHint: boolean;
  hintsRemaining: number;
  onUseHint: () => void;
}

export default function SequencePuzzleComponent({ puzzle, onSolved, showHint, hintsRemaining, onUseHint }: SequencePuzzleProps) {
  const [inputValue, setInputValue] = useState('');
  const [status, setStatus] = useState<'idle' | 'wrong' | 'correct'>('idle');
  const [attempts, setAttempts] = useState(0);

  const handleSubmit = () => {
    const answer = parseInt(inputValue, 10);
    if (isNaN(answer)) return;

    if (answer === puzzle.answer) {
      setStatus('correct');
      setTimeout(onSolved, 800);
    } else {
      setStatus('wrong');
      setAttempts(a => a + 1);
      setTimeout(() => setStatus('idle'), 600);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="text-center">
        <span className="text-xs font-mono uppercase tracking-widest text-accent-primary bg-accent-primary/10 px-3 py-1 rounded-full">
          Puzzle 1/2 · Number Sequence
        </span>
      </div>

      <p className="text-gray-400 text-sm text-center">Find the next number in the sequence</p>

      {/* Sequence display */}
      <div className="flex items-center justify-center gap-3 flex-wrap">
        {puzzle.sequence.map((num, i) => (
          <motion.div
            key={i}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: i * 0.1, type: 'spring', stiffness: 300 }}
            className="w-14 h-14 flex items-center justify-center bg-bg-card border border-bg-border rounded-xl font-mono text-xl text-white font-bold shadow-lg"
          >
            {num}
          </motion.div>
        ))}

        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: puzzle.sequence.length * 0.1 + 0.1 }}
          className="text-2xl text-gray-500"
        >
          →
        </motion.div>

        <motion.div
          animate={status === 'wrong' ? { x: [-5, 5, -5, 5, 0] } : {}}
          transition={{ duration: 0.3 }}
          className={`
            w-14 h-14 flex items-center justify-center rounded-xl border-2 font-mono text-xl font-bold
            ${status === 'correct' ? 'bg-green-500/20 border-green-500 text-green-400' : ''}
            ${status === 'wrong' ? 'bg-red-500/20 border-red-500 text-red-400' : ''}
            ${status === 'idle' ? 'bg-bg-card border-accent-primary/50 text-accent-primary' : ''}
          `}
        >
          {status === 'correct' ? '✓' : '?'}
        </motion.div>
      </div>

      {/* Input */}
      <div className="flex gap-3 max-w-sm mx-auto">
        <input
          type="number"
          value={inputValue}
          onChange={e => setInputValue(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSubmit()}
          placeholder="Your answer..."
          className="flex-1 bg-bg-card border border-bg-border rounded-xl px-4 py-3 text-white font-mono text-lg outline-none focus:border-accent-primary transition-colors text-center"
          autoFocus
        />
        <motion.button
          whileTap={{ scale: 0.95 }}
          whileHover={{ scale: 1.02 }}
          onClick={handleSubmit}
          className="px-6 py-3 bg-accent-primary rounded-xl text-white font-bold text-sm tracking-wide"
        >
          CHECK
        </motion.button>
      </div>

      {/* Hint section */}
      <div className="flex items-center justify-center gap-3">
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

      {attempts >= 2 && !showHint && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center text-xs text-gray-500"
        >
          Having trouble? Try using a hint!
        </motion.p>
      )}
    </motion.div>
  );
}
