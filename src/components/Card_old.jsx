import React from 'react';

const Card = ({ 
  children, 
  className = '', 
  variant = 'default', 
  padding = 'default',
  shadow = true,
  hover = false,
  clickable = false,
  role,
  tabIndex,
  onClick,
  onKeyDown,
  icon: IconComponent,
  title,
  description,
  action,
  ...props 
}) => {
  // Handle keyboard navigation for clickable cards
  const handleKeyDown = (e) => {
    if (clickable && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      if (onClick) onClick(e);
    }
    if (onKeyDown) onKeyDown(e);
  };

  const cardClasses = [
    'luna-card',
    variant !== 'default' && `luna-card--${variant}`,
    clickable && 'luna-card--clickable',
    className
  ].filter(Boolean).join(' ');

  return (
    <div
      className={cardClasses}
      role={clickable ? (role || 'button') : role}
      tabIndex={clickable ? (tabIndex !== undefined ? tabIndex : 0) : tabIndex}
      onClick={clickable ? onClick : undefined}
      onKeyDown={handleKeyDown}
      {...props}
    >
      {IconComponent && (
        <div className="luna-card__icon">
          <IconComponent className="luna-card__icon-svg" aria-hidden="true" />
        </div>
      )}
      
      {title && (
        <h3 className="luna-card__title">
          {title}
        </h3>
      )}
      
      {description && (
        <p className="luna-card__description">
          {description}
        </p>
      )}
      
      {children && (
        <div className="luna-card__content">
          {children}
        </div>
      )}
      
      {action && (
        <div className="luna-card__action">
          {action}
        </div>
      )}
    </div>
  );
};
        .luna-card {
          background-color: var(--luna-bg-primary);
          border-radius: var(--luna-radius-lg);
          border: 1px solid var(--luna-grey-200);
          transition: all var(--luna-transition-normal);
          display: block;
          width: 100%;
          position: relative;
          overflow: hidden;
        }

        /* Variants */
        .luna-card--default {
          background-color: var(--luna-bg-primary);
          border-color: var(--luna-grey-200);
        }

        .luna-card--primary {
          background: linear-gradient(135deg, var(--luna-pink-50) 0%, var(--luna-blue-50) 100%);
          border-color: var(--luna-pink-200);
          position: relative;
        }

        .luna-card--primary::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: var(--luna-gradient-primary);
        }

        .luna-card--gradient {
          background: var(--luna-gradient-subtle);
          border-color: var(--luna-pink-200);
          color: var(--luna-text-on-light);
        }

        .luna-card--secondary {
          background-color: var(--luna-bg-secondary);
          border-color: var(--luna-grey-300);
        }

        .luna-card--muted {
          background-color: var(--luna-grey-50);
          border-color: var(--luna-grey-200);
        }

        .luna-card--danger {
          background-color: var(--luna-red-50);
          border-color: var(--luna-red-200);
        }

        .luna-card--success {
          background-color: var(--luna-green-50);
          border-color: var(--luna-green-200);
        }

        .luna-card--warning {
          background-color: var(--luna-yellow-50);
          border-color: var(--luna-yellow-200);
        }

        /* Padding variants */
        .luna-card--padding-none {
          padding: 0;
        }

        .luna-card--padding-sm {
          padding: var(--luna-space-4);
        }

        .luna-card--padding-default {
          padding: var(--luna-space-6);
        }

        .luna-card--padding-lg {
          padding: var(--luna-space-8);
        }

        .luna-card--padding-xl {
          padding: var(--luna-space-12);
        }

        /* Shadow */
        .luna-card--shadow {
          box-shadow: var(--luna-shadow-sm);
        }

        /* Hover effects */
        .luna-card--hover:hover {
          transform: translateY(-2px);
          box-shadow: var(--luna-shadow-lg);
          border-color: var(--luna-pink-300);
        }

        /* Clickable */
        .luna-card--clickable {
          cursor: pointer;
          transition: all var(--luna-transition-fast);
        }

        .luna-card--clickable:hover {
          transform: translateY(-1px);
          box-shadow: var(--luna-shadow-md);
        }

        .luna-card--clickable:active {
          transform: translateY(0);
          box-shadow: var(--luna-shadow-sm);
        }

        .luna-card--clickable:focus {
          outline: 2px solid var(--luna-pink);
          outline-offset: 2px;
        }

        .luna-card--clickable:focus-visible {
          outline: 2px solid var(--luna-pink);
          outline-offset: 2px;
        }

        /* Card components */
        .luna-card__icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 48px;
          height: 48px;
          margin-bottom: var(--luna-space-4);
          border-radius: var(--luna-radius-lg);
          background-color: var(--luna-bg-secondary);
        }

        .luna-card__icon-svg {
          width: 32px;
          height: 32px;
        }

        .luna-card__icon--pink {
          color: var(--luna-pink);
          background-color: var(--luna-pink-50);
        }

        .luna-card__icon--blue {
          color: var(--luna-blue);
          background-color: var(--luna-blue-50);
        }

        .luna-card__icon--gradient {
          background: var(--luna-gradient-primary);
          color: white;
        }

        .luna-card__icon--green {
          color: var(--luna-green-600);
          background-color: var(--luna-green-50);
        }

        .luna-card__icon--yellow {
          color: var(--luna-yellow-600);
          background-color: var(--luna-yellow-50);
        }

        .luna-card__icon--red {
          color: var(--luna-red-600);
          background-color: var(--luna-red-50);
        }

        .luna-card__title {
          font-size: var(--luna-font-size-xl);
          font-weight: var(--luna-font-weight-semibold);
          color: var(--luna-text-primary);
          margin: 0 0 var(--luna-space-2) 0;
          line-height: var(--luna-line-height-tight);
        }

        .luna-card__description {
          font-size: var(--luna-font-size-base);
          color: var(--luna-text-secondary);
          margin: 0 0 var(--luna-space-4) 0;
          line-height: var(--luna-line-height-relaxed);
        }

        .luna-card__content {
          margin-bottom: var(--luna-space-4);
        }

        .luna-card__action {
          margin-top: var(--luna-space-6);
        }

        /* Reduced motion */
        @media (prefers-reduced-motion: reduce) {
          .luna-card {
            transition: none;
          }

          .luna-card--hover:hover,
          .luna-card--clickable:hover {
            transform: none;
          }

          .luna-card--clickable:active {
            transform: none;
          }
        }

        /* Dark mode support */
        @media (prefers-color-scheme: dark) {
          .luna-card--default {
            background-color: var(--luna-grey-800);
            border-color: var(--luna-grey-700);
          }

          .luna-card--secondary {
            background-color: var(--luna-grey-750);
            border-color: var(--luna-grey-600);
          }

          .luna-card--muted {
            background-color: var(--luna-grey-900);
            border-color: var(--luna-grey-700);
          }

          .luna-card__title {
            color: var(--luna-text-on-dark);
          }

          .luna-card__description {
            color: var(--luna-grey-300);
          }
        }

        /* High contrast mode */
        @media (prefers-contrast: high) {
          .luna-card {
            border-width: 2px;
            border-color: var(--luna-text-primary);
          }

          .luna-card--clickable:focus,
          .luna-card--clickable:focus-visible {
            outline-width: 3px;
            outline-color: var(--luna-text-primary);
          }
        }

        /* Print styles */
        @media print {
          .luna-card {
            box-shadow: none;
            border: 1px solid #000;
          }

          .luna-card--hover:hover,
          .luna-card--clickable:hover {
            transform: none;
            box-shadow: none;
          }
        }
      `}</style>
    </div>
  );
};

export default Card;

// Icon components for the cards
export const HeartIcon = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
  </svg>
);

export const HandHelpingIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 2.25a9.75 9.75 0 109.75 9.75A9.75 9.75 0 0012 2.25zm0 0V12m0 0l3.75-3.75M12 12l-3.75-3.75"/>
  </svg>
);

export const GiftIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"/>
  </svg>
);

export const UserGroupIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
  </svg>
);

export const PhoneIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
  </svg>
);

export const QrCodeIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"/>
  </svg>
);