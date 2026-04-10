import React, { useEffect } from 'react';
import Card, { GiftIcon, HeartIcon, PhoneIcon } from '../components/Card';
import Button from '../components/Button';
import HeroLogo from '../components/HeroLogo';
import { usePublicImpactStats } from '../hooks/usePublicImpactStats';
import { sitePath } from '../constants/site';
import QrCodeImage from '../components/QrCodeImage';
import { ADMIN_EMAIL } from '../constants/contact';

/**
 * Quick donation tiers: five cards so each has a similar chip count (4–5), no overlap.
 * Colours: pink → gradient ×3 → blue.
 */
const QUICK_DONATION_TIERS = [
  {
    label: 'Under £5',
    cardVariant: 'primary',
    buttonVariant: 'primary',
    amounts: [
      { paypal: '1.99', label: '£1.99' },
      { paypal: '2.99', label: '£2.99' },
      { paypal: '3.99', label: '£3.99' },
      { paypal: '4.99', label: '£4.99' }
    ]
  },
  {
    label: '£5 – £25',
    cardVariant: 'gradient',
    buttonVariant: 'gradient',
    amounts: [
      { paypal: '5', label: '£5' },
      { paypal: '10', label: '£10' },
      { paypal: '15', label: '£15' },
      { paypal: '20', label: '£20' },
      { paypal: '25', label: '£25' }
    ]
  },
  {
    label: '£30 – £50',
    cardVariant: 'gradient',
    buttonVariant: 'gradient',
    amounts: [
      { paypal: '30', label: '£30' },
      { paypal: '35', label: '£35' },
      { paypal: '40', label: '£40' },
      { paypal: '45', label: '£45' },
      { paypal: '50', label: '£50' }
    ]
  },
  {
    label: '£55 – £75',
    cardVariant: 'gradient',
    buttonVariant: 'gradient',
    amounts: [
      { paypal: '55', label: '£55' },
      { paypal: '60', label: '£60' },
      { paypal: '65', label: '£65' },
      { paypal: '70', label: '£70' },
      { paypal: '75', label: '£75' }
    ]
  },
  {
    label: '£80 – £100',
    cardVariant: 'secondary',
    buttonVariant: 'secondary',
    amounts: [
      { paypal: '80', label: '£80' },
      { paypal: '85', label: '£85' },
      { paypal: '90', label: '£90' },
      { paypal: '95', label: '£95' },
      { paypal: '100', label: '£100' }
    ]
  }
];

const TIDE_DONATE_URL = 'https://pay.tide.co/pay/a09c827d-4eaf-4fdd-823c-be490e5fa6df';

const Donate = () => {
  const impactStats = usePublicImpactStats();

  useEffect(() => {
    document.title = 'Donate to LUNA SEN PANTRY - Help Wirral Families | Food & Money Donations';
  }, []);

  const impactFigure = (value) => {
    if (impactStats.loading) return '…';
    return value ?? '—';
  };

  const donationMethods = [
    {
      variant: 'primary',
      icon: HeartIcon,
      title: 'Money Donations',
      description: 'Direct financial support helps us buy exactly what families need, including specialty items for SEN requirements.',
      action: (
        <div className="space-y-4">
          <a href={TIDE_DONATE_URL} target="_blank" rel="noopener noreferrer" className="luna-link-button">
            <Button variant="primary" size="lg" className="w-full">
              Donate with Tide
            </Button>
          </a>
          <p className="text-xs text-gray-500">
            Secure payment link powered by Tide. If you can, add a reference starting{' '}
            <strong className="font-extrabold text-gray-700">LSP-</strong> so we can track donations.
          </p>
        </div>
      )
    },
    {
      variant: 'gradient',
      icon: GiftIcon,
      title: 'Food Donations',
      description:
        'Arrange a drop-off or collection with us anywhere across the Wirral. We especially need SEN-friendly foods - get in touch using the details below.',
      action: (
        <div className="luna-donate-food-actions">
          <a href="#food-contact-title" className="luna-link-button">
            <Button variant="gradient" size="lg" className="w-full">
              View drop-off locations
            </Button>
          </a>
          <a
            href={`mailto:${encodeURIComponent(ADMIN_EMAIL)}?subject=${encodeURIComponent('Request food collection')}`}
            className="luna-link-button"
          >
            <Button variant="gradient" size="lg" className="w-full">
              Request collection
            </Button>
          </a>
        </div>
      )
    },
    {
      variant: 'secondary',
      icon: PhoneIcon,
      title: 'Corporate Support',
      description: 'Business partnerships, regular donations, or employee fundraising. Help us help more Wirral families.',
      action: (
        <a
          href={`mailto:${encodeURIComponent(ADMIN_EMAIL)}?subject=${encodeURIComponent('Corporate partnership — LUNA SEN PANTRY')}`}
          className="luna-link-button"
        >
          <Button variant="secondary" size="lg" className="w-full">
            Contact for Partnership
          </Button>
        </a>
      )
    }
  ];

  /** Donor-facing groups — titles align with src/constants/pantryCatalog.js (stock / admin) */
  const mostNeededItems = [
    {
      category: 'SEN-Friendly Foods',
      items: ['Plain pasta shapes', 'Specific brand cereals', 'Smooth textures', 'Allergen-free options'],
      priority: 'high'
    },
    {
      category: 'Staples',
      items: ['Rice', 'Pasta', 'Tinned tomatoes', 'Cooking oil', 'Long-life milk'],
      priority: 'medium'
    },
    {
      category: 'Protein',
      items: ['Tinned meat', 'Beans/lentils', 'Eggs', 'Peanut butter', 'Tuna'],
      priority: 'high'
    },
    {
      category: 'Baby/Child',
      items: ['Baby formula', 'Baby food', 'Nappies', 'Kids snacks', 'Fruit pouches'],
      priority: 'high'
    },
    {
      category: 'Hygiene',
      items: ['Toilet paper', 'Soap', 'Shampoo', 'Toothbrushes', 'Period products'],
      priority: 'medium'
    },
    {
      category: 'Pet Care',
      items: ['Dog food', 'Cat food', 'Pet treats', 'Cat litter'],
      priority: 'low'
    }
  ];

  return (
    <>
      <main className="luna-main">
        <section className="luna-hero" aria-labelledby="donate-hero-title">
          <div className="luna-container">
            <div className="luna-hero__content">
              <HeroLogo />
              <h1 id="donate-hero-title" className="luna-hero__title">
                Help Wirral Families
              </h1>
              <p className="luna-hero__subtitle">
                Your donation directly supports families with SEN and sensory needs
              </p>
              <p className="luna-hero__description">
                Every contribution stays local. Money, food, or corporate support - choose what works for you.
              </p>
              <div className="luna-hero__actions">
                <a href={TIDE_DONATE_URL} target="_blank" rel="noopener noreferrer" className="luna-link-button">
                  <Button variant="primary" size="xl" className="luna-button--full-width">
                    Donate with Tide
                  </Button>
                </a>
                <a href="#donate-methods" className="luna-link-button">
                  <Button variant="secondary" size="xl" className="luna-button--full-width">
                    See ways to give
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </section>

        <div className="luna-container">
          <section id="donate-methods" className="luna-section" aria-labelledby="donate-methods-title">
            <div className="luna-section-header">
              <h2 id="donate-methods-title" className="luna-section-title">
                Ways to Donate to <span className="luna-brand-text">LUNA</span>
              </h2>
              <p className="luna-section-description">
                Choose the method that works best for you - all donations stay local and help Wirral families
              </p>
            </div>

            <div className="luna-card-grid luna-card-grid--3-col">
              {donationMethods.map((method, index) => (
                <Card
                  key={index}
                  variant={method.variant}
                  icon={method.icon}
                  title={method.title}
                  description={method.description}
                  action={method.action}
                  hover
                />
              ))}
            </div>

            <div className="luna-card luna-card--gradient luna-text-center luna-section-spacer">
              <h3 className="luna-card-title">
                Quick donation to <span className="luna-brand-text">LUNA</span>
              </h3>
              <p className="luna-card-text mb-6">
                Tap an amount to open our secure Tide checkout - every gift stays in Wirral and supports SEN-first food
                support.
              </p>

              <div className="luna-donate-tiers" role="group" aria-label="Suggested donation amounts by tier">
                {QUICK_DONATION_TIERS.map((tier) => (
                  <div
                    key={tier.label}
                    className={`luna-card luna-donate-tier luna-card--${tier.cardVariant} luna-text-center`}
                  >
                    <h4 className="luna-donate-tier__title">{tier.label}</h4>
                    <div className="luna-donate-tier__chips">
                      {tier.amounts.map((row) => (
                        <a
                          key={row.paypal}
                          href={TIDE_DONATE_URL}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="luna-donate-tier__chip luna-link-button"
                          aria-label={`Donate ${row.label} (opens Tide checkout)`}
                          title={`Donate ${row.label}`}
                        >
                          <Button variant={tier.buttonVariant} size="sm" className="luna-donate-tier__btn">
                            {row.label}
                          </Button>
                        </a>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-4 mb-0">
                You can enter your chosen amount during checkout. If possible, add a reference starting{' '}
                <strong className="font-extrabold text-gray-700">LSP-</strong>.
              </p>

              <p className="luna-card-text luna-donate-impact-footnote text-sm mb-0">
                <strong className="luna-donate-impact__amt luna-donate-impact__amt--pink">£5</strong> can cover a
                simple family meal;{' '}
                <strong className="luna-donate-impact__amt luna-text-gradient">£25</strong> helps stock essentials;{' '}
                <strong className="luna-donate-impact__amt luna-donate-impact__amt--blue">£100</strong> goes a long
                way for specialty SEN-friendly items.
              </p>
            </div>
          </section>

          <section className="luna-section" aria-labelledby="needed-title">
            <div className="luna-section-header">
              <h2 id="needed-title" className="luna-section-title">
                Most Needed Items
              </h2>
              <p className="luna-section-description">
                These items are always in high demand, especially SEN-friendly options
              </p>
            </div>

            <div className="luna-grid luna-grid--3">
              {mostNeededItems.map((category, index) => (
                <div
                  key={index}
                  className={`luna-card luna-donate-needed-card ${
                    category.priority === 'high'
                      ? 'luna-card--gradient'
                      : category.priority === 'medium'
                        ? 'luna-card--secondary'
                        : 'luna-card--primary'
                  }`}
                >
                  <div className="luna-donate-needed-card__header">
                    <h3 className="luna-card__title luna-donate-needed-card__title">{category.category}</h3>
                    {category.priority === 'high' && (
                      <span className="luna-donate-needed-priority">High Priority</span>
                    )}
                  </div>
                  <ul className="luna-donate-needed-list space-y-2 list-none p-0 m-0">
                    {category.items.map((item, itemIndex) => (
                      <li key={itemIndex} className="flex items-center text-sm">
                        <span className="w-2 h-2 bg-luna-pink rounded-full mr-3 shrink-0" aria-hidden />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div className="luna-donate-callout">
              <h3 className="luna-donate-callout__title">Important notes for food donations</h3>
              <ul>
                <li>Please check expiry dates - we need at least 1 month remaining</li>
                <li>We cannot accept fresh produce, homemade items, or alcohol</li>
                <li>SEN-friendly items (specific brands, textures) are especially valuable</li>
                <li>Please ensure packaging is unopened and undamaged</li>
              </ul>
            </div>
          </section>

          <section className="luna-section" aria-labelledby="food-contact-title">
            <div className="luna-section-header">
              <h2 id="food-contact-title" className="luna-section-title">
                Food donations - get in touch
              </h2>
              <p className="luna-section-description">
                We support families across the Metropolitan Borough of Wirral. Call or email to arrange drop-off or
                collection - we&apos;ll agree what works for you.
              </p>
            </div>

            <div className="max-w-2xl mx-auto">
              <div className="luna-card luna-card--gradient luna-text-center">
                <h3 className="luna-card-title">Call or email us</h3>
                <p className="luna-card-text mb-6">
                  We&apos;ll help you arrange food drop-off or collection anywhere across the Wirral - including from
                  your home or workplace if that&apos;s easier.
                </p>
                <div className="luna-grid luna-grid--2">
                  <a href="tel:07718851362" className="luna-link-button">
                    <Button variant="primary" size="lg" className="w-full">
                      Call for collection
                    </Button>
                  </a>
                  <a href={`mailto:${encodeURIComponent(ADMIN_EMAIL)}`} className="luna-link-button">
                    <Button variant="secondary" size="lg" className="w-full">
                      Email us
                    </Button>
                  </a>
                </div>
              </div>
            </div>
          </section>

          <section className="luna-section" aria-labelledby="impact-title">
            <div className="luna-section-header">
              <h2 id="impact-title" className="luna-section-title">
                Your impact
              </h2>
              <p className="luna-section-description">
                See how your donations make a real difference to Wirral families
              </p>
            </div>

            <div className="luna-grid luna-grid--3">
              <div className="luna-card luna-card--primary luna-text-center">
                <div className="luna-impact-badge luna-impact-badge--pink">95%</div>
                <h3 className="luna-card__title">Local families</h3>
                <p className="luna-card__description mb-0">of our support goes to families with SEN or disabilities</p>
              </div>

              <div className="luna-card luna-card--secondary luna-text-center">
                <div className="luna-impact-badge luna-impact-badge--blue">48h</div>
                <h3 className="luna-card__title">Response time</h3>
                <p className="luna-card__description mb-0">from referral to food support delivered</p>
              </div>

              <div className="luna-card luna-card--primary luna-text-center">
                <div className="luna-impact-badge luna-impact-badge--pink">£1</div>
                <h3 className="luna-card__title">Goes further</h3>
                <p className="luna-card__description mb-0">provides £3 worth of food through bulk buying</p>
              </div>
            </div>

            <div className="luna-card luna-card--secondary luna-text-center luna-section-spacer">
              <h3 className="luna-card-title">Recent impact</h3>
              {!impactStats.loading && !impactStats.hasLiveStats && (
                <p className="luna-card-text text-sm mb-4 opacity-90">
                  Monthly totals will appear here as soon as we publish live figures.
                </p>
              )}
              <div className="luna-grid luna-grid--4">
                <div>
                  <div className="text-3xl font-bold text-luna-pink mb-2">
                    {impactFigure(impactStats.families)}
                  </div>
                  <div className="text-sm text-gray-600">Families helped this month</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-luna-blue mb-2">
                    {impactFigure(impactStats.senPercent)}
                  </div>
                  <div className="text-sm text-gray-600">Had SEN requirements</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-luna-pink mb-2">
                    {impactFigure(impactStats.foodTonnes)}
                  </div>
                  <div className="text-sm text-gray-600">Food distributed</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-luna-blue mb-2">
                    {impactFigure(impactStats.donated)}
                  </div>
                  <div className="text-sm text-gray-600">Donated this month</div>
                </div>
              </div>
            </div>
          </section>

          <section
            className="luna-card luna-card--gradient luna-text-center luna-section-spacer"
            aria-labelledby="donate-cta-title"
          >
            <h2 id="donate-cta-title" className="luna-card-title">
              Ready to help local families?
            </h2>
            <p className="luna-card-text mb-8">
              Every donation stays local and directly helps Wirral families in need
            </p>

            <div className="luna-grid luna-grid--2">
              <a href={TIDE_DONATE_URL} target="_blank" rel="noopener noreferrer" className="luna-link-button">
                <Button variant="primary" size="xl" className="luna-button--full-width">
                  Donate with Tide
                </Button>
              </a>
              <a href="tel:07718851362" className="luna-link-button">
                <Button variant="secondary" size="xl" className="luna-button--full-width">
                  Arrange food collection
                </Button>
              </a>
            </div>

            <div className="luna-card-note">
              <p className="mb-2">Quick access via QR code:</p>
              <p className="mb-4 text-sm text-gray-600">
                Scan with your phone — opens this donate page in the browser.
              </p>
              <div className="flex justify-center">
                <div className="text-center bg-white p-4 rounded-lg shadow-sm">
                  <QrCodeImage
                    value={sitePath('/donate')}
                    size={120}
                    alt="QR code: open Donate page"
                    className="w-[120px] h-[120px] mx-auto mb-2 object-contain rounded-md"
                  />
                  <p className="text-xs text-gray-600">Scan to donate</p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </>
  );
};

export default Donate;
