import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

function MoodReflection() {
  const navigate = useNavigate();

  const today = new Date();

  const dateLabel = today.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  return (
    <main className="mood-reflection-page">
      <div className="mood-reflection-shell">

        {/* =========================================
            HEADER
        ========================================= */}

        <header className="mood-reflection-header">

          <button
            type="button"
            className="mood-reflection-back"
            onClick={() => navigate('/app/teen')}
          >
            ← Back
          </button>

          <span>
            MOOD REFLECTION
          </span>

        </header>


        {/* =========================================
            INTRO
        ========================================= */}

        <motion.section
          className="mood-reflection-intro"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >

          <p className="mood-reflection-eyebrow">
            YOUR DAY, REFLECTED
          </p>

          <h1>
            A little
            <br />
            <strong>something for you.</strong>
          </h1>

          <p>
            Your mood and what you write can become
            a moment to pause, understand yourself,
            and keep going.
          </p>

        </motion.section>


        {/* =========================================
            TODAY
        ========================================= */}

        <section className="mood-reflection-section">

          <div className="mood-reflection-section-label">
            TODAY
          </div>

          <div className="mood-reflection-date">
            {dateLabel}
          </div>


          <div className="mood-reflection-mood-card">

            <div className="mood-reflection-mood">

              <span className="mood-reflection-emoji">
                😐
              </span>

              <div>
                <span className="mood-reflection-small-label">
                  YOU FELT
                </span>

                <h2>
                  Okay
                </h2>
              </div>

            </div>

            <button
              type="button"
              onClick={() =>
                navigate('/app/teen/emotional-calendar')
              }
            >
              Change today's entry →
            </button>

          </div>

        </section>


        {/* =========================================
            WHAT YOU WROTE
        ========================================= */}

        <section className="mood-reflection-section">

          <div className="mood-reflection-section-label">
            WHAT YOU WROTE
          </div>

          <div className="mood-reflection-note">
            <p>
              Your thoughts from today's emotional
              calendar entry will appear here.
            </p>
          </div>

        </section>


        {/* =========================================
            AI REFLECTION
        ========================================= */}

        <motion.section
          className="mood-reflection-ai"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.4,
            delay: 0.1,
          }}
        >

          <span>
            TODAY'S REFLECTION
          </span>

          <h2>
            It's okay to just be okay.
          </h2>

          <p>
            You do not need to force yourself to feel
            amazing every day. Give yourself some room
            to simply be where you are.
          </p>

          <div className="mood-reflection-ai-actions">

            <button
              type="button"
              onClick={() =>
                navigate('/app/teen/nova')
              }
            >
              Talk to Nova →
            </button>

            <button
              type="button"
              onClick={() =>
                navigate('/app/teen/haven')
              }
            >
              Write more →
            </button>

          </div>

        </motion.section>


        {/* =========================================
            WEEKLY SNAPSHOT
        ========================================= */}

        <section className="mood-reflection-section">

          <div className="mood-reflection-section-label">
            THIS WEEK
          </div>

          <div className="mood-reflection-week">

            <div>
              <strong>🙂</strong>
              <span>3 days</span>
            </div>

            <div>
              <strong>😐</strong>
              <span>2 days</span>
            </div>

            <div>
              <strong>😤</strong>
              <span>1 day</span>
            </div>

            <div>
              <strong>😟</strong>
              <span>1 day</span>
            </div>

          </div>

        </section>


        {/* =========================================
            FOOTER
        ========================================= */}

        <footer className="mood-reflection-footer">

          <p>
            Your reflections are private to you.
          </p>

          <button
            type="button"
            onClick={() =>
              navigate('/app/teen/emotional-calendar')
            }
          >
            Open Emotional Calendar →
          </button>

        </footer>

      </div>
    </main>
  );
}

export default MoodReflection;