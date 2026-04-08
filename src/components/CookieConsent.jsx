import React from 'react';

const LS_KEY = 'luna-cookie-consent-v1';
const GLOBAL_INSTANCE_KEY = '__luna_cookie_consent_instance_v1__';

function safeRead() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function writeCookie(name, value, maxAgeDays = 180) {
  try {
    const maxAge = Math.floor(maxAgeDays * 24 * 60 * 60);
    document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}; Max-Age=${maxAge}; Path=/; SameSite=Lax`;
  } catch {
    // ignore
  }
}

export default function CookieConsent() {
  const [blocked, setBlocked] = React.useState(false);
  const [state, setState] = React.useState(() => safeRead());
  const dismissed = Boolean(state?.choice);

  React.useEffect(() => {
    try {
      if (window[GLOBAL_INSTANCE_KEY]) {
        setBlocked(true);
        return undefined;
      }
      window[GLOBAL_INSTANCE_KEY] = true;
      return () => {
        try {
          window[GLOBAL_INSTANCE_KEY] = false;
        } catch {
          // ignore
        }
      };
    } catch {
      return undefined;
    }
  }, []);

  const save = (choice) => {
    const next = { choice, savedAt: new Date().toISOString() };
    setState(next);
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(next));
    } catch {
      // ignore
    }
    writeCookie('luna_cookie_consent', choice);
  };

  if (blocked || dismissed) return null;

  return (
    <div className="luna-consent" role="region" aria-label="Cookie preferences">
      <div className="luna-consent__card">
        <div className="luna-consent__text">
          <div className="luna-consent__title">Cookies &amp; local storage</div>
          <div className="luna-consent__desc">
            We use essential storage to keep forms working and improve reliability. Optional preferences can be saved
            too. We don&apos;t run advertising cookies here.
          </div>
        </div>
        <div className="luna-consent__actions">
          <button type="button" className="luna-consent__btn luna-consent__btn--outline" onClick={() => save('essential')}>
            Essential only
          </button>
          <button type="button" className="luna-button luna-button--gradient luna-consent__btn" onClick={() => save('all')}>
            Accept
          </button>
        </div>
      </div>
      <style jsx>{`
        .luna-consent {
          position: fixed;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 119;
          padding: 0 1rem 1rem;
          pointer-events: none;
        }

        .luna-consent__card {
          pointer-events: auto;
          margin: 0 auto;
          width: min(920px, 100%);
          display: flex;
          gap: 0.9rem;
          align-items: center;
          justify-content: space-between;
          padding: 0.9rem 1rem;
          border-radius: 16px;
          background: rgba(255, 255, 255, 0.92);
          border: 1px solid rgba(17, 24, 39, 0.08);
          box-shadow: 0 18px 45px rgba(0, 0, 0, 0.14);
          backdrop-filter: blur(10px);
        }

        .luna-consent__title {
          font-weight: 900;
          color: var(--luna-text-primary);
          letter-spacing: -0.01em;
        }

        .luna-consent__desc {
          margin-top: 0.25rem;
          font-size: 0.9rem;
          color: var(--luna-text-secondary);
        }

        .luna-consent__actions {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          flex-shrink: 0;
        }

        .luna-consent__btn {
          min-height: 44px;
          padding: 0 1rem;
          border-radius: 12px;
          font-weight: 800;
        }

        .luna-consent__btn--outline {
          border: 1px solid rgba(17, 24, 39, 0.12);
          background: rgba(17, 24, 39, 0.04);
          color: var(--luna-text-primary);
          cursor: pointer;
        }

        .luna-consent__btn--outline:hover {
          background: rgba(17, 24, 39, 0.08);
        }

        @media (max-width: 640px) {
          .luna-consent__card {
            flex-direction: column;
            align-items: stretch;
            text-align: center;
          }
          .luna-consent__actions {
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
}

