'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const WORDS = {
  1: ['APPLE', 'BRAIN', 'CHAIR', 'DANCE', 'EARTH', 'FLAME', 'GRACE', 'HAPPY', 'LIGHT', 'MOUSE', 'NIGHT', 'OCEAN', 'PIANO', 'RIVER', 'SMILE', 'TABLE', 'WATER', 'YOUNG', 'BREAD', 'CLOUD', 'DREAM', 'FLOOR', 'GIANT', 'HEART', 'INPUT'],
  2: ['BLOOM', 'CHEST', 'DRIVE', 'FRESH', 'GLOBE', 'LUNAR', 'MAGIC', 'NERVE', 'OLIVE', 'PIXEL', 'QUIET', 'RELAY', 'SPINE', 'TREND', 'VIVID', 'WINDY', 'FROST', 'BLAND', 'CRISP', 'DELTA', 'EMBER', 'FLOCK', 'GROAN', 'HOVER', 'IVORY'],
  3: ['CRYPT', 'DWARF', 'EPOCH', 'GLYPH', 'JAZZY', 'LYMPH', 'MYRRH', 'NYMPH', 'PROXY', 'RUGBY', 'SYNTH', 'TRYST', 'VYING', 'WALTZ', 'ZESTY', 'BLITZ', 'EXPEL', 'APHID', 'BRISK', 'CHURN', 'DRAWL', 'EVOKE', 'FJORD', 'GLITZ', 'KNACK'],
};

const KEYBOARD_ROWS = [
  ['Q','W','E','R','T','Y','U','I','O','P'],
  ['A','S','D','F','G','H','J','K','L'],
  ['ENTER','Z','X','C','V','B','N','M','⌫'],
];

const MAX_GUESSES = 6;
const WORD_LENGTH = 5;
type TileState = 'correct' | 'present' | 'absent' | 'empty' | 'active';

function getWordForDate(date: string, difficulty: number): string {
  const list = WORDS[difficulty as 1|2|3] || WORDS[1];
  let hash = 0;
  const str = date + 'bluestock_wordle_2026';
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash = hash & hash;
  }
  return list[Math.abs(hash) % list.length];
}

function evaluateGuess(guess: string, target: string): TileState[] {
  const result: TileState[] = Array(WORD_LENGTH).fill('absent');
  const targetArr = target.split('');
  const guessArr = guess.split('');
  const used = Array(WORD_LENGTH).fill(false);

  for (let i = 0; i < WORD_LENGTH; i++) {
    if (guessArr[i] === targetArr[i]) {
      result[i] = 'correct';
      used[i] = true;
    }
  }
  for (let i = 0; i < WORD_LENGTH; i++) {
    if (result[i] === 'correct') continue;
    for (let j = 0; j < WORD_LENGTH; j++) {
      if (!used[j] && guessArr[i] === targetArr[j]) {
        result[i] = 'present';
        used[j] = true;
        break;
      }
    }
  }
  return result;
}

const TILE_STYLES: Record<TileState, string> = {
  correct: 'bg-green-500 border-green-500 text-white',
  present: 'bg-yellow-500 border-yellow-500 text-white',
  absent:  'bg-gray-600 border-gray-600 text-white',
  empty:   'bg-transparent border-gray-600 text-white',
  active:  'bg-transparent border-gray-300 text-white',
};

interface WordlePuzzleProps {
  difficulty: number;
  date: string;
  onSolved: () => void;
  onFailed: () => void;
  showHint: boolean;
  hintsRemaining: number;
  onUseHint: () => void;
}

export default function WordlePuzzle({ difficulty, date, onSolved, onFailed, showHint, hintsRemaining, onUseHint }: WordlePuzzleProps) {
  const word = getWordForDate(date, difficulty);
  const [guesses, setGuesses] = useState<string[]>([]);
  const [evaluations, setEvaluations] = useState<TileState[][]>([]);
  const [currentGuess, setCurrentGuess] = useState('');
  const [status, setStatus] = useState<'playing' | 'won' | 'lost'>('playing');
  const [shakeRow, setShakeRow] = useState<number | null>(null);
  const [revealRow, setRevealRow] = useState<number | null>(null);
  const [message, setMessage] = useState('');

  const letterStates: Record<string, TileState> = {};
  evaluations.forEach((evalRow, i) => {
    evalRow.forEach((state, j) => {
      const letter = guesses[i][j];
      const current = letterStates[letter];
      if (current === 'correct') return;
      if (state === 'correct' || !current) letterStates[letter] = state;
      else if (state === 'present' && current === 'absent') letterStates[letter] = 'present';
    });
  });

  const showMessage = (msg: string) => {
    setMessage(msg);
    setTimeout(() => setMessage(''), 2000);
  };

  const submitGuess = useCallback(() => {
    if (currentGuess.length !== WORD_LENGTH) {
      setShakeRow(guesses.length);
      setTimeout(() => setShakeRow(null), 500);
      showMessage('Not enough letters!');
      return;
    }
    const newEval = evaluateGuess(currentGuess, word);
    const newGuesses = [...guesses, currentGuess];
    const newEvals = [...evaluations, newEval];
    setGuesses(newGuesses);
    setEvaluations(newEvals);
    setRevealRow(newGuesses.length - 1);
    setCurrentGuess('');

    setTimeout(() => {
      setRevealRow(null);
      if (currentGuess === word) {
        setStatus('won');
        const msgs = ['Genius! 🧠', 'Magnificent! 🌟', 'Impressive! 💪', 'Splendid! ✨', 'Great! 👏', 'Phew! 😅'];
        showMessage(msgs[Math.min(newGuesses.length - 1, msgs.length - 1)]);
        setTimeout(onSolved, 1500);
      } else if (newGuesses.length >= MAX_GUESSES) {
        setStatus('lost');
        showMessage(`The word was ${word}`);
        setTimeout(onFailed, 2000);
      }
    }, WORD_LENGTH * 350 + 200);
  }, [currentGuess, guesses, evaluations, word, onSolved, onFailed]);

  const handleKey = useCallback((key: string) => {
    if (status !== 'playing') return;
    if (key === 'ENTER') { submitGuess(); return; }
    if (key === '⌫' || key === 'BACKSPACE') { setCurrentGuess(g => g.slice(0, -1)); return; }
    if (/^[A-Z]$/.test(key) && currentGuess.length < WORD_LENGTH) setCurrentGuess(g => g + key);
  }, [status, currentGuess, submitGuess]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const key = e.key.toUpperCase();
      if (key === 'ENTER' || key === 'BACKSPACE' || /^[A-Z]$/.test(key)) handleKey(key);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handleKey]);

  useEffect(() => {
    if (!showHint) return;
    const unrevealedPositions = word.split('').map((l, i) => i)
      .filter(i => !evaluations.some((ev, gi) => guesses[gi][i] === word[i] && ev[i] === 'correct'));
    if (unrevealedPositions.length > 0) {
      showMessage(`Hint: Position ${unrevealedPositions[0] + 1} is "${word[unrevealedPositions[0]]}"`);
    }
  }, [showHint]);

  const diffLabel = ['', 'Easy', 'Medium', 'Hard'][difficulty];

  const rows = Array.from({ length: MAX_GUESSES }, (_, rowIdx) => {
    const isSubmitted = rowIdx < guesses.length;
    const isCurrent = rowIdx === guesses.length;
    const tiles = Array.from({ length: WORD_LENGTH }, (_, colIdx) => {
      let letter = '';
      let state: TileState = 'empty';
      if (isSubmitted) { letter = guesses[rowIdx][colIdx]; state = evaluations[rowIdx][colIdx]; }
      else if (isCurrent) { letter = currentGuess[colIdx] || ''; state = letter ? 'active' : 'empty'; }
      const isRevealing = revealRow === rowIdx;

      return (
        <motion.div key={colIdx}
          animate={shakeRow === rowIdx ? { x: [-6, 6, -6, 6, 0] } : letter && isCurrent ? { scale: [1, 1.12, 1] } : {}}
          transition={{ duration: 0.3 }}
          className="relative w-12 h-12 sm:w-14 sm:h-14">
          <motion.div
            className={`w-full h-full flex items-center justify-center text-xl sm:text-2xl font-bold font-mono border-2 rounded-lg ${isRevealing ? '' : TILE_STYLES[state]}`}
            animate={isRevealing ? {
              rotateX: [0, -90, 0],
              backgroundColor: ['#1e1e2e', '#1e1e2e',
                state === 'correct' ? '#22c55e' : state === 'present' ? '#eab308' : '#4b5563'],
            } : {}}
            transition={isRevealing ? { duration: 0.5, delay: colIdx * 0.15, ease: 'easeInOut' } : {}}>
            {letter}
          </motion.div>
        </motion.div>
      );
    });
    return <div key={rowIdx} className="flex gap-1.5 justify-center">{tiles}</div>;
  });

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      <div className="text-center">
        <span className="text-xs font-mono uppercase tracking-widest text-green-400 bg-green-500/10 px-3 py-1 rounded-full">
          Puzzle 3/3 · Wordle · {diffLabel}
        </span>
        <p className="text-gray-500 text-xs mt-2">Guess the 5-letter word in 6 tries</p>
      </div>

      <AnimatePresence>
        {message && (
          <motion.div initial={{ opacity: 0, y: -10, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.9 }}
            className="text-center bg-white text-gray-900 font-bold text-sm py-2 px-4 rounded-xl mx-auto w-fit">
            {message}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col gap-1.5 items-center">{rows}</div>

      <div className="space-y-1.5 pt-2">
        {KEYBOARD_ROWS.map((row, ri) => (
          <div key={ri} className="flex justify-center gap-1">
            {row.map(key => {
              const state = letterStates[key];
              return (
                <motion.button key={key} whileTap={{ scale: 0.9 }} onClick={() => handleKey(key)}
                  disabled={status !== 'playing'}
                  className={`h-10 rounded-lg font-mono font-bold text-xs transition-all
                    ${key.length > 1 ? 'px-2 min-w-[44px]' : 'w-9'}
                    ${state === 'correct' ? 'bg-green-500 text-white' : ''}
                    ${state === 'present' ? 'bg-yellow-500 text-white' : ''}
                    ${state === 'absent' ? 'bg-gray-700 text-gray-500' : ''}
                    ${!state ? 'bg-bg-card border border-bg-border text-white hover:border-green-400' : ''}
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
          💡 Get a hint ({hintsRemaining} left)
        </button>
      </div>

      <div className="flex justify-center gap-4 text-xs text-gray-500">
        <span className="flex items-center gap-1"><span className="w-3 h-3 bg-green-500 rounded inline-block" /> Correct</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 bg-yellow-500 rounded inline-block" /> Wrong spot</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 bg-gray-600 rounded inline-block" /> Not in word</span>
      </div>
    </motion.div>
  );
}