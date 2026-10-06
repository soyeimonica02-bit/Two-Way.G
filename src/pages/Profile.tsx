import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

function Profile() {
  const navigate = useNavigate();

  return (
    <main className="profile-page">
      <div className="profile-shell">

        {/* HEADER */}

        <header className="profile-header">
          <button
            type="button"
            aria-label="Go back"
            onClick={() => navigate('/app/teen')}
          >
            ←
          </button>

          <span>PROFILE</span>

          <div />
        </header>


        {/* PROFILE HERO */}

        <motion.section
          className="profile-hero"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >

          <div className="profile-avatar">
            <span>F</span>
          </div>

          <div className="profile-identity">

            <span className="profile-eyebrow">
              YOUR TWO-WAY SPACE
            </span>

            <h1>
              Your Profile
            </h1>

            <p>
              A place for your preferences,
              identity, and app experience.
            </p>

          </div>

        </motion.section>


        {/* PROFILE DETAILS */}

        <section className="profile-section">

          <div className="profile-section-label">
            YOUR DETAILS
          </div>

          <div className="profile-list">

            <div className="profile-row">
              <div>
                <span>Name</span>
                <strong>Your name</strong>
              </div>

              <button type="button">
                Edit
              </button>
            </div>


            <div className="profile-row">
              <div>
                <span>Role</span>
                <strong>Teen</strong>
              </div>

              <button type="button">
                View
              </button>
            </div>


            <div className="profile-row">
              <div>
                <span>Email</span>
                <strong>Your email</strong>
              </div>

              <button type="button">
                Manage
              </button>
            </div>

          </div>

        </section>


        {/* YOUR TWO-WAY */}

        <section className="profile-section">

          <div className="profile-section-label">
            YOUR TWO-WAY
          </div>

          <div className="profile-links">

            <button
              type="button"
              onClick={() =>
                navigate('/app/teen/emotional-calendar')
              }
            >
              <span>
                Emotional Calendar
              </span>

              <strong>→</strong>
            </button>


            <button
              type="button"
              onClick={() =>
                navigate('/app/teen/mood-reflection')
              }
            >
              <span>
                Mood Reflection
              </span>

              <strong>→</strong>
            </button>


            <button
              type="button"
              onClick={() =>
                navigate('/app/teen/haven')
              }
            >
              <span>
                My Haven
              </span>

              <strong>→</strong>
            </button>


            <button
              type="button"
              onClick={() =>
                navigate('/app/teen/circle')
              }
            >
              <span>
                My Circle
              </span>

              <strong>→</strong>
            </button>

          </div>

        </section>


        {/* SETTINGS */}

        <section className="profile-section">

          <div className="profile-section-label">
            ACCOUNT
          </div>

          <button
            type="button"
            className="profile-settings-link"
            onClick={() =>
              navigate('/app/teen/settings')
            }
          >
            <span>
              Settings
            </span>

            <strong>
              →
            </strong>
          </button>

        </section>


        {/* FOOTER */}

        <footer className="profile-footer">
          Your personal space stays yours.
        </footer>

      </div>
    </main>
  );
}

export default Profile;