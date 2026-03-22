import React from 'react';
import { Link } from 'react-router-dom';
import Card, { HeartIcon, GiftIcon, UserGroupIcon } from '../components/Card';
import Button from '../components/Button';
import HeroLogo from '../components/HeroLogo';
import { SITE_URL } from '../constants/site';

const Home = () => {
  // Set page title and meta description
  React.useEffect(() => {
    document.title = 'LUNA SEN PANTRY - Food Support Hub | Wirral & Merseyside | SEN Priority Help';
    
    // Update meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute(
        'content',
        'Independent SEN-priority food support across the Metropolitan Borough of Wirral, Merseyside — not one postcode alone. Birkenhead, Wallasey, Heswall, Bebington, Bromborough, Hoylake, West Kirby and communities across the peninsula. No voucher needed.'
      );
    }
  }, []);

  const services = [
    {
      variant: 'primary', // Luna Pink
      icon: HeartIcon,
      title: 'Get Support',
      description: 'Need food support? Our simple self-referral takes 2 minutes. No vouchers needed. SEN and sensory needs prioritised.',
      action: (
        <Link to="/support">
          <Button variant="primary" size="lg" fullWidth>
            Start Your Referral
          </Button>
        </Link>
      )
    },
    {
      variant: 'gradient', // Luna Gradient
      icon: GiftIcon,
      title: 'Donate',
      description: 'Help local families with food donations, money, or supplies. Every contribution makes a real difference to Wirral families.',
      action: (
        <Link to="/donate">
          <Button variant="gradient" size="lg" fullWidth>
            Make a Donation
          </Button>
        </Link>
      )
    },
    {
      variant: 'secondary', // Luna Blue
      icon: UserGroupIcon,
      title: 'Volunteer',
      description: 'Join our team as a hub volunteer or delivery driver. Flexible hours, full support, and help your local community.',
      action: (
        <Link to="/volunteer">
          <Button variant="secondary" size="lg" fullWidth>
            Apply to Volunteer
          </Button>
        </Link>
      )
    }
  ];

  return (
    <>
      <main className="luna-main">
        {/* Hero Section */}
        <section className="luna-hero" aria-labelledby="hero-title">
          <div className="luna-container">
            <div className="luna-hero__content">
              <HeroLogo />
              <h1 id="hero-title" className="luna-hero__title">
                <span className="luna-brand-text">LUNA</span> SEN PANTRY
              </h1>
              <p className="luna-hero__subtitle">
                Independent SEN-priority food support hub
              </p>
              <p className="luna-hero__description">
                Serving the Metropolitan Borough of Wirral — Birkenhead, Wallasey, Heswall, Bebington, Bromborough,
                Hoylake, West Kirby and beyond • No vouchers • No questions • Just help when you need it
              </p>
              
              <div className="luna-hero__actions">
                <Link to="/support">
                  <Button variant="primary" size="xl">
                    Get Support Now
                  </Button>
                </Link>
                <Link to="/donate">
                  <Button variant="secondary" size="xl">
                    Donate Today
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Mini Auto-Scrolling Stats */}
        <section className="luna-stats-mini">
          <div className="luna-container">
            <div className="luna-stats-mini__track">
              {/* FIRST SET OF CARDS */}
              {/* Card 1: SEN Support - PRIMARY PINK */}
              <div className="luna-card-mini luna-card-mini--primary">
                <div className="luna-card-mini__icon">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                </div>
                <div className="luna-card-mini__content">
                  <div className="luna-stats-mini__value">95%</div>
                  <div className="luna-stats-mini__label">SEN families</div>
                </div>
              </div>

              {/* Card 2: Response Time - GRADIENT */}
              <div className="luna-card-mini luna-card-mini--gradient">
                <div className="luna-card-mini__icon">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <circle cx="12" cy="12" r="10"/>
                    <polyline points="12,6 12,12 16,14" stroke="white" fill="none" strokeWidth="2"/>
                  </svg>
                </div>
                <div className="luna-card-mini__content">
                  <div className="luna-stats-mini__value">24h</div>
                  <div className="luna-stats-mini__label">Response time</div>
                </div>
              </div>

              {/* Card 3: Coverage - SECONDARY BLUE */}
              <div className="luna-card-mini luna-card-mini--secondary">
                <div className="luna-card-mini__icon">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                    <circle cx="12" cy="10" r="3" fill="white"/>
                  </svg>
                </div>
                <div className="luna-card-mini__content">
                  <div className="luna-stats-mini__value">Wirral</div>
                  <div className="luna-stats-mini__label">Full borough</div>
                </div>
              </div>

              {/* Card 4: Referrals - PRIMARY PINK */}
              <div className="luna-card-mini luna-card-mini--primary">
                <div className="luna-card-mini__icon">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M9 11H7a2 2 0 00-2 2v7a2 2 0 002 2h2a2 2 0 002-2v-7a2 2 0 00-2-2zM13 7H11a2 2 0 00-2 2v11a2 2 0 002 2h2a2 2 0 002-2V9a2 2 0 00-2-2zM17 3h-2a2 2 0 00-2 2v15a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2z"/>
                  </svg>
                </div>
                <div className="luna-card-mini__content">
                  <div className="luna-stats-mini__value">247</div>
                  <div className="luna-stats-mini__label">Referrals taken</div>
                </div>
              </div>

              {/* Card 5: Fulfilled - GRADIENT */}
              <div className="luna-card-mini luna-card-mini--gradient">
                <div className="luna-card-mini__icon">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                </div>
                <div className="luna-card-mini__content">
                  <div className="luna-stats-mini__value">231</div>
                  <div className="luna-stats-mini__label">Fulfilled</div>
                </div>
              </div>

              {/* Card 6: Pending - SECONDARY BLUE */}
              <div className="luna-card-mini luna-card-mini--secondary">
                <div className="luna-card-mini__icon">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                </div>
                <div className="luna-card-mini__content">
                  <div className="luna-stats-mini__value">16</div>
                  <div className="luna-stats-mini__label">Pending</div>
                </div>
              </div>

              {/* Card 7: Volunteers - PRIMARY PINK */}
              <div className="luna-card-mini luna-card-mini--primary">
                <div className="luna-card-mini__icon">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
                    <circle cx="9" cy="7" r="4"/>
                    <path d="M23 21v-2a4 4 0 00-3-3.87"/>
                    <path d="M16 3.13a4 4 0 010 7.75"/>
                  </svg>
                </div>
                <div className="luna-card-mini__content">
                  <div className="luna-stats-mini__value">42</div>
                  <div className="luna-stats-mini__label">Volunteers</div>
                </div>
              </div>

              {/* Card 8: Food Parcels - GRADIENT */}
              <div className="luna-card-mini luna-card-mini--gradient">
                <div className="luna-card-mini__icon">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
                  </svg>
                </div>
                <div className="luna-card-mini__content">
                  <div className="luna-stats-mini__value">85</div>
                  <div className="luna-stats-mini__label">Food parcels</div>
                </div>
              </div>

              {/* Card 9: Safe Foods - SECONDARY BLUE */}
              <div className="luna-card-mini luna-card-mini--secondary">
                <div className="luna-card-mini__icon">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"/>
                  </svg>
                </div>
                <div className="luna-card-mini__content">
                  <div className="luna-stats-mini__value">320</div>
                  <div className="luna-stats-mini__label">Safe foods</div>
                </div>
              </div>

              {/* DUPLICATE SET FOR SEAMLESS LOOP */}
              {/* Card 1 Duplicate: SEN Support - PRIMARY PINK */}
              <div className="luna-card-mini luna-card-mini--primary">
                <div className="luna-card-mini__icon">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                </div>
                <div className="luna-card-mini__content">
                  <div className="luna-stats-mini__value">95%</div>
                  <div className="luna-stats-mini__label">SEN families</div>
                </div>
              </div>

              {/* Card 2 Duplicate: Response Time - GRADIENT */}
              <div className="luna-card-mini luna-card-mini--gradient">
                <div className="luna-card-mini__icon">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <circle cx="12" cy="12" r="10"/>
                    <polyline points="12,6 12,12 16,14" stroke="white" fill="none" strokeWidth="2"/>
                  </svg>
                </div>
                <div className="luna-card-mini__content">
                  <div className="luna-stats-mini__value">24h</div>
                  <div className="luna-stats-mini__label">Response time</div>
                </div>
              </div>

              {/* Card 3 Duplicate: Coverage - SECONDARY BLUE */}
              <div className="luna-card-mini luna-card-mini--secondary">
                <div className="luna-card-mini__icon">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                    <circle cx="12" cy="10" r="3" fill="white"/>
                  </svg>
                </div>
                <div className="luna-card-mini__content">
                  <div className="luna-stats-mini__value">Wirral</div>
                  <div className="luna-stats-mini__label">Full borough</div>
                </div>
              </div>

              {/* Card 4 Duplicate: Referrals - PRIMARY PINK */}
              <div className="luna-card-mini luna-card-mini--primary">
                <div className="luna-card-mini__icon">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M9 11H7a2 2 0 00-2 2v7a2 2 0 002 2h2a2 2 0 002-2v-7a2 2 0 00-2-2zM13 7H11a2 2 0 00-2 2v11a2 2 0 002 2h2a2 2 0 002-2V9a2 2 0 00-2-2zM17 3h-2a2 2 0 00-2 2v15a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2z"/>
                  </svg>
                </div>
                <div className="luna-card-mini__content">
                  <div className="luna-stats-mini__value">247</div>
                  <div className="luna-stats-mini__label">Referrals taken</div>
                </div>
              </div>

              {/* Card 5 Duplicate: Fulfilled - GRADIENT */}
              <div className="luna-card-mini luna-card-mini--gradient">
                <div className="luna-card-mini__icon">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                </div>
                <div className="luna-card-mini__content">
                  <div className="luna-stats-mini__value">231</div>
                  <div className="luna-stats-mini__label">Fulfilled</div>
                </div>
              </div>

              {/* Card 6 Duplicate: Pending - SECONDARY BLUE */}
              <div className="luna-card-mini luna-card-mini--secondary">
                <div className="luna-card-mini__icon">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                </div>
                <div className="luna-card-mini__content">
                  <div className="luna-stats-mini__value">16</div>
                  <div className="luna-stats-mini__label">Pending</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Main Services */}
        <section className="luna-services" aria-labelledby="services-title">
          <div className="luna-container">
            <div className="luna-section-header">
              <h2 id="services-title" className="luna-section-title">
                How We Help
              </h2>
              <p className="luna-section-description">
                Simple, respectful support designed with SEN and sensory needs in mind. 
                No complicated forms or waiting lists.
              </p>
            </div>

            <div className="luna-card-grid luna-card-grid--3-col">
              {services.map((service, index) => (
                <Card
                  key={index}
                  variant={service.variant}
                  icon={service.icon}
                  title={service.title}
                  description={service.description}
                  action={service.action}
                  hover
                />
              ))}
            </div>
          </div>
        </section>

        {/* Emergency Contact Strip */}
        <section className="luna-emergency-strip">
          <div className="luna-container">
            <div className="luna-emergency-strip__content">
              <div className="luna-emergency-strip__icon">🚨</div>
              <div className="luna-emergency-strip__text">
                <strong>CRISIS SUPPORT:</strong> Need food today? Call or text 
                <a href="tel:07123456789" className="luna-emergency-strip__phone"> 07123 456 789</a>
              </div>
            </div>
          </div>
        </section>

        {/* Why Choose Luna Section - 4 Steps */}
        <section className="luna-features" aria-labelledby="why-choose-title">
          <div className="luna-container">
            <div className="luna-section-header">
              <h2 id="why-choose-title" className="luna-section-title">
                SEN-First Approach
              </h2>
              <p className="luna-section-description">
                We understand that families with special needs require extra understanding and support.
              </p>
            </div>

            {/* 4 Horizontal Cards */}
            <div className="luna-card-grid luna-card-grid--4-col">
              <div className="luna-card luna-card--primary">
                <div className="luna-card__icon">
                  <div className="luna-features__icon luna-features__icon--pink">✓</div>
                </div>
                <h3 className="luna-card__title">No Voucher System</h3>
                <p className="luna-card__description">Self-referral in 2 minutes. No complicated paperwork or waiting for referrals.</p>
              </div>
              
              <div className="luna-card luna-card--gradient">
                <div className="luna-card__icon">
                  <div className="luna-features__icon luna-features__icon--gradient">✓</div>
                </div>
                <h3 className="luna-card__title">Sensory Friendly</h3>
                <p className="luna-card__description">Quiet collection times, sensory-friendly spaces, and understanding volunteers.</p>
              </div>
              
              <div className="luna-card luna-card--secondary">
                <div className="luna-card__icon">
                  <div className="luna-features__icon luna-features__icon--blue">✓</div>
                </div>
                <h3 className="luna-card__title">Dietary Needs</h3>
                <p className="luna-card__description">Safe foods, allergen-free options, and cultural dietary requirements catered for.</p>
              </div>
              
              <div className="luna-card luna-card--primary">
                <div className="luna-card__icon">
                  <div className="luna-features__icon luna-features__icon--pink">✓</div>
                </div>
                <h3 className="luna-card__title">Home Delivery</h3>
                <p className="luna-card__description">Can't travel? Our volunteer drivers bring support directly to your door.</p>
              </div>
            </div>

            {/* Emergency Support Card - Separate Container Below */}
            <div className="luna-features__cta">
              <div className="luna-card luna-card--gradient luna-card--padding-lg luna-features__cta--centered">
                <h3 className="luna-features__cta-title">Emergency Support Available</h3>
                <p className="luna-features__cta-description">
                  Need help today? Our emergency referral can get support to you within 24 hours.
                </p>
                <Link to="/support?urgent=true">
                  <Button variant="gradient" size="lg" fullWidth>
                    Emergency Support
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="luna-cta" aria-labelledby="cta-title">
          <div className="luna-container">
            <div className="luna-cta__content">
              <h2 id="cta-title" className="luna-cta__title">
                Ready to Get Started?
              </h2>
              <p className="luna-cta__description">
                Whether you need support or want to help others, we&apos;re here for families across the Wirral
                peninsula.
              </p>
              
              <div className="luna-cta__actions">
                <Link to="/support">
                  <Button variant="primary" size="xl" fullWidth>
                    I Need Support
                  </Button>
                </Link>
                <Link to="/volunteer">
                  <Button variant="secondary" size="xl" fullWidth>
                    I Want to Help
                  </Button>
                </Link>
              </div>
              
              <div className="luna-cta__qr">
                <p className="luna-cta__qr-title">Quick access via QR codes:</p>
                <div className="luna-cta__qr-codes">
                  <div className="luna-cta__qr-item">
                    <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(`${SITE_URL}/support`)}`}
                      alt="QR code for self-referral"
                      className="luna-cta__qr-image"
                    />
                    <p className="luna-cta__qr-label">Get Support</p>
                  </div>
                  <div className="luna-cta__qr-item">
                    <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(`${SITE_URL}/donate`)}`}
                      alt="QR code for donations"
                      className="luna-cta__qr-image"
                    />
                    <p className="luna-cta__qr-label">Donate</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <style jsx>{`
        .luna-main {
          min-height: 100vh;
        }

        /* Hero Section */
        .luna-hero {
          background: var(--luna-gradient-primary);
          color: white;
          padding: var(--luna-space-20) 0;
          text-align: center;
        }

        .luna-hero__content {
          max-width: 800px;
          margin: 0 auto;
        }

        .luna-hero__title {
          font-size: var(--luna-font-size-5xl);
          font-weight: var(--luna-font-weight-bold);
          margin-bottom: var(--luna-space-6);
          line-height: var(--luna-line-height-tight);
        }

        .luna-hero__subtitle {
          font-size: var(--luna-font-size-2xl);
          margin-bottom: var(--luna-space-4);
          opacity: 0.95;
        }

        .luna-hero__description {
          font-size: var(--luna-font-size-lg);
          margin-bottom: var(--luna-space-8);
          opacity: 0.9;
          max-width: 600px;
          margin-left: auto;
          margin-right: auto;
        }

        .luna-hero__actions {
          display: flex;
          flex-direction: column;
          gap: var(--luna-space-4);
          align-items: center;
          max-width: 400px;
          margin: 0 auto;
        }

        /* Stats Section */
        .luna-stats {
          padding: var(--luna-space-12) 0;
          background-color: var(--luna-bg-secondary);
        }

        .luna-stats__grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: var(--luna-space-8);
          text-align: center;
        }

        .luna-stats__item {
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .luna-stats__value {
          font-size: var(--luna-font-size-3xl);
          font-weight: var(--luna-font-weight-bold);
          margin-bottom: var(--luna-space-2);
          line-height: 1;
        }

        .luna-stats__value--pink {
          color: var(--luna-pink);
        }

        .luna-stats__value--blue {
          color: var(--luna-blue);
        }

        .luna-stats__label {
          color: var(--luna-text-secondary);
          font-size: var(--luna-font-size-base);
        }

        /* Services Section */
        .luna-services {
          padding: var(--luna-space-16) 0;
        }

        .luna-services__grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: var(--luna-space-8);
        }

        /* Features Section */
        .luna-features {
          padding: var(--luna-space-16) 0;
          background-color: var(--luna-bg-secondary);
        }

        .luna-features__content {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: var(--luna-space-12);
          align-items: start;
        }

        .luna-features__list {
          display: flex;
          flex-direction: column;
          gap: var(--luna-space-6);
        }

        .luna-features__item {
          display: flex;
          align-items: flex-start;
          gap: var(--luna-space-4);
        }

        .luna-features__icon {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: var(--luna-font-weight-bold);
          flex-shrink: 0;
        }

        .luna-features__icon--pink {
          background-color: var(--luna-pink);
        }

        .luna-features__icon--gradient {
          background: var(--luna-gradient-primary);
        }

        .luna-features__icon--blue {
          background-color: var(--luna-blue);
        }

        .luna-features__text {
          flex: 1;
        }

        .luna-features__title {
          font-size: var(--luna-font-size-lg);
          font-weight: var(--luna-font-weight-semibold);
          margin-bottom: var(--luna-space-2);
          color: var(--luna-text-primary);
        }

        .luna-features__description {
          color: var(--luna-text-secondary);
          line-height: var(--luna-line-height-relaxed);
        }

        .luna-features__cta {
          position: sticky;
          top: var(--luna-space-8);
        }

        .luna-features__cta-title {
          font-size: var(--luna-font-size-2xl);
          font-weight: var(--luna-font-weight-bold);
          margin-bottom: var(--luna-space-4);
          color: var(--luna-text-primary);
          text-align: center;
        }

        .luna-features__cta-description {
          color: var(--luna-text-secondary);
          margin-bottom: var(--luna-space-6);
          text-align: center;
          line-height: var(--luna-line-height-relaxed);
        }

        /* CTA Section */
        .luna-cta {
          padding: var(--luna-space-16) 0;
        }

        /* Emergency Strip */
        .luna-emergency-strip {
          background: #dc2626;
          color: white;
          padding: var(--luna-space-4) 0;
          border-top: 3px solid #991b1b;
        }

        .luna-emergency-strip__content {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: var(--luna-space-3);
          text-align: center;
        }

        .luna-emergency-strip__icon {
          font-size: 1.5rem;
          animation: pulse 2s infinite;
        }

        .luna-emergency-strip__text {
          font-weight: var(--luna-font-weight-medium);
          font-size: var(--luna-font-size-base);
        }

        .luna-emergency-strip__phone {
          color: white;
          font-weight: var(--luna-font-weight-bold);
          text-decoration: underline;
          margin-left: var(--luna-space-1);
        }

        .luna-emergency-strip__phone:hover {
          color: #fecaca;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }

        .luna-cta__content {
          max-width: 600px;
          margin: 0 auto;
          text-align: center;
        }

        .luna-cta__title {
          font-size: var(--luna-font-size-4xl);
          font-weight: var(--luna-font-weight-bold);
          color: var(--luna-text-primary);
          margin-bottom: var(--luna-space-6);
        }

        .luna-cta__description {
          font-size: var(--luna-font-size-xl);
          color: var(--luna-text-secondary);
          margin-bottom: var(--luna-space-8);
          line-height: var(--luna-line-height-relaxed);
        }

        .luna-cta__actions {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: var(--luna-space-6);
          margin-bottom: var(--luna-space-8);
        }

        .luna-cta__qr {
          padding-top: var(--luna-space-8);
          border-top: 1px solid var(--luna-grey-200);
        }

        .luna-cta__qr-title {
          font-size: var(--luna-font-size-sm);
          color: var(--luna-text-muted);
          margin-bottom: var(--luna-space-4);
        }

        .luna-cta__qr-codes {
          display: flex;
          justify-content: center;
          gap: var(--luna-space-8);
        }

        .luna-cta__qr-item {
          text-align: center;
        }

        .luna-cta__qr-image {
          width: 80px;
          height: 80px;
          margin-bottom: var(--luna-space-2);
          border-radius: var(--luna-radius-md);
        }

        .luna-cta__qr-label {
          font-size: var(--luna-font-size-xs);
          color: var(--luna-text-muted);
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .luna-hero__title {
            font-size: var(--luna-font-size-3xl);
          }

          .luna-hero__subtitle {
            font-size: var(--luna-font-size-lg);
          }

          .luna-hero__description {
            font-size: var(--luna-font-size-base);
          }

          .luna-services__grid {
            grid-template-columns: 1fr;
          }

          .luna-features__content {
            grid-template-columns: 1fr;
            gap: var(--luna-space-8);
          }

          .luna-features__cta {
            position: static;
          }

          .luna-cta__actions {
            grid-template-columns: 1fr;
          }

          .luna-cta__qr-codes {
            flex-direction: column;
            align-items: center;
            gap: var(--luna-space-4);
          }
        }

        @media (max-width: 480px) {
          .luna-hero {
            padding: var(--luna-space-12) 0;
          }

          .luna-hero__title {
            font-size: var(--luna-font-size-2xl);
          }

          .luna-stats__grid {
            grid-template-columns: 1fr;
            gap: var(--luna-space-4);
          }

          .luna-features__item {
            flex-direction: column;
            text-align: center;
            gap: var(--luna-space-2);
          }
        }
      `}</style>
    </>
  );
};

export default Home;