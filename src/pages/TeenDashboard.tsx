import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import TeenLayout from '../layouts/TeenLayout';
import { useMood } from '../context/useMood';
import {
  formatRecordedTime,
  formatUpdatedTime,
} from '../utils/moodStorage';
import type { MoodKey } from '../utils/moodStorage';
import {
  getCurrentTeenAgeStatus,
  syncServerAgeSession,
  AGE_OUT_BANNER_MESSAGE,
} from '../utils/ageVerification';

function TeenDashboard() {
  const navigate = useNavigate();
  const [ageStatus, setAgeStatus] = useState(() => getCurrentTeenAgeStatus());

  useEffect(() => {
    syncServerAgeSession().then((session) => {
      if (session) {
        setAgeStatus((prev) => ({
          ...prev,
          isAgedOut: session.isAgedOut,
          isEligibleTeen: session.canCreateContent,
        }));
      }
    });
  }, []);
  const { todayKey, todayEntry, saveEntry } = useMood();

  const name =
    localStorage.getItem('twoway_profile_name') ||
    localStorage.getItem('twoway_demo_name') ||
    'there';

  const moodOptions: { key: MoodKey; emoji: string; label: string }[] = [
    { key: 'good', emoji: '🙂', label: 'Good' },
    { key: 'okay', emoji: '😐', label: 'Okay' },
    { key: 'low', emoji: '😔', label: 'Low' },
    { key: 'frustrated', emoji: '😤', label: 'Frustrated' },
    { key: 'anxious', emoji: '😟', label: 'Anxious' },
  ];

  const [editingMood, setEditingMood] = useState<MoodKey | null>(null);
  const [editingNote, setEditingNote] = useState<string>('');
  const [isNoteOpen, setIsNoteOpen] = useState(false);
  const [savedFeedback, setSavedFeedback] = useState(false);

  // The active mood to display: when editing, use editingMood; otherwise use today's saved mood
  const activeMood = isNoteOpen && editingMood ? editingMood : (todayEntry?.mood || null);

  const handleMoodSelect = (mood: MoodKey) => {
    setEditingMood(mood);
    const existingNote = todayEntry?.note || '';
    setEditingNote(existingNote);
    setIsNoteOpen(true);
    setSavedFeedback(false);
    // Immediately save and sync today's mood with Emotional Calendar
    saveEntry({
      date: todayKey,
      mood,
      note: existingNote,
    });
  };

  const handleSaveEntry = () => {
    const moodToSave = editingMood || todayEntry?.mood;
    if (!moodToSave) return;
    saveEntry({
      date: todayKey,
      mood: moodToSave,
      note: editingNote,
    });
    setSavedFeedback(true);
    setIsNoteOpen(false);
    setEditingMood(null);
    setEditingNote('');
    setTimeout(() => {
      setSavedFeedback(false);
    }, 2800);
  };

  const handleCancel = () => {
    setIsNoteOpen(false);
    setEditingMood(null);
    setEditingNote('');
  };

  return (
    <TeenLayout>
      <main className="teen-dashboard">
        <div className="teen-shell">

          {/* =========================================
              1. WELCOME BACK
          ========================================= */}

          <motion.section
            className="teen-intro"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
          >
            <div className="teen-badge-pill">
              ★ WELCOME BACK
            </div>

            <h1>
              Hey, {name}.
            </h1>

            <p>
              This is your space to say what you mean, understand what you feel, and be understood.
            </p>

            {ageStatus.isAgedOut && (
              <div
                style={{
                  background: 'var(--tw-surface, #ffffff)',
                  border: '2px solid var(--tw-border)',
                  borderLeft: '5px solid #d97706',
                  borderRadius: '12px',
                  padding: '16px 20px',
                  marginTop: '16px',
                  boxShadow: '3px 3px 0 rgba(0, 0, 0, 0.06)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <span style={{ fontSize: '1.1rem' }}>⏳</span>
                  <strong style={{ fontSize: '0.94rem', color: 'var(--tw-text)', fontWeight: 800 }}>
                    Account Transition Notice (Read-Only Mode)
                  </strong>
                </div>
                <p style={{ margin: 0, fontSize: '0.86rem', color: 'var(--tw-text-secondary)', lineHeight: 1.55 }}>
                  {AGE_OUT_BANNER_MESSAGE}
                </p>
              </div>
            )}
          </motion.section>


          {/* =========================================
              2. RIGHT NOW
          ========================================= */}

          <motion.section
            className="teen-mood-section"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.05 }}
          >
            <div className="teen-section-heading">
              <div>
                <span className="teen-label-tag">
                  RIGHT NOW
                </span>

                <h2>
                  How are you feeling?
                </h2>
              </div>
            </div>

            <div className="teen-mood-grid">
              {moodOptions.map((mood) => {
                const isSelected = activeMood === mood.key;

                return (
                  <button
                    key={mood.key}
                    type="button"
                    className={`teen-mood-card ${
                      isSelected ? 'is-selected' : ''
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

            {/* Compact note input revealed only when clicked/editing */}
            {isNoteOpen && activeMood && (
              <motion.div
                className="teen-mood-note"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
              >
                <input
                  type="text"
                  className="teen-mood-note-input"
                  value={editingNote}
                  onChange={(event) => setEditingNote(event.target.value)}
                  placeholder="Add a thought for today (optional)..."
                  autoFocus
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      event.preventDefault();
                      handleSaveEntry();
                    }
                  }}
                />

                <div className="teen-mood-note-actions">
                  <button
                    type="button"
                    className="teen-mood-save-button"
                    onClick={handleSaveEntry}
                  >
                    Save
                  </button>

                  <button
                    type="button"
                    className="teen-mood-cancel-button"
                    onClick={handleCancel}
                  >
                    Cancel
                  </button>
                </div>
              </motion.div>
            )}

            {/* Subtle status message and edit action when note input is closed */}
            {!isNoteOpen && todayEntry && (
              <div
                className="teen-mood-status-row"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '8px',
                  marginTop: '12px',
                }}
              >
                <span className="teen-mood-saved-badge">
                  ✓ {todayEntry.recordedAt ? formatRecordedTime(todayEntry.recordedAt) : 'Recorded today'}
                  {todayEntry.updatedAt && todayEntry.updatedAt !== todayEntry.recordedAt
                    ? ` · ${formatUpdatedTime(todayEntry.updatedAt)}`
                    : ''}
                </span>

                <button
                  type="button"
                  onClick={() => {
                    setEditingMood(todayEntry.mood);
                    setEditingNote(todayEntry.note || '');
                    setIsNoteOpen(true);
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--tw-primary)',
                    font: 'inherit',
                    fontSize: '0.76rem',
                    fontWeight: 800,
                    textDecoration: 'underline',
                    cursor: 'pointer',
                    padding: '2px 6px',
                  }}
                >
                  {todayEntry.note ? 'Edit note / mood' : 'Add a note'}
                </button>
              </div>
            )}

            {!isNoteOpen && !todayEntry && savedFeedback && (
              <div className="teen-mood-status-row">
                <span className="teen-mood-saved-badge">
                  ✓ Saved to Emotional Calendar
                </span>
              </div>
            )}
          </motion.section>


          {/* =========================================
              3. OUR WORLD (GRID OF PHYSICAL CARDS)
          ========================================= */}

          <motion.section
            className="teen-world-section"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.1 }}
          >
            <div className="teen-section-heading">
              <div>
                <span className="teen-label-tag">
                  OUR WORLD
                </span>

                <h2>
                  Spaces that are yours.
                </h2>
              </div>
            </div>

            <div className="teen-world-grid">

              <button
                type="button"
                className="teen-world-card teen-world-card--calendar"
                onClick={() =>
                  navigate('/app/teen/emotional-calendar')
                }
              >
                <div className="teen-world-card-top">
                  <span className="teen-world-icon">
                    📅
                  </span>

                  <span className="teen-card-arrow">
                    →
                  </span>
                </div>

                <div>
                  <h3>
                    Emotional Calendar
                  </h3>

                  <p>
                    Track how your days feel.
                  </p>
                </div>
              </button>


              <button
                type="button"
                className="teen-world-card teen-world-card--haven"
                onClick={() =>
                  navigate('/app/teen/haven')
                }
              >
                <div className="teen-world-card-top">
                  <span className="teen-world-icon">
                    🔒
                  </span>

                  <span className="teen-card-arrow">
                    →
                  </span>
                </div>

                <div>
                  <h3>
                    My Haven
                  </h3>

                  <p>
                    Your private space.
                  </p>
                </div>
              </button>


              <button
                type="button"
                className="teen-world-card teen-world-card--reflection"
                onClick={() =>
                  navigate('/app/teen/mood-reflection')
                }
              >
                <div className="teen-world-card-top">
                  <span className="teen-world-icon" aria-label="Mood Reflection">
                    ✨
                  </span>

                  <span className="teen-card-arrow">
                    →
                  </span>
                </div>

                <div>
                  <h3>
                    Mood Reflection
                  </h3>

                  <p>
                    Pause, reflect, and understand how you're feeling.
                  </p>
                </div>
              </button>

            </div>
          </motion.section>

        </div>
      </main>
    </TeenLayout>
  );
}

export default TeenDashboard;