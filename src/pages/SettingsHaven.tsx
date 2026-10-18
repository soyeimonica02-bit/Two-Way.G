import { useState } from 'react';
import { motion } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';

function SettingsHaven() {
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from;

  const isParent = location.pathname.startsWith('/app/parent');
  const baseSettingsRoute = isParent ? '/app/parent/settings' : '/app/teen/settings';

  const handleBack = () => {
    navigate(baseSettingsRoute, { state: { from } });
  };

  useEffect(() => {
    if (isParent) {
      navigate('/app/parent/settings', { replace: true });
    }
  }, [isParent, navigate]);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [statusMessage, setStatusMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const existingPasscode =
    localStorage.getItem('twoway_haven_passcode') || '';

  const handleSavePassword = (e: React.FormEvent) => {
    e.preventDefault();

    if (existingPasscode && currentPassword !== existingPasscode) {
      setStatusMessage({
        type: 'error',
        text: 'Current password does not match.',
      });
      return;
    }

    if (!newPassword.trim()) {
      setStatusMessage({
        type: 'error',
        text: 'Please enter a new password.',
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      setStatusMessage({
        type: 'error',
        text: 'New passwords do not match.',
      });
      return;
    }

    localStorage.setItem('twoway_haven_passcode', newPassword.trim());
    setStatusMessage({
      type: 'success',
      text: 'My Haven password updated successfully.',
    });
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setTimeout(() => setStatusMessage(null), 3000);
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
          <h1>Change Password.</h1>

          <p>Update the password that protects your private Haven.</p>
        </motion.section>

        {/* CHANGE PASSWORD */}
        <section className="settings-section">
          <div className="settings-section-label">
            CHANGE PASSWORD
          </div>

          {statusMessage && (
            <div
              style={{
                padding: '14px 18px',
                background:
                  statusMessage.type === 'success' ? 'var(--tw-surface-raised)' : 'var(--tw-danger-soft, #fef2f2)',
                border: '2.5px solid var(--tw-border)',
                borderRadius: '12px',
                boxShadow: '3px 3px 0px var(--tw-border)',
                color:
                  statusMessage.type === 'success' ? 'var(--tw-text)' : 'var(--tw-danger, #dc2626)',
                fontSize: '0.82rem',
                fontWeight: 800,
                marginBottom: '20px',
              }}
            >
              {statusMessage.text}
            </div>
          )}

          <form
            onSubmit={handleSavePassword}
            style={{
              background: 'var(--tw-surface)',
              border: '2.5px solid var(--tw-border)',
              borderRadius: '20px',
              boxShadow: '5px 5px 0px var(--tw-border), inset 0 2px 0 rgba(255, 255, 255, 0.7)',
              padding: '28px',
              display: 'flex',
              flexDirection: 'column',
              gap: '18px',
              maxWidth: '480px',
            }}
          >
            {existingPasscode ? (
              <div>
                <label
                  htmlFor="current-pw"
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
                    Current Password
                </label>
                <input
                  id="current-pw"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    border: '2px solid var(--tw-border)',
                    borderRadius: '12px',
                    background: 'var(--tw-surface-soft)',
                    color: 'var(--tw-text)',
                    fontSize: '0.95rem',
                    fontFamily: 'inherit',
                    outline: 'none',
                  }}
                  placeholder="Enter current password"
                  required
                />
              </div>
            ) : null}

            <div>
              <label
                htmlFor="new-pw"
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
                {existingPasscode ? 'New Password' : 'Create Haven Password'}
              </label>
              <input
                id="new-pw"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  border: '2px solid var(--tw-border)',
                  borderRadius: '12px',
                  background: 'var(--tw-surface-soft)',
                  color: 'var(--tw-text)',
                  fontSize: '0.95rem',
                  fontFamily: 'inherit',
                  outline: 'none',
                }}
                placeholder="Enter new password"
                required
              />
            </div>

            <div>
              <label
                htmlFor="confirm-pw"
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
                Confirm Password
              </label>
              <input
                id="confirm-pw"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  border: '2px solid var(--tw-border)',
                  borderRadius: '12px',
                  background: 'var(--tw-surface-soft)',
                  color: 'var(--tw-text)',
                  fontSize: '0.95rem',
                  fontFamily: 'inherit',
                  outline: 'none',
                }}
                placeholder="Confirm new password"
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
                padding: '12px 26px',
                font: 'inherit',
                fontSize: '0.82rem',
                fontWeight: 900,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                cursor: 'pointer',
                boxShadow: '3px 3px 0px var(--tw-border)',
                marginTop: '8px',
              }}
            >
              Update Password
            </button>
          </form>
        </section>

        {/* FOOTER */}
        <footer className="settings-footer">
          My Haven Privacy
        </footer>

      </div>
    </main>
  );
}

export default SettingsHaven;
