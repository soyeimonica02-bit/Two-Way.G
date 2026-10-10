import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import {
  formatDateKey,
  formatRecordedTime,
  formatUpdatedTime,
} from '../utils/moodStorage';
import type { MoodKey } from '../utils/moodStorage';
import { useMood } from '../context/useMood';

interface MoodOption {
  key: MoodKey;
  emoji: string;
  label: string;
}

const moods: MoodOption[] = [
  {
    key: 'good',
    emoji: '🙂',
    label: 'Good',
  },
  {
    key: 'okay',
    emoji: '😐',
    label: 'Okay',
  },
  {
    key: 'low',
    emoji: '😔',
    label: 'Low',
  },
  {
    key: 'frustrated',
    emoji: '😤',
    label: 'Frustrated',
  },
  {
    key: 'anxious',
    emoji: '😟',
    label: 'Anxious',
  },
];

const motivation: Record<MoodKey, string> = {
  good:
    'Hold onto whatever is making today feel lighter. You do not have to wait for a difficult day to appreciate a good one.',

  okay:
    'It is okay to just be okay. You do not need to force yourself to feel amazing today.',

  low:
    'You do not have to figure everything out today. Take things one step at a time.',

  frustrated:
    'You are allowed to feel frustrated. Give yourself a moment before deciding what to do next.',

  anxious:
    'You do not have to solve every possibility right now. Focus on what is actually in front of you, one thing at a time.',
};

function EmotionalCalendar() {
  const navigate = useNavigate();
  const { entries, todayKey, saveEntry } = useMood();

  const today = new Date();
  const [viewYear, setViewYear] = useState(() => today.getFullYear());
  const [viewMonth, setViewMonth] = useState(() => today.getMonth());

  const viewDateObj = new Date(viewYear, viewMonth, 1);
  const monthName = viewDateObj.toLocaleDateString('en-US', {
    month: 'long',
  });

  const daysInMonth = new Date(
    viewYear,
    viewMonth + 1,
    0,
  ).getDate();

  const firstDay = new Date(
    viewYear,
    viewMonth,
    1,
  ).getDay();

  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [selectedMood, setSelectedMood] = useState<MoodKey | null>(null);
  const [note, setNote] = useState('');

  const handlePrevMonth = () => {
    setSelectedDay(null);
    if (viewMonth === 0) {
      setViewYear((y) => y - 1);
      setViewMonth(11);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    setSelectedDay(null);
    if (viewMonth === 11) {
      setViewYear((y) => y + 1);
      setViewMonth(0);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  /*
   * Open a calendar day.
   */
  const handleDaySelect = (day: number) => {
    setSelectedDay(day);

    const dateKey = formatDateKey(viewYear, viewMonth, day);
    const existingEntry = entries[dateKey];

    if (existingEntry) {
      setSelectedMood(existingEntry.mood);
      setNote(existingEntry.note || '');
    } else {
      setSelectedMood(null);
      setNote('');
    }
  };

  /*
   * Save the selected mood + note.
   */
  const handleSave = () => {
    if (!selectedDay || !selectedMood) {
      return;
    }

    const dateKey = formatDateKey(viewYear, viewMonth, selectedDay);
    saveEntry({
      date: dateKey,
      mood: selectedMood,
      note: note,
    });
  };

  /*
   * Close the entry editor.
   */
  const handleClose = () => {
    setSelectedDay(null);
    setSelectedMood(null);
    setNote('');
  };

  /*
   * Build calendar days.
   */
  const emptyDays = Array.from({ length: firstDay }, (_, i) => (
    <div
      key={`empty-${i}`}
      className="emotional-calendar-day empty"
    />
  ));

  const monthDays = Array.from({ length: daysInMonth }, (_, index) => {
    const day = index + 1;
    const dateKey = formatDateKey(viewYear, viewMonth, day);
    const savedEntry = entries[dateKey];
    const isTodayTile = dateKey === todayKey;

    const mood = savedEntry
      ? moods.find(
          (item) =>
            item.key === savedEntry.mood,
        )
      : null;

    return (
      <button
        key={day}
        type="button"
        className={`emotional-calendar-day ${
          selectedDay === day
            ? 'is-selected'
            : ''
        } ${
          savedEntry
            ? 'has-entry'
            : ''
        } ${
          isTodayTile
            ? 'is-today'
            : ''
        }`}
        onClick={() =>
          handleDaySelect(day)
        }
      >
        <span className="emotional-calendar-date">
          {day}
        </span>

        {mood && (
          <span className="emotional-calendar-day-mood">
            {mood.emoji}
          </span>
        )}

        {savedEntry && (
          <span className="emotional-calendar-entry-dot" />
        )}
      </button>
    );
  });

  const calendarDays = [...emptyDays, ...monthDays];
  const selectedDateKey = selectedDay ? formatDateKey(viewYear, viewMonth, selectedDay) : null;
  const currentSavedEntry = selectedDateKey ? entries[selectedDateKey] : null;
  const selectedDateObj = selectedDay ? new Date(viewYear, viewMonth, selectedDay) : null;
  const dayName = selectedDateObj
    ? selectedDateObj.toLocaleDateString('en-US', { weekday: 'long' })
    : '';
  const fullDateFormatted = selectedDateObj
    ? selectedDateObj.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : '';
  const isToday = selectedDateKey === todayKey;

  return (
    <main className="emotional-calendar-page">
      <div className="emotional-calendar-shell">

        {/* =========================================
            HEADER
        ========================================= */}

        <header className="emotional-calendar-header">

          <button
            type="button"
            className="emotional-calendar-back"
            aria-label="Go back"
            onClick={() =>
              navigate('/app/teen')
            }
          >
            ←
          </button>

          <span>
            EMOTIONAL CALENDAR
          </span>

          <div style={{ width: '44px' }} />

        </header>


        {/* =========================================
            INTRO & MONTH SWITCHER
        ========================================= */}

        <motion.section
          className="emotional-calendar-intro"
          initial={{
            opacity: 0,
            y: 16,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.4,
          }}
        >
          <p className="emotional-calendar-eyebrow">
            YOUR FEELINGS, OVER TIME
          </p>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '16px',
            }}
          >
            <h1>
              {monthName}
              <br />
              <strong>{viewYear}</strong>
            </h1>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                onClick={handlePrevMonth}
                aria-label="Previous month"
                style={{
                  width: '42px',
                  height: '42px',
                  display: 'grid',
                  placeItems: 'center',
                  background: 'var(--tw-surface)',
                  border: '2.5px solid var(--tw-border)',
                  borderRadius: '12px',
                  boxShadow: '2.5px 2.5px 0px var(--tw-border)',
                  color: 'var(--tw-text)',
                  fontSize: '1.2rem',
                  fontWeight: 900,
                  cursor: 'pointer',
                  transition: 'transform 120ms ease, box-shadow 120ms ease',
                }}
              >
                ←
              </button>
              <button
                type="button"
                onClick={handleNextMonth}
                aria-label="Next month"
                style={{
                  width: '42px',
                  height: '42px',
                  display: 'grid',
                  placeItems: 'center',
                  background: 'var(--tw-surface)',
                  border: '2.5px solid var(--tw-border)',
                  borderRadius: '12px',
                  boxShadow: '2.5px 2.5px 0px var(--tw-border)',
                  color: 'var(--tw-text)',
                  fontSize: '1.2rem',
                  fontWeight: 900,
                  cursor: 'pointer',
                  transition: 'transform 120ms ease, box-shadow 120ms ease',
                }}
              >
                →
              </button>
            </div>
          </div>

          <p>
            Check in with yourself,
            one day at a time.
          </p>
        </motion.section>


        {/* =========================================
            CALENDAR
        ========================================= */}

        <section className="emotional-calendar-grid-section">

          <div className="emotional-calendar-weekdays">
            <span>Sun</span>
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
          </div>

          <div className="emotional-calendar-grid">
            {calendarDays}
          </div>

        </section>


        {/* =========================================
            LEGEND
        ========================================= */}

        <section className="emotional-calendar-legend">

          <span>MOODS</span>

          <div>
            {moods.map((mood) => (
              <span key={mood.key}>
                {mood.emoji} {mood.label}
              </span>
            ))}
          </div>

        </section>


        {/* =========================================
            DAY ENTRY
        ========================================= */}

        {selectedDay && (
          <motion.section
            className="emotional-calendar-entry"
            initial={{
              opacity: 0,
              y: 14,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
          >

            <div className="emotional-calendar-entry-heading">

              <div>
                <span>
                  DAY {selectedDay} · {fullDateFormatted.toUpperCase()}
                </span>

                <h2>
                  {isToday ? 'How did today feel?' : `How did ${dayName} feel?`}
                </h2>
              </div>

              <button
                type="button"
                aria-label="Close"
                onClick={handleClose}
              >
                ×
              </button>

            </div>


            {/* SAVED ENTRY DISPLAY (Display recorded times in user's local timezone) */}
            {currentSavedEntry && (
              <div
                className="emotional-calendar-saved-card"
                style={{
                  marginBottom: '24px',
                  padding: '16px 20px',
                  background: 'var(--tw-surface)',
                  border: '2.5px solid var(--tw-border)',
                  borderRadius: '16px',
                  boxShadow: '3.5px 3.5px 0px var(--tw-border)',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '12px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <span style={{ fontSize: '2rem', lineHeight: 1 }}>
                      {currentSavedEntry.emoji}
                    </span>
                    <div>
                      <span
                        style={{
                          display: 'block',
                          fontSize: '0.68rem',
                          fontWeight: 900,
                          color: 'var(--tw-primary)',
                          textTransform: 'uppercase',
                          letterSpacing: '0.08em',
                        }}
                      >
                        RECORDED MOOD
                      </span>
                      <strong
                        style={{
                          fontSize: '1.15rem',
                          fontWeight: 900,
                          color: 'var(--tw-text)',
                        }}
                      >
                        {moods.find((m) => m.key === currentSavedEntry.mood)?.label || currentSavedEntry.mood}
                      </strong>
                    </div>
                  </div>

                  {/* Timestamps in user's local timezone */}
                  <div style={{ textAlign: 'right' }}>
                    {currentSavedEntry.recordedAt && (
                      <span
                        style={{
                          display: 'block',
                          fontSize: '0.8rem',
                          fontWeight: 900,
                          color: 'var(--tw-primary)',
                        }}
                      >
                        {formatRecordedTime(currentSavedEntry.recordedAt)}
                      </span>
                    )}
                    {currentSavedEntry.updatedAt && currentSavedEntry.updatedAt !== currentSavedEntry.recordedAt && (
                      <span
                        style={{
                          display: 'block',
                          fontSize: '0.74rem',
                          fontWeight: 800,
                          color: 'var(--tw-text-muted)',
                          marginTop: '2px',
                        }}
                      >
                        {formatUpdatedTime(currentSavedEntry.updatedAt)}
                      </span>
                    )}
                  </div>
                </div>

                {currentSavedEntry.note && (
                  <div
                    style={{
                      marginTop: '12px',
                      paddingTop: '10px',
                      borderTop: '1.5px dashed var(--tw-border)',
                    }}
                  >
                    <span
                      style={{
                        display: 'block',
                        fontSize: '0.68rem',
                        fontWeight: 900,
                        color: 'var(--tw-text-muted)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.08em',
                        marginBottom: '4px',
                      }}
                    >
                      SAVED NOTE
                    </span>
                    <p
                      style={{
                        margin: 0,
                        fontSize: '0.94rem',
                        color: 'var(--tw-text)',
                        lineHeight: 1.5,
                      }}
                    >
                      "{currentSavedEntry.note}"
                    </p>
                  </div>
                )}
              </div>
            )}


            {/* MOODS SELECTOR / EDITOR */}

            <div className="emotional-calendar-moods">

              {moods.map((mood) => (
                <button
                  key={mood.key}
                  type="button"
                  className={
                    selectedMood === mood.key
                      ? 'is-selected'
                      : ''
                  }
                  onClick={() =>
                    setSelectedMood(
                      mood.key,
                    )
                  }
                >
                  <span>
                    {mood.emoji}
                  </span>

                  <small>
                    {mood.label}
                  </small>
                </button>
              ))}

            </div>


            {/* NOTE - reveals immediately when mood is selected */}

            {selectedMood && (
              <div className="emotional-calendar-note">
                <label htmlFor="mood-note">
                  YOUR NOTE
                </label>

                <textarea
                  id="mood-note"
                  value={note}
                  onChange={(event) =>
                    setNote(
                      event.target.value,
                    )
                  }
                  placeholder="Write anything you want to remember about today..."
                />
              </div>
            )}


            {/* MOTIVATION */}

            {selectedMood && (
              <div className="emotional-calendar-motivation">

                <span>
                  A LITTLE SOMETHING FOR YOU
                </span>

                <p>
                  {motivation[selectedMood]}
                </p>

                <div>

                  <button
                    type="button"
                    onClick={() =>
                      navigate(
                        '/app/teen/nova',
                      )
                    }
                  >
                    Talk to Nova →
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      navigate(
                        '/app/teen/haven',
                      )
                    }
                  >
                    Write it down →
                  </button>

                </div>

              </div>
            )}


            {/* SAVE */}

            <button
              type="button"
              className="emotional-calendar-save"
              disabled={!selectedMood}
              onClick={handleSave}
            >
              {currentSavedEntry
                ? 'Update entry'
                : 'Save entry'}
            </button>

            {currentSavedEntry && (
              <p className="emotional-calendar-saved">
                ✓ Saved to Emotional Calendar
              </p>
            )}

          </motion.section>
        )}


        {/* =========================================
            FOOTER
        ========================================= */}

        <footer className="emotional-calendar-footer">
          <p>
            Your emotional calendar is private to you.
          </p>
        </footer>

      </div>
    </main>
  );
}

export default EmotionalCalendar;