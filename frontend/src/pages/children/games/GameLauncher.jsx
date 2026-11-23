import { useState } from 'react';
import { CATEGORIES } from './gameCatalog';
import './games.css';

function starsFor(score) {
  if (score >= 80) return 3;
  if (score >= 50) return 2;
  return 1;
}

export default function GameLauncher({ gameKey, onClose, onSave }) {
  const category = CATEGORIES[gameKey];
  const [stage, setStage] = useState('pick'); // pick | menu | playing | result | external | externalDone
  const [game, setGame] = useState(null);
  const [level, setLevel] = useState(1);
  const [round, setRound] = useState(0);
  const [result, setResult] = useState(null);
  const [openedAt, setOpenedAt] = useState(null);
  const [externalMinutes, setExternalMinutes] = useState(0);
  const [saveState, setSaveState] = useState('idle'); // idle | saving | saved | error

  if (!category) return null;

  const chooseGame = (item) => {
    setGame(item);
    setOpenedAt(null);
    setStage(item.type === 'external' ? 'external' : 'menu');
  };

  const startGame = (value) => {
    setLevel(value);
    setSaveState('idle');
    setRound((r) => r + 1);
    setStage('playing');
  };

  const handleFinish = (data) => {
    const payload = {
      ...data,
      
      game_key: gameKey.replace(/-/g, '_'),
      metrics: { ...data.metrics, variant: game.id },
    };
    setResult(payload);
    setStage('result');

    if (onSave) {
      setSaveState('saving');
      Promise.resolve(onSave(payload))
        .then(() => setSaveState('saved'))
        .catch(() => setSaveState('error'));
    } else {
      setSaveState('idle');
    }
  };

  const openExternal = () => {
    window.open(game.url, '_blank', 'noopener,noreferrer');
    if (!openedAt) setOpenedAt(Date.now());
  };

  const finishExternal = () => {
    const minutes = Math.max(1, Math.round((Date.now() - openedAt) / 60000));
    setExternalMinutes(minutes);
    setStage('externalDone');
  
  };

  const heading = stage === 'pick' || !game ? category.title : game.title;
  const Component = game && game.Component ? game.Component : null;

  return (
    <div className="gl-overlay" role="dialog" aria-modal="true" aria-label={heading}>
      <div className="gl-card">
        <button type="button" className="gl-close" onClick={onClose} aria-label="Close game">
          ✕
        </button>
        <h2 className="gl-title">{heading}</h2>

        {stage === 'pick' && (
          <>
            <p className="gl-sub">{category.intro}</p>
            <div className="gl-picks">
              {category.games.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className="gl-pick"
                  onClick={() => chooseGame(item)}
                >
                  <span className="gl-pick-emoji">{item.emoji}</span>
                  <span className="gl-pick-text">
                    <strong>{item.title}</strong>
                    <small>{item.description}</small>
                  </span>
                  <span className="gl-pick-go">{item.type === 'external' ? '↗' : '→'}</span>
                </button>
              ))}
            </div>
          </>
        )}

        {stage === 'menu' && game && (
          <>
            <p className="gl-sub">Pick how tricky you want it!</p>
            <div className="gl-levels">
              {game.levels.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  className="gl-level"
                  onClick={() => startGame(item.value)}
                >
                  <span className="gl-level-emoji">{item.emoji}</span>
                  <strong>{item.label}</strong>
                  <small>{item.hint}</small>
                </button>
              ))}
            </div>
            <button type="button" className="gl-btn gl-back" onClick={() => setStage('pick')}>
              ← All games
            </button>
          </>
        )}

        {stage === 'playing' && Component && (
          <Component key={round} level={level} onFinish={handleFinish} {...(game.props || {})} />
        )}

        {stage === 'result' && result && game && (
          <div className="gl-result">
            <div className="gl-stars">
              {[1, 2, 3].map((n) => (
                <span key={n} className={n <= starsFor(result.score) ? 'gl-star-on' : 'gl-star-off'}>
                  ⭐
                </span>
              ))}
            </div>
            <h3>Great job! 🎉</h3>
            <p>{game.summary(result)}</p>

            {saveState === 'saving' && <p className="gl-save-status">Saving your result...</p>}
            {saveState === 'saved' && (
              <p className="gl-save-status gl-save-status-ok">✅ Your result was saved.</p>
            )}
            {saveState === 'error' && (
              <p className="gl-save-status gl-save-status-warn">
                We could not save this result, but great job anyway!
              </p>
            )}

            <div className="gl-actions">
              <button type="button" className="gl-btn gl-btn-primary" onClick={() => startGame(level)}>
                Play again
              </button>
              <button type="button" className="gl-btn" onClick={() => setStage('menu')}>
                Change level
              </button>
              <button type="button" className="gl-btn" onClick={() => setStage('pick')}>
                More games
              </button>
              <button type="button" className="gl-btn" onClick={onClose}>
                Done
              </button>
            </div>
          </div>
        )}

        {stage === 'external' && game && (
          <div className="gl-external">
            <div className="gl-external-emoji">{game.emoji}</div>
            <p>
              You are going to another website: <strong>{game.sourceName}</strong>.
            </p>
            <p>Ask a grown-up if you need help. Come back here when you are done!</p>
            {game.notice && <p className="gl-external-notice">{game.notice}</p>}

            {!openedAt ? (
              <button type="button" className="gl-btn gl-btn-primary" onClick={openExternal}>
                Open game ↗
              </button>
            ) : (
              <div className="gl-actions">
                <button type="button" className="gl-btn gl-btn-primary" onClick={finishExternal}>
                  I'm back ✅
                </button>
                <button type="button" className="gl-btn" onClick={openExternal}>
                  Open again ↗
                </button>
              </div>
            )}

            <button type="button" className="gl-btn gl-back" onClick={() => setStage('pick')}>
              ← All games
            </button>
          </div>
        )}

        {stage === 'externalDone' && (
          <div className="gl-result">
            <div className="gl-stars">🌟</div>
            <h3>Thanks for exploring!</h3>
            <p>
              You explored for about {externalMinutes} minute{externalMinutes > 1 ? 's' : ''}.
            </p>
            <div className="gl-actions">
              <button type="button" className="gl-btn gl-btn-primary" onClick={() => setStage('pick')}>
                More games
              </button>
              <button type="button" className="gl-btn" onClick={onClose}>
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}