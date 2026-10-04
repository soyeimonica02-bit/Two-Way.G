import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

function Landing() {
  return (
    <main className="tw-page">
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
            transition={{
              duration: 0.55,
              ease: 'easeOut',
            }}
            style={{
              width: '100%',
              maxWidth: '520px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '32px',
            }}
          >
            {/* Logo */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}
            >
              <img
                src="/favicon.svg"
                alt="Two-Way logo"
                style={{
                  width: '180px',
                  height: '150px',
                  objectFit: 'contain',
                  display: 'block',
                }}
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

              <p
                className="text-secondary"
                style={{
                  margin: '10px 0 0',
                  fontSize: '0.85rem',
                  lineHeight: 1.5,
                  textAlign: 'center',
                }}
              >
                Say the hard thing. Be understood.
              </p>
            </div>

            {/* Welcome message */}
            <div
              style={{
                width: '100%',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
              }}
            >
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
                Better conversations
                <br />
                start here.
              </h1>

              <p
                className="text-secondary"
                style={{
                  margin: 0,
                  fontSize: '1rem',
                  lineHeight: 1.7,
                }}
              >
                Two-Way helps teens, families, and communities communicate
                through understanding, emotional awareness, and AI support.
              </p>
            </div>

            {/* Authentication actions */}
            <div
              style={{
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
              }}
            >
              <Link
                to="/roles"
                style={{
                  width: '100%',
                  textDecoration: 'none',
                }}
              >
                <button
                  type="button"
                  className="tw-button tw-button-primary"
                  style={{
                    width: '100%',
                    minHeight: '52px',
                    fontSize: '1rem',
                  }}
                >
                  Create Account
                </button>
              </Link>

              <Link
                to="/auth?mode=login"
                style={{
                  width: '100%',
                  textDecoration: 'none',
                }}
              >
                <button
                  type="button"
                  className="tw-button tw-button-secondary"
                  style={{
                    width: '100%',
                    minHeight: '52px',
                    fontSize: '1rem',
                  }}
                >
                  Log In
                </button>
              </Link>
            </div>

            {/* Privacy reassurance */}
            <p
              className="text-secondary"
              style={{
                maxWidth: '330px',
                margin: 0,
                textAlign: 'center',
                fontSize: '0.78rem',
                lineHeight: 1.6,
              }}
            >
              Your conversations are private. Shared information always
              requires your permission.
            </p>
          </motion.div>
        </section>
      </div>
    </main>
  );
}

export default Landing;