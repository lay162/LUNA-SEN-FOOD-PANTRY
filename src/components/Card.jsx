import React from 'react';

const Card = ({ 
  children, 
  className = '', 
  variant = 'default', 
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