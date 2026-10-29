import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

function MyHaven() {
  const navigate = useNavigate();

  return (
    <main className="haven-page">
      <div className="haven-shell">

        {/* HEADER */}

        <header className="haven-header">
          <button
            type="button"
            aria-label="Go back"
            onClick={() => navigate('/app/teen')}
          >
            ←
          </button>

          <span>MY HAVEN</span>

          <div />
        </header>


        {/* HERO */}

        <motion.section
          className="haven-hero"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h1>
            My
            <br />
            <strong>Haven.</strong>
          </h1>

          <p>
            A quiet place for thoughts,
            feelings, and things you are
            not ready to say out loud.
          </p>
        </motion.section>


        {/* PRIVACY NOTICE */}

        <section className="haven-privacy">
          <span>🔒</span>

          <div>
            <strong>
              This space is private.
            </strong>

            <p>
              What you write here stays
              separate from your conversations
              and your Circle.
            </p>
          </div>
        </section>


        {/* HAVEN OPTIONS - ONLY PRIVATE JOURNAL & PRIVATE THOUGHTS */}

        <section className="haven-section">
          <div className="haven-section-label">
            YOUR HAVEN
          </div>

          <div className="haven-options">

            {/* MY JOURNAL */}
            <button
              type="button"
              onClick={() =>
                navigate(
                  '/app/teen/haven/journal',
                )
              }
            >
              <div className="haven-option-content">
                <span>LONG-FORM REFLECTION</span>

                <h2>
                  My Journal
                </h2>

                <p>
                  Long-form entries and personal reflections over time. Write about your day, emotions, and growth in a chronological diary.
                </p>
              </div>
            </button>


            {/* PRIVATE THOUGHTS */}
            <button
              type="button"
              onClick={() =>
                navigate(
                  '/app/teen/haven/thoughts',
                )
              }
            >
              <div className="haven-option-content">
                <span>QUICK NOTES & UNSENT WORDS</span>

                <h2>
                  Private Thoughts.
                </h2>

                <p>
                  A lightweight, fast space to capture immediate thoughts, feelings, and unsent words without needing a full journal entry.
                </p>
              </div>
            </button>

          </div>
        </section>


        {/* FOOTER */}

        <footer className="haven-footer">
          <p>
            Your Haven belongs to you.
          </p>
        </footer>

      </div>
    </main>
  );
}

export default MyHaven;