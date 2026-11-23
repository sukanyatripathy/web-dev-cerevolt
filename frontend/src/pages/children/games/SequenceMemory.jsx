import { useEffect, useRef, useState } from 'react';

const ROUNDS = 5;
const STEP_MS = 800;
const MAX_ATTEMPTS = 2;
const START_LENGTH = { 1: 2, 2: 3, 3: 4 };

const PADS = [
  { id: 0, label: 'Red', color: '#ffb3b3', lit: '#ff4d4d' },
  { id: 1, label: 'Yellow', color: '#ffeaa0', lit: '#ffc400' },
  { id: 2, label: 'Green', color: '#b5ecc0', lit: '#2fbf5b' },
  { id: 3, label: 'Blue', color: '#b3d1ff', lit: '#3b82f6' },
];

const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const makeSequence = (length) => Array.from({ length }, () => randInt(0, 3));

export default function SequenceMemory({ level = 1, onFinish }) {
  const startLength = START_LENGTH[level] || 2;

  const [round, setRound] = useState(0);
  const [sequence, setSequence] = useState(() => makeSequence(startLength));
  const [phase, setPhase] = useState('watch'); // watch | repeat | feedback
  const [litPad, setLitPad] = useState(null);
  const [typed, setTyped] = useState([]);
  const [attempt, setAttempt] = useState(1);
  const [message, setMessage] = useState('Watch the colors 👀');

  const startRef = useRef(Date.now());
  const statsRef = useRef({ firstTry: 0, mistakes: 0, longest: 0 });
  const timersRef = useRef([]);

  const later = (fn, ms) => {
    timersRef.current.push(setTimeout(fn, ms));
  };

  useEffect(
    () => () => {
      timersRef.current.forEach(clearTimeout);
    },
    []
  );

  useEffect(() => {
    if (phase !== 'watch') return undefined;
    const timers = [];
    sequence.forEach((padId, i) => {
      timers.push(setTimeout(() => setLitPad(padId), 600 + i * STEP_MS));
      timers.push(setTimeout(() => setLitPad(null), 600 + i * STEP_MS + STEP_MS * 0.6));
    });
    timers.push(
      setTimeout(() => {
        setPhase('repeat');
        setMessage('Your turn! Tap the colors 👆');
      }, 600 + sequence.length * STEP_MS)
    );
    return () => timers.forEach(clearTimeout);
  }, [phase, sequence]);

  const finish = () => {
    const { firstTry, mistakes, longest } = statsRef.current;
    const score = Math.round((firstTry / ROUNDS) * 100);
    onFinish({
      difficulty_level: level,
      score,
      accuracy_pct: score,
      duration_seconds: Math.round((Date.now() - startRef.current) / 1000),
      completed: true,
      metrics: {
        rounds: ROUNDS,
        first_try_rounds: firstTry,
        mistakes,
        longest_sequence: longest,
      },
    });
  };

  const nextRound = () => {
    if (round + 1 >= ROUNDS) {
      finish();
      return;
    }
    setRound(round + 1);
    setSequence(makeSequence(startLength + round + 1));
    setTyped([]);
    setAttempt(1);
    setMessage('Watch the colors 👀');
    setPhase('watch');
  };

  const handlePad = (padId) => {
    if (phase !== 'repeat') return;

    setLitPad(padId);
    later(() => setLitPad(null), 250);

    const expected = sequence[typed.length];

    if (padId !== expected) {
      statsRef.current.mistakes += 1;
      setPhase('feedback');
      setTyped([]);
      if (attempt >= MAX_ATTEMPTS) {
        setMessage('Good try! Next one 🌟');
        later(nextRound, 1200);
      } else {
        setAttempt(attempt + 1);
        setMessage("Let's watch again 👀");
        later(() => {
          setMessage('Watch the colors 👀');
          setPhase('watch');
        }, 1000);
      }
      return;
    }

    const nextTyped = [...typed, padId];
    if (nextTyped.length === sequence.length) {
      if (attempt === 1) statsRef.current.firstTry += 1;
      statsRef.current.longest = Math.max(statsRef.current.longest, sequence.length);
      setTyped(nextTyped);
      setPhase('feedback');
      setMessage('Great memory! ⭐');
      later(nextRound, 1100);
    } else {
      setTyped(nextTyped);
    }
  };

  return (
    <div className="sq-wrap">
      <p className="sq-progress">
        Round {round + 1} of {ROUNDS}
      </p>

      <div className="sq-pads">
        {PADS.map((pad) => (
          <button
            key={pad.id}
            type="button"
            className="sq-pad"
            style={{ background: litPad === pad.id ? pad.lit : pad.color }}
            onClick={() => handlePad(pad.id)}
            disabled={phase !== 'repeat'}
          >
            {pad.label}
          </button>
        ))}
      </div>

      <p className="sq-message" aria-live="polite">
        {message}
      </p>
    </div>
  );
}