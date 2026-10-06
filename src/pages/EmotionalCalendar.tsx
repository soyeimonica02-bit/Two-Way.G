import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

type Mood =
  | 'good'
  | 'okay'
  | 'low'
  | 'frustrated'
  | 'anxious';

interface MoodOption {
  key: Mood;
  emoji: string;
  label: string;
}

interface MoodEntry {
  mood: Mood;
  note: string;
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

const motivation: Record<Mood, string> = {
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

  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();

  const monthName = today.toLocaleDateString('en-US', {
    month: 'long',
  });

  const daysInMonth = new Date(
    year,
    month + 1,
    0,
  ).getDate();

  const firstDay = new Date(
    year,
    month,
    1,
  ).getDay();

  const [selectedDay, setSelectedDay] =
    useState<number | null>(null);

  const [selectedMood, setSelectedMood] =
    useState<Mood | null>(null);

  const [note, setNote] = useState('');

  /*
   * This state forces the calendar to immediately
   * update after an entry is saved.
   */
  const [entries, setEntries] =
    useState<Record<number, MoodEntry>>(() => {
      const savedEntries: Record<number, MoodEntry> = {};

      for (let day = 1; day <= daysInMonth; day += 1) {
        const savedMood = localStorage.getItem(
          `twoway_mood_${year}_${month}_${day}`,
        ) as Mood | null;

        const savedNote =
          localStorage.getItem(
            `twoway_note_${year}_${month}_${day}`,
          ) || '';

        if (savedMood) {
          savedEntries[day] = {
            mood: savedMood,
            note: savedNote,
          };
        }
      }

      const todayDate = today.getDate();
      if (!savedEntries[todayDate]) {
        const todayMood = localStorage.getItem('twoway_today_mood') as Mood | null;
        if (todayMood) {
          savedEntries[todayDate] = {
            mood: todayMood,
            note:
              localStorage.getItem(
                `twoway_note_${year}_${month}_${todayDate}`,
              ) || '',
          };
        }
      }

      return savedEntries;
    });

  /*
   * Open a calendar day.
   */
  const handleDaySelect = (day: number) => {
    setSelectedDay(day);

    const existingEntry = entries[day];

    if (existingEntry) {
      setSelectedMood(existingEntry.mood);
      setNote(existingEntry.note);
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

    const entry: MoodEntry = {
      mood: selectedMood,
      note: note.trim(),
    };

    localStorage.setItem(
      `twoway_mood_${year}_${month}_${selectedDay}`,
      selectedMood,
    );

    localStorage.setItem(
      `twoway_note_${year}_${month}_${selectedDay}`,
      note.trim(),
    );

    if (selectedDay === today.getDate()) {
      localStorage.setItem('twoway_today_mood', selectedMood);
    }

    setEntries((previous) => ({
      ...previous,
      [selectedDay]: entry,
    }));
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
   * Build calendar.
   */
  const emptyDays = Array.from({ length: firstDay }, (_, i) => (
    <div
      key={`empty-${i}`}
      className="emotional-calendar-day empty"
    />
  ));

  const monthDays = Array.from({ length: daysInMonth }, (_, index) => {
    const day = index + 1;
    const savedEntry = entries[day];

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

        </header>


        {/* =========================================
            INTRO
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

          <h1>
            {monthName}
            <br />
            <strong>{year}</strong>
          </h1>

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
                  DAY {selectedDay}
                </span>

                <h2>
                  How did today feel?
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


            {/* MOODS */}

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


            {/* NOTE */}

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
              {entries[selectedDay]
                ? 'Update entry'
                : "Save today's entry"}
            </button>

            {entries[selectedDay] && (
              <p className="emotional-calendar-saved">
                ✓ This day has been saved.
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