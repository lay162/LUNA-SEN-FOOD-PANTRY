import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import HeroLogo from '../components/HeroLogo';
import QrCodeImage from '../components/QrCodeImage';
import { sitePath } from '../constants/site';

const LINKS = [
  { path: '/support', label: 'Get support', description: 'Self-referral form' },
  { path: '/donate', label: 'Donate', description: 'Ways to give' },
  { path: '/volunteer', label: 'Volunteer', description: 'Apply to help' },
  { path: '/stories', label: 'Stories & thank yous', description: 'Read or share a message' },
];

/**
 * Printable / shareable QR sheet — each code is a real https URL on this site.
 */
export default function QrCodesPage() {
  useEffect(() => {
    document.title = 'QR codes | LUNA SEN PANTRY';
  }, []);

  return (
    <main className="luna-main" id="main-content">
      <section className="luna-hero" aria-labelledby="qr-page-title">
        <div className="luna-container">
          <div className="luna-hero__content">
            <HeroLogo />
            <h1 id="qr-page-title" className="luna-hero__title">
              <span className="luna-brand-text">LUNA</span> QR codes
            </h1>
            <p className="luna-hero__subtitle">Print or display — scan opens our website</p>
            <p className="luna-hero__description">
              Each code links to a page on this site. Use your phone camera; no app required. Set{' '}
              <code className="luna-qr-page__code">VITE_SITE_URL</code> when building so codes use your live domain.
            </p>
          </div>
        </div>
      </section>

      <section className="luna-section luna-section--alt" aria-label="QR codes list">
        <div className="luna-container">
          <div className="luna-qr-page__grid">
            {LINKS.map(({ path, label, description }) => {
              const url = sitePath(path);
              return (
                <article key={path} className="luna-card luna-card--secondary luna-qr-page__card">
                  <h2 className="luna-card__title">{label}</h2>
                  <p className="luna-qr-page__desc">{description}</p>
                  <div className="luna-qr-page__qr-wrap">
                    <QrCodeImage value={url} size={160} alt={`QR code: ${label}`} className="luna-qr-page__img" />
                  </div>
                  <p className="luna-qr-page__url">
                    <a href={url} className="luna-qr-page__link">
                      {url}
                    </a>
                  </p>
                  <p className="luna-qr-page__hint">
                    <Link to={path}>Open page</Link>
                  </p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <style jsx>{`
        .luna-qr-page__grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
          gap: var(--luna-space-6);
          max-width: 1100px;
          margin: 0 auto;
        }
        .luna-qr-page__card {
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .luna-qr-page__desc {
          font-size: var(--luna-font-size-sm);
          color: var(--luna-text-secondary);
          margin: 0 0 var(--luna-space-4);
        }
        .luna-qr-page__qr-wrap {
          background: #fff;
          padding: var(--luna-space-3);
          border-radius: var(--luna-radius-md);
          margin-bottom: var(--luna-space-3);
        }
        .luna-qr-page__img {
          display: block;
          margin: 0 auto;
        }
        .luna-qr-page__url {
          font-size: 11px;
          word-break: break-all;
          margin: 0 0 var(--luna-space-2);
          color: var(--luna-text-muted);
        }
        .luna-qr-page__link {
          color: var(--luna-blue);
          text-decoration: underline;
        }
        .luna-qr-page__hint {
          font-size: var(--luna-font-size-sm);
          margin: 0;
        }
        .luna-qr-page__hint a {
          font-weight: var(--luna-font-weight-semibold);
          color: var(--luna-pink);
        }
        .luna-qr-page__code {
          font-size: 0.85em;
          padding: 0.1em 0.35em;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 4px;
        }
      `}</style>
    </main>
  );
}
