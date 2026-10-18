import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';

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
    navigate(baseSettingsRoute, { state: { from } });
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

  return (
    <main className="settings-page">
      <div className="settings-shell">

        {/* HEADER */}
        <header className="settings-header">
          <button
            type="button"
            aria-label="Go back"
            onClick={handleBack}
          >
            ←
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
  );
}

export default SettingsNotifications;
