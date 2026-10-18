import { motion } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';

function Settings() {
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from;

  const isParent = location.pathname.startsWith('/app/parent');
  const baseProfileRoute = isParent ? '/app/parent/profile' : '/app/teen/profile';
  const baseSettingsRoute = isParent ? '/app/parent/settings' : '/app/teen/settings';

  const handleBack = () => {
    if (from) {
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

        {/* ACCOUNT */}
        <section className="settings-section">
          <div className="settings-section-label">
            ACCOUNT
          </div>

          <div className="settings-list">
            <button
              type="button"
              onClick={() => navigate(baseProfileRoute, { state: { from: location.pathname } })}
            >
              <div>
                <span>Profile</span>
                <small>Manage your personal details</small>
              </div>
            </button>

            <button
              type="button"
              onClick={() => navigate(`${baseSettingsRoute}/email`, { state: { from: from || baseProfileRoute } })}
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
              onClick={() => navigate(`${baseSettingsRoute}/privacy`, { state: { from: from || baseProfileRoute } })}
            >
              <div>
                <span>Privacy</span>
                <small>Control what stays private</small>
              </div>
            </button>

            {!isParent && (
              <button
                type="button"
                onClick={() => navigate(`${baseSettingsRoute}/haven`, { state: { from: from || baseProfileRoute } })}
              >
                <div>
                  <span>My Haven</span>
                  <small>Manage your private space</small>
                </div>
              </button>
            )}
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
              onClick={() => navigate(`${baseSettingsRoute}/notifications`, { state: { from: from || baseProfileRoute } })}
            >
              <div>
                <span>Notifications</span>
                <small>Choose when Two-Way can notify you</small>
              </div>
            </button>

            <button
              type="button"
              onClick={() => navigate(`${baseSettingsRoute}/appearance`, { state: { from: from || baseProfileRoute } })}
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
              onClick={() => navigate(`${baseSettingsRoute}/help`, { state: { from: from || baseProfileRoute } })}
            >
              <div>
                <span>Help & Support</span>
                <small>Get help with Two-Way</small>
              </div>
            </button>

            <button
              type="button"
              onClick={() => navigate(`${baseSettingsRoute}/about`, { state: { from: from || baseProfileRoute } })}
            >
              <div>
                <span>About Two-Way</span>
                <small>Learn more about the app</small>
              </div>
            </button>
          </div>
        </section>

        {/* LOG OUT */}
        <section className="settings-logout">
          <button
            type="button"
            onClick={handleLogout}
          >
            Log out
          </button>
        </section>

        {/* FOOTER */}
        <footer className="settings-footer">
          Two-Way
        </footer>

      </div>
    </main>
  );
}

export default Settings;