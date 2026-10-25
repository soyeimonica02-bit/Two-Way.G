import { useState } from 'react';
import { motion } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import ParentLayout from '../layouts/ParentLayout';
import TeenLayout from '../layouts/TeenLayout';

function SettingsEmail() {
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from;

  const isParent = location.pathname.startsWith('/app/parent');
  const baseSettingsRoute = isParent ? '/app/parent/settings' : '/app/teen/settings';

  const [email, setEmail] = useState(
    () =>
      localStorage.getItem('twoway_registered_email') ||
      localStorage.getItem('twoway_account_email') ||
      localStorage.getItem('twoway_auth_email') ||
      (isParent ? 'parent@two-way.app' : 'teen@two-way.app'),
  );

  const [isEditing, setIsEditing] = useState(false);
  const [newEmail, setNewEmail] = useState(email);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate(baseSettingsRoute, { state: { from } });
    }
  };

  const handleSave = () => {
    if (!newEmail.includes('@') || !newEmail.includes('.')) {
      setError('Please enter a valid email address.');
      return;
    }
    setError('');
    setEmail(newEmail);
    localStorage.setItem('twoway_registered_email', newEmail);
    localStorage.setItem('twoway_account_email', newEmail);
    localStorage.setItem('twoway_auth_email', newEmail);
    setIsEditing(false);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
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
              <span className="parent-card-label">ACCOUNT CREDENTIALS</span>
              <h1 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 850 }}>Email Address.</h1>
            </div>
          </header>

          {savedSuccess && (
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
              ✓ Account email updated successfully.
            </motion.div>
          )}

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                padding: '12px 16px',
                borderRadius: '8px',
                border: '1.5px solid #dc2626',
                background: '#fef2f2',
                color: '#dc2626',
                fontSize: '0.84rem',
                fontWeight: 750,
                marginBottom: '16px',
              }}
            >
              ⚠ {error}
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
          >
            <div className="parent-card">
              <span className="parent-card-label">REGISTERED ADDRESS</span>
              {!isEditing ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '8px' }}>
                  <strong style={{ fontSize: '1.1rem', color: 'var(--parent-text)', fontWeight: 800 }}>
                    {email}
                  </strong>
                  <button
                    type="button"
                    onClick={() => {
                      setNewEmail(email);
                      setIsEditing(true);
                    }}
                    className="parent-btn-secondary"
                  >
                    Edit Email
                  </button>
                </div>
              ) : (
                <div style={{ marginTop: '12px' }}>
                  <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="parent-input"
                    placeholder="Enter new email address"
                    style={{ marginBottom: '12px' }}
                  />
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button type="button" onClick={handleSave} className="parent-btn-primary">
                      Save Changes
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditing(false);
                        setError('');
                      }}
                      className="parent-btn-secondary"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="parent-card">
              <span className="parent-card-label">DATA &amp; PRIVACY NOTICE</span>
              <h3 style={{ fontSize: '1rem', margin: '4px 0 8px' }}>Private Account Security</h3>
              <p style={{ margin: 0, fontSize: '0.86rem', color: 'var(--parent-text-secondary)', lineHeight: 1.6 }}>
                Your account email is strictly confidential. It is used exclusively for account recovery, authentication, and critical security notices. It is never shown to connected family members, teens, or counselors.
              </p>
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

            <span>ACCOUNT</span>

            <div />
          </header>

          {/* INTRO */}
          <motion.section
            className="settings-intro"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <h1>Email.</h1>
            <p>Manage your account email.</p>
          </motion.section>

          {/* DETAILS */}
          <section className="settings-section">
            <div className="settings-section-label">
              ACCOUNT EMAIL
            </div>

            {savedSuccess && (
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
                ✓ Account email updated successfully.
              </div>
            )}

            {error && (
              <div
                style={{
                  padding: '12px 16px',
                  background: '#fef2f2',
                  border: '1px solid #ef4444',
                  color: '#dc2626',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  marginBottom: '16px',
                }}
              >
                {error}
              </div>
            )}

            <div className="settings-list">
              <div
                style={{
                  background: 'var(--tw-surface)',
                  border: '2.5px solid var(--tw-border)',
                  borderRadius: '18px',
                  boxShadow: '4px 4px 0px var(--tw-border)',
                  padding: '24px 20px',
                }}
              >
                <span
                  style={{
                    display: 'block',
                    fontSize: '0.68rem',
                    fontWeight: 900,
                    letterSpacing: '0.1em',
                    color: 'var(--tw-primary)',
                    marginBottom: '8px',
                    textTransform: 'uppercase',
                  }}
                >
                  Current Email Address
                </span>

                {!isEditing ? (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <strong style={{ fontSize: '1.1rem', fontWeight: 900, color: 'var(--tw-text)' }}>
                      {email}
                    </strong>

                    <button
                      type="button"
                      onClick={() => {
                        setNewEmail(email);
                        setIsEditing(true);
                      }}
                      style={{
                        background: 'var(--tw-surface-raised)',
                        border: '2px solid var(--tw-border)',
                        borderRadius: '10px',
                        padding: '8px 16px',
                        font: 'inherit',
                        fontSize: '0.78rem',
                        fontWeight: 900,
                        cursor: 'pointer',
                        color: 'var(--tw-text)',
                        boxShadow: '2px 2px 0px var(--tw-border)',
                        width: 'auto',
                        minHeight: 'auto',
                      }}
                    >
                      Change Email
                    </button>
                  </div>
                ) : (
                  <div style={{ marginTop: '12px' }}>
                    <input
                      type="email"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      style={{
                        width: '100%',
                        maxWidth: '420px',
                        padding: '12px 14px',
                        border: '2px solid var(--tw-border)',
                        borderRadius: '12px',
                        background: 'var(--tw-surface-soft)',
                        color: 'var(--tw-text)',
                        fontSize: '0.95rem',
                        fontFamily: 'inherit',
                        marginBottom: '14px',
                        outline: 'none',
                      }}
                      placeholder="Enter new email address"
                    />

                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        type="button"
                        onClick={handleSave}
                        style={{
                          background: 'var(--tw-primary)',
                          color: 'var(--tw-primary-text, #ffffff)',
                          border: '2.5px solid var(--tw-border)',
                          borderRadius: '10px',
                          padding: '10px 20px',
                          font: 'inherit',
                          fontSize: '0.8rem',
                          fontWeight: 900,
                          cursor: 'pointer',
                          boxShadow: '2.5px 2.5px 0px var(--tw-border)',
                          width: 'auto',
                          minHeight: 'auto',
                        }}
                      >
                        Save Email
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setIsEditing(false);
                          setError('');
                        }}
                        style={{
                          background: 'var(--tw-surface)',
                          color: 'var(--tw-text)',
                          border: '2px solid var(--tw-border)',
                          borderRadius: '10px',
                          padding: '10px 18px',
                          font: 'inherit',
                          fontSize: '0.8rem',
                          fontWeight: 900,
                          cursor: 'pointer',
                          boxShadow: '2px 2px 0px var(--tw-border)',
                          width: 'auto',
                          minHeight: 'auto',
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* PRIVACY EXPLANATION */}
          <section className="settings-section">
            <div className="settings-section-label">
              PRIVACY
            </div>

            <div
              style={{
                padding: '22px',
                background: 'var(--tw-surface)',
                border: '2.5px solid var(--tw-border)',
                borderRadius: '18px',
                boxShadow: '4px 4px 0px var(--tw-border)',
              }}
            >
              <p
                style={{
                  fontSize: '0.9rem',
                  color: 'var(--tw-text-muted)',
                  lineHeight: 1.6,
                  margin: 0,
                }}
              >
                Your account email is private. It is used strictly for account recovery and sign-in verification. It is never displayed to your Circle connections or shared with third parties.
              </p>
            </div>
          </section>

          {/* FOOTER */}
          <footer className="settings-footer">
            Two-Way Account
          </footer>
        </div>
      </main>
    </TeenLayout>
  );
}

export default SettingsEmail;
