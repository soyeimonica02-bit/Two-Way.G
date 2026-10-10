import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

function SettingsAbout() {
  const navigate = useNavigate();

  return (
    <main className="settings-page">
      <div className="settings-shell">

        {/* HEADER */}
        <header className="settings-header">
          <button
            type="button"
            aria-label="Go back"
            onClick={() => navigate('/app/teen/settings')}
          >
            ←
          </button>

          <span>ABOUT</span>

          <div />
        </header>

        {/* INTRO */}
        <motion.section
          className="settings-intro"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <span className="settings-eyebrow">TWO-WAY</span>

          <h1>Two-Way</h1>

          <p
            style={{
              fontSize: '1.25rem',
              fontWeight: 900,
              color: 'var(--tw-text)',
              marginTop: '12px',
            }}
          >
            Say the hard thing. Be understood.
          </p>
        </motion.section>

        {/* ABOUT CONTENT */}
        <section className="settings-section">
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
            }}
          >
            {/* Mission */}
            <div
              style={{
                background: 'var(--tw-surface)',
                border: '2.5px solid var(--tw-border)',
                borderRadius: '18px',
                boxShadow: '4px 4px 0px var(--tw-border)',
                padding: '24px',
              }}
            >
              <h2 style={{ fontSize: '1.15rem', fontWeight: 900, margin: '0 0 10px', color: 'var(--tw-text)' }}>
                Why Two-Way exists
              </h2>
              <p style={{ fontSize: '0.92rem', color: 'var(--tw-text-muted)', lineHeight: 1.6, margin: 0 }}>
                Two-Way is designed to help people communicate difficult thoughts and conversations more clearly. When feelings are intense, speaking up can feel overwhelming or easily misunderstood. Two-Way creates intentional spaces to untangle what you feel, prepare what you want to communicate, and connect meaningfully.
              </p>
            </div>

            {/* Nova AI Role */}
            <div
              style={{
                background: 'var(--tw-surface)',
                border: '2.5px solid var(--tw-border)',
                borderRadius: '18px',
                boxShadow: '4px 4px 0px var(--tw-border)',
                padding: '24px',
              }}
            >
              <h2 style={{ fontSize: '1.15rem', fontWeight: 900, margin: '0 0 10px', color: 'var(--tw-text)' }}>
                Nova's role as AI support
              </h2>
              <p style={{ fontSize: '0.92rem', color: 'var(--tw-text-muted)', lineHeight: 1.6, margin: 0 }}>
                Nova functions as an AI-powered sounding board to help you organize thoughts, explore perspectives, and find clear words. <strong>Nova is not a human participant, counselor, or Circle member.</strong> Nova operates as private, automated guidance so you remain in full control of what you choose to communicate.
              </p>
            </div>

            {/* Roles Supported */}
            <div
              style={{
                background: 'var(--tw-surface)',
                border: '2.5px solid var(--tw-border)',
                borderRadius: '18px',
                boxShadow: '4px 4px 0px var(--tw-border)',
                padding: '24px',
              }}
            >
              <h2 style={{ fontSize: '1.15rem', fontWeight: 900, margin: '0 0 10px', color: 'var(--tw-text)' }}>
                Supported relationship roles
              </h2>
              <p style={{ fontSize: '0.92rem', color: 'var(--tw-text-muted)', lineHeight: 1.6, margin: '0 0 14px' }}>
                Two-Way is built around key relationship dynamics:
              </p>
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '8px',
                }}
              >
                {['Teenager', 'Parent', 'Partner', 'Spouse', 'Sibling', 'Counselor'].map(
                  (role) => (
                    <span
                      key={role}
                      style={{
                        padding: '8px 14px',
                        background: 'var(--tw-surface-raised)',
                        border: '2px solid var(--tw-border)',
                        borderRadius: '10px',
                        fontSize: '0.78rem',
                        fontWeight: 900,
                        color: 'var(--tw-text)',
                        boxShadow: '2px 2px 0px var(--tw-border)',
                      }}
                    >
                      {role}
                    </span>
                  ),
                )}
              </div>
            </div>

            {/* Version */}
            <div
              style={{
                background: 'var(--tw-surface-soft)',
                border: '2.5px solid var(--tw-border)',
                borderRadius: '18px',
                boxShadow: '4px 4px 0px var(--tw-border)',
                padding: '24px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div>
                <strong style={{ fontSize: '0.95rem', display: 'block', color: 'var(--tw-text)', fontWeight: 900 }}>
                  Prototype Build
                </strong>
                <small style={{ color: 'var(--tw-text-muted)', fontSize: '0.76rem', fontWeight: 700 }}>
                  Two-Way Web Experience
                </small>
              </div>

              <span
                style={{
                  fontSize: '0.78rem',
                  fontWeight: 900,
                  color: 'var(--tw-text)',
                  background: 'var(--tw-surface)',
                  padding: '6px 14px',
                  border: '2px solid var(--tw-border)',
                  borderRadius: '10px',
                  boxShadow: '2px 2px 0px var(--tw-border)',
                }}
              >
                v0.9.4-prototype
              </span>
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="settings-footer">
          Two-Way — Say the hard thing. Be understood.
        </footer>

      </div>
    </main>
  );
}

export default SettingsAbout;
