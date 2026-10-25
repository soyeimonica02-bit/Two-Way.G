import { motion } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import ParentLayout from '../layouts/ParentLayout';
import TeenLayout from '../layouts/TeenLayout';

function Settings() {
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from;

  const isParent = location.pathname.startsWith('/app/parent');
  const baseProfileRoute = isParent ? '/app/parent/profile' : '/app/teen/profile';
  const baseSettingsRoute = isParent ? '/app/parent/settings' : '/app/teen/settings';
  const Layout = isParent ? ParentLayout : TeenLayout;

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else if (from && !from.includes('/settings')) {
      navigate(from);
    } else {
      navigate(baseProfileRoute);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('twoway_auth_token');
    localStorage.removeItem('twoway_user_session');
    localStorage.removeItem('twoway_logged_in');
    localStorage.removeItem('twoway_selected_role');
    localStorage.removeItem('twoway_signup_dob');
    navigate('/');
  };

  // -------------------------------------------------------------
  // PARENT PRESENTATION: MONOCHROMATIC BLACK & WHITE
  // -------------------------------------------------------------
  if (isParent) {
    return (
      <Layout>
        <div className="parent-dashboard">

          {/* HEADER */}
          <motion.section
            className="parent-hero"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
          >
            <header
              className="parent-header-sticky"
              style={{
                position: 'sticky',
                top: 0,
                zIndex: 30,
                background: 'var(--parent-bg)',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                padding: '10px 0',
                marginBottom: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
              }}
            >
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
            </header>

            <h1>Settings.</h1>
            <p>
              Manage your display theme, privacy boundaries, notification preferences, and support.
            </p>
          </motion.section>

          {/* EMAIL & SECURITY */}
          <motion.section
            className="parent-card"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.05 }}
          >
            <span className="parent-card-label">ACCOUNT EMAIL</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px' }}>
              <button
                type="button"
                onClick={() => navigate(`${baseSettingsRoute}/email`, { state: { from: baseProfileRoute } })}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '14px 16px',
                  border: '1px solid var(--parent-border)',
                  borderRadius: '8px',
                  background: 'var(--parent-surface)',
                  color: 'var(--parent-text)',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <div>
                  <strong style={{ display: 'block', fontSize: '0.95rem', color: 'var(--parent-text)' }}>Email Address</strong>
                  <span style={{ fontSize: '0.82rem', color: 'var(--parent-text-secondary)' }}>View or update your registered login email</span>
                </div>
              </button>
            </div>
          </motion.section>

          {/* PRIVACY SECTION (NO HAVEN FOR PARENTS) */}
          <motion.section
            className="parent-card"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.1 }}
          >
            <span className="parent-card-label">PRIVACY &amp; DATA</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px' }}>
              <button
                type="button"
                onClick={() => navigate(`${baseSettingsRoute}/privacy`, { state: { from: baseProfileRoute } })}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '14px 16px',
                  border: '1px solid var(--parent-border)',
                  borderRadius: '8px',
                  background: 'var(--parent-surface)',
                  color: 'var(--parent-text)',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <div>
                  <strong style={{ display: 'block', fontSize: '0.95rem', color: 'var(--parent-text)' }}>Privacy &amp; Boundaries</strong>
                  <span style={{ fontSize: '0.82rem', color: 'var(--parent-text-secondary)' }}>Control visibility and understand data separation rules</span>
                </div>
              </button>
            </div>
          </motion.section>

          {/* PREFERENCES SECTION */}
          <motion.section
            className="parent-card"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.15 }}
          >
            <span className="parent-card-label">PREFERENCES</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px' }}>
              <button
                type="button"
                onClick={() => navigate(`${baseSettingsRoute}/notifications`, { state: { from: baseProfileRoute } })}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '14px 16px',
                  border: '1px solid var(--parent-border)',
                  borderRadius: '8px',
                  background: 'var(--parent-surface)',
                  color: 'var(--parent-text)',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <div>
                  <strong style={{ display: 'block', fontSize: '0.95rem', color: 'var(--parent-text)' }}>Notifications</strong>
                  <span style={{ fontSize: '0.82rem', color: 'var(--parent-text-secondary)' }}>Connection request alerts and quiet hour settings</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => navigate(`${baseSettingsRoute}/appearance`, { state: { from: baseProfileRoute } })}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '14px 16px',
                  border: '1px solid var(--parent-border)',
                  borderRadius: '8px',
                  background: 'var(--parent-surface)',
                  color: 'var(--parent-text)',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <div>
                  <strong style={{ display: 'block', fontSize: '0.95rem', color: 'var(--parent-text)' }}>Appearance</strong>
                  <span style={{ fontSize: '0.82rem', color: 'var(--parent-text-secondary)' }}>Monochromatic theme and contrast preferences</span>
                </div>
              </button>
            </div>
          </motion.section>

          {/* SUPPORT & ABOUT */}
          <motion.section
            className="parent-card"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.2 }}
          >
            <span className="parent-card-label">HELP &amp; INFORMATION</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px' }}>
              <button
                type="button"
                onClick={() => navigate(`${baseSettingsRoute}/help`, { state: { from: baseProfileRoute } })}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '14px 16px',
                  border: '1px solid var(--parent-border)',
                  borderRadius: '8px',
                  background: 'var(--parent-surface)',
                  color: 'var(--parent-text)',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <div>
                  <strong style={{ display: 'block', fontSize: '0.95rem', color: 'var(--parent-text)' }}>Help &amp; Guidance</strong>
                  <span style={{ fontSize: '0.82rem', color: 'var(--parent-text-secondary)' }}>Parent communication principles and FAQs</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => navigate(`${baseSettingsRoute}/about`, { state: { from: baseProfileRoute } })}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '14px 16px',
                  border: '1px solid var(--parent-border)',
                  borderRadius: '8px',
                  background: 'var(--parent-surface)',
                  color: 'var(--parent-text)',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <div>
                  <strong style={{ display: 'block', fontSize: '0.95rem', color: 'var(--parent-text)' }}>About Two-Way</strong>
                  <span style={{ fontSize: '0.82rem', color: 'var(--parent-text-secondary)' }}>Our mission, ethics, and emotional safety philosophy</span>
                </div>
              </button>
            </div>
          </motion.section>

          {/* LOG OUT BUTTON */}
          <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-start' }}>
            <button
              type="button"
              onClick={handleLogout}
              style={{
                background: 'transparent',
                color: '#000000',
                border: '1.5px solid #000000',
                borderRadius: '8px',
                padding: '12px 28px',
                fontSize: '0.88rem',
                fontWeight: 750,
                cursor: 'pointer',
              }}
            >
              Logout
            </button>
          </div>

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

            <span>SETTINGS</span>

            <div />
          </header>

          {/* INTRO */}
          <motion.section
            className="settings-intro"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <h1>Settings.</h1>

            <p>Make Two-Way feel right for you.</p>
          </motion.section>

          {/* ACCOUNT EMAIL */}
          <section className="settings-section">
            <div className="settings-section-label">
              ACCOUNT EMAIL
            </div>

            <div className="settings-list">
              <button
                type="button"
                onClick={() => navigate(`${baseSettingsRoute}/email`, { state: { from: baseProfileRoute } })}
              >
                <div>
                  <span>Email</span>
                  <small>Manage your account email</small>
                </div>
              </button>
            </div>
          </section>

          {/* PRIVACY */}
          <section className="settings-section">
            <div className="settings-section-label">
              PRIVACY
            </div>

            <div className="settings-list">
              <button
                type="button"
                onClick={() => navigate(`${baseSettingsRoute}/privacy`, { state: { from: baseProfileRoute } })}
              >
                <div>
                  <span>Privacy</span>
                  <small>Control what stays private</small>
                </div>
              </button>

              <button
                type="button"
                onClick={() => navigate(`${baseSettingsRoute}/haven`, { state: { from: baseProfileRoute } })}
              >
                <div>
                  <span>My Haven</span>
                  <small>Manage your private space</small>
                </div>
              </button>
            </div>
          </section>

          {/* EXPERIENCE */}
          <section className="settings-section">
            <div className="settings-section-label">
              EXPERIENCE
            </div>

            <div className="settings-list">
              <button
                type="button"
                onClick={() => navigate(`${baseSettingsRoute}/notifications`, { state: { from: baseProfileRoute } })}
              >
                <div>
                  <span>Notifications</span>
                  <small>Choose when Two-Way can notify you</small>
                </div>
              </button>

              <button
                type="button"
                onClick={() => navigate(`${baseSettingsRoute}/appearance`, { state: { from: baseProfileRoute } })}
              >
                <div>
                  <span>Appearance</span>
                  <small>Customize how Two-Way looks</small>
                </div>
              </button>
            </div>
          </section>

          {/* SUPPORT */}
          <section className="settings-section">
            <div className="settings-section-label">
              SUPPORT
            </div>

            <div className="settings-list">
              <button
                type="button"
                onClick={() => navigate(`${baseSettingsRoute}/help`, { state: { from: baseProfileRoute } })}
              >
                <div>
                  <span>Help & Support</span>
                  <small>Get help with Two-Way</small>
                </div>
              </button>

              <button
                type="button"
                onClick={() => navigate(`${baseSettingsRoute}/about`, { state: { from: baseProfileRoute } })}
              >
                <div>
                  <span>About Two-Way</span>
                  <small>Learn more about the app</small>
                </div>
              </button>
            </div>
          </section>

          {/* LOG OUT */}
          <section className="settings-logout" style={{ display: 'flex', justifyContent: 'flex-start' }}>
            <button
              type="button"
              onClick={handleLogout}
            >
              Logout
            </button>
          </section>

          {/* FOOTER */}
          <footer className="settings-footer">
            Two-Way
          </footer>

        </div>
      </main>
    </Layout>
  );
}

export default Settings;