import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

function Landing() {
  const navigate = useNavigate();

  const [socialLoading, setSocialLoading] = useState<'google' | 'apple' | null>(null);
  const [showSocialModal, setShowSocialModal] = useState<'google' | 'apple' | null>(null);
  const [socialEmail, setSocialEmail] = useState('');
  const [socialName, setSocialName] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const initiateSocialSignIn = (provider: 'google' | 'apple') => {
    setErrorMessage('');
    setShowSocialModal(provider);
    setSocialEmail(provider === 'google' ? 'alex.rivera@gmail.com' : 'alex.rivera@icloud.com');
    setSocialName('Alex Rivera');
  };

  const handleExecuteSocialSignIn = async (provider: 'google' | 'apple') => {
    if (!socialEmail.trim() || !socialEmail.includes('@')) {
      setErrorMessage('Please enter a valid account email address.');
      return;
    }

    setSocialLoading(provider);
    setErrorMessage('');

    try {
      const registeredRole = localStorage.getItem('twoway_registered_role') || 'teen';
      const existingDob = localStorage.getItem('twoway_registered_dob');

      const response = await fetch(`/api/auth/${provider}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: socialEmail.trim(),
          name: socialName.trim() || undefined,
          role: registeredRole,
          birthDate: existingDob || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.error === 'UNDERAGE') {
          setErrorMessage('Two-Way is available for teens aged 13–19.');
        } else {
          setErrorMessage(data.message || `${provider === 'google' ? 'Google' : 'Apple'} sign-in could not be completed.`);
        }
        setSocialLoading(null);
        setShowSocialModal(null);
        return;
      }

      if (data.sessionToken) {
        localStorage.setItem('twoway_session_token', data.sessionToken);
      }
      localStorage.setItem('twoway_logged_in', 'true');
      localStorage.setItem('twoway_registered_email', data.user.email);
      localStorage.setItem('twoway_registered_role', data.user.role);
      localStorage.setItem('twoway_auth_provider', provider);
      if (data.user.twoWayId) {
        localStorage.setItem('twoway_user_id', data.user.twoWayId);
      }
      if (data.user.birthDate) {
        localStorage.setItem('twoway_registered_dob', data.user.birthDate);
      }

      setShowSocialModal(null);
      setSocialLoading(null);

      // If teen and birth date is missing: redirect to birthday check
      if (data.requiresDob && data.user.role === 'teen') {
        navigate('/auth/birthday?returnTo=/app/teen', { replace: true });
        return;
      }

      const isOnboarded = localStorage.getItem('twoway_onboarding_complete') === 'true';
      if (isOnboarded) {
        navigate(`/app/${data.user.role}`, { replace: true });
      } else {
        navigate('/onboarding', { replace: true });
      }
    } catch {
      setErrorMessage(`Network error connecting to ${provider === 'google' ? 'Google' : 'Apple'} authentication.`);
      setSocialLoading(null);
      setShowSocialModal(null);
    }
  };

  return (
    <main className="tw-page" style={{ background: 'var(--tw-background, #f3f1e7)', color: 'var(--tw-text, #1a1628)' }}>
      <div className="tw-container">
        <section
          style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '40px 24px',
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: 'easeOut' }}
            style={{
              width: '100%',
              maxWidth: '480px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '28px',
            }}
          >
            {/* Logo */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <img
                src="/favicon.svg"
                alt="Two-Way logo"
                style={{ width: '160px', height: '130px', objectFit: 'contain', display: 'block' }}
              />
              <h2
                style={{
                  margin: '-4px 0 0',
                  fontFamily: 'var(--font-display)',
                  fontSize: '2.25rem',
                  fontWeight: 800,
                  lineHeight: 1,
                  letterSpacing: '-0.04em',
                  color: 'var(--tw-text)',
                }}
              >
                Two-Way
              </h2>
              <p className="text-secondary" style={{ margin: '10px 0 0', fontSize: '0.85rem', textAlign: 'center' }}>
                Say the hard thing. Be understood.
              </p>
            </div>

            {/* Welcome message */}
            <div style={{ width: '100%', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <h1
                style={{
                  margin: 0,
                  fontFamily: 'var(--font-display)',
                  fontSize: 'clamp(1.65rem, 4vw, 2.15rem)',
                  fontWeight: 750,
                  lineHeight: 1.25,
                  letterSpacing: '-0.025em',
                  color: 'var(--tw-text)',
                }}
              >
                Better conversations<br />start here.
              </h1>
              <p className="text-secondary" style={{ margin: 0, fontSize: '0.92rem', lineHeight: 1.6 }}>
                Two-Way helps teens, families, and communities communicate through understanding, emotional awareness, and AI support.
              </p>
            </div>

            {errorMessage && (
              <div style={{ width: '100%', padding: '12px 16px', borderRadius: '10px', background: '#fee2e2', border: '1.5px solid #ef4444', color: '#991b1b', fontSize: '0.86rem', textAlign: 'center' }}>
                {errorMessage}
              </div>
            )}

            {/* THREE PRIMARY CHOICES */}
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {/* 1. Continue with Google */}
              <button
                type="button"
                onClick={() => initiateSocialSignIn('google')}
                disabled={socialLoading !== null}
                style={{
                  width: '100%',
                  minHeight: '52px',
                  padding: '12px 18px',
                  borderRadius: '12px',
                  border: '2px solid var(--tw-border)',
                  background: 'var(--tw-surface)',
                  color: 'var(--tw-text)',
                  fontSize: '0.96rem',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '12px',
                  cursor: socialLoading ? 'wait' : 'pointer',
                  boxShadow: '3px 3px 0 rgba(0, 0, 0, 0.08)',
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                </svg>
                {socialLoading === 'google' ? 'Connecting to Google...' : 'Continue with Google'}
              </button>

              {/* 2. Continue with Apple */}
              <button
                type="button"
                onClick={() => initiateSocialSignIn('apple')}
                disabled={socialLoading !== null}
                style={{
                  width: '100%',
                  minHeight: '52px',
                  padding: '12px 18px',
                  borderRadius: '12px',
                  border: '2px solid var(--tw-border)',
                  background: 'var(--tw-text)',
                  color: 'var(--tw-background)',
                  fontSize: '0.96rem',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '12px',
                  cursor: socialLoading ? 'wait' : 'pointer',
                  boxShadow: '3px 3px 0 rgba(0, 0, 0, 0.08)',
                }}
              >
                <svg width="20" height="20" viewBox="0 0 170 170" fill="currentColor">
                  <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.69-3.04-7.67-7.81-11.96-14.31-7.18-10.74-12.65-22.97-16.41-36.69-3.77-13.72-5.65-26.68-5.65-38.88 0-15.08 3.8-27.42 11.41-37.03 7.6-9.61 17.06-14.49 28.37-14.64 4.58 0 9.8 1.19 15.66 3.57 5.86 2.38 9.5 3.63 10.92 3.75 1.84-.23 5.63-1.6 11.36-4.11 5.73-2.51 10.78-3.66 15.15-3.46 11.96.65 21.6 4.97 28.91 12.98-10.42 6.31-15.52 14.99-15.3 26.04.22 8.79 3.58 16.27 10.09 22.44 6.51 6.17 14.18 9.69 23.01 10.57-2.17 6.31-4.77 12.8-7.79 19.46zM119.22 33.15c0-7.39 2.66-14.4 7.98-21.03 5.32-6.63 11.96-10.97 19.92-13.02.22 1.09.33 2.17.33 3.26 0 7.39-2.83 14.62-8.49 21.69-5.66 7.07-12.51 11.25-20.55 12.54-.33-1.09-.49-2.23-.49-3.44z"/>
                </svg>
                {socialLoading === 'apple' ? 'Connecting to Apple...' : 'Continue with Apple'}
              </button>

              {/* 3. Continue with email */}
              <button
                type="button"
                onClick={() => navigate('/auth')}
                style={{
                  width: '100%',
                  minHeight: '52px',
                  padding: '12px 18px',
                  borderRadius: '12px',
                  border: '2px solid var(--tw-border)',
                  background: 'var(--tw-primary)',
                  color: 'var(--tw-primary-text, #ffffff)',
                  fontSize: '0.96rem',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '12px',
                  cursor: 'pointer',
                  boxShadow: '3px 3px 0 rgba(0, 0, 0, 0.08)',
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
                Continue with email
              </button>
            </div>

            {/* Privacy reassurance */}
            <p className="text-secondary" style={{ maxWidth: '340px', margin: 0, textAlign: 'center', fontSize: '0.78rem', lineHeight: 1.6 }}>
              Your conversations are private. Shared information always requires your permission.
            </p>

            {/* Social Auth Modal */}
            {showSocialModal && (
              <div
                style={{
                  position: 'fixed',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: 'rgba(0, 0, 0, 0.65)',
                  backdropFilter: 'blur(3px)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '20px',
                  zIndex: 9999,
                }}
                role="dialog"
                aria-modal="true"
                aria-labelledby="social-modal-title"
              >
                <div
                  style={{
                    width: '100%',
                    maxWidth: '440px',
                    backgroundColor: 'var(--tw-surface)',
                    border: '2px solid var(--tw-border)',
                    borderRadius: '16px',
                    padding: '24px',
                    boxShadow: '6px 6px 0 rgba(0, 0, 0, 0.16)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                    {showSocialModal === 'google' ? (
                      <svg width="24" height="24" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                      </svg>
                    ) : (
                      <svg width="24" height="24" viewBox="0 0 170 170" fill="var(--tw-text)">
                        <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.69-3.04-7.67-7.81-11.96-14.31-7.18-10.74-12.65-22.97-16.41-36.69-3.77-13.72-5.65-26.68-5.65-38.88 0-15.08 3.8-27.42 11.41-37.03 7.6-9.61 17.06-14.49 28.37-14.64 4.58 0 9.8 1.19 15.66 3.57 5.86 2.38 9.5 3.63 10.92 3.75 1.84-.23 5.63-1.6 11.36-4.11 5.73-2.51 10.78-3.66 15.15-3.46 11.96.65 21.6 4.97 28.91 12.98-10.42 6.31-15.52 14.99-15.3 26.04.22 8.79 3.58 16.27 10.09 22.44 6.51 6.17 14.18 9.69 23.01 10.57-2.17 6.31-4.77 12.8-7.79 19.46zM119.22 33.15c0-7.39 2.66-14.4 7.98-21.03 5.32-6.63 11.96-10.97 19.92-13.02.22 1.09.33 2.17.33 3.26 0 7.39-2.83 14.62-8.49 21.69-5.66 7.07-12.51 11.25-20.55 12.54-.33-1.09-.49-2.23-.49-3.44z"/>
                      </svg>
                    )}
                    <h3 id="social-modal-title" style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800 }}>
                      Sign in with {showSocialModal === 'google' ? 'Google' : 'Apple'}
                    </h3>
                  </div>

                  <p style={{ margin: '0 0 16px', fontSize: '0.86rem', color: 'var(--tw-text-secondary)', lineHeight: 1.5 }}>
                    Connect your {showSocialModal === 'google' ? 'Google' : 'Apple'} profile. Neither Google nor Apple provides date of birth to Two-Way. Teen accounts require verified age confirmation.
                  </p>

                  <div style={{ marginBottom: '14px' }}>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: 700 }}>
                      Account email
                    </label>
                    <input
                      type="email"
                      value={socialEmail}
                      onChange={(e) => setSocialEmail(e.target.value)}
                      placeholder={showSocialModal === 'google' ? 'user@gmail.com' : 'user@icloud.com'}
                      style={{
                        width: '100%',
                        boxSizing: 'border-box',
                        padding: '11px 13px',
                        border: '2px solid var(--tw-border)',
                        borderRadius: '8px',
                        background: 'var(--tw-background)',
                        color: 'var(--tw-text)',
                        fontSize: '0.94rem',
                      }}
                    />
                  </div>

                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: 700 }}>
                      Full name
                    </label>
                    <input
                      type="text"
                      value={socialName}
                      onChange={(e) => setSocialName(e.target.value)}
                      placeholder="Your Name"
                      style={{
                        width: '100%',
                        boxSizing: 'border-box',
                        padding: '11px 13px',
                        border: '2px solid var(--tw-border)',
                        borderRadius: '8px',
                        background: 'var(--tw-background)',
                        color: 'var(--tw-text)',
                        fontSize: '0.94rem',
                      }}
                    />
                  </div>

                  <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                    <button
                      type="button"
                      onClick={() => setShowSocialModal(null)}
                      style={{
                        padding: '10px 16px',
                        border: '2px solid var(--tw-border)',
                        borderRadius: '8px',
                        background: 'transparent',
                        color: 'var(--tw-text)',
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => handleExecuteSocialSignIn(showSocialModal)}
                      disabled={socialLoading !== null}
                      style={{
                        padding: '10px 20px',
                        border: 'none',
                        borderRadius: '8px',
                        background: 'var(--tw-primary)',
                        color: 'var(--tw-primary-text, #ffffff)',
                        fontWeight: 800,
                        cursor: socialLoading ? 'wait' : 'pointer',
                      }}
                    >
                      {socialLoading ? 'Connecting...' : 'Continue'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </section>
      </div>
    </main>
  );
}

export default Landing;