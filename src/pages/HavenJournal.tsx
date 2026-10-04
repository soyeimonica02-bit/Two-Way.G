import { useState } from 'react';

export default function HavenJournal() {
  const [entry, setEntry] = useState('');

  const goBack = () => {
    window.history.back();
  };

  return (
    <main className="haven-journal-page">
      <div className="haven-journal-shell">

        {/* HEADER */}
        <header className="haven-journal-header">
          <button
            type="button"
            className="haven-journal-back"
            onClick={goBack}
          >
            ← Back
          </button>

          <div className="haven-journal-title">
            <span>MY HAVEN</span>
            <h1>Journal</h1>
          </div>

          <div className="haven-journal-private">
            <span>🔒</span>
            Private
          </div>
        </header>

        {/* INTRO */}
        <section className="haven-journal-intro">
          <p className="haven-journal-eyebrow">
            PRIVATE JOURNAL
          </p>

          <h2>
            Whatever is on your mind,
            <br />
            put it here.
          </h2>

          <p className="haven-journal-description">
            A private space for your thoughts, feelings, moments,
            and everything you do not want anywhere else.
          </p>
        </section>

        {/* JOURNAL EDITOR */}
        <section className="haven-journal-editor">

          <div className="haven-journal-editor-header">
            <div>
              <span className="haven-journal-label">
                NEW ENTRY
              </span>

              <p>
                Only you can see what you write here.
              </p>
            </div>

            <span className="haven-journal-lock">
              🔒 Private
            </span>
          </div>

          <textarea
            value={entry}
            onChange={(event) => setEntry(event.target.value)}
            placeholder="Start writing..."
            aria-label="Journal entry"
          />

          <div className="haven-journal-editor-footer">
            <span>
              {entry.length} characters
            </span>

            <button
              type="button"
              className="haven-journal-save"
              disabled={!entry.trim()}
            >
              Save entry
            </button>
          </div>

        </section>

        {/* PRIVACY NOTE */}
        <section className="haven-journal-privacy">

          <div className="haven-journal-privacy-icon">
            🔒
          </div>

          <div>
            <span>
              YOUR PRIVATE SPACE
            </span>

            <p>
              Your journal history stays inside your journal.
              It is not displayed on the My Haven homepage,
              emotional calendar, or reflections.
            </p>
          </div>

        </section>

        {/* FOOTER */}
        <footer className="haven-journal-footer">
          <span>MY HAVEN</span>

          <p>
            Your thoughts belong to you.
          </p>
        </footer>

      </div>
    </main>
  );
}

