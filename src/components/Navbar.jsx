import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useBrandLogoUrl } from '../context/BrandingContext';

const Navbar = () => {
  const brandLogoUrl = useBrandLogoUrl();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  const navItems = [
    { path: '/', label: 'Home' },
    { path: '/support', label: 'Support' },
    { path: '/donate', label: 'Donate' },
    { path: '/volunteer', label: 'Volunteer' },
    { path: '/admin', label: 'Staff sign in', isAdmin: true },
  ];

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <>
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      
      <nav className="luna-navbar" role="navigation" aria-label="Main navigation">
        <div className="luna-container">
          <div className="luna-navbar__content">
            {/* Logo */}
            <Link to="/" className="luna-navbar__logo">
              <img 
                src={brandLogoUrl}
                alt="LUNA SEN PANTRY Logo" 
                className="luna-navbar__logo-img"
                width="40"
                height="40"
                decoding="async"
              />
              <div className="luna-navbar__logo-text">
                <span className="luna-navbar__title">
                  <span className="luna-brand-text">LUNA</span> SEN PANTRY
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="luna-navbar__nav luna-navbar__nav--desktop">
              {navItems.map(({ path, label, isAdmin }) => (
                <Link
                  key={path}
                  to={path}
                  className={`luna-navbar__link ${
                    isActive(path) ? 'luna-navbar__link--active' : ''
                  } ${isAdmin ? 'luna-navbar__link--admin' : ''}`}
                  aria-current={isActive(path) ? 'page' : undefined}
                >
                  {label}
                </Link>
              ))}
            </div>

            {/* Mobile menu button */}
            <button
              type="button"
              className="luna-navbar__mobile-toggle"
              onClick={toggleMobileMenu}
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-menu"
              aria-label="Toggle navigation menu"
            >
              <span className="luna-navbar__hamburger">
                <span></span>
                <span></span>
                <span></span>
              </span>
            </button>
          </div>

          {/* Mobile Navigation */}
          <div 
            className={`luna-navbar__mobile ${isMobileMenuOpen ? 'luna-navbar__mobile--open' : ''}`}
            id="mobile-menu"
          >
            {navItems.map(({ path, label, isAdmin }) => (
              <Link
                key={path}
                to={path}
                className={`luna-navbar__mobile-link ${
                  isActive(path) ? 'luna-navbar__mobile-link--active' : ''
                } ${isAdmin ? 'luna-navbar__mobile-link--admin' : ''}`}
                aria-current={isActive(path) ? 'page' : undefined}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {label}
              </Link>
            ))}
          </div>
        </div>

        <style jsx>{`
          .luna-navbar {
            position: sticky;
            top: 0;
            background-color: #000000;
            border-bottom: 1px solid var(--luna-grey-200);
            box-shadow: var(--luna-shadow-sm);
            z-index: 100;
            height: var(--luna-header-height);
          }

          .luna-navbar__content {
            display: flex;
            align-items: center;
            justify-content: space-between;
            height: var(--luna-header-height);
          }

          .luna-navbar__logo {
            display: flex;
            align-items: center;
            gap: var(--luna-space-3);
            text-decoration: none;
            color: #ffffff;
            transition: opacity var(--luna-transition-fast);
          }

          .luna-navbar__logo:hover {
            opacity: 0.8;
          }

          .luna-navbar__logo-img {
            width: 40px;
            height: 40px;
            object-fit: contain;
          }

          .luna-navbar__logo-text {
            display: flex;
            flex-direction: column;
            line-height: 1.2;
          }

          .luna-navbar__title {
            font-size: var(--luna-font-size-lg);
            font-weight: var(--luna-font-weight-bold);
            color: #ffffff;
          }

          .luna-navbar__subtitle {
            font-size: var(--luna-font-size-xs);
            color: var(--luna-text-muted);
          }

          .luna-navbar__nav--desktop {
            display: flex;
            align-items: center;
            gap: var(--luna-space-8);
          }

          .luna-navbar__link {
            font-size: var(--luna-font-size-base);
            font-weight: var(--luna-font-weight-medium);
            color: #ffffff;
            text-decoration: none;
            padding: var(--luna-space-2) var(--luna-space-3);
            border-radius: var(--luna-radius-md);
            transition: all var(--luna-transition-fast);
            position: relative;
          }

          .luna-navbar__link:hover {
            background: var(--luna-gradient-primary);
            -webkit-background-clip: text;
            background-clip: text;
            -webkit-text-fill-color: transparent;
          }

          .luna-navbar__link--active {
            background: var(--luna-gradient-primary);
            -webkit-background-clip: text;
            background-clip: text;
            -webkit-text-fill-color: transparent;
            font-weight: var(--luna-font-weight-bold);
          }

          .luna-navbar__mobile-toggle {
            display: none;
            background: none;
            border: none;
            cursor: pointer;
            padding: var(--luna-space-2);
            border-radius: var(--luna-radius-sm);
            transition: background-color var(--luna-transition-fast);
          }

          .luna-navbar__mobile-toggle:hover {
            background-color: var(--luna-bg-secondary);
          }

          .luna-navbar__hamburger {
            display: flex;
            flex-direction: column;
            gap: 4px;
            width: 24px;
            height: 18px;
          }

          .luna-navbar__hamburger span {
            display: block;
            height: 2px;
            background-color: #ffffff;
            border-radius: 1px;
            transition: all var(--luna-transition-fast);
          }

          .luna-navbar__mobile {
            display: none;
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            background-color: #000000;
            border-bottom: 1px solid var(--luna-grey-200);
            box-shadow: var(--luna-shadow-md);
            padding: var(--luna-space-4) 0;
            transform: translateY(-10px);
            opacity: 0;
            transition: all var(--luna-transition-normal);
          }

          .luna-navbar__mobile--open {
            display: block;
            transform: translateY(0);
            opacity: 1;
          }

          .luna-navbar__mobile-link {
            display: block;
            padding: var(--luna-space-3) var(--luna-space-6);
            color: #ffffff;
            text-decoration: none;
            font-weight: var(--luna-font-weight-medium);
            transition: all var(--luna-transition-fast);
            border-left: 3px solid transparent;
          }

          .luna-navbar__mobile-link:hover,
          .luna-navbar__mobile-link--active {
            background: var(--luna-gradient-primary);
            -webkit-background-clip: text;
            background-clip: text;
            -webkit-text-fill-color: transparent;
            border-left-color: transparent;
          }

          .luna-navbar__link--admin {
            background: var(--luna-gradient-primary);
            color: #ffffff !important;
            border-radius: var(--luna-radius-md);
            padding: var(--luna-space-2) var(--luna-space-4);
            font-weight: var(--luna-font-weight-bold);
          }

          .luna-navbar__mobile-link--admin {
            background: var(--luna-gradient-primary);
            color: #ffffff !important;
            font-weight: var(--luna-font-weight-bold);
            border-left-color: var(--luna-primary);
          }

          @media (max-width: 768px) {
            .luna-navbar__nav--desktop {
              display: none;
            }

            .luna-navbar__mobile-toggle {
              display: flex;
              align-items: center;
              justify-content: center;
            }

            .luna-navbar__logo-text {
              display: none;
            }

            .luna-navbar__title {
              font-size: var(--luna-font-size-base);
            }
          }

          @media (max-width: 480px) {
            .luna-navbar__logo-text {
              display: flex;
            }

            .luna-navbar__title {
              font-size: var(--luna-font-size-sm);
            }

            .luna-navbar__subtitle {
              font-size: 10px;
            }
          }
        `}</style>
      </nav>
    </>
  );
};

export default Navbar;