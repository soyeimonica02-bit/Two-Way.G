import { useState } from 'react';
import { motion } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import ParentLayout from '../layouts/ParentLayout';
import TeenLayout from '../layouts/TeenLayout';

function SettingsPrivacy() {
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from;

  const [clearedFeedback, setClearedFeedback] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const isParent = location.pathname.startsWith('/app/parent');
  const baseSettingsRoute = isParent ? '/app/parent/settings' : '/app/teen/settings';

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate(baseSettingsRoute, { state: { from } });
    }
  };

  const handleClearData = () => {
    // Retain authentication & role, clear local notes, drafts, and reflections
    const keysToRemove = [
      'twoway_mood_entries',
      'twoway_today_mood',
      'twoway_haven_entries',
      'twoway_haven_journal_entries',
      'twoway_haven_journal_entry',
      'twoway_haven_thoughts',
      'twoway_haven_thoughts_entry',
      'twoway_haven_thoughts_notes',
      'twoway_nova_conversations',
      'twoway_nova_active_id',
      'twoway_nova_conversations_parent',
      'twoway_nova_active_id_parent',
      'twoway_parent_reflections',
      'twoway_saved_guides',
      'twoway_parent_saved_guides',
      'twoway_parent_completed_activities',
      'twoway_parent_learning_goals',
    ];
    keysToRemove.forEach((key) => localStorage.removeItem(key));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('twoway-mood-updated'));
      window.dispatchEvent(new CustomEvent('twoway-saved-guides-updated'));
    }
    setShowConfirmModal(false);
    setClearedFeedback(true);
    setTimeout(() => setClearedFeedback(false), 3000);
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
              <span className="parent-card-label">PRIVACY ARCHITECTURE</span>
              <h1 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 850 }}>Privacy &amp; Boundaries.</h1>
            </div>
          </header>

          {clearedFeedback && (
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
              ✓ Local reflection notes and session history have been cleared.
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
          >
            {/* Core Parent Principle */}
            <div className="parent-card">
              <span className="parent-card-label">CORE ARCHITECTURAL RULE</span>
              <h2 style={{ fontSize: '1.15rem', margin: '4px 0 8px' }}>Strict Journal &amp; Perspective Isolation</h2>
              <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--parent-text-secondary)', lineHeight: 1.6 }}>
                Your Reflection Journal notes, coach sessions, and saved guides are strictly private to your parent account. They are <strong>never automatically transmitted</strong> to your teen, another parent, or a counselor. Likewise, teen personal journals and mood calendars remain strictly private to the teen.
              </p>
            </div>

            {/* Nova Boundaries */}
            <div className="parent-card">
              <span className="parent-card-label">AI BOUNDARIES</span>
              <h2 style={{ fontSize: '1.15rem', margin: '4px 0 8px' }}>Nova Sounding Board Confidentially</h2>
              <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--parent-text-secondary)', lineHeight: 1.6 }}>
                Conversations with Nova are private automated reflections. Nova does not leak parent drafts to teen accounts, nor does Nova inspect teen diaries to summarize their inner thoughts for parents.
              </p>
            </div>

            {/* Storage Scope */}
            <div className="parent-card">
              <span className="parent-card-label">STORAGE SCOPE</span>
              <h2 style={{ fontSize: '1.15rem', margin: '4px 0 8px' }}>Local Storage Prototype</h2>
              <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--parent-text-secondary)', lineHeight: 1.6 }}>
                In this prototype build, all notes, reflections, and settings reside in your current browser localStorage on this device. No unencrypted remote syncing occurs across separate physical browsers without export.
              </p>
            </div>

            {/* Clear Data Control */}
            <div className="parent-card" style={{ border: '1.5px solid #dc2626' }}>
              <span className="parent-card-label" style={{ color: '#dc2626' }}>DATA CONTROLS</span>
              <h3 style={{ fontSize: '1rem', margin: '4px 0 6px', color: 'var(--parent-text)' }}>Reset Local Data</h3>
              <p style={{ margin: '0 0 14px', fontSize: '0.86rem', color: 'var(--parent-text-secondary)', lineHeight: 1.5 }}>
                Erase your saved local reflection entries, coaching drafts, and Nova session history from this device.
              </p>

              {!showConfirmModal ? (
                <button
                  type="button"
                  onClick={() => setShowConfirmModal(true)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '6px',
                    border: '1.5px solid #dc2626',
                    background: 'transparent',
                    color: '#dc2626',
                    fontSize: '0.82rem',
                    fontWeight: 750,
                    cursor: 'pointer',
                  }}
                >
                  Clear Local Reflection Data
                </button>
              ) : (
                <div style={{ padding: '14px', borderRadius: '6px', background: 'var(--parent-surface-subtle)', border: '1px solid #dc2626' }}>
                  <p style={{ margin: '0 0 10px', fontSize: '0.84rem', fontWeight: 750, color: '#dc2626' }}>
                    Confirm clearing all saved local parent reflections on this browser?
                  </p>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      type="button"
                      onClick={handleClearData}
                      style={{
                        padding: '6px 14px',
                        borderRadius: '6px',
                        background: '#dc2626',
                        color: '#FFFFFF',
                        border: 'none',
                        fontSize: '0.8rem',
                        fontWeight: 750,
                        cursor: 'pointer',
                      }}
                    >
                      Yes, Clear Data
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowConfirmModal(false)}
                      className="parent-btn-secondary"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
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
              PRIVACY BOUNDARIES
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
                  Two-Way stores your display name, selected role, account email, daily mood check-ins, personal notes, private haven entries, and the conversations you write.
                </p>
              </div>

              {/* 2. What Information is Private */}
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
                  What information is private
                </h2>
                <p style={{ fontSize: '0.92rem', color: 'var(--tw-text-muted)', lineHeight: 1.6, margin: 0 }}>
                  Your private spaces are yours alone. Your personal entries, journal thoughts, mood history, and unsent drafts are completely private and are never visible to parents, peers, or counselors.
                </p>
              </div>

              {/* 3. My Haven */}
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
                  When writing what you want to say, your words remain completely private to you while drafting. Messages are only seen by a connection when you deliberately choose to send them.
                </p>
              </div>

              {/* 5. Emotional Calendar */}
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
                  Your daily feeling check-ins and personal notes stay solely in your personal calendar. They are not visible to your Circle connections or anyone else.
                </p>
              </div>

              {/* 6. Nova Conversations & Boundaries */}
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
                  How Nova conversations work
                </h2>
                <p style={{ fontSize: '0.92rem', color: 'var(--tw-text-muted)', lineHeight: 1.6, margin: '0 0 10px' }}>
                  Nova is an AI support sounding board built to help you untangle thoughts and prepare conversations.
                </p>
                <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '0.88rem', color: 'var(--tw-text-muted)', lineHeight: 1.6 }}>
                  <li>Nova is <strong>not a person</strong> and not a member of your Circle.</li>
                  <li>Nova cannot read your Haven entries, Emotional Calendar, or conversations unless you choose to paste or discuss them directly in Nova.</li>
                  <li>Your chats with Nova are private and are never shared with parents, counselors, or Circle members.</li>
                </ul>
              </div>

              {/* 7. Circle Connections */}
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
                  Your Circle contains real people only, added using their unique Two-Way ID. Private spaces (My Haven, Emotional Calendar, and unsent drafts) are <strong>never automatically shared</strong> with Circle connections. Only messages you explicitly send are received.
                </p>
              </div>

              {/* 8. Prototype Data Notice */}
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
                  Prototype data notice
                </h2>
                <p style={{ fontSize: '0.92rem', color: 'var(--tw-text-muted)', lineHeight: 1.6, margin: 0 }}>
                  In this prototype version, your information is saved locally in your browser (localStorage). It is temporary and tied to this device. The production version of Two-Way will use secure backend storage.
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
    </TeenLayout>
  );
}

export default SettingsPrivacy;
