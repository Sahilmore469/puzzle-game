// lib/puzzleEngine.ts - Deterministic puzzle generation

const SECRET_KEY = 'bluestock_puzzle_2026';

// Simple seeded PRNG (Mulberry32)
function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Generate numeric seed from date string
function dateToSeed(date: string): number {
  let hash = 0;
  const str = date + SECRET_KEY;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

export type PuzzleType = 'sequence' | 'math';

export interface SequencePuzzle {
  type: 'sequence';
  sequence: number[];
  answer: number;
  hint: string;
  difficulty: number;
}

export interface MathPuzzle {
  type: 'math';
  expression: string;
  choices: number[];
  answer: number;
  hint: string;
  difficulty: number;
}

export type Puzzle = SequencePuzzle | MathPuzzle;

// Generate a number sequence puzzle
function generateSequencePuzzle(rng: () => number, difficulty: number): SequencePuzzle {
  const patterns = [
    // Easy: arithmetic
    () => {
      const start = Math.floor(rng() * 10) + 1;
      const diff = Math.floor(rng() * 5) + 1;
      const seq = Array.from({ length: 5 }, (_, i) => start + i * diff);
      return { sequence: seq, answer: start + 5 * diff, hint: `Each number increases by ${diff}` };
    },
    // Medium: geometric
    () => {
      const start = Math.floor(rng() * 3) + 2;
      const ratio = Math.floor(rng() * 2) + 2;
      const seq = Array.from({ length: 4 }, (_, i) => start * Math.pow(ratio, i));
      return { sequence: seq, answer: start * Math.pow(ratio, 4), hint: `Each number is multiplied by ${ratio}` };
    },
    // Hard: fibonacci-like
    () => {
      const a = Math.floor(rng() * 5) + 1;
      const b = Math.floor(rng() * 5) + 2;
      const seq = [a, b];
      for (let i = 2; i < 5; i++) seq.push(seq[i - 1] + seq[i - 2]);
      return { sequence: seq, answer: seq[3] + seq[4], hint: 'Each number is the sum of the previous two' };
    },
  ];

  const patternIdx = difficulty === 1 ? 0 : difficulty === 2 ? 1 : 2;
  const result = patterns[patternIdx]();

  return {
    type: 'sequence',
    ...result,
    difficulty,
  };
}

// Generate a math puzzle
function generateMathPuzzle(rng: () => number, difficulty: number): MathPuzzle {
  let expression = '';
  let answer = 0;
  let hint = '';

  if (difficulty === 1) {
    const a = Math.floor(rng() * 20) + 5;
    const b = Math.floor(rng() * 20) + 5;
    const ops = ['+', '-', '*'];
    const op = ops[Math.floor(rng() * 2)];
    answer = op === '+' ? a + b : op === '-' ? a - b : a * b;
    expression = `${a} ${op} ${b}`;
    hint = `Compute ${a} ${op} ${b}`;
  } else if (difficulty === 2) {
    const a = Math.floor(rng() * 10) + 2;
    const b = Math.floor(rng() * 10) + 2;
    const c = Math.floor(rng() * 5) + 1;
    answer = a * b + c;
    expression = `${a} × ${b} + ${c}`;
    hint = 'Multiply first, then add (order of operations)';
  } else {
    const a = Math.floor(rng() * 5) + 2;
    const b = Math.floor(rng() * 5) + 2;
    const c = Math.floor(rng() * 10) + 1;
    answer = (a + b) * c;
    expression = `(${a} + ${b}) × ${c}`;
    hint = 'Solve the brackets first';
  }

  // Generate wrong choices
  const wrongAnswers = new Set<number>();
  while (wrongAnswers.size < 3) {
    const offset = Math.floor(rng() * 10) + 1;
    const wrong = rng() > 0.5 ? answer + offset : answer - offset;
    if (wrong !== answer && wrong > 0) wrongAnswers.add(wrong);
  }

  const choices = [answer, ...Array.from(wrongAnswers)].sort(() => rng() - 0.5);

  return { type: 'math', expression, choices, answer, hint, difficulty };
}

export function generateDailyPuzzle(date: string): { sequence: Puzzle; math: Puzzle; difficulty: number } {
  const seed = dateToSeed(date);
  const rng = mulberry32(seed);

  // Difficulty rotates: 1=easy, 2=medium, 3=hard based on day of week
  const dayOfWeek = new Date(date).getDay();
  const difficulty = dayOfWeek <= 1 ? 1 : dayOfWeek <= 4 ? 2 : 3;

  return {
    sequence: generateSequencePuzzle(rng, difficulty),
    math: generateMathPuzzle(rng, difficulty),
    difficulty,
  };
}

// Score calculation
export function calculateScore(
  difficulty: number,
  timeTaken: number,
  hintsUsed: number
): number {
  const baseScore = difficulty * 100;
  const timeBonus = Math.max(0, 300 - timeTaken); // up to 300 bonus
  const hintPenalty = hintsUsed * 50;
  return Math.max(0, baseScore + timeBonus - hintPenalty);
}

// Validate puzzle solution
export function validateSequence(puzzle: SequencePuzzle, answer: number): boolean {
  return answer === puzzle.answer;
}

export function validateMath(puzzle: MathPuzzle, answer: number): boolean {
  return answer === puzzle.answer;
}
