import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import ParentLayout from '../layouts/ParentLayout';
import TeenLayout from '../layouts/TeenLayout';

interface NotificationSettings {
  masterEnabled: boolean;
  conversations: boolean;
  calendarReminders: boolean;
  novaReflections: boolean;
}

const DEFAULT_SETTINGS: NotificationSettings = {
  masterEnabled: true,
  conversations: true,
  calendarReminders: true,
  novaReflections: false,
};

function SettingsNotifications() {
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from;

  const isParent = location.pathname.startsWith('/app/parent');
  const baseSettingsRoute = isParent ? '/app/parent/settings' : '/app/teen/settings';

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate(baseSettingsRoute, { state: { from } });
    }
  };

  const [settings, setSettings] = useState<NotificationSettings>(() => {
    try {
      const saved = localStorage.getItem('twoway_notification_settings');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error(e);
    }
    return DEFAULT_SETTINGS;
  });

  const [savedFeedback, setSavedFeedback] = useState(false);

  useEffect(() => {
    localStorage.setItem(
      'twoway_notification_settings',
      JSON.stringify(settings),
    );
  }, [settings]);

  const toggle = (key: keyof NotificationSettings) => {
    setSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
    setSavedFeedback(true);
    setTimeout(() => setSavedFeedback(false), 2000);
  };

  // -------------------------------------------------------------
  // PARENT PRESENTATION: Monochromatic minimalism
  // -------------------------------------------------------------
  if (isParent) {
    return (
      <ParentLayout>
        <div className="parent-dashboard">
          <header style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '24px' }}>
            <button
              type="button"
              className="parent-back-btn"
              aria-label="Go back"
              title="Go back"
              onClick={handleBack}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
            </button>

            <div>
              <span className="parent-card-label">ALERT PREFERENCES</span>
              <h1 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 850 }}>Notifications.</h1>
            </div>
          </header>

          {savedFeedback && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                padding: '12px 16px',
                borderRadius: '8px',
                border: '1.5px solid var(--parent-border-strong)',
                background: 'var(--parent-accent-soft)',
                color: 'var(--parent-text)',
                fontSize: '0.84rem',
                fontWeight: 750,
                marginBottom: '16px',
              }}
            >
              ✓ Notification preferences updated.
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
          >
            {/* MASTER TOGGLE */}
            <div className="parent-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <strong style={{ display: 'block', fontSize: '1rem', color: 'var(--parent-text)', fontWeight: 800 }}>
                  Master Notification Switch
                </strong>
                <span style={{ fontSize: '0.82rem', color: 'var(--parent-text-secondary)' }}>
                  Enable or suspend all alert prompts in Two-Way
                </span>
              </div>

              <button
                type="button"
                onClick={() => toggle('masterEnabled')}
                style={{
                  width: '52px',
                  height: '28px',
                  borderRadius: '14px',
                  border: '1.5px solid var(--parent-border-strong)',
                  background: settings.masterEnabled ? 'var(--parent-accent)' : 'var(--parent-surface-subtle)',
                  position: 'relative',
                  cursor: 'pointer',
                  padding: '2px',
                  transition: 'background 160ms ease',
                }}
                aria-label={`Toggle master notifications, currently ${settings.masterEnabled ? 'enabled' : 'disabled'}`}
              >
                <div
                  style={{
                    width: '22px',
                    height: '22px',
                    borderRadius: '50%',
                    background: '#FFFFFF',
                    transform: settings.masterEnabled ? 'translateX(24px)' : 'translateX(0)',
                    transition: 'transform 160ms ease',
                  }}
                />
              </button>
            </div>

            {/* SUB-PREFERENCES */}
            <div
              className="parent-card"
              style={{
                opacity: settings.masterEnabled ? 1 : 0.45,
                pointerEvents: settings.masterEnabled ? 'auto' : 'none',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
              }}
            >
              <span className="parent-card-label">CHANNELS &amp; CATEGORIES</span>

              {/* Conversations */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '14px', borderBottom: '1px solid var(--parent-border)' }}>
                <div>
                  <strong style={{ display: 'block', fontSize: '0.92rem', color: 'var(--parent-text)' }}>
                    Conversation Updates
                  </strong>
                  <span style={{ fontSize: '0.8rem', color: 'var(--parent-text-secondary)' }}>
                    Notify when your teen or Circle connection shares a reflection or responds
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => toggle('conversations')}
                  style={{
                    width: '46px',
                    height: '26px',
                    borderRadius: '13px',
                    border: '1.5px solid var(--parent-border)',
                    background: settings.conversations ? 'var(--parent-accent)' : 'var(--parent-surface-subtle)',
                    position: 'relative',
                    cursor: 'pointer',
                    padding: '2px',
                  }}
                  aria-label="Toggle conversation updates"
                >
                  <div
                    style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      background: '#FFFFFF',
                      transform: settings.conversations ? 'translateX(20px)' : 'translateX(0)',
                      transition: 'transform 160ms ease',
                    }}
                  />
                </button>
              </div>

              {/* Calendar Reminders */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '14px', borderBottom: '1px solid var(--parent-border)' }}>
                <div>
                  <strong style={{ display: 'block', fontSize: '0.92rem', color: 'var(--parent-text)' }}>
                    Perspective Daily Prompt
                  </strong>
                  <span style={{ fontSize: '0.8rem', color: 'var(--parent-text-secondary)' }}>
                    Gentle reminder for the optional daily parent communication reflection
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => toggle('calendarReminders')}
                  style={{
                    width: '46px',
                    height: '26px',
                    borderRadius: '13px',
                    border: '1.5px solid var(--parent-border)',
                    background: settings.calendarReminders ? 'var(--parent-accent)' : 'var(--parent-surface-subtle)',
                    position: 'relative',
                    cursor: 'pointer',
                    padding: '2px',
                  }}
                  aria-label="Toggle perspective reminders"
                >
                  <div
                    style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      background: '#FFFFFF',
                      transform: settings.calendarReminders ? 'translateX(20px)' : 'translateX(0)',
                      transition: 'transform 160ms ease',
                    }}
                  />
                </button>
              </div>

              {/* Nova Guidance */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <strong style={{ display: 'block', fontSize: '0.92rem', color: 'var(--parent-text)' }}>
                    Nova Coaching Follow-ups
                  </strong>
                  <span style={{ fontSize: '0.8rem', color: 'var(--parent-text-secondary)' }}>
                    Follow-ups when you have active, unfinished parent conversation drafts in Nova
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => toggle('novaReflections')}
                  style={{
                    width: '46px',
                    height: '26px',
                    borderRadius: '13px',
                    border: '1.5px solid var(--parent-border)',
                    background: settings.novaReflections ? 'var(--parent-accent)' : 'var(--parent-surface-subtle)',
                    position: 'relative',
                    cursor: 'pointer',
                    padding: '2px',
                  }}
                  aria-label="Toggle Nova coaching follow-ups"
                >
                  <div
                    style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      background: '#FFFFFF',
                      transform: settings.novaReflections ? 'translateX(20px)' : 'translateX(0)',
                      transition: 'transform 160ms ease',
                    }}
                  />
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </ParentLayout>
    );
  }

  // -------------------------------------------------------------
  // TEEN PRESENTATION
  // -------------------------------------------------------------
  return (
    <TeenLayout>
      <main className="settings-page">
        <div className="settings-shell">
          {/* HEADER */}
          <header className="settings-header">
            <button
              type="button"
              aria-label="Go back"
              title="Go back"
              onClick={handleBack}
              className="teen-back-btn"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
            </button>

            <span>EXPERIENCE</span>

            <div />
          </header>

          {/* INTRO */}
          <motion.section
            className="settings-intro"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <h1>Notifications.</h1>
            <p>Choose when Two-Way can notify you.</p>
          </motion.section>

          {/* CONTROLS */}
          <section className="settings-section">
            <div className="settings-section-label">
              NOTIFICATION PREFERENCES
            </div>

            {savedFeedback && (
              <div
                style={{
                  padding: '12px 16px',
                  background: '#eefcf1',
                  border: '1px solid #16a34a',
                  color: '#16a34a',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  marginBottom: '16px',
                }}
              >
                ✓ Preferences updated.
              </div>
            )}

            <div
              style={{
                background: 'var(--tw-surface)',
                border: '2.5px solid var(--tw-border)',
                borderRadius: '20px',
                boxShadow: '4px 4px 0px var(--tw-border)',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
              }}
            >
              {/* MASTER TOGGLE */}
              <div
                style={{
                  padding: '22px 20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderBottom: '2px solid var(--tw-border)',
                  background: settings.masterEnabled ? 'var(--tw-surface-raised)' : 'var(--tw-surface)',
                }}
              >
                <div>
                  <strong style={{ fontSize: '1rem', fontWeight: 900, display: 'block', color: 'var(--tw-text)' }}>
                    Allow Notifications
                  </strong>
                  <small style={{ color: 'var(--tw-text-muted)', fontSize: '0.78rem', fontWeight: 600 }}>
                    Master switch for all alerts and messages in Two-Way
                  </small>
                </div>

                <button
                  type="button"
                  onClick={() => toggle('masterEnabled')}
                  style={{
                    width: '56px',
                    height: '30px',
                    borderRadius: '15px',
                    border: '2.5px solid var(--tw-border)',
                    background: settings.masterEnabled ? 'var(--tw-primary)' : 'var(--tw-surface-soft)',
                    boxShadow: '2px 2px 0px var(--tw-border)',
                    position: 'relative',
                    cursor: 'pointer',
                    padding: '2px',
                    transition: 'background 180ms ease',
                  }}
                  aria-label="Toggle allow notifications"
                >
                  <div
                    style={{
                      width: '22px',
                      height: '22px',
                      borderRadius: '50%',
                      background: settings.masterEnabled ? 'var(--tw-primary-text, #ffffff)' : 'var(--tw-surface)',
                      border: '1.5px solid var(--tw-border)',
                      transform: settings.masterEnabled
                        ? 'translateX(24px)'
                        : 'translateX(0)',
                      transition: 'transform 180ms ease, background 180ms ease',
                    }}
                  />
                </button>
              </div>

              {/* CONVERSATION NOTIFICATIONS */}
              <div
                style={{
                  padding: '22px 20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderBottom: '2px solid var(--tw-border)',
                  opacity: settings.masterEnabled ? 1 : 0.45,
                  pointerEvents: settings.masterEnabled ? 'auto' : 'none',
                }}
              >
                <div>
                  <strong style={{ fontSize: '0.95rem', fontWeight: 900, display: 'block', color: 'var(--tw-text)' }}>
                    Conversation Updates
                  </strong>
                  <small style={{ color: 'var(--tw-text-muted)', fontSize: '0.78rem', fontWeight: 600 }}>
                    Alerts when someone in your Circle replies or communicates a conversation
                  </small>
                </div>

                <button
                  type="button"
                  onClick={() => toggle('conversations')}
                  style={{
                    width: '56px',
                    height: '30px',
                    borderRadius: '15px',
                    border: '2.5px solid var(--tw-border)',
                    background: settings.conversations ? 'var(--tw-primary)' : 'var(--tw-surface-soft)',
                    boxShadow: '2px 2px 0px var(--tw-border)',
                    position: 'relative',
                    cursor: 'pointer',
                    padding: '2px',
                    transition: 'background 180ms ease',
                  }}
                  aria-label="Toggle conversation updates"
                >
                  <div
                    style={{
                      width: '22px',
                      height: '22px',
                      borderRadius: '50%',
                      background: settings.conversations ? 'var(--tw-primary-text, #ffffff)' : 'var(--tw-surface)',
                      border: '1.5px solid var(--tw-border)',
                      transform: settings.conversations
                        ? 'translateX(24px)'
                        : 'translateX(0)',
                      transition: 'transform 180ms ease, background 180ms ease',
                    }}
                  />
                </button>
              </div>

              {/* CALENDAR REMINDERS */}
              <div
                style={{
                  padding: '22px 20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderBottom: '2px solid var(--tw-border)',
                  opacity: settings.masterEnabled ? 1 : 0.45,
                  pointerEvents: settings.masterEnabled ? 'auto' : 'none',
                }}
              >
                <div>
                  <strong style={{ fontSize: '0.95rem', fontWeight: 900, display: 'block', color: 'var(--tw-text)' }}>
                    Emotional Calendar Reminders
                  </strong>
                  <small style={{ color: 'var(--tw-text-muted)', fontSize: '0.78rem', fontWeight: 600 }}>
                    A quiet daily check-in prompt to record how your day is feeling
                  </small>
                </div>

                <button
                  type="button"
                  onClick={() => toggle('calendarReminders')}
                  style={{
                    width: '56px',
                    height: '30px',
                    borderRadius: '15px',
                    border: '2.5px solid var(--tw-border)',
                    background: settings.calendarReminders ? 'var(--tw-primary)' : 'var(--tw-surface-soft)',
                    boxShadow: '2px 2px 0px var(--tw-border)',
                    position: 'relative',
                    cursor: 'pointer',
                    padding: '2px',
                    transition: 'background 180ms ease',
                  }}
                  aria-label="Toggle calendar reminders"
                >
                  <div
                    style={{
                      width: '22px',
                      height: '22px',
                      borderRadius: '50%',
                      background: settings.calendarReminders ? 'var(--tw-primary-text, #ffffff)' : 'var(--tw-surface)',
                      border: '1.5px solid var(--tw-border)',
                      transform: settings.calendarReminders
                        ? 'translateX(24px)'
                        : 'translateX(0)',
                      transition: 'transform 180ms ease, background 180ms ease',
                    }}
                  />
                </button>
              </div>

              {/* NOVA REFLECTIONS */}
              <div
                style={{
                  padding: '22px 20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  opacity: settings.masterEnabled ? 1 : 0.45,
                  pointerEvents: settings.masterEnabled ? 'auto' : 'none',
                }}
              >
                <div>
                  <strong style={{ fontSize: '0.95rem', fontWeight: 900, display: 'block', color: 'var(--tw-text)' }}>
                    Nova Reflection Prompts
                  </strong>
                  <small style={{ color: 'var(--tw-text-muted)', fontSize: '0.78rem', fontWeight: 600 }}>
                    Follow-ups when you have active, unfinished thoughts in Nova
                  </small>
                </div>

                <button
                  type="button"
                  onClick={() => toggle('novaReflections')}
                  style={{
                    width: '56px',
                    height: '30px',
                    borderRadius: '15px',
                    border: '2.5px solid var(--tw-border)',
                    background: settings.novaReflections ? 'var(--tw-primary)' : 'var(--tw-surface-soft)',
                    boxShadow: '2px 2px 0px var(--tw-border)',
                    position: 'relative',
                    cursor: 'pointer',
                    padding: '2px',
                    transition: 'background 180ms ease',
                  }}
                  aria-label="Toggle Nova reflection prompts"
                >
                  <div
                    style={{
                      width: '22px',
                      height: '22px',
                      borderRadius: '50%',
                      background: settings.novaReflections ? 'var(--tw-primary-text, #ffffff)' : 'var(--tw-surface)',
                      border: '1.5px solid var(--tw-border)',
                      transform: settings.novaReflections
                        ? 'translateX(24px)'
                        : 'translateX(0)',
                      transition: 'transform 180ms ease, background 180ms ease',
                    }}
                  />
                </button>
              </div>
            </div>
          </section>

          {/* FOOTER */}
          <footer className="settings-footer">
            Notification Preferences
          </footer>
        </div>
      </main>
    </TeenLayout>
  );
}

export default SettingsNotifications;
