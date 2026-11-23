import { useCallback, useEffect, useState } from "react";
import {
  downloadChildCsv,
  getChildAnalysis,
  getMyChildren,
  linkChild,
} from "../../services/gameplayService.js";
import "./gameresults.css";

const BAND_COLORS = {
  Proficient: "#28a58a",
  Developing: "#e5a33c",
  Beginner: "#7f8fe0",
};

function formatDate(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function errorText(error, fallback) {
  const data = error?.data;
  if (data && typeof data === "object") {
    const value = data.detail || data.child_code;
    if (Array.isArray(value) && value.length) return String(value[0]);
    if (typeof value === "string" && value) return value;
  }
  if (error?.message && error.message !== "Request failed.") return error.message;
  return fallback;
}

function GameResultsSection() {
  const [children, setChildren] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [analysisError, setAnalysisError] = useState("");
  const [code, setCode] = useState("");
  const [linking, setLinking] = useState(false);
  const [linkMessage, setLinkMessage] = useState({ type: "", text: "" });
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState("");

  const loadChildren = useCallback(async (preferId) => {
    try {
      const list = await getMyChildren();
      const items = Array.isArray(list) ? list : [];
      setChildren(items);
      setSelectedId((current) => {
        if (preferId) return preferId;
        if (current) return current;
        return items[0] ? items[0].child_id : null;
      });
      setLoadError("");
    } catch (error) {
      setLoadError(errorText(error, "Could not load your linked children."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadChildren();
  }, [loadChildren]);

  useEffect(() => {
    if (!selectedId) return undefined;
    let active = true;
    getChildAnalysis(selectedId)
      .then((data) => {
        if (!active) return;
        setAnalysis(data);
        setAnalysisError("");
      })
      .catch((error) => {
        if (active) setAnalysisError(errorText(error, "Could not load game results."));
      });
    return () => {
      active = false;
    };
  }, [selectedId]);

  const handleSelect = (event) => {
    setAnalysis(null);
    setDownloadError("");
    setSelectedId(Number(event.target.value));
  };

  const handleLink = async (event) => {
    event.preventDefault();
    const trimmed = code.trim();
    if (!trimmed) {
      setLinkMessage({ type: "error", text: "Please enter your child's Family ID code." });
      return;
    }

    setLinking(true);
    setLinkMessage({ type: "", text: "" });
    try {
      const result = await linkChild(trimmed);
      setLinkMessage({
        type: "success",
        text: result.already_linked
          ? "This child is already linked to your account."
          : "Child linked successfully.",
      });
      setCode("");
      setAnalysis(null);
      await loadChildren(result.child_id);
    } catch (error) {
      setLinkMessage({
        type: "error",
        text: errorText(error, "Could not link this child. Please check the code."),
      });
    } finally {
      setLinking(false);
    }
  };

  const handleDownload = async () => {
    if (!selectedId) return;
    setDownloading(true);
    setDownloadError("");
    try {
      await downloadChildCsv(selectedId);
    } catch (error) {
      setDownloadError(errorText(error, "Could not download the CSV file."));
    } finally {
      setDownloading(false);
    }
  };

  const linkForm = (
    <form className="gr-link-form" onSubmit={handleLink}>
      <label htmlFor="gr-child-code">
        {children.length ? "Link another child" : "Link your child"}
      </label>
      <div className="gr-link-row">
        <input
          id="gr-child-code"
          type="text"
          placeholder="Family ID, e.g. K7M2-9QXA"
          value={code}
          onChange={(event) => setCode(event.target.value)}
          autoComplete="off"
          maxLength={20}
        />
        <button type="submit" disabled={linking}>
          {linking ? "Linking..." : "Link child"}
        </button>
      </div>
      {linkMessage.text && (
        <p className={`gr-message gr-message-${linkMessage.type}`} role="status">
          {linkMessage.text}
        </p>
      )}
    </form>
  );

  if (loading) {
    return (
      <section className="progress-report-panel">
        <p className="gr-muted">Loading game results...</p>
      </section>
    );
  }

  return (
    <section className="progress-report-panel gr-section">
      <div className="progress-panel-heading">
        <div>
          <h3>Game Results</h3>
          <p>Live results from your child's learning games</p>
        </div>
        <span className="progress-report-tag">Live data</span>
      </div>

      {loadError && <p className="gr-message gr-message-error">{loadError}</p>}

      {!loadError && children.length === 0 && (
        <>
          <p className="gr-muted">
            No child is linked yet. Ask your child to open their dashboard and
            show you their Family ID, then enter it below.
          </p>
          {linkForm}
        </>
      )}

      {children.length > 0 && (
        <>
          <div className="gr-toolbar">
            <div className="gr-select-wrap">
              <label htmlFor="gr-child-select">Child</label>
              <select
                id="gr-child-select"
                value={selectedId || ""}
                onChange={handleSelect}
              >
                {children.map((child) => (
                  <option key={child.child_id} value={child.child_id}>
                    {child.display_name} (ID {child.child_id})
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              className="gr-download"
              onClick={handleDownload}
              disabled={downloading || !selectedId}
            >
              {downloading ? "Preparing..." : "⬇ Download CSV"}
            </button>
          </div>

          {downloadError && <p className="gr-message gr-message-error">{downloadError}</p>}
          {analysisError && <p className="gr-message gr-message-error">{analysisError}</p>}
          {!analysis && !analysisError && <p className="gr-muted">Loading results...</p>}

          {analysis && (
            <>
              <div className="progress-summary-grid gr-summary">
                <article className="progress-summary-card">
                  <span>Games Played</span>
                  <h2>{analysis.overview.total_sessions}</h2>
                  <p>Total recorded plays</p>
                </article>
                <article className="progress-summary-card">
                  <span>Play Time</span>
                  <h2>{analysis.overview.total_play_minutes} min</h2>
                  <p>Total time in games</p>
                </article>
                <article className="progress-summary-card">
                  <span>Days Played</span>
                  <h2>{analysis.overview.days_played_last_7}</h2>
                  <p>In the last 7 days</p>
                </article>
                <article className="progress-summary-card">
                  <span>Last Played</span>
                  <h2 className="gr-small-value">{formatDate(analysis.overview.last_played)}</h2>
                  <p>Most recent game</p>
                </article>
              </div>

              {analysis.games.length === 0 ? (
                <p className="gr-muted">
                  No game results yet. They will appear here after your child plays.
                </p>
              ) : (
                <div className="subject-progress-list gr-games">
                  {analysis.games.map((game) => (
                    <div className="subject-progress-item" key={game.game_key}>
                      <div className="subject-progress-heading">
                        <strong>{game.game}</strong>
                        <span>{Math.round(game.recent_average)}%</span>
                      </div>
                      <div className="subject-progress-track">
                        <div
                          className="subject-progress-fill"
                          style={{
                            width: `${Math.min(100, game.recent_average)}%`,
                            backgroundColor: BAND_COLORS[game.performance_band] || "#527bc5",
                          }}
                        />
                      </div>
                      <small>
                        {game.performance_band} · Trend: {game.trend} · {game.sessions} plays ·
                        Best {game.best_score}%
                      </small>
                      {game.variants.length > 0 && (
                        <small>
                          {game.variants
                            .map((v) => `${v.variant.replace(/-/g, " ")}: ${v.average_score}%`)
                            .join(" · ")}
                        </small>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {analysis.highlights.strongest_game && (
                <p className="gr-highlight">
                  Strongest game: <strong>{analysis.highlights.strongest_game}</strong> · Needs
                  more practice: <strong>{analysis.highlights.needs_practice_game}</strong>
                </p>
              )}

              <p className="gr-disclaimer">{analysis.disclaimer}</p>
            </>
          )}

          {linkForm}
        </>
      )}
    </section>
  );
}

export default GameResultsSection;