import { motion } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import ParentLayout from '../layouts/ParentLayout';
import TeenLayout from '../layouts/TeenLayout';

function SettingsAbout() {
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from;

  const isParent = location.pathname.startsWith('/app/parent');
  const baseSettingsRoute = isParent ? '/app/parent/settings' : '/app/teen/settings';

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate(baseSettingsRoute, { state: { from } });
    }
  };

  // -------------------------------------------------------------------
  // PARENT PRESENTATION: Monochromatic minimalism with black & white design
  // -------------------------------------------------------------------
  if (isParent) {
    return (
      <ParentLayout>
        <div className="parent-dashboard">
          {/* HEADER WITH UNIFIED ICON-ONLY BACK BUTTON */}
          <header style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '24px' }}>
            <button
              type="button"
              className="parent-back-btn"
              aria-label="Go back"
              title="Go back"
              onClick={handleBack}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
            </button>

            <div>
              <span className="parent-card-label">ABOUT TWO-WAY</span>
              <h1 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 850 }}>About the Platform.</h1>
            </div>
          </header>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
          >
            {/* Core Mission */}
            <div className="parent-card">
              <span className="parent-card-label">FOUNDATIONAL PURPOSE</span>
              <h2 style={{ fontSize: '1.15rem', margin: '4px 0 10px' }}>Say the hard thing. Be understood.</h2>
              <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--parent-text-secondary)', lineHeight: 1.6 }}>
                Two-Way is built to bridge parent-teen communication gaps during challenging developmental years. It offers intentional, private spaces to process emotional reactions before responding, identify constructive dialogue paths, and maintain healthy, respectful boundaries.
              </p>
            </div>

            {/* Role of Nova */}
            <div className="parent-card">
              <span className="parent-card-label">AI GUIDANCE ARCHITECTURE</span>
              <h2 style={{ fontSize: '1.15rem', margin: '4px 0 10px' }}>Nova as an AI Sounding Board</h2>
              <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--parent-text-secondary)', lineHeight: 1.6 }}>
                Nova functions as an automated communication reflection partner. <strong>Nova is strictly an AI assistant and is not a licensed counselor, medical professional, or Circle participant.</strong> Nova does not report or disclose parent thoughts to teens or vice versa.
              </p>
            </div>

            {/* Supported Relationship Roles */}
            <div className="parent-card">
              <span className="parent-card-label">SUPPORTED ROLES</span>
              <h2 style={{ fontSize: '1.15rem', margin: '4px 0 10px' }}>Two-Way Role Model</h2>
              <p style={{ margin: '0 0 12px', fontSize: '0.86rem', color: 'var(--parent-text-secondary)' }}>
                Two-Way supports two dedicated family and communication roles:
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {['Teenager', 'Parent'].map((role) => (
                  <span
                    key={role}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '6px',
                      border: '1.5px solid var(--parent-border)',
                      background: 'var(--parent-surface-subtle)',
                      fontSize: '0.8rem',
                      fontWeight: 750,
                      color: 'var(--parent-text)',
                    }}
                  >
                    {role}
                  </span>
                ))}
              </div>
            </div>

            {/* Technical Specifications */}
            <div
              style={{
                border: '1px solid var(--parent-border)',
                borderRadius: '8px',
                padding: '16px',
                background: 'var(--parent-surface-subtle)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div>
                <strong style={{ display: 'block', fontSize: '0.9rem', color: 'var(--parent-text)' }}>Two-Way Web Application</strong>
                <span style={{ fontSize: '0.78rem', color: 'var(--parent-text-muted)' }}>Role-separated communication system</span>
              </div>
              <span
                style={{
                  fontSize: '0.74rem',
                  fontWeight: 800,
                  padding: '4px 10px',
                  borderRadius: '4px',
                  border: '1px solid var(--parent-border-strong)',
                  background: 'var(--parent-surface)',
                  color: 'var(--parent-text)',
                }}
              >
                v0.9.4
              </span>
            </div>
          </motion.div>
        </div>
      </ParentLayout>
    );
  }

  // -------------------------------------------------------------------
  // TEEN PRESENTATION: Bold, high-energy layout with SVG back button
  // -------------------------------------------------------------------
  return (
    <TeenLayout>
      <main className="settings-page">
        <div className="settings-shell">
          {/* HEADER */}
          <header className="settings-header">
            <button
              type="button"
              aria-label="Go back"
              title="Go back"
              onClick={handleBack}
              className="teen-back-btn"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
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
                  Nova&apos;s role as AI support
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
                  {['Teenager', 'Parent'].map(
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
                  v0.9.4
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
    </TeenLayout>
  );
}

export default SettingsAbout;
