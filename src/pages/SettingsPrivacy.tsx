import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

function SettingsPrivacy() {
  const navigate = useNavigate();
  const [clearedFeedback, setClearedFeedback] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const handleClearData = () => {
    // Retain essentials but clear user drafts & local mood data
    const keysToRemove = [
      'twoway_mood_entries',
      'twoway_today_mood',
      'twoway_haven_entries',
      'twoway_haven_journal_entries',
      'twoway_haven_journal_entry',
      'twoway_haven_thoughts',
      'twoway_haven_thoughts_entry',
      'twoway_nova_conversations',
      'twoway_nova_active_id',
    ];
    keysToRemove.forEach((key) => localStorage.removeItem(key));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('twoway-mood-updated'));
    }
    setShowConfirmModal(false);
    setClearedFeedback(true);
    setTimeout(() => setClearedFeedback(false), 3000);
  };

  return (
    <main className="settings-page">
      <div className="settings-shell">

        {/* HEADER */}
        <header className="settings-header">
          <button
            type="button"
            aria-label="Go back"
            onClick={() => navigate('/app/teen/settings')}
          >
            ←
          </button>

          <span>PRIVACY</span>

          <div />
        </header>

        {/* INTRO */}
        <motion.section
          className="settings-intro"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h1>Privacy.</h1>

          <p>Control what stays private. Understand your boundaries.</p>
        </motion.section>

        {/* PRIVACY BOUNDARIES */}
        <section className="settings-section">
          <div className="settings-section-label">
            HOW TWO-WAY PROTECTS YOUR SPACE
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
            }}
          >
            {/* 1. What Two-Way Stores */}
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
                What information Two-Way stores
              </h2>
              <p style={{ fontSize: '0.92rem', color: 'var(--tw-text-muted)', lineHeight: 1.6, margin: 0 }}>
                Two-Way stores your display name, role, account email, daily mood check-ins, personal notes, private haven journals, and the conversations you draft.
              </p>
            </div>

            {/* 2. My Haven */}
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
                How My Haven works
              </h2>
              <p style={{ fontSize: '0.92rem', color: 'var(--tw-text-muted)', lineHeight: 1.6, margin: 0 }}>
                My Haven (your Private Journal and Private Thoughts) is strictly for you. Nothing written in My Haven is ever broadcasted, shared with parents, shown to counselors, or sent to anyone in your Circle.
              </p>
            </div>

            {/* 3. Emotional Calendar */}
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
                How Emotional Calendar data works
              </h2>
              <p style={{ fontSize: '0.92rem', color: 'var(--tw-text-muted)', lineHeight: 1.6, margin: 0 }}>
                Your daily feelings, emoji selections, and personal day notes belong solely to your personal calendar. They are not visible to your Circle contacts or anyone else.
              </p>
            </div>

            {/* 4. Conversations */}
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
                How conversations work
              </h2>
              <p style={{ fontSize: '0.92rem', color: 'var(--tw-text-muted)', lineHeight: 1.6, margin: 0 }}>
                When drafting what you want to say in Clarity, your words remain completely private to you. They are only seen by another person when you deliberately choose to communicate them.
              </p>
            </div>

            {/* 5. Nova AI Support */}
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
                Nova is AI support — not a person
              </h2>
              <p style={{ fontSize: '0.92rem', color: 'var(--tw-text-muted)', lineHeight: 1.6, margin: '0 0 10px' }}>
                Nova is an artificial intelligence sounding board built to help you untangle thoughts and find the right words.
              </p>
              <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '0.88rem', color: 'var(--tw-text-muted)', lineHeight: 1.6 }}>
                <li>Nova is <strong>not a human being</strong> and not a member of your Circle.</li>
                <li>Nova cannot read your Haven entries or access your Circle conversations unless you choose to paste or discuss them in Nova.</li>
                <li>Your chats with Nova are private and are never shared with parents, counselors, or Circle members.</li>
              </ul>
            </div>

            {/* 6. Circle Connections */}
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
                What is shared with Circle connections
              </h2>
              <p style={{ fontSize: '0.92rem', color: 'var(--tw-text-muted)', lineHeight: 1.6, margin: 0 }}>
                Your Circle contains real people only, added deliberately through their verified Two-Way ID. Private spaces (My Haven, Emotional Calendar, and unsent drafts) are <strong>never automatically shared</strong> with Circle connections.
              </p>
            </div>

            {/* 7. Prototype Data Notice */}
            <div
              style={{
                background: 'var(--tw-surface-soft)',
                border: '2.5px solid var(--tw-border)',
                borderRadius: '18px',
                boxShadow: '4px 4px 0px var(--tw-border)',
                padding: '24px',
              }}
            >
              <h2 style={{ fontSize: '1.15rem', fontWeight: 900, margin: '0 0 8px', color: 'var(--tw-text)' }}>
                Prototype vs. Production data notice
              </h2>
              <p style={{ fontSize: '0.92rem', color: 'var(--tw-text-muted)', lineHeight: 1.6, margin: 0 }}>
                In this prototype version, your data is stored directly in your browser's local memory (localStorage). It is temporary and tied to this device. The upcoming production release will transition to encrypted, authenticated cloud databases with enterprise-grade privacy controls.
              </p>
            </div>
          </div>
        </section>

        {/* DATA CONTROLS */}
        <section className="settings-section">
          <div className="settings-section-label">
            ACCOUNT &amp; DATA CONTROLS
          </div>

          {clearedFeedback && (
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
              ✓ Local prototype entries and chats have been cleared.
            </div>
          )}

          <div
            style={{
              background: 'var(--tw-surface)',
              border: '2.5px solid var(--tw-border)',
              borderRadius: '20px',
              boxShadow: '5px 5px 0px var(--tw-border)',
              padding: '26px',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
            }}
          >
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 900, color: 'var(--tw-text)' }}>
              Reset Prototype Data
            </h3>
            <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--tw-text-muted)', lineHeight: 1.6 }}>
              Erase your saved local mood check-ins, journal entries, and Nova conversation history on this device.
            </p>

            {!showConfirmModal ? (
              <button
                type="button"
                onClick={() => setShowConfirmModal(true)}
                style={{
                  alignSelf: 'flex-start',
                  background: 'var(--tw-surface)',
                  color: 'var(--tw-danger, #dc2626)',
                  border: '2px solid var(--tw-danger, #dc2626)',
                  borderRadius: '10px',
                  boxShadow: '2.5px 2.5px 0px var(--tw-danger, #dc2626)',
                  padding: '10px 20px',
                  font: 'inherit',
                  fontSize: '0.8rem',
                  fontWeight: 900,
                  cursor: 'pointer',
                  marginTop: '8px',
                }}
              >
                Clear Local Data
              </button>
            ) : (
              <div
                style={{
                  padding: '18px',
                  background: 'var(--tw-surface-soft)',
                  border: '2px solid var(--tw-danger, #ef4444)',
                  borderRadius: '14px',
                  marginTop: '8px',
                }}
              >
                <p style={{ margin: '0 0 12px', fontSize: '0.85rem', fontWeight: 800, color: 'var(--tw-danger, #dc2626)' }}>
                  Are you sure you want to clear your local test data?
                </p>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={handleClearData}
                    style={{
                      background: 'var(--tw-danger, #dc2626)',
                      color: '#ffffff',
                      border: '2px solid var(--tw-danger, #dc2626)',
                      borderRadius: '10px',
                      padding: '8px 16px',
                      font: 'inherit',
                      fontSize: '0.76rem',
                      fontWeight: 900,
                      cursor: 'pointer',
                    }}
                  >
                    Yes, Clear Data
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowConfirmModal(false)}
                    style={{
                      background: 'var(--tw-surface)',
                      border: '2px solid var(--tw-border)',
                      borderRadius: '10px',
                      padding: '8px 16px',
                      font: 'inherit',
                      fontSize: '0.76rem',
                      fontWeight: 900,
                      color: 'var(--tw-text)',
                      cursor: 'pointer',
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* FOOTER */}
        <footer className="settings-footer">
          Two-Way Privacy Policy
        </footer>

      </div>
    </main>
  );
}

export default SettingsPrivacy;
