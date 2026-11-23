import { useEffect, useRef, useState } from 'react';

export default function ChoiceGame({ level = 1, onFinish, buildQuestions }) {
  const [questions] = useState(() => buildQuestions(level));
  const [index, setIndex] = useState(0);
  const [firstTry, setFirstTry] = useState(0);
  const [wrongTotal, setWrongTotal] = useState(0);
  const [wrongNow, setWrongNow] = useState([]);
  const [solved, setSolved] = useState(false);

  const startRef = useRef(Date.now());
  const questionStartRef = useRef(Date.now());
  const reactionsRef = useRef([]);
  const timerRef = useRef(null);

  useEffect(() => () => clearTimeout(timerRef.current), []);

  const question = questions[index];
  const total = questions.length;

  const finish = (finalFirstTry) => {
    const seconds = Math.round((Date.now() - startRef.current) / 1000);
    const reactions = reactionsRef.current;
    const avgReaction = reactions.length
      ? Math.round(reactions.reduce((sum, r) => sum + r, 0) / reactions.length)
      : null;
    const score = Math.round((finalFirstTry / total) * 100);

    onFinish({
      difficulty_level: level,
      score,
      accuracy_pct: score,
      avg_reaction_ms: avgReaction,
      duration_seconds: seconds,
      completed: true,
      metrics: {
        total_questions: total,
        first_try_correct: finalFirstTry,
        wrong_attempts: wrongTotal,
      },
    });
  };

  const advance = (finalFirstTry) => {
    if (index + 1 >= total) {
      finish(finalFirstTry);
      return;
    }
    setIndex(index + 1);
    setWrongNow([]);
    setSolved(false);
    questionStartRef.current = Date.now();
  };

  const handleAnswer = (option) => {
    if (solved || wrongNow.includes(option)) return;

    if (option === question.answer) {
      reactionsRef.current.push(Date.now() - questionStartRef.current);
      const newFirstTry = firstTry + (wrongNow.length === 0 ? 1 : 0);
      setFirstTry(newFirstTry);
      setSolved(true);

      if (!question.fact) {
        timerRef.current = setTimeout(() => advance(newFirstTry), 800);
      }
    } else {
      setWrongNow([...wrongNow, option]);
      setWrongTotal(wrongTotal + 1);
    }
  };

  let message = '';
  if (solved && !question.fact) message = 'Yes! ⭐';
  else if (!solved && wrongNow.length > 0) message = 'Almost! Try another one 💪';

  return (
    <div className="se-wrap">
      <p className="se-progress">
        Question {index + 1} of {total}
      </p>
      <div className={`se-emoji ${question.compact ? 'se-emoji-compact' : ''}`} aria-hidden="true">
        {question.visual}
      </div>
      <h3 className={`se-question ${question.bigPrompt ? 'se-question-big' : ''}`}>
        {question.prompt}
      </h3>

      <div className="se-options">
        {question.options.map((option) => {
          const isWrong = wrongNow.includes(option);
          const isRight = solved && option === question.answer;
          return (
            <button
              key={String(option)}
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
        {message}
      </p>

      {solved && question.fact && (
        <div className="se-fact">
          <strong>⭐ Did you know?</strong>
          <p>{question.fact}</p>
          <button type="button" className="gl-btn gl-btn-primary" onClick={() => advance(firstTry)}>
            {index + 1 >= total ? 'Finish 🎉' : 'Next →'}
          </button>
        </div>
      )}
    </div>
  );
}