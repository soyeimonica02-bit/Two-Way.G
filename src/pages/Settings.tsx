import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

function Settings() {
  const navigate = useNavigate();

  return (
    <main className="settings-page">
      <div className="settings-shell">

        {/* HEADER */}

        <header className="settings-header">
          <button
            type="button"
            aria-label="Go back"
            onClick={() => navigate('/app/teen')}
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
          <p className="settings-eyebrow">
            YOUR SPACE
          </p>

          <h1>
            Settings.
          </h1>

          <p>
            Make Two-Way feel right for you.
          </p>
        </motion.section>


        {/* ACCOUNT */}

        <section className="settings-section">

          <div className="settings-section-label">
            ACCOUNT
          </div>

          <div className="settings-list">

            <button
              type="button"
              onClick={() =>
                navigate('/app/teen/profile')
              }
            >
              <div>
                <span>Profile</span>
                <small>
                  Manage your personal details
                </small>
              </div>

              <strong>→</strong>
            </button>


            <button type="button">
              <div>
                <span>Email</span>
                <small>
                  Manage your account email
                </small>
              </div>

              <strong>→</strong>
            </button>

          </div>

        </section>


        {/* PRIVACY */}

        <section className="settings-section">

          <div className="settings-section-label">
            PRIVACY
          </div>

          <div className="settings-list">

            <button type="button">
              <div>
                <span>Privacy</span>
                <small>
                  Control what stays private
                </small>
              </div>

              <strong>→</strong>
            </button>


            <button type="button">
              <div>
                <span>My Haven</span>
                <small>
                  Manage your private space
                </small>
              </div>

              <strong>→</strong>
            </button>

          </div>

        </section>


        {/* EXPERIENCE */}

        <section className="settings-section">

          <div className="settings-section-label">
            EXPERIENCE
          </div>

          <div className="settings-list">

            <button type="button">
              <div>
                <span>Notifications</span>
                <small>
                  Choose when Two-Way can notify you
                </small>
              </div>

              <strong>→</strong>
            </button>


            <button type="button">
              <div>
                <span>Appearance</span>
                <small>
                  Customize how Two-Way looks
                </small>
              </div>

              <strong>→</strong>
            </button>

          </div>

        </section>


        {/* SUPPORT */}

        <section className="settings-section">

          <div className="settings-section-label">
            SUPPORT
          </div>

          <div className="settings-list">

            <button type="button">
              <div>
                <span>Help & Support</span>
                <small>
                  Get help with Two-Way
                </small>
              </div>

              <strong>→</strong>
            </button>


            <button type="button">
              <div>
                <span>About Two-Way</span>
                <small>
                  Learn more about the app
                </small>
              </div>

              <strong>→</strong>
            </button>

          </div>

        </section>


        {/* LOG OUT */}

        <section className="settings-logout">

          <button
            type="button"
            onClick={() => navigate('/')}
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