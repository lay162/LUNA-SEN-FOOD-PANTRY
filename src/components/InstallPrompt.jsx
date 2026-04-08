import React from 'react';

const LS_DISMISSED_KEY = 'luna-install-dismissed-v1';

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = React.useState(null);
  const [dismissed, setDismissed] = React.useState(() => {
    try {
      return localStorage.getItem(LS_DISMISSED_KEY) === '1';
    } catch {
      return false;
    }
  });

  React.useEffect(() => {
    const onBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt);
  }, []);

  if (dismissed || !deferredPrompt) return null;

  return (
    <div className="luna-install">
      <div className="luna-install__card" role="region" aria-label="Install LUNA SEN PANTRY app">
        <div className="luna-install__text">
          <div className="luna-install__title">
            Install the <span className="luna-install__brand">LUNA</span> app
          </div>
          <div className="luna-install__desc">Quick access to support, donate and volunteer.</div>
        </div>
        <div className="luna-install__actions">
          <button
            type="button"
            className="luna-button luna-button--gradient luna-install__btn"
            onClick={async () => {
              try {
                deferredPrompt.prompt();
                await deferredPrompt.userChoice;
              } finally {
                setDeferredPrompt(null);
              }
            }}
          >
            Install
          </button>
          <button
            type="button"
            className="luna-install__dismiss"
            onClick={() => {
              try {
                localStorage.setItem(LS_DISMISSED_KEY, '1');
              } catch {
                // ignore
              }
              setDismissed(true);
            }}
            aria-label="Dismiss install prompt"
            title="Not now"
          >
            Not now
          </button>
        </div>
      </div>
      <style jsx>{`
        .luna-install {
          position: fixed;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 120;
          padding: 0 1rem 1rem;
          pointer-events: none;
        }

        .luna-install__card {
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

        .luna-install__title {
          font-weight: 900;
          color: var(--luna-text-primary);
          letter-spacing: -0.01em;
        }

        .luna-install__brand {
          background: linear-gradient(135deg, var(--luna-pink) 0%, var(--luna-blue) 100%);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }

        .luna-install__desc {
          margin-top: 0.15rem;
          font-size: 0.9rem;
          color: var(--luna-text-secondary);
        }

        .luna-install__actions {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          flex-shrink: 0;
        }

        .luna-install__btn {
          text-transform: none;
          letter-spacing: 0.02em;
          padding: 0 1rem;
          min-height: 44px;
        }

        .luna-install__dismiss {
          border: 1px solid rgba(17, 24, 39, 0.1);
          background: rgba(17, 24, 39, 0.06);
          color: var(--luna-text-primary);
          font-weight: 700;
          padding: 0 0.85rem;
          border-radius: 10px;
          cursor: pointer;
          min-height: 44px;
        }

        .luna-install__dismiss:hover {
          background: rgba(17, 24, 39, 0.1);
        }

        @media (max-width: 640px) {
          .luna-install__card {
            flex-direction: column;
            align-items: stretch;
            text-align: center;
          }

          .luna-install__actions {
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
}

