import React from 'react';
import { Download } from 'lucide-react';

const LS_DISMISSED_KEY = 'luna-install-dismissed-v1';
const GLOBAL_INSTANCE_KEY = '__luna_install_prompt_instance_v1__';
const LS_COOKIE_CONSENT_KEY = 'luna-cookie-consent-v1';

function isStandalone() {
  try {
    return (
      window.matchMedia?.('(display-mode: standalone)')?.matches ||
      window.navigator?.standalone === true
    );
  } catch {
    return false;
  }
}

function isIosSafari() {
  const ua = String(navigator.userAgent || '');
  const isIOS = /iPad|iPhone|iPod/.test(ua);
  const isWebKit = /WebKit/.test(ua);
  const isCriOS = /CriOS/.test(ua);
  const isFxiOS = /FxiOS/.test(ua);
  return isIOS && isWebKit && !isCriOS && !isFxiOS;
}

function hasCookieChoice() {
  try {
    const raw = localStorage.getItem(LS_COOKIE_CONSENT_KEY);
    if (!raw) return false;
    const parsed = JSON.parse(raw);
    return Boolean(parsed?.choice);
  } catch {
    return false;
  }
}

/**
 * @param {{ skipCookieGate?: boolean; variant?: 'bar' | 'fab' }} props
 * `skipCookieGate`: staff login at /admin (no cookie banner there).
 * `variant="fab"`: floating install button top-right with popover (e.g. sign-in page).
 */
export default function InstallPrompt({ skipCookieGate = false, variant = 'bar' } = {}) {
  const [deferredPrompt, setDeferredPrompt] = React.useState(null);
  const [blocked, setBlocked] = React.useState(false);
  const [fabOpen, setFabOpen] = React.useState(false);
  const fabWrapRef = React.useRef(null);
  const [cookiesAnswered, setCookiesAnswered] = React.useState(() =>
    skipCookieGate ? true : hasCookieChoice()
  );
  const [dismissed, setDismissed] = React.useState(() => {
    try {
      return localStorage.getItem(LS_DISMISSED_KEY) === '1';
    } catch {
      return false;
    }
  });

  React.useEffect(() => {
    if (skipCookieGate || cookiesAnswered) return undefined;
    const t = window.setInterval(() => {
      setCookiesAnswered(hasCookieChoice());
    }, 800);
    return () => window.clearInterval(t);
  }, [cookiesAnswered, skipCookieGate]);

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

  React.useEffect(() => {
    const onBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt);
  }, []);

  React.useEffect(() => {
    if (variant !== 'fab' || !fabOpen) return undefined;
    const onDown = (e) => {
      const el = fabWrapRef.current;
      if (!el || el.contains(e.target)) return;
      setFabOpen(false);
    };
    const onKey = (e) => {
      if (e.key === 'Escape') setFabOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [variant, fabOpen]);

  const showIosHelp = !deferredPrompt && isIosSafari() && !isStandalone();
  const showDevHint = !deferredPrompt && import.meta.env.DEV && !isStandalone();
  /** Staff /admin FAB: always offer install entry point (desktop often has no beforeinstallprompt yet). */
  const fabAlwaysOnAdminGate = variant === 'fab' && skipCookieGate;

  // Avoid stacking with cookie banner: show install after cookies answered.
  if (!cookiesAnswered) return null;
  if (isStandalone()) return null;
  if (blocked || dismissed) return null;
  if (
    !fabAlwaysOnAdminGate &&
    !deferredPrompt &&
    !showIosHelp &&
    !showDevHint
  ) {
    return null;
  }

  const cardBody = (
    <>
        <div className="luna-install__text">
          <div className="luna-install__title">
            Install the <span className="luna-install__brand">LUNA</span> SEN PANTRY app
          </div>
          <div className="luna-install__desc">
            {showIosHelp
              ? 'On iPhone/iPad: tap Share → “Add to Home Screen”.'
              : showDevHint
                ? 'Install popups usually appear on the live HTTPS site (or a production preview build), not during dev.'
                : deferredPrompt
                  ? 'Quick access to support, donate and volunteer.'
                  : 'Add this site to your home screen when your browser offers it, or use the menu (⋮ or share) to install.'}
          </div>
        </div>
        <div className="luna-install__actions">
          <button
            type="button"
            className="luna-button luna-button--gradient luna-install__btn"
            onClick={async () => {
              if (deferredPrompt) {
                try {
                  deferredPrompt.prompt();
                  await deferredPrompt.userChoice;
                } finally {
                  setDeferredPrompt(null);
                }
                setFabOpen(false);
                return;
              }
              if (showIosHelp) {
                window.alert('To install: tap the Share button in Safari, then choose “Add to Home Screen”.');
                return;
              }
              if (showDevHint) {
                window.alert('Install is available on the live HTTPS site (or after running a production preview build).');
                return;
              }
              window.alert(
                'If you don’t see an install prompt, open your browser menu and look for “Install app”, “Add to Home Screen”, or similar.'
              );
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
              setFabOpen(false);
            }}
            aria-label="Dismiss install prompt"
            title="Not now"
          >
            Not now
          </button>
        </div>
    </>
  );

  if (variant === 'fab') {
    return (
      <div className="luna-install luna-install--fab" ref={fabWrapRef}>
        {fabOpen ? <div className="luna-install__fab-scrim" aria-hidden onClick={() => setFabOpen(false)} /> : null}
        <div className="luna-install__fab-inner">
          {fabOpen ? (
            <div className="luna-install__popover" role="dialog" aria-label="Install app">
              <div className="luna-install__card luna-install__card--popover">{cardBody}</div>
            </div>
          ) : null}
          <button
            type="button"
            className="luna-install__fab-btn"
            aria-expanded={fabOpen}
            aria-haspopup="dialog"
            aria-label={fabOpen ? 'Close install options' : 'Install app — open menu'}
            onClick={() => setFabOpen((o) => !o)}
          >
            <Download size={22} strokeWidth={2.25} aria-hidden />
            {deferredPrompt ? <span className="luna-install__fab-badge" aria-hidden /> : null}
          </button>
        </div>
        <style jsx>{`
          .luna-install--fab {
            position: fixed;
            top: max(0.75rem, env(safe-area-inset-top, 0px));
            right: max(0.75rem, env(safe-area-inset-right, 0px));
            z-index: 5000;
            pointer-events: none;
          }
          .luna-install__fab-inner {
            position: relative;
            z-index: 1;
            pointer-events: auto;
            display: flex;
            flex-direction: column;
            align-items: flex-end;
            gap: 0.5rem;
          }
          .luna-install__fab-scrim {
            position: fixed;
            inset: 0;
            z-index: 0;
            pointer-events: auto;
            background: rgba(15, 23, 42, 0.12);
          }
          .luna-install__fab-btn {
            width: 52px;
            height: 52px;
            border-radius: 999px;
            border: 1px solid rgba(255, 255, 255, 0.85);
            background: rgba(255, 255, 255, 0.96);
            color: var(--luna-pink);
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.18);
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: transform 0.15s ease, box-shadow 0.15s ease;
            position: relative;
            touch-action: manipulation;
          }
          .luna-install__fab-btn:hover {
            transform: scale(1.04);
            box-shadow: 0 12px 36px rgba(0, 0, 0, 0.22);
          }
          .luna-install__fab-badge {
            position: absolute;
            top: 8px;
            right: 8px;
            width: 9px;
            height: 9px;
            border-radius: 999px;
            background: var(--luna-blue);
            border: 2px solid #fff;
          }
          .luna-install__popover {
            pointer-events: auto;
            width: min(320px, calc(100vw - 5rem));
            animation: lunaFabIn 0.2s ease;
          }
          @keyframes lunaFabIn {
            from {
              opacity: 0;
              transform: translateY(6px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          .luna-install__card--popover {
            display: flex;
            flex-direction: column;
            align-items: stretch;
            text-align: left;
            gap: 0.75rem;
            padding: 1rem 1.1rem;
            width: 100%;
            margin: 0;
            border-radius: 16px;
            background: rgba(255, 255, 255, 0.96);
            border: 1px solid rgba(17, 24, 39, 0.08);
            box-shadow: 0 18px 45px rgba(0, 0, 0, 0.14);
            backdrop-filter: blur(10px);
          }
          .luna-install__card--popover .luna-install__actions {
            justify-content: stretch;
            flex-wrap: wrap;
          }
          .luna-install__card--popover .luna-install__btn {
            flex: 1;
            min-width: 6rem;
            text-transform: none;
            letter-spacing: 0.02em;
            padding: 0 1rem;
            min-height: 44px;
          }
          .luna-install__card--popover .luna-install__title {
            font-weight: 900;
            color: var(--luna-text-primary);
            letter-spacing: -0.01em;
          }
          .luna-install__card--popover .luna-install__brand {
            background: linear-gradient(135deg, var(--luna-pink) 0%, var(--luna-blue) 100%);
            -webkit-background-clip: text;
            background-clip: text;
            color: transparent;
          }
          .luna-install__card--popover .luna-install__desc {
            margin-top: 0.15rem;
            font-size: 0.9rem;
            color: var(--luna-text-secondary);
          }
          .luna-install__card--popover .luna-install__dismiss {
            border: 1px solid rgba(17, 24, 39, 0.1);
            background: rgba(17, 24, 39, 0.06);
            color: var(--luna-text-primary);
            font-weight: 700;
            padding: 0 0.85rem;
            border-radius: 10px;
            cursor: pointer;
            min-height: 44px;
          }
          .luna-install__card--popover .luna-install__dismiss:hover {
            background: rgba(17, 24, 39, 0.1);
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="luna-install">
      <div className="luna-install__card" role="region" aria-label="Install LUNA SEN PANTRY app">
        {cardBody}
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

