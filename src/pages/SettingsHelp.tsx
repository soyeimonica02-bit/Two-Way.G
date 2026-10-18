import { useState } from 'react';
import { motion } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';

function SettingsHelp() {
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from;

  const [contactMessage, setContactMessage] = useState('');
  const [feedbackSent, setFeedbackSent] = useState(false);

  const isParent = location.pathname.startsWith('/app/parent');
  const baseSettingsRoute = isParent ? '/app/parent/settings' : '/app/teen/settings';

  const handleBack = () => {
    navigate(baseSettingsRoute, { state: { from } });
  };

  const handleSubmitContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactMessage.trim()) return;

    try {
      const existing = JSON.parse(
        localStorage.getItem('twoway_support_messages') || '[]',
      );
      existing.push({
        text: contactMessage.trim(),
        date: new Date().toISOString(),
      });
      localStorage.setItem(
        'twoway_support_messages',
        JSON.stringify(existing),
      );
    } catch (err) {
      console.error(err);
    }

    setContactMessage('');
    setFeedbackSent(true);
    setTimeout(() => setFeedbackSent(false), 3000);
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

          <span>SUPPORT</span>

          <div />
        </header>

        {/* INTRO */}
        <motion.section
          className="settings-intro"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h1>Help &amp; Support.</h1>

          <p>Get help with Two-Way.</p>
        </motion.section>

        {/* SECTIONS */}
        <section className="settings-section">
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
            }}
          >
            {/* 1. Getting Started */}
            <div
              style={{
                background: 'var(--tw-surface)',
                border: '2.5px solid var(--tw-border)',
                borderRadius: '18px',
                boxShadow: '4px 4px 0px var(--tw-border)',
                padding: '24px',
              }}
            >
              <h2 style={{ fontSize: '1.15rem', fontWeight: 900, margin: '0 0 8px', color: 'var(--tw-text)' }}>
                Getting Started
              </h2>
              <p style={{ fontSize: '0.92rem', color: 'var(--tw-text-muted)', lineHeight: 1.6, margin: 0 }}>
                Two-Way gives you a quiet space to process emotions and prepare what you want to communicate. Check in on the <strong>Emotional Calendar</strong>, write unshared thoughts in <strong>My Haven</strong>, draft important messages in <strong>Clarity</strong>, and talk through tough dilemmas with <strong>Nova</strong>.
              </p>
            </div>

            {/* 2. Privacy & Safety */}
            <div
              style={{
                background: 'var(--tw-surface)',
                border: '2.5px solid var(--tw-border)',
                borderRadius: '18px',
                boxShadow: '4px 4px 0px var(--tw-border)',
                padding: '24px',
              }}
            >
              <h2 style={{ fontSize: '1.15rem', fontWeight: 900, margin: '0 0 8px', color: 'var(--tw-text)' }}>
                Privacy &amp; Safety
              </h2>
              <p style={{ fontSize: '0.92rem', color: 'var(--tw-text-muted)', lineHeight: 1.6, margin: 0 }}>
                Your private spaces are completely shielded. Your Haven journals, mood entries, and unsent drafts are never visible to anyone in your Circle. Only messages you explicitly choose to communicate are shared. Nova conversations stay strictly between you and the AI support system.
              </p>
            </div>

            {/* 3. Account */}
            <div
              style={{
                background: 'var(--tw-surface)',
                border: '2.5px solid var(--tw-border)',
                borderRadius: '18px',
                boxShadow: '4px 4px 0px var(--tw-border)',
                padding: '24px',
              }}
            >
              <h2 style={{ fontSize: '1.15rem', fontWeight: 900, margin: '0 0 8px', color: 'var(--tw-text)' }}>
                Account
              </h2>
              <p style={{ fontSize: '0.92rem', color: 'var(--tw-text-muted)', lineHeight: 1.6, margin: 0 }}>
                You can manage your display name, pronouns, and gender in Profile settings, and update your login email under Account Email. Your assigned role (Teenager) and verified Two-Way ID are protected.
              </p>
            </div>

            {/* 4. Troubleshooting */}
            <div
              style={{
                background: 'var(--tw-surface)',
                border: '2.5px solid var(--tw-border)',
                borderRadius: '18px',
                boxShadow: '4px 4px 0px var(--tw-border)',
                padding: '24px',
              }}
            >
              <h2 style={{ fontSize: '1.15rem', fontWeight: 900, margin: '0 0 8px', color: 'var(--tw-text)' }}>
                Troubleshooting
              </h2>
              <p style={{ fontSize: '0.92rem', color: 'var(--tw-text-muted)', lineHeight: 1.6, margin: 0 }}>
                If you encounter any glitches or data doesn't render immediately, refresh your browser tab. If you wish to wipe test entries and start fresh, visit Privacy settings to clear local prototype data.
              </p>
            </div>
          </div>
        </section>

        {/* 5. Contact Support */}
        <section className="settings-section">
          <div className="settings-section-label">
            CONTACT SUPPORT
          </div>

          {feedbackSent && (
            <div
              style={{
                padding: '14px 18px',
                background: 'var(--tw-surface-raised)',
                border: '2.5px solid var(--tw-border)',
                borderRadius: '12px',
                boxShadow: '3px 3px 0px var(--tw-border)',
                color: 'var(--tw-text)',
                fontSize: '0.82rem',
                fontWeight: 900,
                marginBottom: '20px',
              }}
            >
              ✓ Your message has been saved for review.
            </div>
          )}

          <form
            onSubmit={handleSubmitContact}
            style={{
              background: 'var(--tw-surface)',
              border: '2.5px solid var(--tw-border)',
              borderRadius: '20px',
              boxShadow: '5px 5px 0px var(--tw-border), inset 0 2px 0 rgba(255, 255, 255, 0.7)',
              padding: '26px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
            }}
          >
            <div>
              <label
                htmlFor="support-message"
                style={{
                  display: 'block',
                  fontSize: '0.72rem',
                  fontWeight: 900,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: 'var(--tw-primary)',
                  marginBottom: '8px',
                }}
              >
                Send a question or feedback
              </label>
              <textarea
                id="support-message"
                value={contactMessage}
                onChange={(e) => setContactMessage(e.target.value)}
                placeholder="Describe what's not working or what you need help with..."
                rows={4}
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  border: '2px solid var(--tw-border)',
                  borderRadius: '12px',
                  background: 'var(--tw-surface-soft)',
                  color: 'var(--tw-text)',
                  fontFamily: 'inherit',
                  fontSize: '0.92rem',
                  resize: 'vertical',
                  outline: 'none',
                }}
                required
              />
            </div>

            <button
              type="submit"
              style={{
                alignSelf: 'flex-start',
                background: 'var(--tw-primary)',
                color: 'var(--tw-primary-text, #ffffff)',
                border: '2.5px solid var(--tw-border)',
                borderRadius: '12px',
                padding: '12px 24px',
                font: 'inherit',
                fontSize: '0.82rem',
                fontWeight: 900,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                cursor: 'pointer',
                boxShadow: '3px 3px 0px var(--tw-border)',
              }}
            >
              Submit Support Note
            </button>
          </form>
        </section>

        {/* FOOTER */}
        <footer className="settings-footer">
          Two-Way Help &amp; Support
        </footer>

      </div>
    </main>
  );
}

export default SettingsHelp;
