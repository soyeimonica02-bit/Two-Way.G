import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import PaletteSelector from '../components/PaletteSelector';

function SettingsAppearance() {
  const navigate = useNavigate();
  const [feedback, setFeedback] = useState(false);

  const handlePaletteSelect = () => {
    setFeedback(true);
    setTimeout(() => setFeedback(false), 2400);
  };

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

          <span>EXPERIENCE</span>

          <div />
        </header>

        {/* INTRO */}
        <motion.section
          className="settings-intro"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h1>Choose your colors.</h1>

          <p>Pick a palette that feels like you. You can change it later in Settings.</p>
        </motion.section>

        {/* CONTENT */}
        <section className="settings-section">
          {feedback && (
            <div
              style={{
                padding: '14px 18px',
                background: 'var(--tw-primary)',
                border: '2.5px solid var(--tw-border)',
                color: 'var(--tw-primary-text, #ffffff)',
                fontSize: '0.8rem',
                fontWeight: 900,
                letterSpacing: '0.04em',
                marginBottom: '24px',
                borderRadius: '12px',
                boxShadow: '3px 3px 0px var(--tw-border)',
                textTransform: 'uppercase',
              }}
            >
              ✓ Theme palette updated and applied across Two-Way.
            </div>
          )}

          <PaletteSelector onPaletteSelect={handlePaletteSelect} showHeader={false} />
        </section>

        {/* FOOTER */}
        <footer className="settings-footer">
          Two-Way Appearance
        </footer>

      </div>
    </main>
  );
}

export default SettingsAppearance;
