import { useEffect, useRef, useState } from 'react';

const TOTAL_QUESTIONS = 8;

const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

function shuffle(list) {
  const arr = [...list];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function makeOptions(answer) {
  const set = new Set([answer]);
  while (set.size < 4) {
    const delta = randInt(1, 5) * (Math.random() < 0.5 ? -1 : 1);
    const candidate = answer + delta;
    if (candidate >= 0) set.add(candidate);
  }
  return shuffle([...set]);
}

function makeQuestion(level) {
  let a;
  let b;
  let op;
  let answer;

  if (level === 1) {
    op = '+';
    a = randInt(1, 9);
    b = randInt(1, 10 - a);
    answer = a + b;
  } else if (level === 2) {
    op = Math.random() < 0.5 ? '+' : '-';
    if (op === '+') {
      a = randInt(2, 15);
      b = randInt(1, 20 - a);
      answer = a + b;
    } else {
      a = randInt(5, 20);
      b = randInt(1, a - 1);
      answer = a - b;
    }
  } else {
    const pick = randInt(0, 2);
    if (pick === 0) {
      op = '+';
      a = randInt(10, 40);
      b = randInt(10, 40);
      answer = a + b;
    } else if (pick === 1) {
      op = '-';
      a = randInt(20, 60);
      b = randInt(5, a - 5);
      answer = a - b;
    } else {
      op = '×';
      a = randInt(2, 5);
      b = randInt(2, 9);
      answer = a * b;
    }
  }

  return { a, b, op, answer, options: makeOptions(answer) };
}

export default function MathMagic({ level = 1, onFinish }) {
  const [questions] = useState(() =>
    Array.from({ length: TOTAL_QUESTIONS }, () => makeQuestion(level))
  );
  const [index, setIndex] = useState(0);
  const [firstTry, setFirstTry] = useState(0);
  const [wrongTotal, setWrongTotal] = useState(0);
  const [wrongNow, setWrongNow] = useState([]);
  const [message, setMessage] = useState('');
  const [locked, setLocked] = useState(false);

  const startRef = useRef(Date.now());
  const questionStartRef = useRef(Date.now());
  const reactionsRef = useRef([]);
  const timerRef = useRef(null);

  useEffect(() => () => clearTimeout(timerRef.current), []);

  const question = questions[index];

  const finish = (finalFirstTry, finalWrong) => {
    const seconds = Math.round((Date.now() - startRef.current) / 1000);
    const reactions = reactionsRef.current;
    const avgReaction = reactions.length
      ? Math.round(reactions.reduce((sum, r) => sum + r, 0) / reactions.length)
      : null;
    const score = Math.round((finalFirstTry / TOTAL_QUESTIONS) * 100);

    onFinish({
      game_key: 'math_magic',
      difficulty_level: level,
      score,
      accuracy_pct: score,
      avg_reaction_ms: avgReaction,
      duration_seconds: seconds,
      completed: true,
      metrics: {
        total_questions: TOTAL_QUESTIONS,
        first_try_correct: finalFirstTry,
        wrong_attempts: finalWrong,
      },
    });
  };

  const handleAnswer = (value) => {
    if (locked || wrongNow.includes(value)) return;

    if (value === question.answer) {
      reactionsRef.current.push(Date.now() - questionStartRef.current);
      const newFirstTry = firstTry + (wrongNow.length === 0 ? 1 : 0);
      setFirstTry(newFirstTry);
      setMessage('Yes! ⭐');
      setLocked(true);

      timerRef.current = setTimeout(() => {
        if (index + 1 >= questions.length) {
          finish(newFirstTry, wrongTotal);
        } else {
          setIndex(index + 1);
          setWrongNow([]);
          setMessage('');
          setLocked(false);
          questionStartRef.current = Date.now();
        }
      }, 800);
    } else {
      setWrongNow([...wrongNow, value]);
      setWrongTotal(wrongTotal + 1);
      setMessage('Almost! Try again 💪');
    }
  };

  return (
    <div className="mg-wrap">
      <p className="mg-progress">
        Question {index + 1} of {TOTAL_QUESTIONS}
      </p>
      <div className="mg-question">
        {question.a} {question.op} {question.b} = ?
      </div>
      <div className="mg-options">
        {question.options.map((value) => (
          <button
            key={value}
            type="button"
            className={`mg-option ${wrongNow.includes(value) ? 'mg-option-wrong' : ''}`}
            onClick={() => handleAnswer(value)}
            disabled={wrongNow.includes(value)}
          >
            {value}
          </button>
        ))}
      </div>
      <p className="mg-message" aria-live="polite">
        {message}
      </p>
    </div>
  );
}