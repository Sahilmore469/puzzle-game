'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const WORDS = {
  1: ['APPLE', 'BRAIN', 'CHAIR', 'DANCE', 'EARTH', 'FLAME', 'GRACE', 'HAPPY', 'LIGHT', 'MOUSE', 'NIGHT', 'OCEAN', 'PIANO', 'RIVER', 'SMILE', 'TABLE', 'WATER', 'YOUNG'],
  2: ['BLOOM', 'CHEST', 'DRIVE', 'FRESH', 'GLOBE', 'HEART', 'LUNAR', 'MAGIC', 'NERVE', 'OLIVE', 'PIXEL', 'QUIET', 'RELAY', 'SPINE', 'TREND', 'VIVID', 'WINDY', 'FROST'],
  3: ['CRYPT', 'DWARF', 'EPOCH', 'GLYPH', 'HUMID', 'JAZZY', 'LYMPH', 'MYRRH', 'NYMPH', 'PROXY', 'RUGBY', 'SYNTH', 'TRYST', 'VYING', 'WALTZ', 'ZESTY', 'BLITZ', 'EXPEL'],
};

const KEYBOARD_ROWS = [
  ['Q','W','E','R','T','Y','U','I','O','P'],
  ['A','S','D','F','G','H','J','K','L'],
  ['Z','X','C','V','B','N','M'],
];

const MAX_WRONG = 6;

function getWordForDate(date: string, difficulty: number): string {
  const list = WORDS[difficulty as 1|2|3] || WORDS[1];
  let hash = 0;
  const str = date + 'bluestock_hangman_2026';
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash = hash & hash;
  }
  return list[Math.abs(hash) % list.length];
}

interface HangmanPuzzleProps {
  difficulty: number;
  date: string;
  onSolved: () => void;
  onFailed: () => void;
  showHint: boolean;
  hintsRemaining: number;
  onUseHint: () => void;
}

function HangmanSVG({ wrongCount, falling }: { wrongCount: number; falling: boolean }) {
  const parts = [
    <motion.circle key="head" cx="100" cy="45" r="15" stroke="#e2e8f0" strokeWidth="3" fill="none"
      initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 300 }} />,
    <motion.line key="body" x1="100" y1="60" x2="100" y2="110" stroke="#e2e8f0" strokeWidth="3"
      initial={{ scaleY: 0 }} animate={{ scaleY: 1 }}
      transition={{ type: 'spring', stiffness: 200 }} />,
    <motion.line key="larm" x1="100" y1="75" x2="75" y2="95" stroke="#e2e8f0" strokeWidth="3"
      initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}
      transition={{ type: 'spring', stiffness: 200 }} />,
    <motion.line key="rarm" x1="100" y1="75" x2="125" y2="95" stroke="#e2e8f0" strokeWidth="3"
      initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
      transition={{ type: 'spring', stiffness: 200 }} />,
    <motion.line key="lleg" x1="100" y1="110" x2="75" y2="140" stroke="#e2e8f0" strokeWidth="3"
      initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 200 }} />,
    <motion.line key="rleg" x1="100" y1="110" x2="125" y2="140" stroke="#e2e8f0" strokeWidth="3"
      initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 200 }} />,
  ];

  const ropeSegments = Array.from({ length: MAX_WRONG }, (_, i) => {
    const isCut = i < wrongCount;
    const y1 = 5 + i * 4;
    const y2 = y1 + 4;
    return (
      <motion.line key={`rope-${i}`} x1="100" y1={y1} x2="100" y2={y2}
        stroke={isCut ? '#ef4444' : '#f59e0b'}
        strokeWidth={isCut ? 2 : 3}
        strokeDasharray={isCut ? '3,2' : 'none'}
        animate={isCut ? { opacity: [1, 0.3, 1] } : { opacity: 1 }}
        transition={{ duration: 0.5 }} />
    );
  });

  return (
    <svg viewBox="0 0 200 200" className="w-full h-full">
      <line x1="20" y1="185" x2="180" y2="185" stroke="#6366f1" strokeWidth="4" strokeLinecap="round" />
      <line x1="50" y1="185" x2="50" y2="10" stroke="#6366f1" strokeWidth="4" strokeLinecap="round" />
      <line x1="50" y1="10" x2="100" y2="10" stroke="#6366f1" strokeWidth="4" strokeLinecap="round" />
      <line x1="50" y1="35" x2="75" y2="10" stroke="#6366f1" strokeWidth="3" strokeLinecap="round" />
      {ropeSegments}
      <motion.g
        animate={falling ? { y: [0, 5, 60], rotate: [0, -10, 45], opacity: [1, 1, 0] } : { y: 0, rotate: 0, opacity: 1 }}
        transition={falling ? { duration: 1, ease: 'easeIn' } : {}}
        style={{ originX: '100px', originY: '30px' }}
      >
        {parts.slice(0, wrongCount)}
      </motion.g>
      {wrongCount >= MAX_WRONG && !falling && (
        <motion.text x="93" y="50" fontSize="10" fill="#ef4444"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}>✕✕</motion.text>
      )}
    </svg>
  );
}

export default function HangmanPuzzle({ difficulty, date, onSolved, onFailed, showHint, hintsRemaining, onUseHint }: HangmanPuzzleProps) {
  const word = getWordForDate(date, difficulty);
  const [guessed, setGuessed] = useState<Set<string>>(new Set());
  const [falling, setFalling] = useState(false);
  const [status, setStatus] = useState<'playing' | 'won' | 'lost'>('playing');

  const wrongGuesses = Array.from(guessed).filter(l => !word.includes(l));  const wrongCount = wrongGuesses.length;
  const isWordComplete = word.split('').every(l => guessed.has(l));

  useEffect(() => {
    if (isWordComplete && status === 'playing') {
      setStatus('won');
      setTimeout(onSolved, 800);
    } else if (wrongCount >= MAX_WRONG && status === 'playing') {
      setStatus('lost');
      setFalling(true);
      setTimeout(() => { onFailed(); }, 1500);
    }
  }, [isWordComplete, wrongCount, status, onSolved, onFailed]);

  const handleGuess = useCallback((letter: string) => {
    if (status !== 'playing' || guessed.has(letter)) return;
    setGuessed(prev => new Set([...prev, letter]));
  }, [status, guessed]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const key = e.key.toUpperCase();
      if (/^[A-Z]$/.test(key)) handleGuess(key);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handleGuess]);

  useEffect(() => {
    if (showHint) {
      const unguessed = word.split('').filter(l => !guessed.has(l));
      if (unguessed.length > 0) {
        const reveal = unguessed[Math.floor(Math.random() * unguessed.length)];
        setGuessed(prev => new Set([...prev, reveal]));
      }
    }
  }, [showHint]);

  const diffLabel = ['', 'Easy', 'Medium', 'Hard'][difficulty];

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      <div className="text-center">
        <span className="text-xs font-mono uppercase tracking-widest text-purple-400 bg-purple-500/10 px-3 py-1 rounded-full">
          Puzzle 3/3 · Hangman · {diffLabel}
        </span>
      </div>

      <div className="flex gap-4 items-start">
        <div className="w-40 h-40 flex-shrink-0">
          <HangmanSVG wrongCount={wrongCount} falling={falling} />
        </div>

        <div className="flex-1 space-y-4">
          <div className="flex items-center gap-1">
            {Array.from({ length: MAX_WRONG }, (_, i) => (
              <motion.div key={i} animate={i < wrongCount ? { scale: [1, 1.3, 1] } : {}}
                className={`w-6 h-1.5 rounded-full ${i < wrongCount ? 'bg-red-500' : 'bg-yellow-500/60'}`} />
            ))}
            <span className="text-xs text-gray-500 ml-2 font-mono">{MAX_WRONG - wrongCount} cuts left</span>
          </div>

          <div className="flex gap-2 flex-wrap">
            {word.split('').map((letter, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }} className="flex flex-col items-center">
                <motion.span animate={guessed.has(letter) ? { scale: [1, 1.3, 1] } : {}}
                  className={`text-2xl font-mono font-bold w-8 text-center ${guessed.has(letter) ? 'text-white' : 'text-transparent'} ${status === 'lost' ? 'text-red-400' : ''}`}>
                  {guessed.has(letter) || status === 'lost' ? letter : '_'}
                </motion.span>
                <div className="w-8 h-0.5 bg-gray-500 mt-1" />
              </motion.div>
            ))}
          </div>

          {wrongGuesses.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {wrongGuesses.map(l => (
                <span key={l} className="text-xs font-mono text-red-400 bg-red-500/10 px-1.5 py-0.5 rounded">{l}</span>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="space-y-1.5">
        {KEYBOARD_ROWS.map((row, ri) => (
          <div key={ri} className="flex justify-center gap-1">
            {row.map(key => {
              const isGuessed = guessed.has(key);
              const isCorrect = isGuessed && word.includes(key);
              const isWrong = isGuessed && !word.includes(key);
              return (
                <motion.button key={key} whileTap={{ scale: 0.9 }} whileHover={{ scale: 1.05 }}
                  onClick={() => handleGuess(key)}
                  disabled={isGuessed || status !== 'playing'}
                  className={`h-10 rounded-lg font-mono font-bold text-sm transition-all w-9
                    ${isCorrect ? 'bg-green-500 text-white' : ''}
                    ${isWrong ? 'bg-gray-700 text-gray-500' : ''}
                    ${!isGuessed ? 'bg-bg-card border border-bg-border text-white hover:border-purple-400 hover:text-purple-400' : ''}
                    disabled:cursor-not-allowed`}>
                  {key}
                </motion.button>
              );
            })}
          </div>
        ))}
      </div>

      <div className="flex justify-center">
        <button onClick={onUseHint} disabled={hintsRemaining === 0 || status !== 'playing'}
          className="text-xs text-gray-500 hover:text-yellow-400 transition-colors disabled:opacity-30">
          💡 Reveal a letter ({hintsRemaining} hints left)
        </button>
      </div>

      <AnimatePresence>
        {status === 'won' && (
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
            className="text-center bg-green-500/10 border border-green-500/30 rounded-xl p-3">
            <p className="text-green-400 font-bold">🎉 You saved him! The word was <span className="font-mono">{word}</span></p>
          </motion.div>
        )}
        {status === 'lost' && (
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
            className="text-center bg-red-500/10 border border-red-500/30 rounded-xl p-3">
            <p className="text-red-400 font-bold">💀 He fell! The word was <span className="font-mono">{word}</span></p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}