import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/Button';
import FormField from '../components/FormField';
import HeroLogo from '../components/HeroLogo';
import { SITE_URL } from '../constants/site';
import { useOfflineForm } from '../hooks/useOfflineForm';
import { getDb, isFirebaseConfigured } from '../firebase';

const Stories = () => {
  const { isSubmitting, submitStatus, submitForm } = useOfflineForm('story');
  const [storyName, setStoryName] = React.useState('');
  const [storyMessage, setStoryMessage] = React.useState('');
  const [storyConsent, setStoryConsent] = React.useState(false);
  const [stories, setStories] = React.useState([]);

  React.useEffect(() => {
    document.title = 'Stories & thank yous | LUNA SEN PANTRY';
  }, []);

  React.useEffect(() => {
    if (!isFirebaseConfigured()) return undefined;
    const db = getDb();
    if (!db) return undefined;
    let unsub = null;
    (async () => {
      try {
        const { collection, limit, onSnapshot, orderBy, query } = await import('firebase/firestore');
        const q = query(collection(db, 'stories'), orderBy('createdAt', 'desc'), limit(12));
        unsub = onSnapshot(
          q,
          (snap) => {
            const rows = snap.docs.map((d) => d.data()).filter(Boolean);
            setStories(rows);
          },
          () => {}
        );
      } catch {
        // ignore
      }
    })();
    return () => {
      if (typeof unsub === 'function') unsub();
    };
  }, []);

  const setField = (name, value) => {
    if (name === 'storyName') setStoryName(value);
    if (name === 'storyMessage') setStoryMessage(value);
    if (name === 'storyConsent') setStoryConsent(Boolean(value));
  };

  return (
    <main className="luna-main">
      <section className="luna-hero" aria-labelledby="stories-title">
        <div className="luna-container">
          <div className="luna-hero__content">
            <HeroLogo />
            <h1 id="stories-title" className="luna-hero__title">
              <span className="luna-brand-text">LUNA</span> Stories &amp; Thank Yous
            </h1>
            <p className="luna-hero__subtitle">Share a short message</p>
            <p className="luna-hero__description">
              If LUNA helped your family, you can share a short message here. Please don’t include addresses or sensitive details.
            </p>
            <div className="luna-hero__actions">
              <a href="#leave-message" className="luna-button luna-button--primary">
                Leave a message
              </a>
              <a href="#recent-stories" className="luna-button luna-button--secondary">
                View our stories
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="luna-section luna-section--alt" aria-label="Stories form and messages">
        <div className="luna-container">
          <div className="luna-stories-panels">
            <div className="luna-card luna-card--gradient" id="leave-message">
              <h2 className="luna-card__title">Leave a message</h2>
              <form
                className="mt-5"
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (!storyConsent) return;
                  const ok = await submitForm({
                    name: storyName.trim(),
                    message: storyMessage.trim(),
                    consentToDisplay: true,
                    page: SITE_URL,
                  });
                  if (ok?.success) {
                    setStoryName('');
                    setStoryMessage('');
                    setStoryConsent(false);
                  }
                }}
              >
                <div className="luna-stories-form__grid">
                  <FormField
                    label="Name (first name or anonymous)"
                    name="storyName"
                    type="text"
                    value={storyName}
                    onChange={setField}
                    placeholder="e.g. Sarah / Anonymous"
                  />

                  <FormField
                    label="Your message"
                    name="storyMessage"
                    type="textarea"
                    value={storyMessage}
                    onChange={setField}
                    placeholder="A short thank you or story (no personal details)."
                    required
                  />
                </div>

                <FormField
                  label="I consent to LUNA displaying this message publicly (first name/anonymous only)."
                  name="storyConsent"
                  type="checkbox"
                  value={storyConsent}
                  onChange={setField}
                  required
                />

                <Button type="submit" variant="gradient" fullWidth loading={isSubmitting} disabled={isSubmitting}>
                  Submit message
                </Button>
                {submitStatus?.message ? (
                  <p className={`text-sm ${submitStatus.success ? 'text-green-700' : 'text-red-700'}`}>
                    {submitStatus.message}
                  </p>
                ) : null}
              </form>
            </div>

            <div className="luna-card luna-card--secondary" id="recent-stories">
              <h2 className="luna-card__title">Recent messages</h2>
              <div className="mt-5">
                {stories.length ? (
                  <div className="luna-stories-grid" aria-label="Stories list">
                    {stories.map((s, idx) => {
                      const variant = idx % 3 === 0 ? 'primary' : idx % 3 === 1 ? 'gradient' : 'secondary';
                      const variantClass =
                        variant === 'primary'
                          ? 'luna-card--primary'
                          : variant === 'gradient'
                            ? 'luna-card--gradient'
                            : 'luna-card--secondary';

                      return (
                        <div key={idx} className={`luna-card luna-story-card ${variantClass}`}>
                          <p className="luna-story-card__name">{String(s.name || 'Anonymous')}</p>
                          <p className="luna-story-card__msg">{String(s.message || '')}</p>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-gray-600">No messages yet.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
      <style jsx>{`
        .luna-stories-form__grid {
          display: grid;
          gap: var(--luna-space-4);
          margin-bottom: var(--luna-space-2);
        }

        .luna-stories-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: var(--luna-space-4);
        }

        .luna-stories-panels {
          display: grid;
          gap: var(--luna-space-16);
          align-items: start;
          grid-template-columns: 1fr;
        }

        .luna-story-card {
          text-align: left;
        }

        .luna-story-card__name {
          margin: 0;
          font-size: 0.95rem;
          font-weight: 900;
          color: var(--luna-text-primary);
        }

        .luna-story-card__msg {
          margin: 0.6rem 0 0 0;
          font-size: 0.95rem;
          color: var(--luna-text-secondary);
          line-height: 1.65;
          white-space: pre-wrap;
        }

        @media (max-width: 1024px) {
          .luna-stories-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 640px) {
          .luna-stories-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 768px) {
          /* hero uses shared Home styles */
        }
      `}</style>
    </main>
  );
};

export default Stories;

