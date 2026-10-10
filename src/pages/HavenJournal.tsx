import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import type { JournalEntry } from '../utils/journalStorage';
import {
  loadJournalEntries,
  saveJournalEntry,
  deleteJournalEntry,
  formatJournalDateTime,
  getJournalPreview,
  getJournalLockConfig,
  saveJournalLockConfig,
  isJournalSessionUnlocked,
  setJournalSessionUnlocked,
} from '../utils/journalStorage';

type ViewMode = 'list' | 'new' | 'edit' | 'read';

export default function HavenJournal() {
  const navigate = useNavigate();

  // State
  const [entries, setEntries] = useState<JournalEntry[]>(() => loadJournalEntries());
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);

  // Editor fields
  const [editorTitle, setEditorTitle] = useState('');
  const [editorBody, setEditorBody] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccessBanner, setSaveSuccessBanner] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Unsaved changes confirmation dialog
  const [showDiscardDialog, setShowDiscardDialog] = useState(false);
  const [pendingBackAction, setPendingBackAction] = useState<(() => void) | null>(null);

  // Delete confirmation
  const [entryToDelete, setEntryToDelete] = useState<JournalEntry | null>(null);

  // Lock & Security
  const [lockConfig, setLockConfig] = useState(getJournalLockConfig);
  const [isUnlocked, setIsUnlocked] = useState(isJournalSessionUnlocked);
  const [enteredPin, setEnteredPin] = useState('');
  const [pinError, setPinError] = useState<string | null>(null);
  const [showLockSetupModal, setShowLockSetupModal] = useState(false);
  const [newPasscode, setNewPasscode] = useState('');
  const [confirmPasscode, setConfirmPasscode] = useState('');
  const [setupError, setSetupError] = useState<string | null>(null);

  // Track initial values to detect unsaved changes
  const initialEditorState = useRef<{ title: string; body: string }>({ title: '', body: '' });

  // Listen for storage updates across tabs/windows
  useEffect(() => {
    const handleStorageUpdate = () => {
      setEntries(loadJournalEntries());
      setLockConfig(getJournalLockConfig());
      setIsUnlocked(isJournalSessionUnlocked());
    };

    window.addEventListener('twoway-journal-updated', handleStorageUpdate);
    window.addEventListener('storage', handleStorageUpdate);
    return () => {
      window.removeEventListener('twoway-journal-updated', handleStorageUpdate);
      window.removeEventListener('storage', handleStorageUpdate);
    };
  }, []);

  const hasUnsavedChanges = () => {
    if (viewMode !== 'new' && viewMode !== 'edit') return false;
    return (
      editorTitle.trim() !== initialEditorState.current.title.trim() ||
      editorBody.trim() !== initialEditorState.current.body.trim()
    );
  };

  // Safe navigation back to My Haven
  const handleHeaderBack = () => {
    if (viewMode === 'list') {
      navigate('/app/teen/haven');
    } else if (viewMode === 'read') {
      setViewMode('list');
      setSelectedEntry(null);
    } else {
      // In editor mode (new / edit)
      if (hasUnsavedChanges()) {
        setPendingBackAction(() => () => {
          if (viewMode === 'edit' && selectedEntry) {
            setViewMode('read');
          } else {
            setViewMode('list');
            setSelectedEntry(null);
          }
        });
        setShowDiscardDialog(true);
      } else {
        if (viewMode === 'edit' && selectedEntry) {
          setViewMode('read');
        } else {
          setViewMode('list');
          setSelectedEntry(null);
        }
      }
    }
  };

  // Start new entry
  const handleOpenNewEntry = () => {
    setEditorTitle('');
    setEditorBody('');
    initialEditorState.current = { title: '', body: '' };
    setSelectedEntry(null);
    setErrorMessage(null);
    setViewMode('new');
  };

  // View existing entry in read mode
  const handleSelectEntry = (entry: JournalEntry) => {
    setSelectedEntry(entry);
    setViewMode('read');
  };

  // Switch from read mode to edit mode
  const handleStartEdit = () => {
    if (!selectedEntry) return;
    setEditorTitle(selectedEntry.title || '');
    setEditorBody(selectedEntry.body || '');
    initialEditorState.current = {
      title: selectedEntry.title || '',
      body: selectedEntry.body || '',
    };
    setErrorMessage(null);
    setViewMode('edit');
  };

  // Save entry (both create and update)
  const handleSave = () => {
    if (isSaving) return; // Prevent double taps

    const trimmedBody = editorBody.trim();
    if (!trimmedBody) {
      setErrorMessage('Please write something before saving.');
      return;
    }

    setIsSaving(true);
    setErrorMessage(null);

    const result = saveJournalEntry({
      id: viewMode === 'edit' ? selectedEntry?.id : undefined,
      title: editorTitle.trim() || undefined,
      body: trimmedBody,
    });

    if (result.success && result.entry) {
      // Reload fresh list
      const updatedEntries = loadJournalEntries();
      setEntries(updatedEntries);

      // Reset editor state
      setEditorTitle('');
      setEditorBody('');
      initialEditorState.current = { title: '', body: '' };

      setIsSaving(false);
      setSaveSuccessBanner(true);
      setTimeout(() => setSaveSuccessBanner(false), 2600);

      // Return to journal history list
      setSelectedEntry(null);
      setViewMode('list');
    } else {
      setIsSaving(false);
      setErrorMessage(
        result.error || 'Could not save journal entry. Your text has been preserved.'
      );
    }
  };

  // Handle Cancel in Editor
  const handleCancelEditor = () => {
    if (hasUnsavedChanges()) {
      setPendingBackAction(() => () => {
        if (viewMode === 'edit' && selectedEntry) {
          setViewMode('read');
        } else {
          setViewMode('list');
          setSelectedEntry(null);
        }
      });
      setShowDiscardDialog(true);
    } else {
      if (viewMode === 'edit' && selectedEntry) {
        setViewMode('read');
      } else {
        setViewMode('list');
        setSelectedEntry(null);
      }
    }
  };

  // Delete entry confirmation
  const handleConfirmDelete = () => {
    if (!entryToDelete) return;
    deleteJournalEntry(entryToDelete.id);
    const updated = loadJournalEntries();
    setEntries(updated);
    setEntryToDelete(null);
    if (selectedEntry?.id === entryToDelete.id) {
      setSelectedEntry(null);
      setViewMode('list');
    }
  };

  // Unlock journal verification
  const handleUnlockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (enteredPin.trim() === lockConfig.passcode.trim()) {
      setJournalSessionUnlocked(true);
      setIsUnlocked(true);
      setPinError(null);
      setEnteredPin('');
    } else {
      setPinError('Incorrect passcode. Please try again.');
    }
  };

  // Lock journal manually
  const handleLockJournal = () => {
    setJournalSessionUnlocked(false);
    setIsUnlocked(false);
    setViewMode('list');
    setSelectedEntry(null);
  };

  // Setup / toggle lock
  const handleToggleLockConfig = () => {
    if (lockConfig.enabled) {
      // Disabling lock
      const updated = { enabled: false, passcode: '' };
      saveJournalLockConfig(updated);
      setLockConfig(updated);
      setJournalSessionUnlocked(true);
      setIsUnlocked(true);
    } else {
      // Enabling lock - open setup modal
      setNewPasscode('');
      setConfirmPasscode('');
      setSetupError(null);
      setShowLockSetupModal(true);
    }
  };

  const handleSaveLockSetup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPasscode.trim()) {
      setSetupError('Please enter a passcode.');
      return;
    }
    if (newPasscode.trim() !== confirmPasscode.trim()) {
      setSetupError('Passcodes do not match.');
      return;
    }
    const updated = { enabled: true, passcode: newPasscode.trim() };
    saveJournalLockConfig(updated);
    setLockConfig(updated);
    setJournalSessionUnlocked(true);
    setIsUnlocked(true);
    setShowLockSetupModal(false);
  };

  // If lock is enabled and session is not unlocked, show lock screen
  const isLockedView = lockConfig.enabled && !isUnlocked;

  return (
    <main className="haven-journal-page">
      <div className="haven-journal-shell">
        {/* HEADER */}
        <header className="haven-journal-header">
          <img
            src="/favicon.svg"
            alt="Two-Way"
            className="haven-journal-logo"
          />

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {lockConfig.enabled && isUnlocked && (
              <button
                type="button"
                className="haven-journal-secondary-btn"
                style={{ minHeight: '40px', padding: '8px 14px', fontSize: '0.78rem' }}
                onClick={handleLockJournal}
                title="Lock Journal"
              >
                🔒 Lock
              </button>
            )}

            <button
              type="button"
              className="haven-journal-back"
              aria-label={viewMode === 'list' ? 'My Haven' : 'Back to Journal'}
              onClick={handleHeaderBack}
            >
              ←
            </button>
          </div>
        </header>

        {/* LOCKED SCREEN */}
        {isLockedView ? (
          <motion.div
            className="haven-journal-content"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="haven-journal-lock-screen">
              <div className="haven-journal-lock-icon">🔒</div>

              <h2>Journal Locked.</h2>

              <p>
                Enter your passcode to view your private entries. Entries remain concealed until unlocked.
              </p>

              {pinError && (
                <div className="haven-journal-error-banner" style={{ width: '100%' }}>
                  {pinError}
                </div>
              )}

              <form onSubmit={handleUnlockSubmit} className="haven-journal-lock-form">
                <input
                  type="password"
                  className="haven-journal-pin-input"
                  value={enteredPin}
                  onChange={(e) => {
                    setEnteredPin(e.target.value);
                    if (pinError) setPinError(null);
                  }}
                  placeholder="••••"
                  autoFocus
                  required
                />

                <button type="submit" className="haven-journal-save" style={{ width: '100%', maxWidth: '260px' }}>
                  Unlock Journal
                </button>
              </form>

              <div className="haven-journal-prototype-disclaimer">
                <strong>Prototype Security Notice:</strong> Passcode is stored locally on this device. Journal entries are strictly private and never shared with parents, counselors, or Circle members.
              </div>
            </div>
          </motion.div>
        ) : (
          /* UNLOCKED JOURNAL CONTENT */
          <motion.div
            className="haven-journal-content"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* INTRO TITLE & PRIVACY BADGE */}
            <h1 className="haven-journal-title">Private Journal.</h1>

            <p className="haven-journal-description">
              Write it out. Put your thoughts somewhere they can simply exist.
            </p>

            <div className="haven-journal-privacy">
              <span className="haven-journal-privacy-badge">🔒</span>
              <div style={{ flex: 1 }}>
                <strong>Private space.</strong>
                <p>Your journal entries stay in your Haven. Nothing is shared with parents or your Circle.</p>
              </div>

              <button
                type="button"
                className="haven-journal-lock-toggle"
                onClick={handleToggleLockConfig}
                aria-label={lockConfig.enabled ? 'Disable lock' : 'Enable lock'}
              >
                {lockConfig.enabled ? '🔒 Lock Active' : '🔓 Add Lock'}
              </button>
            </div>

            {/* SAVE SUCCESS BANNER */}
            <AnimatePresence>
              {saveSuccessBanner && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  style={{
                    background: 'var(--tw-surface-raised)',
                    border: '2.5px solid var(--tw-border)',
                    borderRadius: '14px',
                    padding: '12px 18px',
                    marginBottom: '20px',
                    fontWeight: 900,
                    color: 'var(--tw-primary)',
                    boxShadow: '3px 3px 0px var(--tw-border)',
                  }}
                >
                  ✓ Entry saved to your private journal.
                </motion.div>
              )}
            </AnimatePresence>

            {/* ERROR BANNER */}
            {errorMessage && (
              <div className="haven-journal-error-banner">
                {errorMessage}
              </div>
            )}

            {/* ============================================================ */}
            {/* VIEW MODE: LIST (HISTORY) */}
            {/* ============================================================ */}
            {viewMode === 'list' && (
              <div>
                {/* TOOLBAR */}
                <div className="haven-journal-topbar">
                  <span className="haven-journal-counts-badge">
                    {entries.length} {entries.length === 1 ? 'Entry' : 'Entries'} Saved
                  </span>

                  <div className="haven-journal-actions-cluster">
                    <button
                      type="button"
                      className="haven-journal-add-btn"
                      onClick={handleOpenNewEntry}
                    >
                      <span style={{ fontSize: '1.2rem', lineHeight: 1 }}>+</span>
                      <span>New Entry</span>
                    </button>
                  </div>
                </div>

                {/* ENTRIES LIST OR EMPTY STATE */}
                {entries.length === 0 ? (
                  <div className="haven-journal-empty">
                    <span className="haven-journal-empty-icon">📖</span>
                    <h2>Your journal is empty.</h2>
                    <p>
                      Start writing your thoughts, feelings, and experiences. Only you can read what you write here.
                    </p>
                    <button
                      type="button"
                      className="haven-journal-add-btn"
                      onClick={handleOpenNewEntry}
                      style={{ marginTop: '8px' }}
                    >
                      + Write First Entry
                    </button>
                  </div>
                ) : (
                  <div className="haven-journal-history-list">
                    {entries.map((item) => (
                      <div
                        key={item.id}
                        className="haven-journal-card"
                        onClick={() => handleSelectEntry(item)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            handleSelectEntry(item);
                          }
                        }}
                      >
                        <div className="haven-journal-card-header">
                          <span className="haven-journal-card-time">
                            {formatJournalDateTime(item.createdAt)}
                          </span>

                          {item.updatedAt && item.updatedAt !== item.createdAt && (
                            <span className="haven-journal-card-updated">
                              Updated {formatJournalDateTime(item.updatedAt)}
                            </span>
                          )}
                        </div>

                        {item.title ? (
                          <h3 className="haven-journal-card-title">{item.title}</h3>
                        ) : null}

                        <p className="haven-journal-card-preview">
                          {getJournalPreview(item.body)}
                        </p>

                        <div className="haven-journal-card-footer">
                          <span>{item.body.length} characters</span>
                          <span className="haven-journal-card-action">
                            Read Entry →
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ============================================================ */}
            {/* VIEW MODE: READ SINGLE ENTRY */}
            {/* ============================================================ */}
            {viewMode === 'read' && selectedEntry && (
              <div className="haven-journal-read-container">
                <div className="haven-journal-read-header">
                  <div className="haven-journal-read-timestamps">
                    <span className="haven-journal-read-time">
                      Recorded: {formatJournalDateTime(selectedEntry.createdAt)}
                    </span>
                    {selectedEntry.updatedAt && selectedEntry.updatedAt !== selectedEntry.createdAt && (
                      <span className="haven-journal-read-updated-time">
                        Last edited: {formatJournalDateTime(selectedEntry.updatedAt)}
                      </span>
                    )}
                  </div>

                  <div className="haven-journal-read-actions">
                    <button
                      type="button"
                      className="haven-journal-secondary-btn"
                      onClick={() => setViewMode('list')}
                    >
                      All Entries
                    </button>

                    <button
                      type="button"
                      className="haven-journal-secondary-btn"
                      onClick={handleStartEdit}
                    >
                      ✏️ Edit
                    </button>

                    <button
                      type="button"
                      className="haven-journal-danger-btn"
                      onClick={() => setEntryToDelete(selectedEntry)}
                      title="Delete Entry"
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>

                {selectedEntry.title && (
                  <h2 className="haven-journal-read-title">{selectedEntry.title}</h2>
                )}

                <div className="haven-journal-read-body">
                  {selectedEntry.body}
                </div>

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderTop: '2px solid var(--tw-border)',
                    paddingTop: '16px',
                    fontSize: '0.82rem',
                    color: 'var(--tw-text-muted)',
                    fontWeight: 700,
                  }}
                >
                  <span>{selectedEntry.body.length} characters</span>
                  <button
                    type="button"
                    className="haven-journal-secondary-btn"
                    style={{ minHeight: '40px', padding: '6px 16px' }}
                    onClick={() => setViewMode('list')}
                  >
                    ← Back to Journal
                  </button>
                </div>
              </div>
            )}

            {/* ============================================================ */}
            {/* VIEW MODE: NEW / EDIT (EDITOR) */}
            {/* ============================================================ */}
            {(viewMode === 'new' || viewMode === 'edit') && (
              <div className="haven-journal-editor">
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '4px',
                    flexWrap: 'wrap',
                    gap: '10px',
                  }}
                >
                  <h3
                    style={{
                      margin: 0,
                      fontFamily: 'var(--font-display, inherit)',
                      fontSize: '1.25rem',
                      fontWeight: 900,
                    }}
                  >
                    {viewMode === 'new' ? 'New Journal Entry' : 'Edit Journal Entry'}
                  </h3>

                  <button
                    type="button"
                    className="haven-journal-secondary-btn"
                    style={{ minHeight: '38px', padding: '6px 14px', fontSize: '0.78rem' }}
                    onClick={handleCancelEditor}
                  >
                    Cancel
                  </button>
                </div>

                {/* TITLE INPUT (OPTIONAL) */}
                <div>
                  <label
                    htmlFor="journal-title"
                    style={{
                      display: 'block',
                      fontSize: '0.75rem',
                      fontWeight: 900,
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      color: 'var(--tw-primary)',
                      marginBottom: '6px',
                    }}
                  >
                    Entry Title (Optional)
                  </label>
                  <input
                    id="journal-title"
                    type="text"
                    className="haven-journal-title-input"
                    value={editorTitle}
                    onChange={(e) => {
                      setEditorTitle(e.target.value);
                      if (errorMessage) setErrorMessage(null);
                    }}
                    placeholder="Give this entry a title..."
                    maxLength={120}
                  />
                </div>

                {/* BODY TEXTAREA */}
                <div>
                  <label
                    htmlFor="journal-body"
                    style={{
                      display: 'block',
                      fontSize: '0.75rem',
                      fontWeight: 900,
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      color: 'var(--tw-primary)',
                      marginBottom: '6px',
                    }}
                  >
                    Journal Entry
                  </label>
                  <textarea
                    id="journal-body"
                    className="haven-journal-textarea"
                    value={editorBody}
                    onChange={(e) => {
                      setEditorBody(e.target.value);
                      if (errorMessage) setErrorMessage(null);
                    }}
                    placeholder="Write whatever is on your mind..."
                    aria-label="Journal entry body"
                    rows={12}
                    autoFocus
                  />
                </div>

                <div className="haven-journal-meta">
                  <span className="haven-journal-count">
                    {editorBody.length} {editorBody.length === 1 ? 'character' : 'characters'}
                  </span>

                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                      type="button"
                      className="haven-journal-secondary-btn"
                      onClick={handleCancelEditor}
                    >
                      Cancel
                    </button>

                    <button
                      type="button"
                      className="haven-journal-save"
                      onClick={handleSave}
                      disabled={isSaving}
                    >
                      {isSaving ? 'Saving…' : viewMode === 'edit' ? 'Update Entry' : 'Save Entry'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* ============================================================ */}
        {/* MODAL: UNSAVED CHANGES WARNING */}
        {/* ============================================================ */}
        {showDiscardDialog && (
          <div className="haven-journal-modal-overlay" role="dialog" aria-modal="true">
            <div className="haven-journal-modal-card">
              <h3>Discard unsaved changes?</h3>
              <p>
                You have unsaved writing in this entry. If you leave now, your unsaved edits will be discarded.
              </p>
              <div className="haven-journal-modal-actions">
                <button
                  type="button"
                  className="haven-journal-secondary-btn"
                  onClick={() => setShowDiscardDialog(false)}
                >
                  Keep Writing
                </button>
                <button
                  type="button"
                  className="haven-journal-danger-btn"
                  onClick={() => {
                    setShowDiscardDialog(false);
                    if (pendingBackAction) {
                      pendingBackAction();
                      setPendingBackAction(null);
                    }
                  }}
                >
                  Discard Changes
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* MODAL: DELETE ENTRY CONFIRMATION */}
        {/* ============================================================ */}
        {entryToDelete && (
          <div className="haven-journal-modal-overlay" role="dialog" aria-modal="true">
            <div className="haven-journal-modal-card">
              <h3>Delete this entry?</h3>
              <p>
                Are you sure you want to delete this journal entry? This action cannot be undone.
              </p>
              <div className="haven-journal-modal-actions">
                <button
                  type="button"
                  className="haven-journal-secondary-btn"
                  onClick={() => setEntryToDelete(null)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="haven-journal-danger-btn"
                  onClick={handleConfirmDelete}
                >
                  Delete Entry
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* MODAL: LOCK SETUP */}
        {/* ============================================================ */}
        {showLockSetupModal && (
          <div className="haven-journal-modal-overlay" role="dialog" aria-modal="true">
            <div className="haven-journal-modal-card">
              <h3>Set Journal Passcode</h3>
              <p>
                Protect your journal entries from curious eyes on this device.
              </p>

              {setupError && (
                <div className="haven-journal-error-banner">
                  {setupError}
                </div>
              )}

              <form onSubmit={handleSaveLockSetup} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label
                    htmlFor="new-passcode"
                    style={{
                      display: 'block',
                      fontSize: '0.75rem',
                      fontWeight: 900,
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      color: 'var(--tw-primary)',
                      marginBottom: '6px',
                    }}
                  >
                    Passcode / PIN
                  </label>
                  <input
                    id="new-passcode"
                    type="password"
                    value={newPasscode}
                    onChange={(e) => setNewPasscode(e.target.value)}
                    className="haven-journal-title-input"
                    placeholder="Enter passcode"
                    required
                    autoFocus
                  />
                </div>

                <div>
                  <label
                    htmlFor="confirm-passcode"
                    style={{
                      display: 'block',
                      fontSize: '0.75rem',
                      fontWeight: 900,
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      color: 'var(--tw-primary)',
                      marginBottom: '6px',
                    }}
                  >
                    Confirm Passcode
                  </label>
                  <input
                    id="confirm-passcode"
                    type="password"
                    value={confirmPasscode}
                    onChange={(e) => setConfirmPasscode(e.target.value)}
                    className="haven-journal-title-input"
                    placeholder="Confirm passcode"
                    required
                  />
                </div>

                <div className="haven-journal-modal-actions">
                  <button
                    type="button"
                    className="haven-journal-secondary-btn"
                    onClick={() => setShowLockSetupModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="haven-journal-save"
                    style={{ minHeight: '44px', padding: '10px 20px' }}
                  >
                    Enable Lock
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </main>
  );
}
