import React, { useEffect, useState } from "react";
import Sidebar from "../../components/Sidebar";
import adminAssessmentService from "../../services/adminAssessmentService";
import "./adminreport.css";
import "./childrecords.css";

const SUBJECT_NAMES = {
  maths: "Maths",
  science: "Science",
  language: "Language",
  colours: "Colours",
  observation: "Observation",
};
const LANGUAGE_NAMES = { en: "English", hi: "Hindi", bn: "Bengali" };
const RISK_LABEL = { low: "Low", medium: "Medium", high: "High" };

function formatDate(value) {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function RiskChip({ level }) {
  if (!RISK_LABEL[level]) return <span className="cr-none">-</span>;
  return <span className={`cr-chip cr-chip-${level}`}>{RISK_LABEL[level]}</span>;
}

function answerStatus(a) {
  if (a.timed_out) return "Timed out";
  if (a.chosen === null || a.chosen === undefined) return "Skipped";
  return a.is_correct ? "Correct" : "Wrong";
}

function AdminChildRecords() {
  const [overview, setOverview] = useState(null);
  const [query, setQuery] = useState("");
  const [children, setChildren] = useState([]);
  const [loadingList, setLoadingList] = useState(true);
  const [selectedId, setSelectedId] = useState(null);
  const [detail, setDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [openId, setOpenId] = useState(null);
  const [error, setError] = useState("");
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    adminAssessmentService
      .getOverview()
      .then(setOverview)
      .catch((err) => setError(err.message || "Could not load the overview."));
  }, []);

  // Search runs 0.3 s after the admin stops typing.
  useEffect(() => {
    let cancelled = false;
    setLoadingList(true);
    const timer = setTimeout(() => {
      adminAssessmentService
        .searchChildren(query)
        .then((data) => {
          if (!cancelled) setChildren(Array.isArray(data) ? data : []);
        })
        .catch((err) => {
          if (!cancelled) {
            setChildren([]);
            setError(err.message || "Search failed.");
          }
        })
        .finally(() => {
          if (!cancelled) setLoadingList(false);
        });
    }, 300);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query]);

  useEffect(() => {
    if (!selectedId) return undefined;
    let cancelled = false;
    setLoadingDetail(true);
    setOpenId(null);
    adminAssessmentService
      .getChild(selectedId)
      .then((data) => {
        if (!cancelled) setDetail(data);
      })
      .catch((err) => {
        if (!cancelled) {
          setDetail(null);
          setError(err.message || "Could not load this child.");
        }
      })
      .finally(() => {
        if (!cancelled) setLoadingDetail(false);
      });
    return () => {
      cancelled = true;
    };
  }, [selectedId]);

  const downloadCsv = async () => {
    setExporting(true);
    setError("");
    try {
      const text = await adminAssessmentService.exportCsv();
      const blob = new Blob(["\ufeff" + String(text || "")], {
        type: "text/csv;charset=utf-8",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `assessment-data-${new Date()
        .toISOString()
        .slice(0, 10)}.csv`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err.message || "Could not download the data.");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="admin-layout">
      <Sidebar />

      <main className="admin-main">
        <header className="admin-header">
          <div className="header-search" />
          <div className="header-actions">
            <div className="admin-profile">
              <div className="admin-avatar">A</div>
              <div className="admin-profile-info">
                <strong>Administrator</strong>
                <span>System Admin</span>
              </div>
            </div>
          </div>
        </header>

        <div className="page-container">
          <div className="admin-report-heading cr-heading">
            <div>
              <h1>Children &amp; Analysis</h1>
              <p>
                Find a child, review every quiz and download data for
                research. Screening indicators, not diagnoses.
              </p>
            </div>
            <button
              className="cr-download"
              onClick={downloadCsv}
              disabled={exporting}
            >
              {exporting ? "Preparing..." : "Download research data (CSV)"}
            </button>
          </div>

          {error && <div className="cr-error">{error}</div>}

          {overview && (
            <>
              <section className="report-summary">
                <div className="report-summary-card">
                  <span>Children</span>
                  <strong>{overview.children}</strong>
                </div>
                <div className="report-summary-card">
                  <span>Played at least once</span>
                  <strong>{overview.children_with_quizzes}</strong>
                </div>
                <div className="report-summary-card">
                  <span>Quizzes completed</span>
                  <strong>{overview.assessments}</strong>
                </div>
                <div className="report-summary-card">
                  <span>Average score</span>
                  <strong>{overview.avg_accuracy}%</strong>
                </div>
                <div className="report-summary-card">
                  <span>Timed-out answers</span>
                  <strong>{overview.timed_out_answers}</strong>
                </div>
              </section>

              <section className="cr-grid">
                <div className="report-table-panel cr-panel">
                  <h3>By subject</h3>
                  {overview.by_subject.map((r) => (
                    <div className="cr-bar-row" key={r.subject}>
                      <span>{SUBJECT_NAMES[r.subject] || r.subject}</span>
                      <div className="cr-bar">
                        <div
                          className="cr-bar-fill"
                          style={{ width: `${r.avg_accuracy}%` }}
                        />
                      </div>
                      <small>
                        {r.avg_accuracy}% · {r.count} quizzes
                      </small>
                    </div>
                  ))}
                  {overview.by_subject.length === 0 && (
                    <p className="cr-none">No quizzes yet.</p>
                  )}
                </div>

                <div className="report-table-panel cr-panel">
                  <h3>By level</h3>
                  {overview.by_level.map((r) => (
                    <div className="cr-bar-row" key={r.level}>
                      <span>Level {r.level}</span>
                      <div className="cr-bar">
                        <div
                          className="cr-bar-fill"
                          style={{ width: `${r.avg_accuracy}%` }}
                        />
                      </div>
                      <small>
                        {r.avg_accuracy}% · {r.count} quizzes
                      </small>
                    </div>
                  ))}
                  {overview.by_level.length === 0 && (
                    <p className="cr-none">No quizzes yet.</p>
                  )}
                </div>

                <div className="report-table-panel cr-panel">
                  <h3>Indicator spread</h3>
                  <p className="cr-small">Attention (all quizzes)</p>
                  <div className="cr-risk-row">
                    {["low", "medium", "high"].map((k) => (
                      <span key={k} className={`cr-chip cr-chip-${k}`}>
                        {RISK_LABEL[k]} {overview.attention_risk[k]}
                      </span>
                    ))}
                  </div>
                  <p className="cr-small">Learning (all quizzes)</p>
                  <div className="cr-risk-row">
                    {["low", "medium", "high"].map((k) => (
                      <span key={k} className={`cr-chip cr-chip-${k}`}>
                        {RISK_LABEL[k]} {overview.learning_risk[k]}
                      </span>
                    ))}
                  </div>
                </div>
              </section>
            </>
          )}

          <section className="report-table-panel">
            <div className="report-toolbar">
              <input
                type="search"
                placeholder="Search a child by name, email or code (C003)..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>

            <div className="report-table-wrapper">
              <table className="report-table">
                <thead>
                  <tr>
                    <th>Code</th>
                    <th>Name</th>
                    <th>Parent</th>
                    <th>Quizzes</th>
                    <th>Last quiz</th>
                    <th>Attention</th>
                    <th>Learning</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {children.map((c) => (
                    <tr
                      key={c.id}
                      className={c.id === selectedId ? "cr-selected" : ""}
                    >
                      <td>{c.code}</td>
                      <td>{c.name}</td>
                      <td>{c.parents.length ? c.parents.join(", ") : "-"}</td>
                      <td>{c.assessments}</td>
                      <td>{formatDate(c.last_assessment)}</td>
                      <td>
                        <RiskChip level={c.attention_risk} />
                      </td>
                      <td>
                        <RiskChip level={c.learning_risk} />
                      </td>
                      <td>
                        <button
                          className="cr-view"
                          onClick={() => setSelectedId(c.id)}
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                  {!loadingList && children.length === 0 && (
                    <tr>
                      <td colSpan="8" className="report-empty">
                        No children found.
                      </td>
                    </tr>
                  )}
                  {loadingList && (
                    <tr>
                      <td colSpan="8" className="report-empty">
                        Loading...
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {selectedId && (
            <section className="report-table-panel cr-detail">
              {loadingDetail && <p>Loading...</p>}
              {detail && !loadingDetail && (
                <>
                  <div className="cr-detail-head">
                    <div>
                      <h2>{detail.name}</h2>
                      <p>
                        Code {detail.code} · {detail.email || "no email"} ·
                        Parent:{" "}
                        {detail.parents.length
                          ? detail.parents.join(", ")
                          : "not linked"}
                      </p>
                    </div>
                  </div>

                  {detail.assessments.length === 0 && (
                    <p className="cr-none">No completed quizzes yet.</p>
                  )}

                  {detail.assessments.length > 0 && (
                    <div className="report-table-wrapper">
                      <table className="report-table">
                        <thead>
                          <tr>
                            <th>Date</th>
                            <th>Subject</th>
                            <th>Language</th>
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
                          {detail.assessments.map((a) => {
                            const r = a.result || {};
                            const open = openId === a.id;
                            const indicators = Array.isArray(r.indicators)
                              ? r.indicators
                              : [];
                            return (
                              <React.Fragment key={a.id}>
                                <tr>
                                  <td>{formatDate(a.completed_at)}</td>
                                  <td>
                                    {SUBJECT_NAMES[a.subject] || a.subject}
                                  </td>
                                  <td>
                                    {LANGUAGE_NAMES[a.language] || a.language}
                                  </td>
                                  <td>{a.level}</td>
                                  <td>
                                    {Math.round(r.accuracy_percent || 0)}%
                                  </td>
                                  <td>{r.stars || 0}/3</td>
                                  <td>{r.timed_out_count || 0}</td>
                                  <td>
                                    <RiskChip level={r.attention_risk} />
                                  </td>
                                  <td>
                                    <RiskChip level={r.learning_risk} />
                                  </td>
                                  <td>
                                    <button
                                      className="cr-view"
                                      onClick={() =>
                                        setOpenId(open ? null : a.id)
                                      }
                                    >
                                      {open ? "Hide" : "Answers"}
                                    </button>
                                  </td>
                                </tr>
                                {open && (
                                  <tr className="cr-answers-row">
                                    <td colSpan="10">
                                      {indicators.length > 0 && (
                                        <ul className="cr-indicators">
                                          {indicators.map((t, i) => (
                                            <li key={i}>{t}</li>
                                          ))}
                                        </ul>
                                      )}
                                      <table className="cr-answers">
                                        <thead>
                                          <tr>
                                            <th>#</th>
                                            <th>Question</th>
                                            <th>Chosen</th>
                                            <th>Correct</th>
                                            <th>Result</th>
                                            <th>Time</th>
                                          </tr>
                                        </thead>
                                        <tbody>
                                          {a.answers.map((x, i) => (
                                            <tr key={i}>
                                              <td>{i + 1}</td>
                                              <td>
                                                {x.visual && !x.visual.startsWith("#")
                                                  ? `${x.visual} `
                                                  : ""}
                                                {x.question}
                                              </td>
                                              <td>{x.chosen ?? "-"}</td>
                                              <td>{x.correct_answer ?? "-"}</td>
                                              <td>{answerStatus(x)}</td>
                                              <td>
                                                {(x.response_time_ms / 1000).toFixed(1)}s
                                              </td>
                                            </tr>
                                          ))}
                                        </tbody>
                                      </table>
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
                </>
              )}
            </section>
          )}
        </div>
      </main>
    </div>
  );
}

export default AdminChildRecords;