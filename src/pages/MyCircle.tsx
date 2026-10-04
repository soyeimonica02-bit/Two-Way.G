import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

function MyCircle() {
  const navigate = useNavigate();

  return (
    <main className="circle-page">
      <div className="circle-shell">

        {/* =========================================
            HEADER
        ========================================= */}

        <header className="circle-header">

          <button
            type="button"
            className="circle-back"
            onClick={() => navigate('/app/teen')}
          >
            ← Back
          </button>

          <div className="circle-header-title">
            <span>YOUR WORLD</span>
            <h1>My Circle</h1>
          </div>

          <button
            type="button"
            className="circle-add"
          >
            +
          </button>

        </header>


        {/* =========================================
            INTRO
        ========================================= */}

        <motion.section
          className="circle-intro"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
        >
          <p className="circle-eyebrow">
            YOUR PEOPLE
          </p>

          <h2>
            The people
            <br />
            <em>you choose.</em>
          </h2>

          <p className="circle-description">
            Your Circle is made up of real people you choose
            to connect with. It is separate from Nova and
            your private spaces.
          </p>
        </motion.section>


        {/* =========================================
            EMPTY CIRCLE
        ========================================= */}

        <motion.section
          className="circle-empty"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >

          <div className="circle-empty-symbol">
            +
          </div>

          <div className="circle-empty-content">

            <span>
              YOUR CIRCLE IS EMPTY
            </span>

            <h3>
              Start with someone you trust.
            </h3>

            <p>
              Add a person to your Circle when you're ready.
              They'll become a real connection inside Two-Way.
            </p>

            <button
              type="button"
              className="circle-primary-button"
            >
              + Add someone
            </button>

          </div>

        </motion.section>


        {/* =========================================
            HOW IT WORKS
        ========================================= */}

        <section className="circle-info">

          <div className="circle-info-heading">
            <span>
              HOW YOUR CIRCLE WORKS
            </span>

            <h3>
              Human connections only.
            </h3>
          </div>

          <div className="circle-info-grid">

            <article className="circle-info-card">
              <span>01</span>

              <h4>
                Choose
              </h4>

              <p>
                You decide who belongs in your Circle.
              </p>
            </article>

            <article className="circle-info-card">
              <span>02</span>

              <h4>
                Connect
              </h4>

              <p>
                Your connections are real people,
                not AI participants.
              </p>
            </article>

            <article className="circle-info-card">
              <span>03</span>

              <h4>
                Communicate
              </h4>

              <p>
                Conversations happen when you're
                ready to have them.
              </p>
            </article>

          </div>

        </section>


        {/* =========================================
            PRIVACY
        ========================================= */}

        <section className="circle-privacy">

          <div className="circle-privacy-icon">
            🔒
          </div>

          <div>
            <span>
              YOUR PRIVATE SPACES STAY PRIVATE
            </span>

            <p>
              Your Haven, Journal, Emotional Calendar,
              and other private spaces are not shared
              with people in your Circle.
            </p>
          </div>

        </section>


        {/* =========================================
            FOOTER
        ========================================= */}

        <footer className="circle-footer">

          <button
            type="button"
            onClick={() => navigate('/app/teen')}
          >
            Return to your world
          </button>

        </footer>

      </div>
    </main>
  );
}

export default MyCircle;