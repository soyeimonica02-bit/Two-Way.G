import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

function Settings() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('twoway_auth_token');
    localStorage.removeItem('twoway_user_session');
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
            onClick={() => {
              if (window.history.length > 1) {
                navigate(-1);
              } else {
                navigate('/app/teen/profile');
              }
            }}
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
              onClick={() => navigate('/app/teen/settings/email')}
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
              onClick={() => navigate('/app/teen/settings/privacy')}
            >
              <div>
                <span>Privacy</span>
                <small>Control what stays private</small>
              </div>
            </button>

            <button
              type="button"
              onClick={() => navigate('/app/teen/settings/haven')}
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
              onClick={() => navigate('/app/teen/settings/notifications')}
            >
              <div>
                <span>Notifications</span>
                <small>Choose when Two-Way can notify you</small>
              </div>
            </button>

            <button
              type="button"
              onClick={() => navigate('/app/teen/settings/appearance')}
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
              onClick={() => navigate('/app/teen/settings/help')}
            >
              <div>
                <span>Help & Support</span>
                <small>Get help with Two-Way</small>
              </div>
            </button>

            <button
              type="button"
              onClick={() => navigate('/app/teen/settings/about')}
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

          <p>
            Logging out is only simulated during the prototype stage.
          </p>
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