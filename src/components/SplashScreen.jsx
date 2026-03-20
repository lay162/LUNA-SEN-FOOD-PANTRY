import React from 'react';

const SplashScreen = ({ isVisible }) => {
  if (!isVisible) return null;

  return (
    <div className="luna-splash">
      <div className="luna-splash__content">
        <div className="luna-splash__logo">
          <img 
            src="/logo.svg" 
            alt="LUNA SEN PANTRY" 
            width="120" 
            height="120"
          />
        </div>
        <h1 className="luna-splash__title">LUNA SEN PANTRY</h1>
        <p className="luna-splash__subtitle">SEN-Priority Food Support Hub</p>
        <div className="luna-splash__loading">
          <div className="luna-loading"></div>
        </div>
      </div>
      
      <style jsx>{`
        .luna-splash {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: var(--luna-gradient);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          color: var(--luna-text-inverse);
        }
        
        .luna-splash__content {
          text-align: center;
          padding: var(--luna-space-8);
        }
        
        .luna-splash__logo {
          margin-bottom: var(--luna-space-6);
        }
        
        .luna-splash__logo img {
          filter: brightness(0) invert(1);
          opacity: 0.95;
        }
        
        .luna-splash__title {
          font-size: var(--luna-font-size-3xl);
          font-weight: var(--luna-font-weight-bold);
          margin-bottom: var(--luna-space-2);
          color: var(--luna-text-inverse);
        }
        
        .luna-splash__subtitle {
          font-size: var(--luna-font-size-lg);
          opacity: 0.9;
          margin-bottom: var(--luna-space-8);
          color: var(--luna-text-inverse);
        }
        
        .luna-splash__loading {
          display: flex;
          justify-content: center;
        }
        
        .luna-splash__loading .luna-loading {
          border-color: rgba(255, 255, 255, 0.3);
          border-top-color: white;
        }
        
        @media (max-width: 768px) {
          .luna-splash__title {
            font-size: var(--luna-font-size-2xl);
          }
          
          .luna-splash__subtitle {
            font-size: var(--luna-font-size-base);
          }
          
          .luna-splash__logo img {
            width: 80px;
            height: 80px;
          }
        }
      `}</style>
    </div>
  );
};

export default SplashScreen;