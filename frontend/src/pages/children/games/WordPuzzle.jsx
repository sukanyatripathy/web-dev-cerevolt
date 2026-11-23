import { useEffect, useRef, useState } from 'react';

const TOTAL_WORDS = 6;

const WORDS = {
  1: [
    ['🐱', 'CAT'], ['🐶', 'DOG'], ['☀️', 'SUN'], ['🐷', 'PIG'],
    ['🚌', 'BUS'], ['🎩', 'HAT'], ['🐝', 'BEE'], ['🦊', 'FOX'],
    ['🐮', 'COW'], ['🦇', 'BAT'], ['🥚', 'EGG'], ['🚗', 'CAR'],
  ],
  2: [
    ['🐸', 'FROG'], ['🌙', 'MOON'], ['⭐', 'STAR'], ['🐟', 'FISH'],
    ['🦆', 'DUCK'], ['🌳', 'TREE'], ['🍰', 'CAKE'], ['🐦', 'BIRD'],
    ['🐻', 'BEAR'], ['🥛', 'MILK'], ['⚽', 'BALL'], ['🚢', 'SHIP'],
  ],
  3: [
    ['🍎', 'APPLE'], ['🐴', 'HORSE'], ['🐯', 'TIGER'], ['🍕', 'PIZZA'],
    ['🚆', 'TRAIN'], ['🐭', 'MOUSE'], ['🐍', 'SNAKE'], ['🦓', 'ZEBRA'],
    ['🍋', 'LEMON'], ['🤖', 'ROBOT'], ['🍌', 'BANANA'], ['🍊', 'ORANGE'],
  ],
};

function shuffle(list) {
  const arr = [...list];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function scramble(word) {
  const letters = word.split('');
  let result = letters;
  for (let attempt = 0; attempt < 10; attempt += 1) {
    result = shuffle(letters);
    if (result.join('') !== word) break;
  }
  return result;
}

export default function WordPuzzle({ level = 1, onFinish }) {
  const [questions] = useState(() =>
    shuffle(WORDS[level] || WORDS[1])
      .slice(0, TOTAL_WORDS)
      .map(([emoji, word]) => ({ emoji, word, tiles: scramble(word) }))
  );
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState([]);
  const [firstTry, setFirstTry] = useState(0);
  const [wrongTotal, setWrongTotal] = useState(0);
  const [wrongNow, setWrongNow] = useState(0);
  const [message, setMessage] = useState('');
  const [locked, setLocked] = useState(false);

  const startRef = useRef(Date.now());
  const questionStartRef = useRef(Date.now());
  const reactionsRef = useRef([]);
  const timerRef = useRef(null);

  useEffect(() => () => clearTimeout(timerRef.current), []);

  const question = questions[index];
  const total = questions.length;

  const finish = (finalFirstTry, finalWrong) => {
    const seconds = Math.round((Date.now() - startRef.current) / 1000);
    const reactions = reactionsRef.current;
    const avgReaction = reactions.length
      ? Math.round(reactions.reduce((sum, r) => sum + r, 0) / reactions.length)
      : null;
    const score = Math.round((finalFirstTry / total) * 100);

    onFinish({
      game_key: 'word_puzzle',
      difficulty_level: level,
      score,
      accuracy_pct: score,
      avg_reaction_ms: avgReaction,
      duration_seconds: seconds,
      completed: true,
      metrics: {
        total_words: total,
        first_try_correct: finalFirstTry,
        wrong_attempts: finalWrong,
        word_length: question.word.length,
      },
    });
  };

  const handleTile = (tileIndex) => {
    if (locked || picked.includes(tileIndex)) return;

    const nextPicked = [...picked, tileIndex];
    setPicked(nextPicked);
    if (nextPicked.length < question.word.length) return;

    const guess = nextPicked.map((t) => question.tiles[t]).join('');
    setLocked(true);

    if (guess === question.word) {
      reactionsRef.current.push(Date.now() - questionStartRef.current);
      const newFirstTry = firstTry + (wrongNow === 0 ? 1 : 0);
      setFirstTry(newFirstTry);
      setMessage('Yes! ⭐');

      timerRef.current = setTimeout(() => {
        if (index + 1 >= total) {
          finish(newFirstTry, wrongTotal);
        } else {
          setIndex(index + 1);
          setPicked([]);
          setWrongNow(0);
          setMessage('');
          setLocked(false);
          questionStartRef.current = Date.now();
        }
      }, 900);
    } else {
      setWrongTotal(wrongTotal + 1);
      setWrongNow(wrongNow + 1);
      setMessage('Almost! Try again 💪');
      timerRef.current = setTimeout(() => {
        setPicked([]);
        setMessage('');
        setLocked(false);
      }, 900);
    }
  };

  const handleUndo = () => {
    if (!locked) setPicked(picked.slice(0, -1));
  };

  return (
    <div className="wp-wrap">
      <p className="wp-progress">
        Word {index + 1} of {total}
      </p>
      <div className="wp-picture" aria-hidden="true">
        {question.emoji}
      </div>

      <div className="wp-slots">
        {question.word.split('').map((_, i) => (
          <span key={i} className="wp-slot">
            {picked[i] !== undefined ? question.tiles[picked[i]] : ''}
          </span>
        ))}
      </div>

      <div className="wp-tiles">
        {question.tiles.map((letter, tileIndex) => (
          <button
            key={tileIndex}
            type="button"
            className="wp-tile"
            onClick={() => handleTile(tileIndex)}
            disabled={picked.includes(tileIndex)}
          >
            {letter}
          </button>
        ))}
      </div>

      <button type="button" className="gl-btn wp-undo" onClick={handleUndo}>
        ↩ Undo
      </button>

      <p className="wp-message" aria-live="polite">
        {message}
      </p>
    </div>
  );
}