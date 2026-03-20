import React from 'react';

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  type = 'button',
  disabled = false,
  loading = false,
  onClick,
  className = '',
  ariaLabel,
  icon: IconComponent,
  iconPosition = 'left',
  fullWidth = false,
  ...props
}) => {
  const buttonClasses = [
    'luna-button',
    `luna-button--${variant}`,
    `luna-button--${size}`,
    fullWidth && 'luna-button--full-width',
    loading && 'luna-button--loading',
    disabled && 'luna-button--disabled',
    className
  ].filter(Boolean).join(' ');

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={buttonClasses}
      aria-label={ariaLabel}
      {...props}
    >
      {loading && (
        <span className="luna-button__spinner" aria-hidden="true">
          <svg className="luna-button__spinner-svg" fill="none" viewBox="0 0 24 24">
            <circle 
              className="luna-button__spinner-track" 
              cx="12" 
              cy="12" 
              r="10" 
              stroke="currentColor" 
              strokeWidth="4"
            />
            <path 
              className="luna-button__spinner-path" 
              fill="currentColor" 
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        </span>
      )}
      
      {IconComponent && iconPosition === 'left' && !loading && (
        <IconComponent className="luna-button__icon luna-button__icon--left" aria-hidden="true" />
      )}
      
      <span className="luna-button__text">
        {children}
      </span>
      
      {IconComponent && iconPosition === 'right' && !loading && (
        <IconComponent className="luna-button__icon luna-button__icon--right" aria-hidden="true" />
      )}

      <style jsx>{`
        .luna-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: var(--luna-space-2);
          font-family: var(--luna-font-family);
          font-weight: var(--luna-font-weight-medium);
          line-height: 1;
          text-align: center;
          text-decoration: none;
          border: 1px solid transparent;
          border-radius: var(--luna-radius-md);
          cursor: pointer;
          transition: all var(--luna-transition-fast);
          position: relative;
          white-space: nowrap;
          user-select: none;
          -webkit-user-select: none;
          background-clip: padding-box;
        }

        .luna-button:focus {
          outline: 2px solid transparent;
          outline-offset: 2px;
        }

        .luna-button:focus-visible {
          box-shadow: 0 0 0 2px var(--luna-bg-primary), 0 0 0 4px var(--luna-pink);
        }

        /* Variants */
        .luna-button--primary {
          background: var(--luna-gradient-primary);
          color: white;
          border-color: transparent;
          box-shadow: var(--luna-shadow-sm);
        }

        .luna-button--primary:hover:not(:disabled) {
          opacity: 0.9;
          transform: translateY(-1px);
          box-shadow: var(--luna-shadow-md);
        }

        .luna-button--primary:active:not(:disabled) {
          transform: translateY(0);
          box-shadow: var(--luna-shadow-sm);
        }

        .luna-button--secondary {
          background-color: var(--luna-bg-secondary);
          color: var(--luna-text-primary);
          border-color: var(--luna-grey-300);
        }

        .luna-button--secondary:hover:not(:disabled) {
          background-color: var(--luna-grey-100);
          border-color: var(--luna-grey-400);
        }

        .luna-button--outline {
          background-color: transparent;
          color: var(--luna-pink);
          border-color: var(--luna-pink);
        }

        .luna-button--outline:hover:not(:disabled) {
          background-color: var(--luna-pink-50);
          color: var(--luna-pink-600);
          border-color: var(--luna-pink-600);
        }

        .luna-button--ghost {
          background-color: transparent;
          color: var(--luna-text-secondary);
          border-color: transparent;
        }

        .luna-button--ghost:hover:not(:disabled) {
          background-color: var(--luna-bg-secondary);
          color: var(--luna-text-primary);
        }

        .luna-button--danger {
          background-color: var(--luna-red-600);
          color: white;
          border-color: var(--luna-red-600);
        }

        .luna-button--danger:hover:not(:disabled) {
          background-color: var(--luna-red-700);
          border-color: var(--luna-red-700);
        }

        .luna-button--success {
          background-color: var(--luna-green-600);
          color: white;
          border-color: var(--luna-green-600);
        }

        .luna-button--success:hover:not(:disabled) {
          background-color: var(--luna-green-700);
          border-color: var(--luna-green-700);
        }

        .luna-button--warning {
          background-color: var(--luna-yellow-500);
          color: var(--luna-grey-900);
          border-color: var(--luna-yellow-500);
        }

        .luna-button--warning:hover:not(:disabled) {
          background-color: var(--luna-yellow-600);
          border-color: var(--luna-yellow-600);
        }

        /* Sizes */
        .luna-button--xs {
          padding: var(--luna-space-1) var(--luna-space-2);
          font-size: var(--luna-font-size-xs);
          gap: var(--luna-space-1);
        }

        .luna-button--sm {
          padding: var(--luna-space-2) var(--luna-space-3);
          font-size: var(--luna-font-size-sm);
          gap: var(--luna-space-1);
        }

        .luna-button--md {
          padding: var(--luna-space-3) var(--luna-space-4);
          font-size: var(--luna-font-size-base);
          gap: var(--luna-space-2);
        }

        .luna-button--lg {
          padding: var(--luna-space-4) var(--luna-space-6);
          font-size: var(--luna-font-size-lg);
          gap: var(--luna-space-2);
        }

        .luna-button--xl {
          padding: var(--luna-space-5) var(--luna-space-8);
          font-size: var(--luna-font-size-xl);
          gap: var(--luna-space-3);
        }

        /* Full width */
        .luna-button--full-width {
          width: 100%;
        }

        /* States */
        .luna-button--disabled,
        .luna-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          pointer-events: none;
        }

        .luna-button--loading {
          cursor: wait;
        }

        .luna-button--loading .luna-button__text {
          opacity: 0.7;
        }

        /* Components */
        .luna-button__text {
          display: inline-block;
        }

        .luna-button__icon {
          width: 1em;
          height: 1em;
          flex-shrink: 0;
        }

        .luna-button__icon--left {
          margin-left: calc(var(--luna-space-1) * -1);
        }

        .luna-button__icon--right {
          margin-right: calc(var(--luna-space-1) * -1);
        }

        .luna-button__spinner {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 1em;
          height: 1em;
          margin-left: calc(var(--luna-space-1) * -1);
        }

        .luna-button__spinner-svg {
          width: 100%;
          height: 100%;
          animation: spin 1s linear infinite;
        }

        .luna-button__spinner-track {
          opacity: 0.25;
        }

        .luna-button__spinner-path {
          opacity: 0.75;
        }

        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        /* Reduced motion */
        @media (prefers-reduced-motion: reduce) {
          .luna-button {
            transition: none;
          }

          .luna-button--primary:hover:not(:disabled),
          .luna-button--primary:active:not(:disabled) {
            transform: none;
          }

          .luna-button__spinner-svg {
            animation: none;
          }
        }

        /* High contrast mode */
        @media (prefers-contrast: high) {
          .luna-button {
            border-width: 2px;
          }

          .luna-button:focus-visible {
            outline: 3px solid;
            outline-offset: 2px;
          }
        }

        /* Dark mode */
        @media (prefers-color-scheme: dark) {
          .luna-button--secondary {
            background-color: var(--luna-grey-700);
            color: var(--luna-text-on-dark);
            border-color: var(--luna-grey-600);
          }

          .luna-button--secondary:hover:not(:disabled) {
            background-color: var(--luna-grey-600);
            border-color: var(--luna-grey-500);
          }

          .luna-button--ghost {
            color: var(--luna-grey-300);
          }

          .luna-button--ghost:hover:not(:disabled) {
            background-color: var(--luna-grey-700);
            color: var(--luna-text-on-dark);
          }
        }

        /* Print styles */
        @media print {
          .luna-button {
            background: white !important;
            color: black !important;
            border: 1px solid black !important;
            box-shadow: none !important;
          }
        }
      `}</style>
    </button>
  );
};

export default Button;