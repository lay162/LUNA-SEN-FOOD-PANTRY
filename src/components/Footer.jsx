import React from 'react';
import { Link } from 'react-router-dom';
import { brandLogoUrl } from '../constants/assets';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { path: '/', label: 'Home' },
    { path: '/support', label: 'Support' },
    { path: '/donate', label: 'Donate' },
    { path: '/volunteer', label: 'Volunteer' },
  ];

  const supportInfo = [
    { label: 'Emergency Food', value: 'Available 7 days' },
    { label: 'SEN Support', value: 'Priority Service' },
    { label: 'Area Coverage', value: 'CH62 Wirral' },
    { label: 'Contact', value: 'Via Referral Form' },
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
                  Supporting families with Special Educational Needs across the CH62 area with 
                  dignity, compassion, and understanding. Emergency food parcels available 7 days a week.
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
                  {supportInfo.map(({ label, value }) => (
                    <div key={label} className="luna-footer__info-item">
                      <span className="luna-footer__info-label">{label}:</span>
                      <span className="luna-footer__info-value">{value}</span>
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
              {/* Accessibility Statement */}
              <div className="luna-footer__accessibility">
                <p className="luna-footer__accessibility-text">
                  We're committed to making our service accessible to all. If you need help using this website, 
                  <Link to="/accessibility" className="luna-footer__accessibility-link">
                    read our accessibility statement
                  </Link> or contact us for support.
                </p>
              </div>
              
              <div className="luna-footer__bottom-content">
                <div className="luna-footer__copyright">
                  <p>&copy; {currentYear} LUNA SEN PANTRY. All rights reserved.</p>
                </div>
              </div>
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

          .luna-footer__bottom-content {
            display: flex;
            justify-content: center;
            align-items: center;
            gap: var(--luna-space-4);
            text-align: center;
          }

          .luna-footer__copyright {
            flex: 1;
            text-align: center;
          }

          .luna-footer__copyright p {
            margin: 0;
            font-size: var(--luna-font-size-sm);
            color: var(--luna-blue-100);
          }

          .luna-footer__legal {
            font-size: var(--luna-font-size-xs) !important;
            margin-top: var(--luna-space-1) !important;
          }

          .luna-footer__meta {
            display: flex;
            align-items: center;
            gap: var(--luna-space-4);
          }

          .luna-footer__badges {
            display: flex;
            gap: var(--luna-space-2);
            flex-wrap: wrap;
          }

          .luna-footer__badge {
            background: rgba(255, 255, 255, 0.15);
            border: 1px solid rgba(255, 255, 255, 0.25);
            border-radius: var(--luna-radius-full);
            padding: var(--luna-space-1) var(--luna-space-3);
          }

          .luna-footer__badge-text {
            font-size: var(--luna-font-size-xs);
            font-weight: var(--luna-font-weight-medium);
            color: white;
          }

          .luna-footer__install-btn {
            background: rgba(255, 255, 255, 0.2);
            border: 1px solid rgba(255, 255, 255, 0.3);
            color: white;
            padding: var(--luna-space-2) var(--luna-space-4);
            border-radius: var(--luna-radius-md);
            font-size: var(--luna-font-size-sm);
            font-weight: var(--luna-font-weight-medium);
            cursor: pointer;
            transition: all var(--luna-transition-fast);
          }

          .luna-footer__install-btn:hover {
            background: rgba(255, 255, 255, 0.3);
          }

          .luna-footer__accessibility {
            background-color: rgba(0, 0, 0, 0.3);
            border-top: 1px solid rgba(255, 255, 255, 0.1);
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            padding: var(--luna-space-3) 0;
            margin-bottom: var(--luna-space-4);
          }

          .luna-footer__accessibility-text {
            font-size: var(--luna-font-size-xs);
            color: var(--luna-blue-200);
            text-align: center;
            margin: 0;
          }

          .luna-footer__accessibility-link {
            color: white;
            text-decoration: underline;
            margin-left: var(--luna-space-1);
            transition: opacity var(--luna-transition-fast);
          }

          .luna-footer__accessibility-link:hover,
          .luna-footer__accessibility-link:focus {
            opacity: 0.8;
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

            .luna-footer__bottom-content {
              flex-direction: column;
              gap: var(--luna-space-4);
              text-align: center;
            }

            .luna-footer__meta {
              flex-direction: column;
              gap: var(--luna-space-3);
            }

            .luna-footer__badges {
              justify-content: center;
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

            .luna-footer__badges {
              flex-direction: column;
              align-items: center;
            }

            .luna-footer__emergency-content {
              flex-direction: column;
              gap: var(--luna-space-2);
            }

            .luna-footer__emergency-contacts {
              flex-direction: column;
              gap: var(--luna-space-1);
            }
          }
        `}</style>
      </footer>
    </>
  );
};

export default Footer;