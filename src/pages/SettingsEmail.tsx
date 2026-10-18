import { useState } from 'react';
import { motion } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';

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
    navigate(baseSettingsRoute, { state: { from } });
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
  );
}

export default SettingsEmail;
