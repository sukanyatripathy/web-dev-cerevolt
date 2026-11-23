import React, { useEffect, useRef, useState } from "react";
import ChildSidebar from "../../components/ChildSidebar";
import assessmentService from "../../services/assessmentService";
import "./solveassessments.css";

// "key" is the backend subject. null = no questions yet (coming soon).
const assessments = [
  {
    id: 1,
    key: "maths",
    title: "Maths Challenge",
    subject: "Mathematics",
    icon: "🔢",
    description: "Test your number skills with fun questions.",
    questions: 10,
    color: "math",
    level: "Easy",
  },
  {
    id: 2,
    key: "language",
    title: "Word Wizard",
    subject: "English",
    icon: "📚",
    description: "Explore words, grammar and vocabulary.",
    questions: 10,
    color: "english",
    level: "Easy",
  },
  {
    id: 3,
    key: "science",
    title: "Science Explorer",
    subject: "Science",
    icon: "🔬",
    description: "Discover the wonders of science.",
    questions: 10,
    color: "science",
    level: "Medium",
  },
  {
    id: 4,
    key: "colours",
    title: "Colour Fun",
    subject: "Colours",
    icon: "🎨",
    description: "Look at the colour and pick its name.",
    questions: 10,
    color: "english",
    level: "Easy",
  },
  {
    id: 5,
    key: "observation",
    title: "What Is This?",
    subject: "Observation",
    icon: "🔍",
    description: "Look carefully, count and spot things.",
    questions: 10,
    color: "gk",
    level: "Easy",
  },
  {
    id: 6,
    key: null,
    title: "General Knowledge",
    subject: "General Knowledge",
    icon: "🌍",
    description: "See how much you know about the world.",
    questions: 10,
    color: "gk",
    level: "Medium",
  },
];

const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "hi", label: "Hindi" },
  { code: "bn", label: "Bengali" },
];

// Seconds per question (the server sends the real value when the quiz starts).
const LEVELS = [
  { value: 1, label: "Level 1 · Easy", seconds: 15 },
  { value: 2, label: "Level 2 · Medium", seconds: 12 },
  { value: 3, label: "Level 3 · Hard", seconds: 10 },
];

const isColour = (value) => /^#[0-9a-fA-F]{3,8}$/.test(value || "");

const isImage = (value) =>
  /^(\/|https?:\/\/).+\.(png|jpe?g|gif|svg|webp)$/i.test(value || "");

const SolveAssessments = () => {
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [startedAssessment, setStartedAssessment] = useState(null);

  const [language, setLanguage] = useState("en");
  const [level, setLevel] = useState(1); // level chosen in the modal
  const [phase, setPhase] = useState("pick"); // pick | quiz | done
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [assessmentId, setAssessmentId] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [index, setIndex] = useState(0);
  const [result, setResult] = useState(null);
  const [needsRetry, setNeedsRetry] = useState(false);

  const [active, setActive] = useState(null); // card currently being played
  const [activeLevel, setActiveLevel] = useState(1);
  const [timeLimit, setTimeLimit] = useState(15);
  const [timeLeft, setTimeLeft] = useState(15000);

  const answersRef = useRef([]);
  const questionStart = useRef(Date.now());
  const answeredFor = useRef(-1);
  const recordRef = useRef(null);

  const filters = ["All", "Easy", "Medium"];

  const filteredAssessments =
    selectedFilter === "All"
      ? assessments
      : assessments.filter((item) => item.level === selectedFilter);

  const closeModal = () => {
    setStartedAssessment(null);
    setError("");
  };

  const beginQuiz = async (item, lang, lvl) => {
    if (!item || !item.key) return;
    setError("");
    setLoading(true);
    try {
      const data = await assessmentService.start(
        item.key,
        lang,
        10,
        undefined,
        lvl
      );
      const limit = data.time_limit || 15;
      answersRef.current = [];
      answeredFor.current = -1;
      setAssessmentId(data.assessment_id);
      setQuestions(data.questions);
      setActive(item);
      setActiveLevel(data.level || lvl);
      setTimeLimit(limit);
      setTimeLeft(limit * 1000);
      setIndex(0);
      setResult(null);
      setNeedsRetry(false);
      questionStart.current = Date.now();
      setPhase("quiz");
      setStartedAssessment(null);
    } catch (err) {
      setError(err.message || "Could not start the assessment.");
    } finally {
      setLoading(false);
    }
  };

  const submitAll = async () => {
    setError("");
    setLoading(true);
    try {
      const res = await assessmentService.submit(
        assessmentId,
        answersRef.current
      );
      setResult(res);
      setNeedsRetry(false);
      setPhase("done");
    } catch (err) {
      setError(err.message || "Could not save your answers.");
      setNeedsRetry(true);
    } finally {
      setLoading(false);
    }
  };

  const recordAnswer = (selectedIndex, timedOut = false) => {
    if (loading || answeredFor.current === index) return;
    answeredFor.current = index;
    const q = questions[index];
    answersRef.current.push({
      question_id: q.id,
      selected_index: timedOut ? null : selectedIndex,
      timed_out: timedOut,
      response_time_ms: timedOut
        ? timeLimit * 1000
        : Date.now() - questionStart.current,
    });
    if (index + 1 < questions.length) {
      setIndex(index + 1);
      questionStart.current = Date.now();
    } else {
      submitAll();
    }
  };

  // The timer always calls the latest version of recordAnswer.
  useEffect(() => {
    recordRef.current = recordAnswer;
  });

  // Countdown: restarts for every question, pauses while saving.
  useEffect(() => {
    if (phase !== "quiz" || loading || needsRetry || !questions.length) {
      return undefined;
    }
    const deadline = Date.now() + timeLimit * 1000;
    setTimeLeft(timeLimit * 1000);
    const timer = setInterval(() => {
      const left = deadline - Date.now();
      if (left <= 0) {
        clearInterval(timer);
        setTimeLeft(0);
        if (recordRef.current) recordRef.current(null, true);
      } else {
        setTimeLeft(left);
      }
    }, 100);
    return () => clearInterval(timer);
  }, [phase, index, loading, needsRetry, questions, timeLimit]);

  const backToStart = () => {
    setPhase("pick");
    setQuestions([]);
    setResult(null);
    setError("");
  };

  const current = questions[index];
  const timePercent = Math.max(
    0,
    Math.min(100, (timeLeft / (timeLimit * 1000)) * 100)
  );
  const timerColour =
    timePercent > 50 ? "#43a047" : timePercent > 25 ? "#fb8c00" : "#e53935";
  const secondsLeft = Math.ceil(timeLeft / 1000);
  const chosenLevel = LEVELS.find((l) => l.value === level) || LEVELS[0];

  const stars = result ? result.stars || 0 : 0;
  const canLevelUp =
    result && active && activeLevel < 3 && result.accuracy_percent >= 50;

  return (
    <div className="child-layout">
      <ChildSidebar />

      <main className="assessment-page">
        {phase === "pick" && (
          <>
            <div className="assessment-header">
              <div>
                <span className="assessment-tag">📝 LEARNING ZONE</span>
                <h1>Let's Test Your Knowledge!</h1>
                <p>
                  Challenge yourself, answer questions and discover
                  how much you've learned.
                </p>
              </div>

              <div className="assessment-header-emoji">🎓</div>
            </div>

            <div className="assessment-stats">
              <div className="assessment-stat-card">
                <span>📋</span>
                <div>
                  <h3>{assessments.length}</h3>
                  <p>Assessments</p>
                </div>
              </div>

              <div className="assessment-stat-card">
                <span>❓</span>
                <div>
                  <h3>{assessments.length * 10}</h3>
                  <p>Total Questions</p>
                </div>
              </div>

              <div className="assessment-stat-card">
                <span>⭐</span>
                <div>
                  <h3>Learn</h3>
                  <p>Every Day</p>
                </div>
              </div>
            </div>

            <div className="assessment-section-heading">
              <div>
                <h2>Choose Your Challenge</h2>
                <p>Pick a subject and start practising!</p>
              </div>
            </div>

            <div className="assessment-filters">
              {filters.map((filter) => (
                <button
                  key={filter}
                  className={selectedFilter === filter ? "selected" : ""}
                  onClick={() => setSelectedFilter(filter)}
                >
                  {filter}
                </button>
              ))}
            </div>

            <div className="assessment-grid">
              {filteredAssessments.map((item) => (
                <div
                  className={`assessment-card ${item.color}`}
                  key={item.id}
                >
                  <div className="assessment-card-top">
                    <span className="assessment-icon">{item.icon}</span>
                    <span className="assessment-level">{item.level}</span>
                  </div>

                  <span className="assessment-subject">{item.subject}</span>

                  <h3>{item.title}</h3>

                  <p className="assessment-description">
                    {item.description}
                  </p>

                  <div className="assessment-details">
                    <span>❓ {item.questions} Questions</span>
                    <span>⏱️ Timed</span>
                  </div>

                  <button
                    className="assessment-start-btn"
                    onClick={() => {
                      setError("");
                      setStartedAssessment(item);
                    }}
                  >
                    Start Assessment →
                  </button>
                </div>
              ))}
            </div>
          </>
        )}

        {phase === "pick" && startedAssessment && (
          <div className="assessment-modal-overlay">
            <div className="assessment-modal">
              <button
                className="assessment-modal-close"
                onClick={closeModal}
              >
                ✕
              </button>

              <span className="assessment-modal-icon">
                {startedAssessment.icon}
              </span>

              <h2>{startedAssessment.title}</h2>

              <p>
                Your {startedAssessment.subject} assessment is ready!
              </p>

              <div className="assessment-modal-info">
                <span>❓ {startedAssessment.questions} Questions</span>
                <span>⏱️ {chosenLevel.seconds}s per question</span>
              </div>

              {startedAssessment.key ? (
                <>
                  <p>Choose your language:</p>
                  <div className="quiz-lang">
                    {LANGUAGES.map((l) => (
                      <button
                        key={l.code}
                        className={language === l.code ? "selected" : ""}
                        onClick={() => setLanguage(l.code)}
                      >
                        {l.label}
                      </button>
                    ))}
                  </div>

                  <p>Choose your level:</p>
                  <div className="quiz-lang">
                    {LEVELS.map((l) => (
                      <button
                        key={l.value}
                        className={level === l.value ? "selected" : ""}
                        onClick={() => setLevel(l.value)}
                      >
                        {l.label}
                      </button>
                    ))}
                  </div>

                  {error && <div className="quiz-error">{error}</div>}

                  <button
                    className="assessment-modal-btn"
                    disabled={loading}
                    onClick={() =>
                      beginQuiz(startedAssessment, language, level)
                    }
                  >
                    {loading ? "Loading..." : "Let's go! 🚀"}
                  </button>
                </>
              ) : (
                <>
                  <p className="assessment-coming-soon">
                    🚀 Assessment questions will be available soon!
                  </p>
                  <button
                    className="assessment-modal-btn"
                    onClick={closeModal}
                  >
                    Got it!
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {phase === "quiz" && current && (
          <div className="quiz-card">
            <p>
              Question {index + 1} of {questions.length} · Level {activeLevel}
            </p>
            <div className="quiz-progress">
              <div
                className="quiz-progress-fill"
                style={{ width: `${(index / questions.length) * 100}%` }}
              />
			  
            </div>

            <div className="quiz-timer">
              <div
                className="quiz-timer-fill"
                style={{ width: `${timePercent}%`, background: timerColour }}
              />
            </div>
            <p className="quiz-timer-text">⏱️ {secondsLeft}s</p>

             {current.visual &&
              (isColour(current.visual) ? (
                <div
                  className="quiz-swatch"
                  style={{ background: current.visual }}
                />
              ) : isImage(current.visual) ? (
                <img className="quiz-image" src={current.visual} alt="" />
              ) : (
                <div className="quiz-visual">{current.visual}</div>
              ))}

            <h2 className="quiz-question">{current.text}</h2>

            <div className="quiz-options">
              {current.options.map((opt, i) => (
                <button
                  key={i}
                  className="quiz-option"
                  disabled={loading}
                  onClick={() => recordAnswer(i)}
                >
                  {opt}
                </button>
              ))}
            </div>

            <button
              className="quiz-skip"
              disabled={loading}
              onClick={() => recordAnswer(null)}
            >
              Skip this question
            </button>

            {error && <div className="quiz-error">{error}</div>}
            {needsRetry && (
              <button className="assessment-modal-btn" onClick={submitAll}>
                Try saving again
              </button>
            )}
          </div>
        )}

        {phase === "done" && result && (
          <div className="quiz-card quiz-result">
            <span className="assessment-modal-icon">🌟</span>
            <h2>All done!</h2>
            <div className="quiz-stars">
              {[1, 2, 3].map((n) => (
                <span key={n} className={n <= stars ? "star-on" : "star-off"}>
                  ⭐
                </span>
              ))}
            </div>
            <div className="quiz-score">
              {Math.round(result.accuracy_percent)}%
            </div>
            <p>{result.message}</p>

            {error && <div className="quiz-error">{error}</div>}

            {canLevelUp && (
              <button
                className="assessment-modal-btn"
                disabled={loading}
                onClick={() => beginQuiz(active, language, activeLevel + 1)}
              >
                {loading ? "Loading..." : "Next level →"}
              </button>
            )}
            {active && (
              <button
                className="assessment-modal-btn"
                disabled={loading}
                onClick={() => beginQuiz(active, language, activeLevel)}
              >
                Play this level again
              </button>
            )}
            <button className="assessment-modal-btn" onClick={backToStart}>
              Try another challenge
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default SolveAssessments;