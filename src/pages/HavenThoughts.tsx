import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

export interface ThoughtNote {
  id: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

const STORAGE_KEY_THOUGHT_NOTES = 'twoway_haven_thoughts_notes';
const LEGACY_KEY_THOUGHT_ENTRY = 'twoway_haven_thoughts_entry';
const LEGACY_KEY_THOUGHTS = 'twoway_haven_thoughts';

function formatThoughtDate(isoString: string): string {
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return 'Recently';

    return new Intl.DateTimeFormat(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    }).format(date);
  } catch {
    return 'Recently';
  }
}

function loadInitialThoughtNotes(): ThoughtNote[] {
  let notes: ThoughtNote[] = [];

  // 1. Try modern collection
  try {
    const raw = localStorage.getItem(STORAGE_KEY_THOUGHT_NOTES);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        notes = parsed.filter(
          (n) => n && typeof n.id === 'string' && typeof n.content === 'string',
        );
      }
    }
  } catch (err) {
    console.error('Failed to parse thought notes:', err);
  }

  // 2. Migrate legacy array (from clarity saves) if any exist
  try {
    const rawLegacyList = localStorage.getItem(LEGACY_KEY_THOUGHTS);
    if (rawLegacyList) {
      const parsedLegacy = JSON.parse(rawLegacyList);
      if (Array.isArray(parsedLegacy)) {
        parsedLegacy.forEach((legacyItem) => {
          if (legacyItem && legacyItem.content && !notes.some((n) => n.id === legacyItem.id || n.content === legacyItem.content)) {
            notes.push({
              id: legacyItem.id || `thought_legacy_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
              content: legacyItem.content,
              createdAt: legacyItem.createdAt || new Date().toISOString(),
              updatedAt: legacyItem.createdAt || new Date().toISOString(),
            });
          }
        });
      }
    }
  } catch (err) {
    console.error('Failed to migrate legacy thoughts list:', err);
  }

  // 3. Migrate legacy single string draft if non-empty and not yet in notes
  try {
    const legacySingle = localStorage.getItem(LEGACY_KEY_THOUGHT_ENTRY);
    if (legacySingle && legacySingle.trim().length > 0) {
      const trimmed = legacySingle.trim();
      const alreadyIncluded = notes.some((n) => n.content.trim() === trimmed);
      if (!alreadyIncluded) {
        const nowIso = new Date().toISOString();
        notes.unshift({
          id: `thought_entry_${Date.now()}`,
          content: trimmed,
          createdAt: nowIso,
          updatedAt: nowIso,
        });
      }
    }
  } catch (err) {
    console.error('Failed to migrate single thought draft:', err);
  }

  // Sort newest first
  return notes.sort((a, b) => {
    const timeA = new Date(a.createdAt || a.updatedAt).getTime();
    const timeB = new Date(b.createdAt || b.updatedAt).getTime();
    return timeB - timeA;
  });
}

function persistNotes(notes: ThoughtNote[]) {
  try {
    localStorage.setItem(STORAGE_KEY_THOUGHT_NOTES, JSON.stringify(notes));
    // Also keep legacy single draft in sync with newest thought for backward compatibility
    if (notes.length > 0) {
      localStorage.setItem(LEGACY_KEY_THOUGHT_ENTRY, notes[0].content);
    } else {
      localStorage.removeItem(LEGACY_KEY_THOUGHT_ENTRY);
    }
  } catch (err) {
    console.error('Failed to persist thought notes:', err);
  }
}

export default function HavenThoughts() {
  const navigate = useNavigate();

  const [notes, setNotes] = useState<ThoughtNote[]>(() => loadInitialThoughtNotes());
  const [newContent, setNewContent] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Editing state
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState('');

  // Delete modal state
  const [noteToDelete, setNoteToDelete] = useState<ThoughtNote | null>(null);

  // Copy feedback state
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    persistNotes(notes);
  }, [notes]);

  const handleCreateThought = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newContent.trim();
    if (!trimmed) return;

    const nowIso = new Date().toISOString();
    const newNote: ThoughtNote = {
      id: `thought_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      content: trimmed,
      createdAt: nowIso,
      updatedAt: nowIso,
    };

    setNotes((prev) => [newNote, ...prev]);
    setNewContent('');
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2400);
  };

  const handleStartEdit = (note: ThoughtNote) => {
    setEditingNoteId(note.id);
    setEditingContent(note.content);
  };

  const handleSaveEdit = (noteId: string) => {
    const trimmed = editingContent.trim();
    if (!trimmed) return;

    setNotes((prev) =>
      prev.map((n) => {
        if (n.id === noteId) {
          return {
            ...n,
            content: trimmed,
            updatedAt: new Date().toISOString(),
          };
        }
        return n;
      }),
    );
    setEditingNoteId(null);
    setEditingContent('');
  };

  const handleCancelEdit = () => {
    setEditingNoteId(null);
    setEditingContent('');
  };

  const handleConfirmDelete = () => {
    if (!noteToDelete) return;
    setNotes((prev) => prev.filter((n) => n.id !== noteToDelete.id));
    setNoteToDelete(null);
  };

  const handleCopy = (note: ThoughtNote) => {
    navigator.clipboard.writeText(note.content);
    setCopiedId(note.id);
    setTimeout(() => setCopiedId(null), 2000);
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

          <span>PRIVATE THOUGHTS</span>

          <button
            type="button"
            className="haven-thoughts-back"
            aria-label="Back to My Haven"
            onClick={goBack}
          >
            ←
          </button>
        </header>

        {/* HERO / INTRO */}
        <motion.div
          className="haven-thoughts-content"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >
          <h1 className="haven-thoughts-title">Private Thoughts.</h1>

          <p className="haven-thoughts-description">
            A fast, low-pressure space for capturing immediate thoughts, feelings, and unsent words. Quick notes that stay completely yours without needing a full journal entry.
          </p>

          {/* PRIVACY BADGE */}
          <div className="haven-thoughts-privacy">
            <span className="haven-thoughts-privacy-badge">🔒</span>
            <div>
              <strong>Strictly Private · On Your Device</strong>
              <p>
                Thoughts saved here are completely separate from your conversations and Circle. They are never shared with connected people, parents, partners, siblings, or counselors.
              </p>
            </div>
          </div>

          {/* QUICK NOTE COMPOSER */}
          <section
            style={{
              background: 'var(--tw-surface)',
              border: '2.5px solid var(--tw-border)',
              borderRadius: '20px',
              padding: '24px',
              boxShadow: '4px 4px 0px var(--tw-border)',
              marginBottom: '36px',
            }}
          >
            <form onSubmit={handleCreateThought}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '10px',
                }}
              >
                <label
                  htmlFor="newThoughtInput"
                  style={{
                    fontSize: '0.85rem',
                    fontWeight: 900,
                    letterSpacing: '0.04em',
                    textTransform: 'uppercase',
                    color: 'var(--tw-primary)',
                  }}
                >
                  Quick Note / Unsent Words
                </label>

                <span
                  style={{
                    fontSize: '0.78rem',
                    color: 'var(--tw-text-muted)',
                    fontWeight: 700,
                  }}
                >
                  {newContent.length} characters
                </span>
              </div>

              <textarea
                id="newThoughtInput"
                className="haven-thoughts-textarea"
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                placeholder="What's crossing your mind right now? Jot it down quickly..."
                rows={4}
                style={{
                  minHeight: '120px',
                  marginBottom: '16px',
                }}
              />

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '12px',
                }}
              >
                <span
                  style={{
                    fontSize: '0.8rem',
                    color: saveSuccess ? 'var(--tw-primary)' : 'var(--tw-text-muted)',
                    fontWeight: 800,
                  }}
                >
                  {saveSuccess ? '✓ Thought saved to your private collection' : 'Low-pressure scratchpad'}
                </span>

                <button
                  type="submit"
                  className="haven-thoughts-save"
                  disabled={!newContent.trim()}
                  style={{
                    opacity: newContent.trim() ? 1 : 0.6,
                    cursor: newContent.trim() ? 'pointer' : 'not-allowed',
                  }}
                >
                  {saveSuccess ? 'Saved ✓' : '+ Save Thought'}
                </button>
              </div>
            </form>
          </section>

          {/* SAVED THOUGHTS LIST */}
          <section>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '18px',
              }}
            >
              <h2
                style={{
                  fontSize: '1.15rem',
                  fontWeight: 900,
                  letterSpacing: '-0.02em',
                  margin: 0,
                  color: 'var(--tw-text)',
                }}
              >
                Saved Notes ({notes.length})
              </h2>

              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  color: 'var(--tw-text-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                }}
              >
                Newest First
              </span>
            </div>

            {/* EMPTY STATE */}
            {notes.length === 0 ? (
              <div
                style={{
                  padding: '36px 24px',
                  borderRadius: '18px',
                  border: '2.5px dashed var(--tw-border)',
                  background: 'var(--tw-surface-soft)',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: '2rem', marginBottom: '12px' }}>💭</div>
                <h3
                  style={{
                    fontSize: '1.1rem',
                    fontWeight: 900,
                    margin: '0 0 8px 0',
                    color: 'var(--tw-text)',
                  }}
                >
                  No private thoughts yet
                </h3>
                <p
                  style={{
                    margin: '0 auto',
                    maxWidth: '460px',
                    fontSize: '0.9rem',
                    lineHeight: 1.55,
                    color: 'var(--tw-text-muted)',
                  }}
                >
                  Jot down a quick thought, an unsent message, or an idea whenever you need a fast place to let it out. No formatting or titles needed.
                </p>
              </div>
            ) : (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '14px',
                }}
              >
                <AnimatePresence>
                  {notes.map((note) => {
                    const isEditing = editingNoteId === note.id;

                    return (
                      <motion.article
                        key={note.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        transition={{ duration: 0.2 }}
                        style={{
                          background: 'var(--tw-surface)',
                          border: '2.5px solid var(--tw-border)',
                          borderRadius: '16px',
                          padding: '20px 22px',
                          boxShadow: '3px 3px 0px var(--tw-border)',
                        }}
                      >
                        {isEditing ? (
                          /* EDITING INLINE */
                          <div>
                            <div
                              style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginBottom: '8px',
                              }}
                            >
                              <span
                                style={{
                                  fontSize: '0.72rem',
                                  fontWeight: 900,
                                  color: 'var(--tw-primary)',
                                  letterSpacing: '0.08em',
                                  textTransform: 'uppercase',
                                }}
                              >
                                Editing Note
                              </span>
                              <span
                                style={{
                                  fontSize: '0.74rem',
                                  color: 'var(--tw-text-muted)',
                                }}
                              >
                                {editingContent.length} chars
                              </span>
                            </div>

                            <textarea
                              className="haven-thoughts-textarea"
                              value={editingContent}
                              onChange={(e) => setEditingContent(e.target.value)}
                              rows={3}
                              style={{
                                minHeight: '90px',
                                marginBottom: '12px',
                              }}
                              autoFocus
                            />

                            <div
                              style={{
                                display: 'flex',
                                justifyContent: 'flex-end',
                                gap: '8px',
                              }}
                            >
                              <button
                                type="button"
                                onClick={handleCancelEdit}
                                style={{
                                  padding: '8px 16px',
                                  borderRadius: '10px',
                                  border: '2px solid var(--tw-border)',
                                  background: 'var(--tw-surface-soft)',
                                  color: 'var(--tw-text)',
                                  font: 'inherit',
                                  fontSize: '0.8rem',
                                  fontWeight: 800,
                                  cursor: 'pointer',
                                }}
                              >
                                Cancel
                              </button>

                              <button
                                type="button"
                                onClick={() => handleSaveEdit(note.id)}
                                style={{
                                  padding: '8px 18px',
                                  borderRadius: '10px',
                                  border: '2px solid var(--tw-border)',
                                  background: 'var(--tw-primary)',
                                  color: 'var(--tw-primary-text, #ffffff)',
                                  font: 'inherit',
                                  fontSize: '0.8rem',
                                  fontWeight: 900,
                                  cursor: 'pointer',
                                }}
                              >
                                Save Changes
                              </button>
                            </div>
                          </div>
                        ) : (
                          /* VIEWING NOTE */
                          <div>
                            <div
                              style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginBottom: '10px',
                              }}
                            >
                              <span
                                style={{
                                  fontSize: '0.74rem',
                                  fontWeight: 800,
                                  color: 'var(--tw-text-muted)',
                                  letterSpacing: '0.02em',
                                }}
                              >
                                {formatThoughtDate(note.createdAt)}
                                {note.updatedAt && note.updatedAt !== note.createdAt
                                  ? ' · edited'
                                  : ''}
                              </span>

                              <div
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '8px',
                                }}
                              >
                                <button
                                  type="button"
                                  onClick={() => handleCopy(note)}
                                  title="Copy text"
                                  style={{
                                    padding: '4px 10px',
                                    borderRadius: '8px',
                                    border: '1.5px solid var(--tw-border)',
                                    background: 'var(--tw-surface-soft)',
                                    color: 'var(--tw-text)',
                                    fontSize: '0.72rem',
                                    fontWeight: 800,
                                    cursor: 'pointer',
                                  }}
                                >
                                  {copiedId === note.id ? '✓ Copied' : 'Copy'}
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleStartEdit(note)}
                                  title="Edit note"
                                  style={{
                                    padding: '4px 10px',
                                    borderRadius: '8px',
                                    border: '1.5px solid var(--tw-border)',
                                    background: 'var(--tw-surface-soft)',
                                    color: 'var(--tw-text)',
                                    fontSize: '0.72rem',
                                    fontWeight: 800,
                                    cursor: 'pointer',
                                  }}
                                >
                                  Edit
                                </button>

                                <button
                                  type="button"
                                  onClick={() => setNoteToDelete(note)}
                                  title="Delete note"
                                  style={{
                                    padding: '4px 8px',
                                    borderRadius: '8px',
                                    border: '1.5px solid var(--tw-border)',
                                    background: 'var(--tw-surface-soft)',
                                    color: 'var(--tw-accent-red, #dc2626)',
                                    fontSize: '0.72rem',
                                    fontWeight: 800,
                                    cursor: 'pointer',
                                  }}
                                >
                                  ✕
                                </button>
                              </div>
                            </div>

                            <p
                              style={{
                                margin: 0,
                                fontSize: '0.98rem',
                                lineHeight: 1.6,
                                color: 'var(--tw-text)',
                                whiteSpace: 'pre-wrap',
                                wordBreak: 'break-word',
                              }}
                            >
                              {note.content}
                            </p>
                          </div>
                        )}
                      </motion.article>
                    );
                  })}
                </AnimatePresence>
              </div>
            )}
          </section>

          {/* DELETE CONFIRMATION MODAL */}
          {noteToDelete && (
            <div
              style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(0, 0, 0, 0.65)',
                display: 'grid',
                placeItems: 'center',
                zIndex: 9999,
                padding: '20px',
              }}
              role="dialog"
              aria-modal="true"
            >
              <div
                style={{
                  background: 'var(--tw-surface)',
                  border: '3px solid var(--tw-border)',
                  borderRadius: '20px',
                  padding: '28px',
                  maxWidth: '440px',
                  width: '100%',
                  boxShadow: '6px 6px 0px var(--tw-border)',
                }}
              >
                <h3
                  style={{
                    fontSize: '1.25rem',
                    fontWeight: 900,
                    margin: '0 0 10px 0',
                    color: 'var(--tw-text)',
                  }}
                >
                  Delete this thought?
                </h3>
                <p
                  style={{
                    fontSize: '0.88rem',
                    lineHeight: 1.5,
                    color: 'var(--tw-text-muted)',
                    margin: '0 0 20px 0',
                  }}
                >
                  This will permanently remove this private note from your device.
                </p>

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    gap: '12px',
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setNoteToDelete(null)}
                    style={{
                      padding: '10px 18px',
                      borderRadius: '12px',
                      border: '2px solid var(--tw-border)',
                      background: 'var(--tw-surface-soft)',
                      color: 'var(--tw-text)',
                      font: 'inherit',
                      fontSize: '0.85rem',
                      fontWeight: 800,
                      cursor: 'pointer',
                    }}
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    onClick={handleConfirmDelete}
                    style={{
                      padding: '10px 20px',
                      borderRadius: '12px',
                      border: '2px solid var(--tw-border)',
                      background: 'var(--tw-accent-red, #dc2626)',
                      color: '#ffffff',
                      font: 'inherit',
                      fontSize: '0.85rem',
                      fontWeight: 900,
                      cursor: 'pointer',
                    }}
                  >
                    Delete Note
                  </button>
                </div>
              </div>
            </div>
          )}

        </motion.div>
      </div>
    </main>
  );
}
