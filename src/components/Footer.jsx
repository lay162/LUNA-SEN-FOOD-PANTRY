import React from 'react';
import { Link } from 'react-router-dom';
import { useBrandLogoUrl } from '../context/BrandingContext';
import { SOCIAL_LINKS } from '../constants/socials';
import { ADMIN_EMAIL } from '../constants/contact';

const Footer = () => {
  const brandLogoUrl = useBrandLogoUrl();
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { path: '/', label: 'Home' },
    { path: '/support', label: 'Support' },
    { path: '/donate', label: 'Donate' },
    { path: '/volunteer', label: 'Volunteer' },
    { path: '/stories', label: 'Stories & Thank Yous' },
    { path: '/qr-codes', label: 'QR codes (print)' },
  ];

  const supportInfo = [
    { label: 'Emergency Food', value: 'Available 7 days' },
    { label: 'SEN Support', value: 'Priority Service' },
    { label: 'Area Coverage', value: 'Metropolitan Borough of Wirral' },
    { label: 'Email', value: ADMIN_EMAIL, mailto: true },
  ];

  const emergencyContacts = [
    { name: 'Emergency Services', number: '999' },
    { name: 'Samaritans', number: '116 123' },
    { name: 'Mental Health Crisis', number: '111' },
  ];

  return (
    <>
      <footer className="luna-footer" role="contentinfo">
        {/* Emergency Contact Bar */}
        <div className="luna-footer__emergency-bar">
          <div className="luna-container">
            <div className="luna-footer__emergency-content">
              <span className="luna-footer__emergency-label">Emergency Help:</span>
              <div className="luna-footer__emergency-contacts">
                {emergencyContacts.map((contact, index) => (
                  <div key={index} className="luna-footer__emergency-contact">
                    <span className="luna-footer__contact-name">{contact.name}:</span>
                    <a 
                      href={`tel:${contact.number}`} 
                      className="luna-footer__contact-number"
                      aria-label={`Call ${contact.name} at ${contact.number}`}
                    >
                      {contact.number}
                    </a>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="luna-container">
          <div className="luna-footer__content">
            {/* Main Footer Content */}
            <div className="luna-footer__grid">
              {/* About Section */}
              <div className="luna-footer__section">
                <div className="luna-footer__brand">
                  <img 
                    src={brandLogoUrl}
                    alt="LUNA SEN PANTRY Logo" 
                    className="luna-footer__logo"
                    width="48"
                    height="48"
                  />
                  <div className="luna-footer__brand-text">
                    <h3 className="luna-footer__title">
                      <span className="luna-brand-text">LUNA</span> SEN PANTRY
                    </h3>
                    <p className="luna-footer__subtitle">Wirral's Independent SEN-Priority Food Support Hub</p>
                  </div>
                </div>
                <p className="luna-footer__description">
                  Supporting families with Special Educational Needs across the Metropolitan Borough of Wirral,
                  Merseyside from Birkenhead and Wallasey to Heswall, Bebington, Bromborough, Hoylake, West Kirby and
                  communities throughout the peninsula with dignity, compassion, and understanding. Emergency food
                  parcels available 7 days a week.
                </p>
              </div>

              {/* Quick Links */}
              <div className="luna-footer__section">
                <h4 className="luna-footer__heading">Quick Links</h4>
                <nav className="luna-footer__nav" aria-label="Footer navigation">
                  {quickLinks.map(({ path, label }) => (
                    <Link
                      key={path}
                      to={path}
                      className="luna-footer__link"
                    >
                      {label}
                    </Link>
                  ))}
                </nav>
              </div>

              {/* Support Information */}
              <div className="luna-footer__section">
                <h4 className="luna-footer__heading">Support Information</h4>
                <div className="luna-footer__info">
                  {supportInfo.map(({ label, value, mailto }) => (
                    <div key={label} className="luna-footer__info-item">
                      <span className="luna-footer__info-label">{label}:</span>
                      {mailto ? (
                        <a
                          href={`mailto:${encodeURIComponent(value)}`}
                          className="luna-footer__info-value luna-footer__link"
                        >
                          {value}
                        </a>
                      ) : (
                        <span className="luna-footer__info-value">{value}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Emergency Contact */}
              <div className="luna-footer__section">
                <h4 className="luna-footer__heading">Emergency Support</h4>
                <div className="luna-footer__emergency">
                  <div className="luna-footer__emergency-card">
                    <div className="luna-footer__emergency-icon">🆘</div>
                    <div className="luna-footer__emergency-text">
                      <p className="luna-footer__emergency-title">Need Urgent Help?</p>
                      <p className="luna-footer__emergency-desc">Use our referral form for priority SEN support</p>
                      <div className="luna-footer__emergency-cta">
                        <Link to="/support" className="luna-footer__emergency-link luna-button luna-button--emergency luna-button--sm luna-button--full-width">
                          Get Support Now
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Bottom */}
            <div className="luna-footer__bottom">
              <div className="luna-footer__socials" aria-label="Follow us">
                <div className="luna-footer__socials-label">Follow us</div>
                <div className="luna-footer__socials-icons">
                  <a
                    className={`luna-footer__social luna-footer__social--pink ${SOCIAL_LINKS.facebook ? '' : 'is-disabled'}`}
                    href={SOCIAL_LINKS.facebook || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Facebook"
                    title="Facebook"
                  >
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path
                        fill="currentColor"
                        d="M13.5 22v-8.5H16l.5-3h-3V8.6c0-.9.3-1.5 1.6-1.5h1.6V4.4c-.3 0-1.4-.1-2.7-.1-2.7 0-4.5 1.6-4.5 4.7v1.5H7v3h2.4V22h4.1z"
                      />
                    </svg>
                  </a>
                  <a
                    className={`luna-footer__social luna-footer__social--gradient ${SOCIAL_LINKS.instagram ? '' : 'is-disabled'}`}
                    href={SOCIAL_LINKS.instagram || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Instagram"
                    title="Instagram"
                  >
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path
                        fill="currentColor"
                        d="M7.5 2h9A5.5 5.5 0 0 1 22 7.5v9A5.5 5.5 0 0 1 16.5 22h-9A5.5 5.5 0 0 1 2 16.5v-9A5.5 5.5 0 0 1 7.5 2zm0 2A3.5 3.5 0 0 0 4 7.5v9A3.5 3.5 0 0 0 7.5 20h9a3.5 3.5 0 0 0 3.5-3.5v-9A3.5 3.5 0 0 0 16.5 4h-9z"
                      />
                      <path fill="currentColor" d="M12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10zm0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6z" />
                      <path fill="currentColor" d="M17.6 6.4a1 1 0 1 1-2 0 1 1 0 0 1 2 0z" />
                    </svg>
                  </a>
                  <a
                    className={`luna-footer__social luna-footer__social--blue ${SOCIAL_LINKS.tiktok ? '' : 'is-disabled'}`}
                    href={SOCIAL_LINKS.tiktok || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="TikTok"
                    title="TikTok"
                  >
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path
                        fill="currentColor"
                        d="M14 3c.4 3 2.3 5 5 5v3.2c-1.9 0-3.5-.6-5-1.7v6.7c0 3.2-2.6 5.8-5.8 5.8S2.4 18.4 2.4 15.2c0-3.2 2.6-5.8 5.8-5.8.4 0 .8 0 1.2.1v3.3c-.4-.2-.8-.3-1.2-.3-1.4 0-2.6 1.2-2.6 2.6 0 1.4 1.2 2.6 2.6 2.6 1.5 0 2.8-1.2 2.8-3V3h3z"
                      />
                    </svg>
                  </a>
                </div>
                <div className="luna-footer__socials-hint">Set links when ready.</div>
              </div>

              <div className="luna-footer__accessibility">
                <p className="luna-footer__accessibility-text">
                  We're committed to making our service accessible to all. If you need help using this website,{' '}
                  <Link to="/accessibility" className="luna-footer__accessibility-link">
                    read our accessibility statement
                  </Link>{' '}
                  or contact us for support.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Legal / company strip — black bar (like header); white text, gradient LUNA */}
        <div className="luna-footer__strip luna-footer__strip--legal">
          <div className="luna-container">
            <div className="luna-footer__strip-inner">
              <p className="luna-footer__company-line">
                &copy; {currentYear}{' '}
                <span className="luna-brand-text">LUNA</span> SEN Pantry, trading under{' '}
                <span className="luna-brand-text">LUNA</span> SEN GROUP LTD (
                <span className="luna-footer__company-reg">17049817</span>). CIC registration intended. All rights reserved.
              </p>
            </div>
          </div>
        </div>

        <style jsx>{`
          .luna-footer {
            background: var(--luna-gradient-primary);
            color: var(--luna-text-on-dark);
            margin-top: auto;
          }

          .luna-footer__emergency-bar {
            background-color: var(--luna-red-600);
            padding: var(--luna-space-3) 0;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          }

          .luna-footer__emergency-content {
            display: flex;
            flex-wrap: wrap;
            justify-content: center;
            align-items: center;
            gap: var(--luna-space-4);
            font-size: var(--luna-font-size-sm);
          }

          .luna-footer__emergency-label {
            font-weight: var(--luna-font-weight-semibold);
            color: white;
          }

          .luna-footer__emergency-contacts {
            display: flex;
            flex-wrap: wrap;
            gap: var(--luna-space-4);
          }

          .luna-footer__emergency-contact {
            display: flex;
            align-items: center;
            gap: var(--luna-space-1);
            color: white;
          }

          .luna-footer__contact-name {
            color: var(--luna-red-100);
          }

          .luna-footer__contact-number {
            font-weight: var(--luna-font-weight-bold);
            color: white;
            text-decoration: underline;
            transition: opacity var(--luna-transition-fast);
          }

          .luna-footer__contact-number:hover,
          .luna-footer__contact-number:focus {
            opacity: 0.8;
          }

          .luna-footer__content {
            padding: var(--luna-space-12) 0 var(--luna-space-8);
          }

          .luna-footer__grid {
            display: grid;
            grid-template-columns: 2fr 1fr 1fr 1.5fr;
            gap: var(--luna-space-8);
            margin-bottom: var(--luna-space-8);
          }

          .luna-footer__section {
            display: flex;
            flex-direction: column;
            gap: var(--luna-space-4);
          }

          .luna-footer__section:last-child {
            text-align: center;
          }

          .luna-footer__section:last-child .luna-footer__heading {
            text-align: center;
          }

          .luna-footer__brand {
            display: flex;
            align-items: center;
            gap: var(--luna-space-3);
            margin-bottom: var(--luna-space-2);
          }

          .luna-footer__logo {
            width: 48px;
            height: 48px;
            display: block;
          }

          .luna-footer__brand-text {
            flex: 1;
          }

          .luna-footer__title {
            font-size: var(--luna-font-size-xl);
            font-weight: var(--luna-font-weight-bold);
            color: white;
            margin: 0 0 var(--luna-space-1) 0;
          }

          .luna-footer__subtitle {
            font-size: var(--luna-font-size-sm);
            color: var(--luna-blue-100);
            margin: 0;
          }

          .luna-footer__description {
            font-size: var(--luna-font-size-sm);
            line-height: var(--luna-line-height-relaxed);
            color: var(--luna-blue-100);
            margin: 0;
          }

          .luna-footer__heading {
            font-size: var(--luna-font-size-lg);
            font-weight: var(--luna-font-weight-semibold);
            color: white;
            margin: 0 0 var(--luna-space-3) 0;
          }

          .luna-footer__nav {
            display: flex;
            flex-direction: column;
            gap: var(--luna-space-2);
          }

          .luna-footer__link {
            color: var(--luna-blue-100);
            text-decoration: none;
            font-size: var(--luna-font-size-sm);
            transition: color var(--luna-transition-fast);
            padding: var(--luna-space-1) 0;
          }

          .luna-footer__link:hover,
          .luna-footer__link:focus {
            color: white;
            text-decoration: underline;
          }

          .luna-footer__info {
            display: flex;
            flex-direction: column;
            gap: var(--luna-space-2);
          }

          .luna-footer__info-item {
            display: flex;
            flex-direction: column;
            gap: var(--luna-space-1);
          }

          .luna-footer__info-label {
            font-size: var(--luna-font-size-xs);
            color: var(--luna-blue-200);
            font-weight: var(--luna-font-weight-medium);
          }

          .luna-footer__info-value {
            font-size: var(--luna-font-size-sm);
            color: white;
            font-weight: var(--luna-font-weight-medium);
          }

          .luna-footer__emergency {
            display: flex;
            flex-direction: column;
            gap: var(--luna-space-4);
          }

          .luna-footer__emergency-card {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: var(--luna-space-3);
            background: rgba(255, 255, 255, 0.1);
            padding: var(--luna-space-4);
            border-radius: var(--luna-radius-lg);
            border: 1px solid rgba(255, 255, 255, 0.2);
            text-align: center;
          }

          .luna-footer__emergency-icon {
            font-size: 24px;
            line-height: 1;
            flex-shrink: 0;
          }

          .luna-footer__emergency-text {
            flex: 1;
            min-width: 0;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: var(--luna-space-3);
            text-align: center;
          }

          .luna-footer__emergency-title {
            font-weight: var(--luna-font-weight-semibold);
            color: white;
            margin: 0;
            font-size: var(--luna-font-size-sm);
            text-align: center;
            width: 100%;
            text-wrap: balance;
          }

          .luna-footer__emergency-desc {
            font-size: var(--luna-font-size-xs);
            color: var(--luna-blue-100);
            margin: 0;
            text-align: center;
            width: 100%;
            max-width: 22rem;
            text-wrap: balance;
            line-height: var(--luna-line-height-relaxed);
          }

          .luna-footer__emergency-cta {
            width: 100%;
            max-width: 20rem;
            display: flex;
            justify-content: center;
            margin-top: var(--luna-space-1);
          }

          .luna-footer__emergency-link {
            display: flex;
            width: 100%;
            justify-content: center;
            text-align: center;
            text-decoration: none;
            box-sizing: border-box;
          }

          .luna-footer__bottom {
            border-top: 1px solid rgba(255, 255, 255, 0.2);
            padding-top: var(--luna-space-6);
          }

          .luna-footer__socials {
            display: grid;
            gap: 0.5rem;
            justify-items: center;
            text-align: center;
            margin-bottom: var(--luna-space-6);
          }

          .luna-footer__socials-label {
            font-size: var(--luna-font-size-sm);
            font-weight: var(--luna-font-weight-bold);
            color: rgba(255, 255, 255, 0.95);
            letter-spacing: 0.02em;
            text-transform: uppercase;
          }

          .luna-footer__socials-icons {
            display: flex;
            gap: 0.7rem;
            align-items: center;
            justify-content: center;
          }

          .luna-footer__social {
            width: 38px;
            height: 38px;
            border-radius: 999px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            color: white;
            text-decoration: none;
            border: 1px solid rgba(255, 255, 255, 0.35);
            box-shadow: 0 10px 28px -18px rgba(0, 0, 0, 0.6);
            transition: transform var(--luna-transition-fast), opacity var(--luna-transition-fast), filter var(--luna-transition-fast);
          }

          .luna-footer__social svg {
            width: 18px;
            height: 18px;
            display: block;
          }

          .luna-footer__social--pink {
            background: var(--luna-pink);
          }

          .luna-footer__social--gradient {
            background: var(--luna-gradient-primary);
          }

          .luna-footer__social--blue {
            background: var(--luna-blue);
          }

          .luna-footer__social:hover,
          .luna-footer__social:focus {
            transform: translateY(-1px);
            filter: brightness(1.03);
            outline: none;
          }

          .luna-footer__social.is-disabled {
            opacity: 0.55;
            pointer-events: none;
            filter: saturate(0.85);
          }

          .luna-footer__socials-hint {
            font-size: var(--luna-font-size-xs);
            color: rgba(255, 255, 255, 0.78);
            font-weight: var(--luna-font-weight-semibold);
          }

          /* Shared “strip” layout (accessibility + legal) */
          .luna-footer__strip {
            width: 100%;
            padding: var(--luna-space-6) 0 var(--luna-space-8);
            margin: 0;
            text-align: center;
          }

          .luna-footer__strip-inner {
            max-width: 36rem;
            margin-left: auto;
            margin-right: auto;
          }

          .luna-footer__strip--legal {
            background-color: #000000;
            border-top: 1px solid var(--luna-grey-200);
            /* Shorter bar: override shared strip vertical padding only */
            padding: var(--luna-space-3) 0;
          }

          .luna-footer__strip--legal .luna-footer__company-line {
            margin: 0;
            font-size: var(--luna-font-size-sm);
            line-height: var(--luna-line-height-relaxed);
            color: rgba(255, 255, 255, 0.9);
            text-align: center;
            text-wrap: balance;
          }

          .luna-footer__strip--legal .luna-footer__company-reg {
            font-weight: var(--luna-font-weight-semibold);
            font-variant-numeric: tabular-nums;
            color: #ffffff;
          }

          .luna-footer__strip--legal .luna-brand-text {
            display: inline;
            position: relative;
          }

          @supports not (-webkit-background-clip: text) {
            .luna-footer__strip--legal .luna-brand-text {
              background: none;
              color: var(--luna-pink);
              -webkit-text-fill-color: unset;
            }
          }

          .luna-footer__accessibility {
            background-color: #f8fafc;
            border: 1px solid rgba(15, 23, 42, 0.12);
            border-radius: var(--luna-radius-lg);
            padding: var(--luna-space-4) var(--luna-space-4);
            margin: 0 var(--luna-space-1) 0;
            box-shadow: 0 1px 2px rgba(15, 23, 42, 0.06);
          }

          .luna-footer__accessibility-text {
            font-size: var(--luna-font-size-xs);
            color: #0f172a;
            text-align: center;
            margin: 0;
            line-height: var(--luna-line-height-relaxed);
          }

          /* Gradient-filled text only (no fill box); overrides global a:hover pink */
          .luna-footer__accessibility-link {
            font-weight: var(--luna-font-weight-semibold);
            cursor: pointer;
            text-decoration: underline;
            text-underline-offset: 3px;
            text-decoration-thickness: 1px;
            text-decoration-color: rgba(15, 23, 42, 0.35);
            background: var(--luna-gradient-primary);
            -webkit-background-clip: text;
            background-clip: text;
            -webkit-text-fill-color: transparent;
            color: transparent !important;
            transition: opacity var(--luna-transition-fast), filter var(--luna-transition-fast);
          }

          .luna-footer__accessibility-link:hover,
          .luna-footer__accessibility-link:focus {
            color: transparent !important;
            -webkit-text-fill-color: transparent !important;
            background: var(--luna-gradient-primary);
            -webkit-background-clip: text;
            background-clip: text;
            opacity: 0.92;
            filter: brightness(0.97);
            outline: none;
            text-decoration-color: rgba(15, 23, 42, 0.45);
          }

          .luna-footer__accessibility-link:focus-visible {
            outline: 2px solid #0f172a;
            outline-offset: 3px;
            border-radius: 2px;
            box-shadow: none;
          }

          @supports not (-webkit-background-clip: text) {
            .luna-footer__accessibility-link,
            .luna-footer__accessibility-link:hover,
            .luna-footer__accessibility-link:focus {
              background: none;
              -webkit-background-clip: unset;
              background-clip: unset;
              -webkit-text-fill-color: unset;
              color: var(--luna-pink) !important;
              filter: none;
            }

            .luna-footer__accessibility-link:hover,
            .luna-footer__accessibility-link:focus {
              color: var(--luna-secondary) !important;
            }
          }

          @media (max-width: 1024px) {
            .luna-footer__grid {
              grid-template-columns: 1fr 1fr;
              gap: var(--luna-space-6);
            }
          }

          @media (max-width: 768px) {
            .luna-footer__content {
              padding: var(--luna-space-8) 0 var(--luna-space-6);
            }

            .luna-footer__grid {
              grid-template-columns: 1fr;
              gap: var(--luna-space-6);
            }

            .luna-footer__brand {
              flex-direction: column;
              align-items: center;
              text-align: center;
              gap: var(--luna-space-2);
            }

            .luna-footer__emergency-contacts {
              justify-content: center;
            }

            .luna-footer__emergency-card {
              flex-direction: column;
              align-items: center;
              text-align: center;
            }

            .luna-footer__emergency-icon {
              margin: 0 0 var(--luna-space-2) 0;
            }

            .luna-footer__accessibility {
              margin-left: 0;
              margin-right: 0;
            }

            .luna-footer__strip--legal {
              padding: var(--luna-space-2) 0 var(--luna-space-3);
            }

            .luna-footer__strip-inner {
              padding: 0 var(--luna-space-2);
            }

          }

          @media (max-width: 480px) {
            .luna-footer__content {
              padding: var(--luna-space-6) 0 var(--luna-space-4);
            }

            .luna-footer__emergency-card {
              flex-direction: column;
              align-items: center;
              text-align: center;
              gap: var(--luna-space-3);
            }

            .luna-footer__emergency-cta {
              max-width: none;
              padding: 0 var(--luna-space-2);
            }

            .luna-footer__emergency-content {
              flex-direction: column;
              gap: var(--luna-space-2);
            }

            .luna-footer__emergency-contacts {
              flex-direction: column;
              gap: var(--luna-space-1);
            }

            .luna-footer__strip--legal {
              padding: var(--luna-space-2) 0;
            }

            .luna-footer__company-line {
              font-size: var(--luna-font-size-xs);
              line-height: 1.65;
            }

            .luna-footer__accessibility-text {
              font-size: var(--luna-font-size-xs);
            }
          }
        `}</style>
      </footer>
    </>
  );
};

export default Footer;