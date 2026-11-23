import React, { useCallback, useEffect, useRef, useState } from "react";
import ChildSidebar from "../../components/ChildSidebar";
import videoService from "../../services/videoService";
import "./watchvideos.css";
import "./watchlearn.css";

const TOPICS = [
  { value: "science", label: "Science", emoji: "🪐" },
  { value: "maths", label: "Maths", emoji: "🔢" },
  { value: "language", label: "Language", emoji: "📚" },
  { value: "colours", label: "Colours", emoji: "🎨" },
  { value: "observation", label: "Observation", emoji: "🔍" },
  { value: "geography", label: "Geography", emoji: "🌍" },
  { value: "technology", label: "Technology", emoji: "💻" },
  { value: "general", label: "General Knowledge", emoji: "💡" },
];

const AGE_GROUPS = [
  { value: "3-5", label: "3 to 5 years" },
  { value: "6-8", label: "6 to 8 years" },
  { value: "9-12", label: "9 to 12 years" },
];

const LANGUAGES = [
  { value: "en", label: "English" },
  { value: "hi", label: "Hindi" },
  { value: "bn", label: "Bengali" },
];

function topicInfo(value) {
  return TOPICS.find((t) => t.value === value) || { label: value, emoji: "🎬" };
}

function labelOf(list, value) {
  const item = list.find((x) => x.value === value);
  return item ? item.label : value;
}

function WatchLearn() {
  const [filters, setFilters] = useState({ topic: "", age_group: "", language: "" });
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedVideo, setSelectedVideo] = useState(null);

  const watchIdRef = useRef(null);
  const startedAtRef = useRef(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");
    videoService
      .list(filters)
      .then((data) => {
        if (!cancelled) setVideos(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || "Could not load videos.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [filters]);

  // Sends how long the video window has been open (in seconds).
  const sendProgress = useCallback(() => {
    if (!watchIdRef.current) return;
    const seconds = Math.round((Date.now() - startedAtRef.current) / 1000);
    videoService.updateWatch(watchIdRef.current, seconds).catch(() => {});
  }, []);

  useEffect(() => {
    if (!selectedVideo) return undefined;
    const timer = setInterval(sendProgress, 15000);
    return () => clearInterval(timer);
  }, [selectedVideo, sendProgress]);

  useEffect(() => {
    return () => sendProgress();
  }, [sendProgress]);

  function openVideo(video) {
    setSelectedVideo(video);
    startedAtRef.current = Date.now();
    watchIdRef.current = null;
    videoService
      .startWatch(video.id)
      .then((data) => {
        watchIdRef.current = data.watch_id;
      })
      .catch(() => {});
  }

  function closeVideo() {
    sendProgress();
    watchIdRef.current = null;
    setSelectedVideo(null);
  }

  function changeFilter(field, value) {
    setFilters((prev) => ({ ...prev, [field]: value }));
  }

  return (
    <div className="child-layout">
      <ChildSidebar />

      <main className="watch-page">
        <section className="watch-header">
          <div>
            <p className="watch-eyebrow">LEARN SOMETHING NEW</p>
            <h1>Watch & Learn 🎬</h1>
            <p>Explore fun videos and discover something amazing every day!</p>
          </div>
          <div className="watch-header-emoji">🎥</div>
        </section>

        <section className="watch-library">
          <div className="watch-section-heading">
            <div>
              <h2>Explore Videos</h2>
              <p>Choose a topic, age group and language.</p>
            </div>
          </div>

          <div className="wl-filters">
            <select
              className="wl-select"
              value={filters.topic}
              onChange={(e) => changeFilter("topic", e.target.value)}
            >
              <option value="">All topics</option>
              {TOPICS.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>

            <select
              className="wl-select"
              value={filters.age_group}
              onChange={(e) => changeFilter("age_group", e.target.value)}
            >
              <option value="">All ages</option>
              {AGE_GROUPS.map((a) => (
                <option key={a.value} value={a.value}>
                  {a.label}
                </option>
              ))}
            </select>

            <select
              className="wl-select"
              value={filters.language}
              onChange={(e) => changeFilter("language", e.target.value)}
            >
              <option value="">All languages</option>
              {LANGUAGES.map((l) => (
                <option key={l.value} value={l.value}>
                  {l.label}
                </option>
              ))}
            </select>
          </div>

          {error && <div className="wl-error">{error}</div>}
          {loading && <div className="wl-empty">Loading videos...</div>}
          {!loading && !error && videos.length === 0 && (
            <div className="wl-empty">No videos found. Try different choices.</div>
          )}

          <div className="watch-video-grid">
            {videos.map((video) => {
              const topic = topicInfo(video.topic);
              return (
                <article className="watch-video-card" key={video.id}>
                  <div className={`watch-video-thumbnail subject-${video.topic}`}>
                    <span>{topic.emoji}</span>
                    {video.duration_minutes ? (
                      <small>{video.duration_minutes} min</small>
                    ) : null}
                  </div>

                  <div className="watch-video-info">
                    <div className="watch-video-meta">
                      <span>{topic.label}</span>
                      <span>{labelOf(AGE_GROUPS, video.age_group)}</span>
                      <span>{labelOf(LANGUAGES, video.language)}</span>
                    </div>

                    <h3>{video.title}</h3>
                    <p>{video.description}</p>

                    <button onClick={() => openVideo(video)}>
                      Watch Now <span>▶</span>
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        {selectedVideo && (
          <div className="watch-modal-overlay" onClick={closeVideo}>
            <div
              className="watch-modal wl-modal"
              onClick={(event) => event.stopPropagation()}
            >
              <button className="watch-modal-close" onClick={closeVideo}>
                ×
              </button>

              <h2>{selectedVideo.title}</h2>

              <div className="wl-player">
                <iframe
                  src={`https://www.youtube-nocookie.com/embed/${selectedVideo.youtube_id}?rel=0&modestbranding=1`}
                  title={selectedVideo.title}
                  allow="encrypted-media; picture-in-picture"
                  allowFullScreen
                />
              </div>

              <p>{selectedVideo.description}</p>

              <button className="watch-modal-done" onClick={closeVideo}>
                Done
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default WatchLearn;