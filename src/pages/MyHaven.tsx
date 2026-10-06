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
          <p className="haven-eyebrow">
            PRIVATE · JUST FOR YOU
          </p>

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


        {/* HAVEN OPTIONS */}

        <section className="haven-section">

          <div className="haven-section-label">
            YOUR HAVEN
          </div>

          <div className="haven-options">

            {/* JOURNAL */}

            <button
              type="button"
              onClick={() =>
                navigate(
                  '/app/teen/haven/journal',
                )
              }
            >
              <div className="haven-option-number">
                01
              </div>

              <div className="haven-option-content">
                <span>PRIVATE JOURNAL</span>

                <h2>
                  Write it out.
                </h2>

                <p>
                  Put your thoughts somewhere
                  they can simply exist.
                </p>
              </div>

              <strong>→</strong>
            </button>


            {/* PRIVATE THOUGHTS */}

            <button
              type="button"
              onClick={() =>
                navigate(
                  '/app/teen/haven/journal',
                )
              }
            >
              <div className="haven-option-number">
                02
              </div>

              <div className="haven-option-content">
                <span>PRIVATE THOUGHTS</span>

                <h2>
                  Keep it here.
                </h2>

                <p>
                  Save something for yourself
                  without sending it anywhere.
                </p>
              </div>

              <strong>→</strong>
            </button>


            {/* REFLECTION */}

            <button
              type="button"
              onClick={() =>
                navigate(
                  '/app/teen/mood-reflection',
                )
              }
            >
              <div className="haven-option-number">
                03
              </div>

              <div className="haven-option-content">
                <span>REFLECTION</span>

                <h2>
                  Look back.
                </h2>

                <p>
                  Reflect on what you've been
                  feeling lately.
                </p>
              </div>

              <strong>→</strong>
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