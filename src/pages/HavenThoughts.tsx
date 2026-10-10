import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const STORAGE_KEY_THOUGHTS = 'twoway_haven_thoughts_entry';

export default function HavenThoughts() {
  const navigate = useNavigate();
  const [thought, setThought] = useState(() => {
    return localStorage.getItem(STORAGE_KEY_THOUGHTS) || '';
  });
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = () => {
    localStorage.setItem(STORAGE_KEY_THOUGHTS, thought);
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
    }, 2500);
  };

  const goBack = () => {
    navigate('/app/teen/haven');
  };

  return (
    <main className="haven-thoughts-page">
      <div className="haven-thoughts-shell">
        {/* HEADER */}
        <header className="haven-thoughts-header">
          <img
            src="/favicon.svg"
            alt="Two-Way"
            className="haven-thoughts-logo"
          />

          <button
            type="button"
            className="haven-thoughts-back"
            aria-label="My Haven"
            onClick={goBack}
          >
            ←
          </button>
        </header>

        {/* CONTENT */}
        <motion.div
          className="haven-thoughts-content"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h1 className="haven-thoughts-title">Private Thoughts.</h1>

          <p className="haven-thoughts-description">
            Keep it here. Save something for yourself without sending it anywhere.
          </p>

          <div className="haven-thoughts-privacy">
            <span className="haven-thoughts-privacy-badge">🔒</span>
            <div>
              <strong>Private space.</strong>
              <p>Nothing here is sent to your conversations.</p>
            </div>
          </div>

          <div className="haven-thoughts-editor">
            <textarea
              className="haven-thoughts-textarea"
              value={thought}
              onChange={(e) => {
                setThought(e.target.value);
                if (isSaved) setIsSaved(false);
              }}
              placeholder="Keep a thought here..."
              aria-label="Private thought"
              rows={9}
            />

            <div className="haven-thoughts-meta">
              <span className="haven-thoughts-count">
                {thought.length} {thought.length === 1 ? 'character' : 'characters'}
              </span>

              <button
                type="button"
                className="haven-thoughts-save"
                onClick={handleSave}
              >
                {isSaved ? 'Saved ✓' : 'Save thought'}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
