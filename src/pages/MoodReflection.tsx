import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

type MoodKey = 'good' | 'okay' | 'low' | 'frustrated' | 'anxious';

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

  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const day = today.getDate();

  const dateLabel = today.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  const calendarMoodKey = `twoway_mood_${year}_${month}_${day}`;
  const calendarNoteKey = `twoway_note_${year}_${month}_${day}`;
  const reflectionStorageKey = `twoway_reflection_${year}_${month}_${day}`;

  const [currentMood, setCurrentMood] = useState<MoodKey | null>(() => {
    const raw =
      localStorage.getItem(calendarMoodKey) ||
      localStorage.getItem('twoway_today_mood');
    return (raw as MoodKey) || null;
  });

  const savedNote = localStorage.getItem(calendarNoteKey) || '';

  const [reflection, setReflection] = useState(() => {
    return localStorage.getItem(reflectionStorageKey) || '';
  });

  const [savedFeedback, setSavedFeedback] = useState(false);

  const handleQuickMoodSelect = (mood: MoodKey) => {
    setCurrentMood(mood);
    localStorage.setItem('twoway_today_mood', mood);
    localStorage.setItem(calendarMoodKey, mood);
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
                      padding: '8px 12px',
                      border: '1px solid #111111',
                      borderRadius: '6px',
                      background: '#ffffff',
                      cursor: 'pointer',
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
              color: '#626779',
              fontSize: '0.9rem',
              marginBottom: '18px',
            }}
          >
            Take a moment to write freely. This space is private and just for you.
          </p>

          <div
            style={{
              border: '1px solid #111111',
              background: '#ffffff',
              padding: '16px',
            }}
          >
            <textarea
              value={reflection}
              onChange={(e) => setReflection(e.target.value)}
              placeholder="Write your reflection here..."
              style={{
                width: '100%',
                minHeight: '130px',
                border: 'none',
                outline: 'none',
                resize: 'vertical',
                background: 'transparent',
                fontFamily: 'inherit',
                fontSize: '0.95rem',
                lineHeight: 1.6,
                color: '#111111',
              }}
            />

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginTop: '14px',
                paddingTop: '12px',
                borderTop: '1px solid #e8e8e3',
              }}
            >
              <button
                type="button"
                onClick={handleSaveReflection}
                style={{
                  background: '#111111',
                  color: '#ffffff',
                  padding: '10px 18px',
                  borderRadius: '6px',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                }}
              >
                Save reflection
              </button>

              {savedFeedback && (
                <span
                  style={{
                    color: '#22a06b',
                    fontSize: '0.85rem',
                    fontWeight: 600,
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