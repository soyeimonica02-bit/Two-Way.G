import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import TeenLayout from '../layouts/TeenLayout';

function TeenDashboard() {
  const navigate = useNavigate();

  const name =
    localStorage.getItem('twoway_profile_name') ||
    localStorage.getItem('twoway_demo_name') ||
    'there';

  const moodOptions = [
    { key: 'good', emoji: '🙂', label: 'Good' },
    { key: 'okay', emoji: '😐', label: 'Okay' },
    { key: 'low', emoji: '😔', label: 'Low' },
    { key: 'frustrated', emoji: '😤', label: 'Frustrated' },
    { key: 'anxious', emoji: '😟', label: 'Anxious' },
  ];

  const now = new Date();
  const todayCalendarKey = `twoway_mood_${now.getFullYear()}_${now.getMonth()}_${now.getDate()}`;

  const [todayMood, setTodayMood] = useState<string | null>(() => {
    return (
      localStorage.getItem('twoway_today_mood') ||
      localStorage.getItem(todayCalendarKey) ||
      null
    );
  });

  const handleMoodSelect = (mood: string) => {
    localStorage.setItem('twoway_today_mood', mood);
    localStorage.setItem(todayCalendarKey, mood);
    setTodayMood(mood);
  };

  return (
    <TeenLayout>
      <main className="teen-dashboard">

        <motion.section
          className="teen-intro"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
        >
          <p className="teen-eyebrow">
            WELCOME BACK
          </p>

          <h1>
            Hey, {name}.
          </h1>

          <p>
            This is your space to say what you mean,
            understand what you feel, and be understood.
          </p>
        </motion.section>


        {/* =========================================
            MOOD
        ========================================= */}

        <motion.section
          className="teen-mood-section"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.05 }}
        >
          <div className="teen-section-heading">
            <div>
              <span className="teen-label">
                RIGHT NOW
              </span>

              <h2>
                How are you feeling?
              </h2>
            </div>

            <button
              type="button"
              onClick={() =>
                navigate('/app/teen/emotional-calendar')
              }
            >
              Emotional Calendar →
            </button>
          </div>

          <div className="teen-mood-grid">
            {moodOptions.map((mood) => {
              const selected = todayMood === mood.key;

              return (
                <button
                  key={mood.key}
                  type="button"
                  className={`teen-mood-card ${
                    selected ? 'is-selected' : ''
                  }`}
                  onClick={() =>
                    handleMoodSelect(mood.key)
                  }
                >
                  <span className="teen-mood-emoji">
                    {mood.emoji}
                  </span>

                  <span className="teen-mood-label">
                    {mood.label}
                  </span>
                </button>
              );
            })}
          </div>
        </motion.section>


        {/* =========================================
            NOVA
        ========================================= */}

        <motion.section
          className="teen-feature-section"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.1 }}
        >
          <button
            type="button"
            className="teen-nova-card"
            onClick={() => navigate('/app/teen/nova')}
          >
            <div className="teen-nova-content">
              <span className="teen-label">
                NOVA
              </span>

              <h2>
                Need help saying something?
              </h2>

              <p>
                Put your thoughts here. Nova can help
                you understand what you want to say.
              </p>
            </div>

            <span className="teen-nova-arrow">
              →
            </span>
          </button>
        </motion.section>


        {/* =========================================
            CONVERSATIONS
        ========================================= */}

        <motion.section
          className="teen-feature-section"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.15 }}
        >
          <button
            type="button"
            className="teen-conversation-card"
            onClick={() =>
              navigate('/app/teen/conversations')
            }
          >
            <div>
              <span className="teen-label">
                YOUR CONVERSATIONS
              </span>

              <h2>
                Talk when you're ready.
              </h2>

              <p>
                Your conversations live here.
              </p>
            </div>

            <span>
              →
            </span>
          </button>
        </motion.section>


        {/* =========================================
            YOUR WORLD
        ========================================= */}

        <motion.section
          className="teen-world-section"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.2 }}
        >
          <div className="teen-section-heading">
            <div>
              <span className="teen-label">
                YOUR WORLD
              </span>

              <h2>
                Spaces that are yours.
              </h2>
            </div>
          </div>

          <div className="teen-world-grid">

            <button
              type="button"
              className="teen-world-card"
              onClick={() =>
                navigate('/app/teen/emotional-calendar')
              }
            >
              <span className="teen-world-number">
                01
              </span>

              <h3>
                Emotional Calendar
              </h3>

              <p>
                Track how your days feel.
              </p>

              <span className="teen-world-arrow">
                →
              </span>
            </button>


            <button
              type="button"
              className="teen-world-card"
              onClick={() =>
                navigate('/app/teen/haven')
              }
            >
              <span className="teen-world-number">
                02
              </span>

              <h3>
                My Haven
              </h3>

              <p>
                Your private space.
              </p>

              <span className="teen-world-arrow">
                →
              </span>
            </button>


            <button
              type="button"
              className="teen-world-card"
              onClick={() =>
                navigate('/app/teen/circle')
              }
            >
              <span className="teen-world-number">
                03
              </span>

              <h3>
                My Circle
              </h3>

              <p>
                The people you choose.
              </p>

              <span className="teen-world-arrow">
                →
              </span>
            </button>


            <button
              type="button"
              className="teen-world-card"
              onClick={() =>
                navigate('/app/teen/mood-reflection')
              }
            >
              <span className="teen-world-number">
                04
              </span>

              <h3>
                Mood Reflection
              </h3>

              <p>
                Pause, reflect, and understand how you're feeling.
              </p>

              <span className="teen-world-arrow">
                →
              </span>
            </button>

          </div>
        </motion.section>


        {/* =========================================
            SETTINGS
        ========================================= */}

        <footer className="teen-footer">
          <button
            type="button"
            onClick={() =>
              navigate('/app/teen/settings')
            }
          >
            Settings →
          </button>
        </footer>

      </main>
    </TeenLayout>
  );
}

export default TeenDashboard;