import { useRef, useState } from 'react';

const TOTAL_QUESTIONS = 6;

const BANK = {
  1: [
    { emoji: '🐮', q: 'Which animal says "moo"?', options: ['Cow', 'Dog', 'Cat'], answer: 'Cow', fact: 'Cows give us milk.' },
    { emoji: '🌱', q: 'What do plants need to grow?', options: ['Water and sunlight', 'Candy', 'Toys'], answer: 'Water and sunlight', fact: 'Plants use sunlight, water and air to make their food.' },
    { emoji: '🌤️', q: 'What color is the sky on a clear sunny day?', options: ['Blue', 'Green', 'Red'], answer: 'Blue', fact: 'The air scatters the sun\'s blue light more than other colors, so the sky looks blue.' },
    { emoji: '🦅', q: 'Which one can fly?', options: ['Bird', 'Fish', 'Cow'], answer: 'Bird', fact: 'Most birds have wings and light feathers that help them fly.' },
    { emoji: '🌧️', q: 'What falls from the clouds when it rains?', options: ['Water', 'Sand', 'Milk'], answer: 'Water', fact: 'Rain is made of tiny water drops that fall from clouds.' },
    { emoji: '☀️', q: 'Which one is very, very hot?', options: ['The Sun', 'An ice cube', 'A snowman'], answer: 'The Sun', fact: 'The Sun is a giant, super-hot star.' },
    { emoji: '🐟', q: 'Which animal lives in water?', options: ['Fish', 'Dog', 'Horse'], answer: 'Fish', fact: 'Fish breathe underwater using gills.' },
    { emoji: '👀', q: 'What do we use to see?', options: ['Eyes', 'Ears', 'Nose'], answer: 'Eyes', fact: 'Our eyes help us see colors and shapes.' },
    { emoji: '🍎', q: 'Which one is a fruit?', options: ['Apple', 'Carrot', 'Potato'], answer: 'Apple', fact: 'Fruits grow from flowers and have seeds inside.' },
    { emoji: '🐝', q: 'What do bees make?', options: ['Honey', 'Milk', 'Bread'], answer: 'Honey', fact: 'Bees collect nectar from flowers to make honey.' },
  ],
  2: [
    { emoji: '🐜', q: 'How many legs does an insect have?', options: ['4', '6', '8'], answer: '6', fact: 'Insects have six legs, like ants and butterflies.' },
    { emoji: '🌍', q: 'Which planet do we live on?', options: ['Earth', 'Mars', 'Jupiter'], answer: 'Earth', fact: 'Earth is the only planet we know that has living things.' },
    { emoji: '♨️', q: 'What does water turn into when it is boiled?', options: ['Steam', 'Ice', 'Sand'], answer: 'Steam', fact: 'Water boils at about 100°C and turns into steam.' },
    { emoji: '❤️', q: 'Which body part pumps blood around your body?', options: ['Heart', 'Brain', 'Stomach'], answer: 'Heart', fact: 'Your heart beats day and night to send blood around your body.' },
    { emoji: '🌬️', q: 'Which gas do we need to breathe?', options: ['Oxygen', 'Helium', 'Steam'], answer: 'Oxygen', fact: 'Plants make oxygen and release it into the air.' },
    { emoji: '🐋', q: 'Which is the biggest animal?', options: ['Elephant', 'Blue whale', 'Giraffe'], answer: 'Blue whale', fact: 'The blue whale is the largest animal known to have ever lived.' },
    { emoji: '🧲', q: 'A magnet sticks to which of these?', options: ['Iron', 'Paper', 'Wood'], answer: 'Iron', fact: 'Magnets attract things made of iron and steel.' },
    { emoji: '🐬', q: 'Which one is a mammal?', options: ['Dolphin', 'Shark', 'Frog'], answer: 'Dolphin', fact: 'Mammals breathe air and feed their babies milk. Dolphins are mammals!' },
    { emoji: '🌙', q: 'The Moon goes around which one?', options: ['Earth', 'Mars', 'The Sun'], answer: 'Earth', fact: 'The Moon travels around Earth about once a month.' },
    { emoji: '🐛', q: 'What does a caterpillar turn into?', options: ['Butterfly', 'Beetle', 'Bee'], answer: 'Butterfly', fact: 'A caterpillar rests in a chrysalis and changes into a butterfly or moth.' },
  ],
  3: [
    { emoji: '🔴', q: 'Which planet is called the Red Planet?', options: ['Mars', 'Venus', 'Saturn'], answer: 'Mars', fact: 'Mars looks red because its soil contains a lot of rusty iron.' },
    { emoji: '🌿', q: 'Which gas do plants take in from the air?', options: ['Carbon dioxide', 'Oxygen', 'Nitrogen'], answer: 'Carbon dioxide', fact: 'Plants use carbon dioxide, water and sunlight to make food.' },
    { emoji: '🍏', q: 'What force pulls things toward the ground?', options: ['Gravity', 'Magnetism', 'Wind'], answer: 'Gravity', fact: 'Gravity keeps us on Earth and makes things fall down.' },
    { emoji: '💎', q: 'What is the hardest natural material?', options: ['Diamond', 'Gold', 'Iron'], answer: 'Diamond', fact: 'Diamond is the hardest natural material known.' },
    { emoji: '🪐', q: 'How many planets are in our solar system?', options: ['7', '8', '9'], answer: '8', fact: 'Pluto is now called a dwarf planet, so we count eight planets.' },
    { emoji: '💧', q: 'What is H2O the formula for?', options: ['Water', 'Salt', 'Air'], answer: 'Water', fact: 'Each water particle has 2 hydrogen atoms and 1 oxygen atom.' },
    { emoji: '🧍', q: 'What is the largest organ of the human body?', options: ['Skin', 'Heart', 'Liver'], answer: 'Skin', fact: 'Your skin covers your whole body and protects you.' },
    { emoji: '🐇', q: 'Animals that eat only plants are called...', options: ['Herbivores', 'Carnivores', 'Predators'], answer: 'Herbivores', fact: 'Cows, rabbits and elephants are herbivores.' },
    { emoji: '⚡', q: 'Which travels fastest?', options: ['Light', 'Sound', 'A car'], answer: 'Light', fact: 'Light is faster than sound, so we see lightning before we hear thunder.' },
    { emoji: '🐸', q: 'What is a baby frog called?', options: ['Tadpole', 'Caterpillar', 'Cub'], answer: 'Tadpole', fact: 'Tadpoles live in water and grow legs to become frogs.' },
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

function buildQuestions(level) {
  return shuffle(BANK[level] || BANK[1])
    .slice(0, TOTAL_QUESTIONS)
    .map((item) => ({ ...item, options: shuffle(item.options) }));
}

export default function ScienceExplorer({ level = 1, onFinish }) {
  const [questions] = useState(() => buildQuestions(level));
  const [index, setIndex] = useState(0);
  const [firstTry, setFirstTry] = useState(0);
  const [wrongTotal, setWrongTotal] = useState(0);
  const [wrongNow, setWrongNow] = useState([]);
  const [solved, setSolved] = useState(false);

  const startRef = useRef(Date.now());
  const questionStartRef = useRef(Date.now());
  const reactionsRef = useRef([]);

  const question = questions[index];
  const total = questions.length;

  const handleAnswer = (option) => {
    if (solved || wrongNow.includes(option)) return;

    if (option === question.answer) {
      reactionsRef.current.push(Date.now() - questionStartRef.current);
      if (wrongNow.length === 0) setFirstTry(firstTry + 1);
      setSolved(true);
    } else {
      setWrongNow([...wrongNow, option]);
      setWrongTotal(wrongTotal + 1);
    }
  };

  const handleNext = () => {
    if (index + 1 >= total) {
      const seconds = Math.round((Date.now() - startRef.current) / 1000);
      const reactions = reactionsRef.current;
      const avgReaction = reactions.length
        ? Math.round(reactions.reduce((sum, r) => sum + r, 0) / reactions.length)
        : null;
      const score = Math.round((firstTry / total) * 100);

      onFinish({
        game_key: 'science_explorer',
        difficulty_level: level,
        score,
        accuracy_pct: score,
        avg_reaction_ms: avgReaction,
        duration_seconds: seconds,
        completed: true,
        metrics: {
          total_questions: total,
          first_try_correct: firstTry,
          wrong_attempts: wrongTotal,
        },
      });
      return;
    }
    setIndex(index + 1);
    setWrongNow([]);
    setSolved(false);
    questionStartRef.current = Date.now();
  };

  return (
    <div className="se-wrap">
      <p className="se-progress">
        Question {index + 1} of {total}
      </p>
      <div className="se-emoji" aria-hidden="true">
        {question.emoji}
      </div>
      <h3 className="se-question">{question.q}</h3>

      <div className="se-options">
        {question.options.map((option) => {
          const isWrong = wrongNow.includes(option);
          const isRight = solved && option === question.answer;
          return (
            <button
              key={option}
              type="button"
              className={`se-option ${isWrong ? 'se-option-wrong' : ''} ${isRight ? 'se-option-right' : ''}`}
              onClick={() => handleAnswer(option)}
              disabled={isWrong || solved}
            >
              {option}
            </button>
          );
        })}
      </div>

      <p className="se-message" aria-live="polite">
        {!solved && wrongNow.length > 0 ? 'Not quite! Try another one 💪' : ''}
      </p>

      {solved && (
        <div className="se-fact">
          <strong>⭐ Did you know?</strong>
          <p>{question.fact}</p>
          <button type="button" className="gl-btn gl-btn-primary" onClick={handleNext}>
            {index + 1 >= total ? 'Finish 🎉' : 'Next →'}
          </button>
        </div>
      )}
    </div>
  );
}