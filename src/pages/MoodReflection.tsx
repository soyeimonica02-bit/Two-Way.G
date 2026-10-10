import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useMood } from '../context/useMood';
import type { MoodKey } from '../utils/moodStorage';

interface MoodInfo {
  emoji: string;
  label: string;
  reflectionTitle: string;
  reflectionBody: string;
  prompt: string;
}

const moodDetails: Record<MoodKey, MoodInfo> = {
  good: {
    emoji: '🙂',
    label: 'Good',
    reflectionTitle: 'Hold onto what feels light.',
    reflectionBody:
      'When things feel steady or good, give yourself credit for simply experiencing it. You do not have to wait for difficult days to appreciate what is working right now.',
    prompt: 'What do you think contributed to making today feel lighter or easier?',
  },
  okay: {
    emoji: '😐',
    label: 'Okay',
    reflectionTitle: "It's completely okay to just be okay.",
    reflectionBody:
      'You do not need to force yourself to feel amazing or achieve something extraordinary today. Existing in the middle is normal, peaceful, and honest.',
    prompt: 'What do you think is behind this feeling, or has today just been quiet?',
  },
  low: {
    emoji: '😔',
    label: 'Low',
    reflectionTitle: 'You are allowed to move slowly today.',
    reflectionBody:
      'Feeling low can make everything seem like effort. Be gentle with yourself. You do not have to figure out everything or fix anything right this second.',
    prompt: 'What do you think is weighing on you today, even if it feels small?',
  },
  frustrated: {
    emoji: '😤',
    label: 'Frustrated',
    reflectionTitle: 'Your frustration is valid.',
    reflectionBody:
      'Frustration happens when something feels unfair, blocked, or out of your control. Give yourself a moment to step back before deciding what to do next.',
    prompt: 'What felt like the biggest friction point today?',
  },
  anxious: {
    emoji: '😟',
    label: 'Anxious',
    reflectionTitle: 'One thing at a time.',
    reflectionBody:
      'Anxiety tries to make you solve every possible scenario all at once. Ground yourself in what is right here in front of you. You only have to handle this exact moment.',
    prompt: 'What thoughts keep looping in your mind right now?',
  },
};

function MoodReflection() {
  const navigate = useNavigate();

  const { todayEntry, todayKey, saveEntry } = useMood();

  const today = new Date();
  const dateLabel = today.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  const reflectionStorageKey = `twoway_reflection_${todayKey}`;

  const currentMood = todayEntry?.mood || null;
  const savedNote = todayEntry?.note || '';

  const [reflection, setReflection] = useState(() => {
    return localStorage.getItem(reflectionStorageKey) || '';
  });

  const [savedFeedback, setSavedFeedback] = useState(false);

  const handleQuickMoodSelect = (mood: MoodKey) => {
    saveEntry({
      date: todayKey,
      mood: mood,
      note: savedNote,
    });
  };

  const handleSaveReflection = () => {
    localStorage.setItem(reflectionStorageKey, reflection.trim());
    setSavedFeedback(true);
    setTimeout(() => {
      setSavedFeedback(false);
    }, 2800);
  };

  const activeMoodInfo = currentMood ? moodDetails[currentMood] : null;

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
            aria-label="Go back"
            onClick={() => navigate('/app/teen')}
          >
            ←
          </button>

          <span>
            MOOD REFLECTION
          </span>

          <div />
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
            A moment
            <br />
            <strong>to pause.</strong>
          </h1>

          <p>
            Understand how you feel, what is behind it, and where you want to go next.
          </p>
        </motion.section>


        {/* =========================================
            TODAY'S MOOD
        ========================================= */}

        <section className="mood-reflection-section">
          <div className="mood-reflection-section-label">
            TODAY'S MOOD
          </div>

          <div className="mood-reflection-date">
            {dateLabel}
          </div>

          {activeMoodInfo ? (
            <div className="mood-reflection-mood-card">
              <div className="mood-reflection-mood">
                <span className="mood-reflection-emoji">
                  {activeMoodInfo.emoji}
                </span>

                <div>
                  <span className="mood-reflection-small-label">
                    YOU FELT
                  </span>

                  <h2>
                    {activeMoodInfo.label}
                  </h2>
                </div>
              </div>

              <button
                type="button"
                onClick={() =>
                  navigate('/app/teen/emotional-calendar')
                }
              >
                Change in Calendar →
              </button>
            </div>
          ) : (
            <div className="mood-reflection-mood-card">
              <div className="mood-reflection-mood">
                <span className="mood-reflection-emoji">
                  💭
                </span>

                <div>
                  <span className="mood-reflection-small-label">
                    NOT RECORDED YET
                  </span>

                  <h2>
                    How are you?
                  </h2>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {(Object.keys(moodDetails) as MoodKey[]).map((key) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handleQuickMoodSelect(key)}
                    style={{
                      padding: '10px 16px',
                      border: '2.5px solid var(--tw-border)',
                      borderRadius: '12px',
                      background: 'var(--tw-surface)',
                      color: 'var(--tw-text)',
                      fontWeight: 800,
                      boxShadow: '2.5px 2.5px 0px var(--tw-border)',
                      cursor: 'pointer',
                      transition: 'transform 120ms ease, box-shadow 120ms ease',
                    }}
                  >
                    {moodDetails[key].emoji} {moodDetails[key].label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </section>


        {/* =========================================
            WHAT YOU WROTE (IF AVAILABLE)
        ========================================= */}

        {savedNote && (
          <section className="mood-reflection-section">
            <div className="mood-reflection-section-label">
              WHAT YOU WROTE IN YOUR CALENDAR
            </div>

            <div className="mood-reflection-note">
              <p>{savedNote}</p>
            </div>
          </section>
        )}


        {/* =========================================
            SHORT REFLECTION ABOUT THAT MOOD
        ========================================= */}

        {activeMoodInfo && (
          <motion.section
            className="mood-reflection-ai"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.4,
              delay: 0.08,
            }}
          >
            <span>
              REFLECTION ON HOW YOU FEEL
            </span>

            <h2>
              {activeMoodInfo.reflectionTitle}
            </h2>

            <p>
              {activeMoodInfo.reflectionBody}
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
                My Haven →
              </button>
            </div>
          </motion.section>
        )}


        {/* =========================================
            THOUGHTFUL PROMPT & REFLECTION SPACE
        ========================================= */}

        <section className="mood-reflection-section">
          <div className="mood-reflection-section-label">
            THOUGHTFUL PROMPT
          </div>

          <h3
            style={{
              fontSize: '1.25rem',
              fontWeight: 700,
              letterSpacing: '-0.02em',
              marginBottom: '10px',
            }}
          >
            {activeMoodInfo
              ? activeMoodInfo.prompt
              : 'What do you think is behind how you are feeling right now?'}
          </h3>

          <p
            style={{
              color: 'var(--tw-text-muted)',
              fontSize: '0.9rem',
              marginBottom: '18px',
            }}
          >
            Take a moment to write freely. This space is private and just for you.
          </p>

          <div
            style={{
              border: '2.5px solid var(--tw-border)',
              borderRadius: '16px',
              background: 'var(--tw-surface)',
              boxShadow: '4px 4px 0px var(--tw-border)',
              padding: '20px',
            }}
          >
            <textarea
              value={reflection}
              onChange={(e) => setReflection(e.target.value)}
              placeholder="Write your reflection here..."
              style={{
                width: '100%',
                minHeight: '140px',
                border: '2px solid var(--tw-border)',
                borderRadius: '12px',
                outline: 'none',
                resize: 'vertical',
                background: 'var(--tw-surface-soft)',
                fontFamily: 'inherit',
                fontSize: '0.98rem',
                lineHeight: 1.6,
                color: 'var(--tw-text)',
                padding: '14px',
              }}
            />

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginTop: '14px',
                paddingTop: '12px',
                borderTop: '2px solid var(--tw-border)',
              }}
            >
              <button
                type="button"
                onClick={handleSaveReflection}
                style={{
                  background: 'var(--tw-primary)',
                  color: 'var(--tw-primary-text, #ffffff)',
                  border: '2.5px solid var(--tw-border)',
                  padding: '12px 24px',
                  borderRadius: '12px',
                  fontWeight: 900,
                  fontSize: '0.82rem',
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                  boxShadow: '2.5px 2.5px 0px var(--tw-border)',
                }}
              >
                Save reflection
              </button>

              {savedFeedback && (
                <span
                  style={{
                    color: 'var(--tw-primary)',
                    fontSize: '0.85rem',
                    fontWeight: 800,
                  }}
                >
                  ✓ Saved to your private space
                </span>
              )}
            </div>
          </div>
        </section>


        {/* =========================================
            FOOTER
        ========================================= */}

        <footer className="mood-reflection-footer">
          <p>
            🔒 Your reflections are private to you.
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