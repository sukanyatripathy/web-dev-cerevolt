import React, { useEffect, useState } from "react";
import ParentSidebar from "../../components/ParentSidebar";
import assessmentService from "../../services/assessmentService";
import "./childprogressreport.css";
import "./childscreening.css";

const SUBJECT_NAMES = {
  maths: "Maths",
  science: "Science",
  language: "Language",
  colours: "Colours",
  observation: "Observation",
};

const LANGUAGE_NAMES = { en: "English", hi: "Hindi", bn: "Bengali" };
const RISK_LABEL = { low: "Low", medium: "Medium", high: "High" };

const DEFAULT_DISCLAIMER =
  "This is a screening result, not a diagnosis. " +
  "Please consult a qualified professional for evaluation.";

function formatDate(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function RiskChip({ level }) {
  const key = RISK_LABEL[level] ? level : "low";
  return (
    <span className={`screening-chip screening-chip-${key}`}>
      {RISK_LABEL[key]}
    </span>
  );
}

function ChildScreening() {
  const [children, setChildren] = useState([]);
  const [childId, setChildId] = useState(null);
  const [rows, setRows] = useState([]);
  const [loadingChildren, setLoadingChildren] = useState(true);
  const [loadingRows, setLoadingRows] = useState(false);
  const [error, setError] = useState("");
  const [openId, setOpenId] = useState(null);

  useEffect(() => {
    let cancelled = false;
    assessmentService
      .getMyChildren()
      .then((list) => {
        if (cancelled) return;
        const safe = Array.isArray(list) ? list : [];
        setChildren(safe);
        if (safe.length) setChildId(safe[0].id);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || "Could not load your children.");
      })
      .finally(() => {
        if (!cancelled) setLoadingChildren(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!childId) return undefined;
    let cancelled = false;
    setLoadingRows(true);
    setError("");
    setOpenId(null);
    assessmentService
      .getHistory(childId)
      .then((data) => {
        if (!cancelled) setRows(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        if (!cancelled) {
          setRows([]);
          setError(err.message || "Could not load the results.");
        }
      })
      .finally(() => {
        if (!cancelled) setLoadingRows(false);
      });
    return () => {
      cancelled = true;
    };
  }, [childId]);

  const total = rows.length;
  const latest = rows[0] ? rows[0].result : null;
  const avgAccuracy = total
    ? Math.round(
        rows.reduce(
          (sum, r) => sum + ((r.result && r.result.accuracy_percent) || 0),
          0
        ) / total
      )
    : 0;
  const disclaimer =
    (latest && latest.disclaimer) || DEFAULT_DISCLAIMER;

  return (
    <div className="parent-layout">
      <ParentSidebar />

      <main className="parent-main progress-report-main">
        <header className="parent-topbar">
          <div>
            <p className="parent-breadcrumb">PARENT PORTAL / SCREENING</p>
            <h1>Screening Results</h1>
            <p className="parent-subtitle">
              Indicators from your child's quizzes. A screening aid, not a
              diagnosis.
            </p>
          </div>
        </header>

        {loadingChildren && <p className="screening-note">Loading...</p>}

        {error && <div className="screening-error">{error}</div>}

        {!loadingChildren && !error && children.length === 0 && (
          <div className="progress-report-panel screening-empty">
            <h3>No linked child yet</h3>
            <p>
              Once a child account is linked and verified, their screening
              results will appear here.
            </p>
          </div>
        )}

        {children.length > 0 && (
          <div className="screening-child-picker">
            {children.map((c) => (
              <button
                key={c.id}
                className={c.id === childId ? "selected" : ""}
                onClick={() => setChildId(c.id)}
              >
                {c.name}
              </button>
            ))}
          </div>
        )}

        {childId && (
          <>
            <section className="progress-summary-grid">
              <article className="progress-summary-card">
                <span>Assessments Completed</span>
                <h2>{total}</h2>
                <p>Latest 50 records</p>
              </article>

              <article className="progress-summary-card">
                <span>Average Score</span>
                <h2>{avgAccuracy}%</h2>
                <p>Across all assessments</p>
              </article>

              <article className="progress-summary-card">
                <span>Attention Indicator</span>
                <div className="screening-card-chip">
                  <RiskChip level={latest ? latest.attention_risk : "low"} />
                </div>
                <p>Latest assessment</p>
              </article>

              <article className="progress-summary-card">
                <span>Learning Indicator</span>
                <div className="screening-card-chip">
                  <RiskChip level={latest ? latest.learning_risk : "low"} />
                </div>
                <p>Latest assessment</p>
              </article>
            </section>

            <section className="progress-report-panel progress-activity-panel">
              <div className="progress-panel-heading">
                <div>
                  <h3>Assessment History</h3>
                  <p>Open "Details" to see the indicators for each quiz</p>
                </div>
                <span className="progress-report-tag">Most recent first</span>
              </div>

              {loadingRows && <p className="screening-note">Loading...</p>}

              {!loadingRows && total === 0 && !error && (
                <p className="screening-note">
                  No completed assessments yet.
                </p>
              )}

              {total > 0 && (
                <div className="progress-table-wrapper">
                  <table className="progress-activity-table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Subject</th>
                        <th>Level</th>
                        <th>Score</th>
                        <th>Stars</th>
                        <th>Timed out</th>
                        <th>Attention</th>
                        <th>Learning</th>
                        <th />
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((row) => {
                        const r = row.result || {};
                        const stars = r.stars || 0;
                        const open = openId === row.id;
                        const indicators = Array.isArray(r.indicators)
                          ? r.indicators
                          : [];
                        return (
                          <React.Fragment key={row.id}>
                            <tr>
                              <td>{formatDate(row.completed_at)}</td>
                              <td>
                                {SUBJECT_NAMES[row.subject] || row.subject}
                              </td>
                              <td>{row.level || r.level || 1}</td>
                              <td>{Math.round(r.accuracy_percent || 0)}%</td>
                              <td>{stars}/3</td>
                              <td>{r.timed_out_count || 0}</td>
                              <td>
                                <RiskChip level={r.attention_risk} />
                              </td>
                              <td>
                                <RiskChip level={r.learning_risk} />
                              </td>
                              <td>
                                <button
                                  className="screening-toggle"
                                  onClick={() =>
                                    setOpenId(open ? null : row.id)
                                  }
                                >
                                  {open ? "Hide" : "Details"}
                                </button>
                              </td>
                            </tr>
                            {open && (
                              <tr className="screening-detail-row">
                                <td colSpan={9}>
                                  <strong>
                                    Language:{" "}
                                    {LANGUAGE_NAMES[row.language] ||
                                      row.language}
                                  </strong>
                                  <span className="screening-detail-meta">
                                    Average answer time:{" "}
                                    {((r.avg_response_ms || 0) / 1000).toFixed(
                                      1
                                    )}
                                    s · Skipped: {r.skipped_count || 0}
                                  </span>
                                  {indicators.length > 0 ? (
                                    <ul>
                                      {indicators.map((text, i) => (
                                        <li key={i}>{text}</li>
                                      ))}
                                    </ul>
                                  ) : (
                                    <p>No indicators were noted.</p>
                                  )}
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </>
        )}

        <p className="screening-note">{disclaimer}</p>
      </main>
    </div>
  );
}

export default ChildScreening;