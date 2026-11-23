import { useEffect, useState } from "react";
import { getMyChildCode } from "../../services/gameplayService.js";
import "./familyidcard.css";

function FamilyIdCard() {
  const [info, setInfo] = useState(null);
  const [visible, setVisible] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  
  useEffect(() => {
    let active = true;
    getMyChildCode()
      .then((data) => {
        if (active) setInfo(data);
      })
      .catch(() => {
        if (active) setError("We could not load your Family ID right now.");
      });
    return () => {
      active = false;
    };
  }, []);

  const handleCopy = async () => {
    if (!info) return;
    try {
      await navigator.clipboard.writeText(info.child_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <section className="family-id-card" aria-label="Family ID">
      <div className="family-id-icon" aria-hidden="true">🔑</div>

      <div className="family-id-body">
        <span className="family-id-kicker">FOR YOUR GROWN-UP</span>
        <h2>My Family ID</h2>
        <p>
          This is a secret code. Show it only to your parent so they can join
          your learning journey.
        </p>

        {error && <p className="family-id-error">{error}</p>}

        {info && (
          <>
            <div className="family-id-code" aria-live="polite">
              {visible ? info.child_code : "••••-••••"}
            </div>

            <div className="family-id-actions">
              <button type="button" onClick={() => setVisible((v) => !v)}>
                {visible ? "Hide code" : "Show my code"}
              </button>
              {visible && (
                <button type="button" onClick={handleCopy}>
                  {copied ? "Copied!" : "Copy"}
                </button>
              )}
            </div>

            <small>
              Grown-ups linked: {info.linked_parents}
            </small>
          </>
        )}
      </div>
    </section>
  );
}

export default FamilyIdCard;