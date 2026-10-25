import { useState } from 'react';
import { motion } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import PaletteSelector from '../components/PaletteSelector';
import ParentLayout from '../layouts/ParentLayout';
import TeenLayout from '../layouts/TeenLayout';
import { useTheme } from '../context/useTheme';

function SettingsAppearance() {
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from;
  const [feedback, setFeedback] = useState<string | null>(null);

  const isParent = location.pathname.startsWith('/app/parent');
  const baseSettingsRoute = isParent ? '/app/parent/settings' : '/app/teen/settings';
  const Layout = isParent ? ParentLayout : TeenLayout;

  const {
    teenThemeMode,
    setTeenThemeMode,
    parentAccentId,
    setParentAccentId,
    parentThemeMode,
    setParentThemeMode,
    allParentAccents,
  } = useTheme();

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate(baseSettingsRoute, { state: { from } });
    }
  };

  const handleParentAccentSelect = (id: string, name: string) => {
    setParentAccentId(id);
    setFeedback(`Accent updated to ${name}. Applied across Parent experience.`);
    setTimeout(() => setFeedback(null), 2500);
  };

  const handleTeenPaletteSelect = () => {
    setFeedback('Theme palette updated.');
    setTimeout(() => setFeedback(null), 2500);
  };

  // -------------------------------------------------------------
  // PARENT PRESENTATION: MONOCHROMATIC BASE + 6 ACCENTS + LIGHT/DARK
  // -------------------------------------------------------------
  if (isParent) {
    return (
      <Layout>
        <div className="parent-dashboard">

          {/* HEADER WITH ICON-ONLY BACK BUTTON */}
          <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
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
                <span className="parent-card-label">APPEARANCE SETTINGS</span>
                <h1 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 850 }}>Theme &amp; Contrast.</h1>
              </div>
            </div>
          </header>

          {feedback && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                padding: '12px 16px',
                borderRadius: '8px',
                border: '1.5px solid var(--parent-border-strong)',
                background: 'var(--parent-accent-soft)',
                color: 'var(--parent-text)',
                fontSize: '0.84rem',
                fontWeight: 750,
                marginBottom: '20px',
              }}
            >
              ✓ {feedback}
            </motion.div>
          )}

          {/* MODE TOGGLE: LIGHT / DARK (INDEPENDENT TO PARENT) */}
          <motion.section
            className="parent-card"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
          >
            <span className="parent-card-label">DISPLAY MODE</span>
            <h2 style={{ fontSize: '1.15rem', margin: '4px 0 6px' }}>Independent Contrast Mode</h2>
            <p style={{ color: 'var(--parent-text-secondary)', fontSize: '0.88rem', margin: '0 0 16px' }}>
              Choose your surface contrast. Setting Dark Mode here does not affect your teen&apos;s interface.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <button
                type="button"
                onClick={() => setParentThemeMode('light')}
                style={{
                  padding: '14px 16px',
                  borderRadius: '10px',
                  border: parentThemeMode === 'light' ? '2.5px solid var(--parent-accent)' : '1.5px solid var(--parent-border)',
                  background: '#FFFFFF',
                  color: '#000000',
                  cursor: 'pointer',
                  textAlign: 'left',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  boxShadow: parentThemeMode === 'light' ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
                }}
              >
                <div>
                  <strong style={{ display: 'block', fontSize: '0.92rem' }}>☀️ Light Mode</strong>
                  <span style={{ fontSize: '0.78rem', color: '#666666' }}>High-contrast crisp white</span>
                </div>
                {parentThemeMode === 'light' && (
                  <span style={{ color: 'var(--parent-accent)', fontWeight: 800, fontSize: '0.9rem' }}>●</span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setParentThemeMode('dark')}
                style={{
                  padding: '14px 16px',
                  borderRadius: '10px',
                  border: parentThemeMode === 'dark' ? '2.5px solid var(--parent-accent)' : '1.5px solid var(--parent-border)',
                  background: '#141416',
                  color: '#FFFFFF',
                  cursor: 'pointer',
                  textAlign: 'left',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  boxShadow: parentThemeMode === 'dark' ? '0 2px 8px rgba(0,0,0,0.4)' : 'none',
                }}
              >
                <div>
                  <strong style={{ display: 'block', fontSize: '0.92rem' }}>🌙 Dark Mode</strong>
                  <span style={{ fontSize: '0.78rem', color: '#A1A1AA' }}>Deep obsidian surfaces</span>
                </div>
                {parentThemeMode === 'dark' && (
                  <span style={{ color: 'var(--parent-accent)', fontWeight: 800, fontSize: '0.9rem' }}>●</span>
                )}
              </button>
            </div>
          </motion.section>

          {/* 6 ACCENT COLOR PALETTES */}
          <motion.section
            className="parent-card"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.05 }}
          >
            <span className="parent-card-label">ACCENT COLOR</span>
            <h2 style={{ fontSize: '1.15rem', margin: '4px 0 6px' }}>Minimal Accent Highlights</h2>
            <p style={{ color: 'var(--parent-text-secondary)', fontSize: '0.88rem', margin: '0 0 16px' }}>
              Used purposefully for active navigation, badges, focus states, and key highlights over the black &amp; white foundation.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
              {allParentAccents.map((acc) => {
                const isSelected = parentAccentId === acc.id;
                return (
                  <button
                    key={acc.id}
                    type="button"
                    onClick={() => handleParentAccentSelect(acc.id, acc.name)}
                    style={{
                      padding: '14px 16px',
                      borderRadius: '10px',
                      border: isSelected ? '2px solid var(--parent-border-strong)' : '1.5px solid var(--parent-border)',
                      background: isSelected ? 'var(--parent-surface-subtle)' : 'var(--parent-surface)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '12px',
                      transition: 'all 120ms ease',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span
                        style={{
                          width: '24px',
                          height: '24px',
                          borderRadius: '50%',
                          background: acc.accent,
                          display: 'inline-block',
                          border: '2px solid var(--parent-border-strong)',
                        }}
                      />
                      <div style={{ textAlign: 'left' }}>
                        <strong style={{ display: 'block', fontSize: '0.88rem', color: 'var(--parent-text)' }}>
                          {acc.name}
                        </strong>
                        <span style={{ fontSize: '0.74rem', color: 'var(--parent-text-muted)' }}>
                          {acc.colorName} Highlight
                        </span>
                      </div>
                    </div>

                    {isSelected ? (
                      <span
                        style={{
                          fontSize: '0.65rem',
                          fontWeight: 850,
                          textTransform: 'uppercase',
                          color: acc.accent,
                          background: acc.accentSoft,
                          padding: '3px 7px',
                          borderRadius: '4px',
                          border: `1px solid ${acc.accent}`,
                        }}
                      >
                        Active
                      </span>
                    ) : (
                      <span style={{ fontSize: '0.75rem', color: 'var(--parent-text-muted)' }}>Apply</span>
                    )}
                  </button>
                );
              })}
            </div>
          </motion.section>

        </div>
      </Layout>
    );
  }

  // -------------------------------------------------------------
  // TEEN PRESENTATION: EXPRESSIVE PALETTES + INDEPENDENT LIGHT/DARK
  // -------------------------------------------------------------
  return (
    <Layout>
      <main className="settings-page">
        <div className="settings-shell" style={{ maxWidth: '780px', margin: '0 auto', padding: '24px 20px 80px' }}>

          {/* HEADER WITH ICON-ONLY BACK BUTTON */}
          <header
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '20px',
            }}
          >
            <button
              type="button"
              className="tw-button"
              aria-label="Go back"
              onClick={handleBack}
              style={{
                width: '40px',
                height: '40px',
                display: 'grid',
                placeItems: 'center',
                borderRadius: '10px',
                border: '2px solid var(--tw-border)',
                background: 'var(--tw-surface)',
                color: 'var(--tw-text)',
                fontSize: '1.2rem',
                fontWeight: 800,
                cursor: 'pointer',
                boxShadow: '2px 2px 0px var(--tw-border)',
              }}
            >
              ←
            </button>

            <span
              style={{
                fontSize: '0.72rem',
                fontWeight: 850,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: 'var(--tw-primary)',
              }}
            >
              EXPERIENCE &amp; THEMES
            </span>

            <div style={{ width: '40px' }} />
          </header>

          {/* INTRO */}
          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            style={{ marginBottom: '22px' }}
          >
            <h1
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(1.7rem, 4vw, 2.2rem)',
                fontWeight: 900,
                margin: '0 0 8px',
                color: 'var(--tw-text)',
              }}
            >
              Choose your colors.
            </h1>
            <p style={{ margin: 0, color: 'var(--tw-text-muted)', fontSize: '0.92rem' }}>
              Pick a theme palette and contrast mode that feels right for you.
            </p>
          </motion.section>

          {/* INDEPENDENT TEEN LIGHT / DARK MODE TOGGLE */}
          <section
            style={{
              padding: '16px',
              borderRadius: '14px',
              border: '2px solid var(--tw-border)',
              background: 'var(--tw-surface)',
              marginBottom: '24px',
              boxShadow: '3px 3px 0px var(--tw-border)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div>
                <strong style={{ display: 'block', fontSize: '0.92rem', color: 'var(--tw-text)' }}>
                  Contrast Mode
                </strong>
                <span style={{ fontSize: '0.78rem', color: 'var(--tw-text-muted)' }}>
                  Independent to your account
                </span>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => setTeenThemeMode('light')}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '8px',
                    border: teenThemeMode === 'light' ? '2px solid var(--tw-border)' : '1px solid var(--tw-border)',
                    background: teenThemeMode === 'light' ? 'var(--tw-primary)' : 'var(--tw-surface)',
                    color: teenThemeMode === 'light' ? 'var(--tw-primary-text, #ffffff)' : 'var(--tw-text)',
                    fontSize: '0.8rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                  }}
                >
                  ☀️ Light
                </button>
                <button
                  type="button"
                  onClick={() => setTeenThemeMode('dark')}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '8px',
                    border: teenThemeMode === 'dark' ? '2px solid var(--tw-border)' : '1px solid var(--tw-border)',
                    background: teenThemeMode === 'dark' ? 'var(--tw-primary)' : 'var(--tw-surface)',
                    color: teenThemeMode === 'dark' ? 'var(--tw-primary-text, #ffffff)' : 'var(--tw-text)',
                    fontSize: '0.8rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                  }}
                >
                  🌙 Dark
                </button>
              </div>
            </div>
          </section>

          {feedback && (
            <div
              style={{
                padding: '12px 16px',
                background: 'var(--tw-primary)',
                border: '2px solid var(--tw-border)',
                color: 'var(--tw-primary-text, #ffffff)',
                fontSize: '0.8rem',
                fontWeight: 900,
                letterSpacing: '0.04em',
                marginBottom: '20px',
                borderRadius: '10px',
                boxShadow: '2.5px 2.5px 0px var(--tw-border)',
                textTransform: 'uppercase',
              }}
            >
              ✓ {feedback}
            </div>
          )}

          {/* PALETTES */}
          <PaletteSelector onPaletteSelect={handleTeenPaletteSelect} showHeader={false} />

        </div>
      </main>
    </Layout>
  );
}

export default SettingsAppearance;
