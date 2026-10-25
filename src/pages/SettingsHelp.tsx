import { useState } from 'react';
import { motion } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import ParentLayout from '../layouts/ParentLayout';
import TeenLayout from '../layouts/TeenLayout';

function SettingsHelp() {
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from;

  const [contactMessage, setContactMessage] = useState('');
  const [feedbackSent, setFeedbackSent] = useState(false);

  const isParent = location.pathname.startsWith('/app/parent');
  const baseSettingsRoute = isParent ? '/app/parent/settings' : '/app/teen/settings';
  const Layout = isParent ? ParentLayout : TeenLayout;

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate(baseSettingsRoute, { state: { from } });
    }
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
        role: isParent ? 'parent' : 'teen',
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

  // -------------------------------------------------------------
  // PARENT PRESENTATION: MONOCHROMATIC CLAMOPHORISM
  // -------------------------------------------------------------
  if (isParent) {
    return (
      <Layout>
        <div className="parent-dashboard">

          {/* HEADER WITH ICON-ONLY BACK BUTTON */}
          <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
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
                <span className="parent-card-label">HELP &amp; SUPPORT</span>
                <h1 style={{ margin: 0, fontSize: '1.45rem', fontWeight: 850 }}>
                  Guidance &amp; Support.
                </h1>
              </div>
            </div>
          </header>

          {/* 1. GETTING STARTED FOR PARENTS */}
          <motion.section
            className="parent-card"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
          >
            <span className="parent-card-label">GETTING STARTED</span>
            <h2 style={{ fontSize: '1.15rem', margin: '4px 0 8px' }}>
              Parent Experience Overview
            </h2>
            <p style={{ color: 'var(--parent-text-secondary)', fontSize: '0.92rem', lineHeight: 1.6, margin: 0 }}>
              Two-Way provides an intentional space to reflect and communicate constructively with your teen. Explore structured communication frameworks in <strong>Perspective</strong>, coordinate with family connections in <strong>My Circle</strong>, test difficult conversational ideas privately with <strong>Nova</strong>, and manage profile preferences in <strong>Profile</strong>.
            </p>
          </motion.section>

          {/* 2. PRIVACY & BOUNDARIES */}
          <motion.section
            className="parent-card"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.05 }}
          >
            <span className="parent-card-label">PRIVACY &amp; DATA SEPARATION</span>
            <h2 style={{ fontSize: '1.15rem', margin: '4px 0 8px' }}>
              Strict Emotional Safety &amp; Shielding
            </h2>
            <p style={{ color: 'var(--parent-text-secondary)', fontSize: '0.92rem', lineHeight: 1.6, margin: 0 }}>
              Your private reflections and sounding board conversations with Nova are strictly shielded on your device. They are never shared with your teen, other family members, or third parties. Likewise, your teen&apos;s private journal entries and unsent thoughts in My Haven are completely private to them. Only messages sent in direct conversations or authorized group conversations are shared.
            </p>
          </motion.section>

          {/* 3. CIRCLE CONNECTIONS */}
          <motion.section
            className="parent-card"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.1 }}
          >
            <span className="parent-card-label">CIRCLE &amp; GROUPS</span>
            <h2 style={{ fontSize: '1.15rem', margin: '4px 0 8px' }}>
              Connecting with Your Teen
            </h2>
            <p style={{ color: 'var(--parent-text-secondary)', fontSize: '0.92rem', lineHeight: 1.6, margin: 0 }}>
              Every Two-Way account has a unique 6-digit Two-Way ID (e.g. TW-4920). You can share your ID with your teen or look up their ID in My Circle to send a connection request. When both parties confirm, you can exchange direct messages. Multi-member family group conversations are available with eligible paid subscription tiers (Two-Way Family or Circle Plus).
            </p>
          </motion.section>

          {/* 4. TROUBLESHOOTING */}
          <motion.section
            className="parent-card"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.15 }}
          >
            <span className="parent-card-label">TROUBLESHOOTING</span>
            <h2 style={{ fontSize: '1.15rem', margin: '4px 0 8px' }}>
              Frequently Asked Questions
            </h2>
            <p style={{ color: 'var(--parent-text-secondary)', fontSize: '0.92rem', lineHeight: 1.6, margin: '0 0 12px' }}>
              <strong>How do I change my display theme?</strong><br />
              Visit Settings → Appearance to switch between Light and Dark mode, or choose from 6 high-contrast accent highlights. Parent theme preferences are completely independent of teen preferences.
            </p>
            <p style={{ color: 'var(--parent-text-secondary)', fontSize: '0.92rem', lineHeight: 1.6, margin: 0 }}>
              <strong>How do I reset my local session?</strong><br />
              Visit Settings → Privacy &amp; Data to view data controls or clear local cached prototype data.
            </p>
          </motion.section>

          {/* 5. CONTACT SUPPORT FORM */}
          <motion.section
            className="parent-card"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.2 }}
          >
            <span className="parent-card-label">CONTACT SUPPORT</span>
            <h2 style={{ fontSize: '1.15rem', margin: '4px 0 8px' }}>
              Send Feedback or Request Assistance
            </h2>

            {feedbackSent && (
              <div
                style={{
                  padding: '12px 16px',
                  borderRadius: '8px',
                  border: '1.5px solid var(--parent-border-strong)',
                  background: 'var(--parent-surface-subtle)',
                  color: 'var(--parent-text)',
                  fontSize: '0.86rem',
                  fontWeight: 750,
                  marginBottom: '18px',
                }}
              >
                ✓ Your support note has been recorded.
              </div>
            )}

            <form onSubmit={handleSubmitContact} style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '12px' }}>
              <div>
                <label
                  htmlFor="parent-support-message"
                  style={{
                    display: 'block',
                    fontSize: '0.8rem',
                    fontWeight: 800,
                    marginBottom: '8px',
                    color: 'var(--parent-text)',
                  }}
                >
                  Describe your question or issue
                </label>
                <textarea
                  id="parent-support-message"
                  value={contactMessage}
                  onChange={(e) => setContactMessage(e.target.value)}
                  placeholder="Tell us what you need help with or how we can improve Two-Way..."
                  rows={4}
                  required
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    borderRadius: '8px',
                    border: '1.5px solid var(--parent-border)',
                    background: 'var(--parent-surface-subtle)',
                    color: 'var(--parent-text)',
                    fontFamily: 'inherit',
                    fontSize: '0.92rem',
                    lineHeight: 1.5,
                    resize: 'vertical',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <button
                type="submit"
                className="parent-btn-primary"
                style={{ alignSelf: 'flex-start', padding: '10px 22px' }}
              >
                Submit Support Note →
              </button>
            </form>
          </motion.section>

        </div>
      </Layout>
    );
  }

  // -------------------------------------------------------------
  // TEEN PRESENTATION: EXISTING TEEN VISUAL IDENTITY INTACT
  // -------------------------------------------------------------
  return (
    <Layout>
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
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
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
    </Layout>
  );
}

export default SettingsHelp;
