import { useEffect, useRef, useState } from 'react';

const THEMES = {
  animals: ['🐶', '🐱', '🐼', '🦁', '🐸', '🐵', '🐰', '🦊'],
  fruits: ['🍎', '🍌', '🍇', '🍓', '🍊', '🍉', '🍍', '🍒'],
};
const PAIRS_BY_LEVEL = { 1: 3, 2: 6, 3: 8 };

function buildDeck(pairs, theme) {
  const pool = THEMES[theme] || THEMES.animals;
  const chosen = pool.slice(0, pairs);
  const deck = [...chosen, ...chosen].map((emoji, i) => ({ id: i, emoji }));
  // Fisher-Yates shuffle
  for (let i = deck.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

export default function MemoryMatch({ level = 1, theme = 'animals', onFinish }) {
  const pairs = PAIRS_BY_LEVEL[level] || 3;
  const [cards] = useState(() => buildDeck(pairs, theme));
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState([]);
  const [moves, setMoves] = useState(0);
  const [locked, setLocked] = useState(false);
  const startRef = useRef(Date.now());
  const timerRef = useRef(null);

  useEffect(() => () => clearTimeout(timerRef.current), []);

  const finish = (totalMoves) => {
    const seconds = Math.round((Date.now() - startRef.current) / 1000);
    const accuracy = Math.round((pairs / totalMoves) * 100);
    timerRef.current = setTimeout(() => {
      onFinish({
        difficulty_level: level,
        score: Math.min(100, accuracy),
        accuracy_pct: Math.min(100, accuracy),
        duration_seconds: seconds,
        completed: true,
        metrics: { moves: totalMoves, pairs },
      });
    }, 700);
  };

  const handleClick = (index) => {
    if (locked || flipped.includes(index) || matched.includes(index)) return;

    const nextFlipped = [...flipped, index];
    setFlipped(nextFlipped);

    if (nextFlipped.length === 2) {
      const newMoves = moves + 1;
      setMoves(newMoves);
      const [a, b] = nextFlipped;

      if (cards[a].emoji === cards[b].emoji) {
        const newMatched = [...matched, a, b];
        setMatched(newMatched);
        setFlipped([]);
        if (newMatched.length === cards.length) finish(newMoves);
      } else {
        setLocked(true);
        timerRef.current = setTimeout(() => {
          setFlipped([]);
          setLocked(false);
        }, 900);
      }
    }
  };

  const columns = cards.length > 6 ? 4 : 3;

  return (
    <div className="mm-wrap">
      <p className="mm-moves">Moves: {moves}</p>
      <div className="mm-grid" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
        {cards.map((card, index) => {
          const show = flipped.includes(index) || matched.includes(index);
          return (
            <button
              key={card.id}
              type="button"
              className={`mm-card ${show ? 'mm-card-open' : ''}`}
              onClick={() => handleClick(index)}
              aria-label={show ? card.emoji : 'Hidden card'}
            >
              {show ? card.emoji : '❓'}
            </button>
          );
        })}
      </div>
    </div>
  );
}