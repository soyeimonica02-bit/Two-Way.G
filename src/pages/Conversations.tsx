import { useState, useEffect } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  loadSavedDrafts,
  saveDraft,
  deleteDraft,
  formatDraftDate,
  sendDirectMessage,
  type ClaritySavedDraft,
} from '../utils/clarityStorage';
import {
  loadCircleConnections,
  lookupRegisteredAccount,
  type CircleConnection,
} from '../utils/circleStorage';

type ClarityStage = 'express' | 'understand' | 'rephrase' | 'review' | 'decision';

interface ClarityStageConfig {
  id: ClarityStage;
  label: string;
  badge: string;
  title: string;
  subtitle: string;
}

const STAGES: ClarityStageConfig[] = [
  {
    id: 'express',
    label: 'Express',
    badge: 'STAGE 1 · EXPRESS',
    title: 'What do you want to say?',
    subtitle: "Start however feels natural. You don't need to make it sound perfect.",
  },
  {
    id: 'understand',
    label: 'Understand',
    badge: 'STAGE 2 · UNDERSTAND',
    title: 'What feelings and needs are underneath?',
    subtitle: 'Clarifying the real emotions helps others hear your message without getting defensive.',
  },
  {
    id: 'rephrase',
    label: 'Rephrase',
    badge: 'STAGE 3 · REPHRASE',
    title: 'How can you frame it clearly?',
    subtitle: 'Choose a phrasing that feels authentic while helping the other person truly listen.',
  },
  {
    id: 'review',
    label: 'Review',
    badge: 'STAGE 4 · REVIEW',
    title: 'Review your refined message',
    subtitle: 'Read your draft carefully. Ensure it represents what you truly meant to express.',
  },
  {
    id: 'decision',
    label: 'Decision',
    badge: 'FINAL STAGE · YOUR CHOICE',
    title: 'What would you like to do?',
    subtitle: 'You are completely in control. Decide how to proceed with your refined message.',
  },
];

const STORAGE_KEY_ACTIVE = 'twoway_clarity_draft';

const FEELING_OPTIONS = [
  'Hurt',
  'Angry',
  'Sad',
  'Anxious',
  'Overwhelmed',
  'Disappointed',
  'Confused',
  'Lonely',
  'Frustrated',
  'Relieved',
];

const NEED_OPTIONS = [
  'To be understood',
  'Someone to listen',
  'Reassurance',
  'Space and time',
  'An apology',
  'Help solving the problem',
  'Support without judgment',
];

interface ClarityActiveDraft {
  id?: string;
  expressText: string;
  primaryEmotion: string;
  coreNeed: string;
  selectedFeelings?: string[];
  otherFeeling?: string;
  selectedNeeds?: string[];
  otherNeed?: string;
  selectedTone: 'gentle' | 'direct' | 'balanced';
  rephrasedText: string;
  customRephrase: string;
  stage: ClarityStage;
  createdAt?: string;
}

export default function Conversations() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  const isParent = location.pathname.startsWith('/app/parent');
  const baseRoute = isParent ? '/app/parent' : '/app/teen';

  // Navigation mode: 'editor' or 'drafts'
  const [activeView, setActiveView] = useState<'editor' | 'drafts'>('editor');

  // Drafts list state
  const [draftsList, setDraftsList] = useState<ClaritySavedDraft[]>(() => loadSavedDrafts());
  const [activeDraftId, setActiveDraftId] = useState<string | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_ACTIVE);
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.id || null;
      }
    } catch {
      // ignore
    }
    return null;
  });

  // Modal & feedback state
  const [draftToDelete, setDraftToDelete] = useState<ClaritySavedDraft | null>(null);
  const [draftSaveFeedback, setDraftSaveFeedback] = useState<string | null>(null);

  // Active draft fields
  const [draft, setDraft] = useState<ClarityActiveDraft>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_ACTIVE);
      if (saved) {
        const parsed = JSON.parse(saved);
        const feelings = Array.isArray(parsed.selectedFeelings)
          ? parsed.selectedFeelings
          : parsed.primaryEmotion
            ? parsed.primaryEmotion.split(',').map((s: string) => s.trim()).filter(Boolean)
            : ['Frustrated'];
        const needs = Array.isArray(parsed.selectedNeeds)
          ? parsed.selectedNeeds
          : parsed.coreNeed
            ? [parsed.coreNeed]
            : ['To be understood'];

        return {
          ...parsed,
          selectedFeelings: feelings,
          otherFeeling: parsed.otherFeeling || '',
          selectedNeeds: needs,
          otherNeed: parsed.otherNeed || '',
          primaryEmotion: parsed.primaryEmotion || feelings.join(', '),
          coreNeed: parsed.coreNeed || needs.join(', '),
        };
      }
    } catch (e) {
      console.error('Failed to load active Clarity draft:', e);
    }
    return {
      expressText: '',
      primaryEmotion: 'Frustrated',
      coreNeed: 'To be understood',
      selectedFeelings: ['Frustrated'],
      otherFeeling: '',
      selectedNeeds: ['To be understood'],
      otherNeed: '',
      selectedTone: 'balanced',
      rephrasedText: '',
      customRephrase: '',
      stage: 'express',
    };
  });

  // Circle connections state
  const [circleConnections, setCircleConnections] = useState<CircleConnection[]>(() =>
    loadCircleConnections(),
  );
  const [selectedRecipient, setSelectedRecipient] = useState<CircleConnection | null>(null);

  // Decision stage sub-steps: 'options' | 'select-recipient' | 'confirm-send' | 'sent-success'
  const [decisionSubStep, setDecisionSubStep] = useState<
    'options' | 'select-recipient' | 'confirm-send' | 'sent-success'
  >('options');

  const [isSending, setIsSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [sentSuccessDetails, setSentSuccessDetails] = useState<{
    recipientName: string;
    recipientId: string;
  } | null>(null);

  // Stage routing
  const urlStageParam = searchParams.get('stage') as ClarityStage | null;
  const stageFromUrl = urlStageParam ? STAGES.findIndex((s) => s.id === urlStageParam) : -1;
  const fallbackIndex = STAGES.findIndex((s) => s.id === draft.stage);
  const currentStageIndex =
    stageFromUrl >= 0 ? stageFromUrl : fallbackIndex >= 0 ? fallbackIndex : 0;

  const [validationError, setValidationError] = useState<string | null>(null);
  const [copyFeedback, setCopyFeedback] = useState(false);
  const [havenSaveFeedback, setHavenSaveFeedback] = useState<string | null>(null);

  // Listen for storage changes
  useEffect(() => {
    const handleDraftsUpdated = () => {
      setDraftsList(loadSavedDrafts());
    };
    const handleCircleUpdated = () => {
      setCircleConnections(loadCircleConnections());
    };

    window.addEventListener('twoway-clarity-drafts-updated', handleDraftsUpdated);
    window.addEventListener('storage', handleDraftsUpdated);
    window.addEventListener('storage', handleCircleUpdated);
    return () => {
      window.removeEventListener('twoway-clarity-drafts-updated', handleDraftsUpdated);
      window.removeEventListener('storage', handleDraftsUpdated);
      window.removeEventListener('storage', handleCircleUpdated);
    };
  }, []);

  // Auto-persist active draft to ensure zero data loss
  useEffect(() => {
    try {
      const payload: ClarityActiveDraft = {
        ...draft,
        id: activeDraftId || undefined,
        stage: STAGES[currentStageIndex].id,
      };
      localStorage.setItem(STORAGE_KEY_ACTIVE, JSON.stringify(payload));
    } catch (e) {
      console.error('Failed to auto-persist active Clarity draft:', e);
    }
  }, [draft, currentStageIndex, activeDraftId]);

  const goToStage = (targetIndex: number) => {
    setValidationError(null);
    setSearchParams({ stage: STAGES[targetIndex].id });
  };

  const currentStage = STAGES[currentStageIndex];

  // Helper generator for rephrasings based on inputs
  const generateRephraseOptions = (text: string, emotion: string, need: string) => {
    const raw = text.trim();
    if (!raw) return { balanced: '', gentle: '', direct: '' };

    const em = emotion ? emotion.toLowerCase() : 'overwhelmed';
    const nd = need ? need.toLowerCase() : 'to be understood';

    return {
      balanced: `I've been feeling ${em} lately. What I really need right now is ${nd}. When this happens: "${raw}", I want us to talk through it calmly so we understand each other.`,
      gentle: `I care a lot about our relationship, but I've been feeling ${em}. What would help me most right now is ${nd}. Could we find a quiet time to talk about this?`,
      direct: `I want to be direct with you about how I'm feeling: I feel ${em}. What I need is ${nd}. Specifically: ${raw}.`,
    };
  };

  const handleToggleFeeling = (emotion: string) => {
    setDraft((prev) => {
      const current = prev.selectedFeelings || [];
      const updated = current.includes(emotion)
        ? current.filter((e) => e !== emotion)
        : [...current, emotion];

      const all = [...updated, (prev.otherFeeling || '').trim()].filter(Boolean);
      return {
        ...prev,
        selectedFeelings: updated,
        primaryEmotion: all.join(', '),
      };
    });
    setValidationError(null);
  };

  const handleOtherFeelingChange = (val: string) => {
    setDraft((prev) => {
      const all = [...(prev.selectedFeelings || []), val.trim()].filter(Boolean);
      return {
        ...prev,
        otherFeeling: val,
        primaryEmotion: all.join(', '),
      };
    });
    setValidationError(null);
  };

  const handleToggleNeed = (need: string) => {
    setDraft((prev) => {
      const current = prev.selectedNeeds || [];
      const updated = current.includes(need)
        ? current.filter((n) => n !== need)
        : [...current, need];

      const all = [...updated, (prev.otherNeed || '').trim()].filter(Boolean);
      return {
        ...prev,
        selectedNeeds: updated,
        coreNeed: all.join(', '),
      };
    });
    setValidationError(null);
  };

  const handleOtherNeedChange = (val: string) => {
    setDraft((prev) => {
      const all = [...(prev.selectedNeeds || []), val.trim()].filter(Boolean);
      return {
        ...prev,
        otherNeed: val,
        coreNeed: all.join(', '),
      };
    });
    setValidationError(null);
  };

  const rephraseOptions = generateRephraseOptions(
    draft.expressText,
    draft.primaryEmotion,
    draft.coreNeed,
  );

  const activeRefinedText =
    draft.customRephrase.trim() || rephraseOptions[draft.selectedTone] || draft.expressText;

  // Manual save draft action (available at every stage)
  const handleSaveCurrentAsDraft = () => {
    const res = saveDraft({
      id: activeDraftId || undefined,
      expressText: draft.expressText,
      primaryEmotion: draft.primaryEmotion,
      coreNeed: draft.coreNeed,
      selectedFeelings: draft.selectedFeelings,
      otherFeeling: draft.otherFeeling,
      selectedNeeds: draft.selectedNeeds,
      otherNeed: draft.otherNeed,
      selectedTone: draft.selectedTone,
      rephrasedText: draft.rephrasedText,
      customRephrase: draft.customRephrase,
      stage: STAGES[currentStageIndex].id,
      recipientTwoWayId: selectedRecipient?.twoWayId,
      createdAt: draft.createdAt,
    });

    if (res.success && res.draft) {
      setActiveDraftId(res.draft.id);
      setDraftsList(loadSavedDrafts());
      setDraftSaveFeedback('Draft saved successfully ✓');
      setTimeout(() => setDraftSaveFeedback(null), 2500);
    } else {
      setDraftSaveFeedback(res.error || 'Could not save draft to local storage.');
      setTimeout(() => setDraftSaveFeedback(null), 3500);
    }
  };

  // Reopen and resume a saved draft
  const handleResumeDraft = (saved: ClaritySavedDraft) => {
    setActiveDraftId(saved.id);
    const parsedFeelings = Array.isArray(saved.selectedFeelings)
      ? saved.selectedFeelings
      : saved.primaryEmotion
        ? saved.primaryEmotion.split(',').map((s) => s.trim()).filter(Boolean)
        : [];
    const parsedNeeds = Array.isArray(saved.selectedNeeds)
      ? saved.selectedNeeds
      : saved.coreNeed
        ? [saved.coreNeed]
        : [];

    setDraft({
      id: saved.id,
      expressText: saved.expressText,
      primaryEmotion: saved.primaryEmotion,
      coreNeed: saved.coreNeed,
      selectedFeelings: parsedFeelings,
      otherFeeling: saved.otherFeeling || '',
      selectedNeeds: parsedNeeds,
      otherNeed: saved.otherNeed || '',
      selectedTone: saved.selectedTone,
      rephrasedText: saved.rephrasedText,
      customRephrase: saved.customRephrase,
      stage: saved.stage,
      createdAt: saved.createdAt,
    });

    if (saved.recipientTwoWayId) {
      const conn = circleConnections.find((c) => c.twoWayId === saved.recipientTwoWayId);
      setSelectedRecipient(conn || null);
    } else {
      setSelectedRecipient(null);
    }

    setDecisionSubStep('options');
    setActiveView('editor');
    const stageIdx = STAGES.findIndex((s) => s.id === saved.stage);
    goToStage(stageIdx >= 0 ? stageIdx : 0);
  };

  // Delete draft action
  const handleConfirmDeleteDraft = () => {
    if (!draftToDelete) return;
    deleteDraft(draftToDelete.id);
    setDraftsList(loadSavedDrafts());

    // If deleting the active draft, reset active draft id
    if (activeDraftId === draftToDelete.id) {
      setActiveDraftId(null);
    }

    setDraftToDelete(null);
  };

  // Start fresh message
  const handleStartNewMessage = () => {
    localStorage.removeItem(STORAGE_KEY_ACTIVE);
    setActiveDraftId(null);
    setSelectedRecipient(null);
    setDecisionSubStep('options');
    setDraft({
      expressText: '',
      primaryEmotion: '',
      coreNeed: '',
      selectedFeelings: [],
      otherFeeling: '',
      selectedNeeds: [],
      otherNeed: '',
      selectedTone: 'balanced',
      rephrasedText: '',
      customRephrase: '',
      stage: 'express',
    });
    setActiveView('editor');
    goToStage(0);
  };

  // Continue button validation & transitions
  const handleContinue = () => {
    setValidationError(null);

    if (currentStage.id === 'express') {
      if (!draft.expressText.trim()) {
        setValidationError('Please write what you want to say before continuing.');
        return;
      }
      if (draft.expressText.trim().length < 4) {
        setValidationError('Please write a bit more so we can help clarify your thoughts.');
        return;
      }
      goToStage(1); // Go to Understand
      return;
    }

    if (currentStage.id === 'understand') {
      const activeFeelings = [
        ...(draft.selectedFeelings || []),
        ...(draft.otherFeeling ? [draft.otherFeeling.trim()] : []),
      ].filter(Boolean);

      if (activeFeelings.length === 0 && !draft.primaryEmotion.trim()) {
        setValidationError('Please select or describe at least one feeling before continuing.');
        return;
      }

      const activeNeeds = [
        ...(draft.selectedNeeds || []),
        ...(draft.otherNeed ? [draft.otherNeed.trim()] : []),
      ].filter(Boolean);

      if (activeNeeds.length === 0 && !draft.coreNeed.trim()) {
        setValidationError('Please select or describe what you need most before continuing.');
        return;
      }

      const effectiveEmotion = activeFeelings.join(', ') || draft.primaryEmotion;
      const effectiveNeed = activeNeeds.join(', ') || draft.coreNeed;

      const initialOptions = generateRephraseOptions(
        draft.expressText,
        effectiveEmotion,
        effectiveNeed,
      );
      if (!draft.customRephrase) {
        setDraft((prev) => ({
          ...prev,
          primaryEmotion: effectiveEmotion,
          coreNeed: effectiveNeed,
          rephrasedText: initialOptions[prev.selectedTone],
          customRephrase: initialOptions[prev.selectedTone],
        }));
      }
      goToStage(2); // Go to Rephrase
      return;
    }

    if (currentStage.id === 'rephrase') {
      if (!activeRefinedText.trim()) {
        setValidationError('Please choose or write a rephrased version of your message.');
        return;
      }
      goToStage(3); // Go to Review
      return;
    }

    if (currentStage.id === 'review') {
      if (!activeRefinedText.trim()) {
        setValidationError('Your message cannot be empty.');
        return;
      }
      goToStage(4); // Go to Decision
      return;
    }
  };

  const handleBack = () => {
    setValidationError(null);

    // If inside a decision sub-step, back returns to previous sub-step
    if (currentStage.id === 'decision') {
      if (decisionSubStep === 'confirm-send') {
        setDecisionSubStep('select-recipient');
        return;
      }
      if (decisionSubStep === 'select-recipient') {
        setDecisionSubStep('options');
        return;
      }
    }

    if (currentStageIndex > 0) {
      goToStage(currentStageIndex - 1);
    } else {
      navigate(baseRoute);
    }
  };

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(activeRefinedText);
    setCopyFeedback(true);
    setTimeout(() => setCopyFeedback(false), 2200);
  };

  const handleSaveToHaven = () => {
    try {
      const entryId = isParent
        ? `parent_note_${Date.now()}`
        : `thought_clarity_${Date.now()}`;
      const noteContent = `[Clarity Message]\n${activeRefinedText}`;
      const nowIso = new Date().toISOString();

      if (isParent) {
        const raw = localStorage.getItem('twoway_parent_notes');
        const notes = raw ? JSON.parse(raw) : [];
        notes.unshift({
          id: entryId,
          content: noteContent,
          createdAt: nowIso,
          updatedAt: nowIso,
        });
        localStorage.setItem('twoway_parent_notes', JSON.stringify(notes));
        setHavenSaveFeedback('Saved to your private Parent Notes.');
        setTimeout(() => setHavenSaveFeedback(null), 3000);
        return;
      }

      // Save to primary Thought Notes collection
      const notesRaw = localStorage.getItem('twoway_haven_thoughts_notes');
      const notes = notesRaw ? JSON.parse(notesRaw) : [];
      notes.unshift({
        id: entryId,
        content: noteContent,
        createdAt: nowIso,
        updatedAt: nowIso,
      });
      localStorage.setItem('twoway_haven_thoughts_notes', JSON.stringify(notes));

      // Also maintain legacy keys so any legacy listeners remain in sync
      localStorage.setItem('twoway_haven_thoughts_entry', noteContent);
      localStorage.setItem('twoway_haven_thoughts', JSON.stringify(notes));

      setHavenSaveFeedback('Saved to your private Haven Thoughts.');
      setTimeout(() => setHavenSaveFeedback(null), 3000);
    } catch (e) {
      console.error('Failed to save to notes:', e);
      setHavenSaveFeedback('Could not save note.');
    }
  };

  // Real message sending upon explicit confirmation
  const handleConfirmSend = () => {
    if (!selectedRecipient) {
      setSendError('Please select a recipient before sending.');
      return;
    }

    if (!activeRefinedText.trim()) {
      setSendError('Message content cannot be empty.');
      return;
    }

    // Verify recipient is still an accepted connection
    const currentList = loadCircleConnections();
    const stillConnected = currentList.some((c) => c.twoWayId === selectedRecipient.twoWayId);
    if (!stillConnected) {
      setSendError('This person is no longer in your accepted Circle connections.');
      return;
    }

    setIsSending(true);
    setSendError(null);

    setTimeout(() => {
      const result = sendDirectMessage(selectedRecipient.twoWayId, activeRefinedText);
      setIsSending(false);

      if (result.success) {
        // Remove from saved drafts if it was a saved draft
        if (activeDraftId) {
          deleteDraft(activeDraftId);
          setDraftsList(loadSavedDrafts());
          setActiveDraftId(null);
        }
        localStorage.removeItem(STORAGE_KEY_ACTIVE);

        setSentSuccessDetails({
          recipientName: selectedRecipient.displayName || selectedRecipient.twoWayId,
          recipientId: selectedRecipient.twoWayId,
        });
        setDecisionSubStep('sent-success');
      } else {
        setSendError(result.error || 'Failed to send message. Please try again.');
      }
    }, 450);
  };

  return (
    <main className="tw-page">
      <div className="tw-container">

        {/* HEADER */}
        <header className="tw-page-header">
          <div
            className="tw-page-header-content"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '100%',
              flexWrap: 'wrap',
              gap: '12px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <button
                className="tw-button tw-button-ghost"
                aria-label="Go back"
                onClick={handleBack}
                style={{
                  minWidth: '42px',
                  height: '42px',
                  padding: '0 12px',
                  fontSize: '1.2rem',
                  display: 'grid',
                  placeItems: 'center',
                  flexShrink: 0,
                }}
              >
                ←
              </button>

              <div>
                <h1 style={{ margin: 0, fontSize: '1.6rem' }}>Clarity</h1>
                <p className="text-secondary" style={{ margin: '2px 0 0 0', fontSize: '0.86rem' }}>
                  Say what you actually mean.
                </p>
              </div>
            </div>

            {/* TOP ACTIONS & VIEW SWITCHER */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                type="button"
                onClick={() => setActiveView('editor')}
                style={{
                  padding: '8px 14px',
                  borderRadius: '10px',
                  border: '2px solid var(--tw-border)',
                  background: activeView === 'editor' ? 'var(--tw-primary)' : 'var(--tw-surface)',
                  color: activeView === 'editor' ? 'var(--tw-primary-text, #ffffff)' : 'var(--tw-text)',
                  fontSize: '0.78rem',
                  fontWeight: 850,
                  cursor: 'pointer',
                  boxShadow: activeView === 'editor' ? '2px 2px 0px var(--tw-border)' : 'none',
                  transition: 'all 120ms ease',
                }}
              >
                ✏️ Editor
              </button>

              <button
                type="button"
                onClick={() => {
                  setDraftsList(loadSavedDrafts());
                  setActiveView('drafts');
                }}
                style={{
                  padding: '8px 14px',
                  borderRadius: '10px',
                  border: '2px solid var(--tw-border)',
                  background: activeView === 'drafts' ? 'var(--tw-primary)' : 'var(--tw-surface)',
                  color: activeView === 'drafts' ? 'var(--tw-primary-text, #ffffff)' : 'var(--tw-text)',
                  fontSize: '0.78rem',
                  fontWeight: 850,
                  cursor: 'pointer',
                  boxShadow: activeView === 'drafts' ? '2px 2px 0px var(--tw-border)' : 'none',
                  transition: 'all 120ms ease',
                }}
              >
                📁 Drafts ({draftsList.length})
              </button>

              {activeView === 'editor' && (
                <button
                  type="button"
                  onClick={handleSaveCurrentAsDraft}
                  title="Save current progress as draft"
                  style={{
                    padding: '8px 14px',
                    borderRadius: '10px',
                    border: '2px solid var(--tw-border)',
                    background: 'var(--tw-surface-raised)',
                    color: 'var(--tw-text)',
                    fontSize: '0.78rem',
                    fontWeight: 850,
                    cursor: 'pointer',
                    boxShadow: '2px 2px 0px var(--tw-border)',
                  }}
                >
                  💾 Save Draft
                </button>
              )}
            </div>
          </div>
        </header>

        {/* FEEDBACK TOAST / BANNER */}
        {draftSaveFeedback && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            style={{
              marginTop: '12px',
              padding: '10px 16px',
              background: 'var(--tw-primary-soft)',
              border: '2px solid var(--tw-primary)',
              borderRadius: '10px',
              color: 'var(--tw-primary)',
              fontWeight: 800,
              fontSize: '0.82rem',
              textAlign: 'center',
            }}
            role="status"
          >
            {draftSaveFeedback}
          </motion.div>
        )}

        {/* ========================================================
            VIEW: DRAFTS LIST
           ======================================================== */}
        {activeView === 'drafts' && (
          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            style={{ marginTop: '20px' }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '18px',
              }}
            >
              <div>
                <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 900 }}>
                  Saved Clarity Drafts
                </h2>
                <p className="text-secondary" style={{ margin: '4px 0 0 0', fontSize: '0.82rem' }}>
                  Resume, edit, or delete your in-progress messages. Drafts remain completely private and are never sent automatically.
                </p>
              </div>

              <button
                type="button"
                className="tw-button tw-button-primary"
                onClick={handleStartNewMessage}
                style={{ fontSize: '0.78rem', padding: '8px 16px' }}
              >
                + New Message
              </button>
            </div>

            {draftsList.length === 0 ? (
              <div
                className="tw-card"
                style={{
                  padding: '48px 24px',
                  textAlign: 'center',
                  border: '2.5px dashed var(--tw-border)',
                }}
              >
                <div style={{ fontSize: '2.2rem', marginBottom: '12px' }}>📝</div>
                <h3 style={{ margin: '0 0 6px 0', fontSize: '1.15rem', fontWeight: 900 }}>
                  No saved drafts yet
                </h3>
                <p
                  className="text-muted"
                  style={{
                    maxWidth: '460px',
                    margin: '0 auto 20px auto',
                    fontSize: '0.88rem',
                    lineHeight: 1.5,
                  }}
                >
                  When writing a message in Clarity, tap "Save Draft" at any stage to pause and return whenever you are ready.
                </p>
                <button
                  type="button"
                  className="tw-button tw-button-primary"
                  onClick={() => setActiveView('editor')}
                >
                  Start writing in Clarity →
                </button>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '14px' }}>
                {draftsList.map((d) => {
                  const stageObj = STAGES.find((s) => s.id === d.stage) || STAGES[0];
                  const preview = d.customRephrase || d.rephrasedText || d.expressText;

                  return (
                    <article
                      key={d.id}
                      className="tw-card"
                      style={{
                        padding: '22px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '12px',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          flexWrap: 'wrap',
                          gap: '8px',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span
                            className="tw-badge"
                            style={{
                              background: 'var(--tw-primary-soft)',
                              color: 'var(--tw-primary)',
                              border: '1.5px solid var(--tw-primary)',
                              fontSize: '0.7rem',
                              fontWeight: 800,
                            }}
                          >
                            {stageObj.label} (Stage {STAGES.indexOf(stageObj) + 1})
                          </span>

                          {d.primaryEmotion && (
                            <span
                              style={{
                                fontSize: '0.72rem',
                                padding: '2px 8px',
                                borderRadius: '6px',
                                background: 'var(--tw-surface-raised)',
                                border: '1px solid var(--tw-border)',
                                fontWeight: 750,
                              }}
                            >
                              {d.primaryEmotion}
                            </span>
                          )}

                          {d.recipientTwoWayId && (
                            <span
                              style={{
                                fontSize: '0.72rem',
                                padding: '2px 8px',
                                borderRadius: '6px',
                                background: 'var(--tw-surface-raised)',
                                border: '1px solid var(--tw-border)',
                                fontWeight: 750,
                                color: 'var(--tw-primary)',
                              }}
                            >
                              To: {d.recipientTwoWayId}
                            </span>
                          )}
                        </div>

                        <span
                          style={{
                            fontSize: '0.74rem',
                            color: 'var(--tw-text-muted)',
                            fontWeight: 700,
                          }}
                        >
                          Saved {formatDraftDate(d.updatedAt)}
                        </span>
                      </div>

                      <p
                        style={{
                          margin: 0,
                          fontSize: '0.94rem',
                          lineHeight: 1.55,
                          color: 'var(--tw-text)',
                          display: '-webkit-box',
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        }}
                      >
                        {preview || <em>(Empty draft message)</em>}
                      </p>

                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'flex-end',
                          alignItems: 'center',
                          gap: '10px',
                          marginTop: '4px',
                          paddingTop: '10px',
                          borderTop: '1px solid var(--tw-border)',
                        }}
                      >
                        <button
                          type="button"
                          onClick={() => setDraftToDelete(d)}
                          style={{
                            padding: '6px 14px',
                            borderRadius: '8px',
                            border: '1.5px solid var(--tw-border)',
                            background: 'transparent',
                            color: 'var(--tw-accent-red, #dc2626)',
                            fontSize: '0.75rem',
                            fontWeight: 800,
                            cursor: 'pointer',
                          }}
                        >
                          Delete
                        </button>

                        <button
                          type="button"
                          className="tw-button tw-button-primary"
                          onClick={() => handleResumeDraft(d)}
                          style={{
                            padding: '8px 18px',
                            fontSize: '0.78rem',
                          }}
                        >
                          Resume Draft →
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </motion.section>
        )}

        {/* ========================================================
            VIEW: ACTIVE EDITOR & MULTI-STAGE FLOW
           ======================================================== */}
        {activeView === 'editor' && (
          <>
            {/* MULTI-STAGE PROCESS INDICATOR */}
            <section className="tw-card" style={{ marginTop: '20px' }}>
              <div style={{ padding: '22px' }}>
                <span className="text-muted" style={{ fontSize: '0.72rem', fontWeight: 800 }}>
                  YOUR PROCESS
                </span>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: `repeat(${STAGES.length}, 1fr)`,
                    gap: '8px',
                    marginTop: '18px',
                  }}
                >
                  {STAGES.map((s, index) => {
                    const isPassed = index < currentStageIndex;
                    const isCurrent = index === currentStageIndex;
                    return (
                      <div
                        key={s.id}
                        onClick={() => {
                          if (index < currentStageIndex) {
                            goToStage(index);
                          }
                        }}
                        style={{
                          cursor: isPassed ? 'pointer' : 'default',
                        }}
                        title={isPassed ? `Back to ${s.label}` : s.label}
                      >
                        <div
                          style={{
                            height: '5px',
                            background: isCurrent
                              ? 'var(--tw-primary)'
                              : isPassed
                              ? 'var(--tw-primary-soft, #93c5fd)'
                              : 'var(--tw-border)',
                            borderRadius: '999px',
                            transition: 'background 200ms ease',
                          }}
                        />
                        <span
                          style={{
                            display: 'block',
                            marginTop: '7px',
                            fontSize: '0.72rem',
                            fontWeight: isCurrent ? 800 : 600,
                            color: isCurrent
                              ? 'var(--tw-primary)'
                              : isPassed
                              ? 'var(--tw-text)'
                              : 'var(--tw-text-muted)',
                          }}
                        >
                          {s.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>

            {/* STAGE CONTAINER */}
            <AnimatePresence mode="wait">
              <motion.section
                key={currentStage.id}
                className="tw-card"
                style={{ marginTop: '20px' }}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.25 }}
              >
                <div style={{ padding: '28px' }}>
                  <span className="tw-badge tw-badge-primary">
                    {currentStage.badge}
                  </span>

                  <h2 style={{ marginTop: '14px' }}>
                    {currentStage.title}
                  </h2>

                  <p
                    className="text-secondary"
                    style={{
                      marginTop: '8px',
                      maxWidth: '620px',
                    }}
                  >
                    {currentStage.subtitle}
                  </p>

                  {/* ========================================================
                      STAGE 1: EXPRESS
                     ======================================================== */}
                  {currentStage.id === 'express' && (
                    <div style={{ marginTop: '20px' }}>
                      <textarea
                        className="tw-textarea"
                        placeholder="Write what you're really trying to say..."
                        value={draft.expressText}
                        onChange={(e) => {
                          setDraft((prev) => ({
                            ...prev,
                            expressText: e.target.value,
                          }));
                          setValidationError(null);
                        }}
                        style={{
                          width: '100%',
                          minHeight: '190px',
                          boxSizing: 'border-box',
                        }}
                        autoFocus
                      />
                      <p
                        className="text-muted"
                        style={{
                          fontSize: '0.76rem',
                          marginTop: '8px',
                        }}
                      >
                        Take all the space you need. Don't worry about punctuation or sounding polite right now.
                      </p>
                    </div>
                  )}

                  {/* ========================================================
                      STAGE 2: UNDERSTAND
                     ======================================================== */}
                  {currentStage.id === 'understand' && (
                    <div style={{ marginTop: '20px' }}>
                      <div
                        style={{
                          padding: '14px 18px',
                          background: 'var(--tw-surface-soft)',
                          borderLeft: '4px solid var(--tw-primary)',
                          borderRadius: '8px',
                          marginBottom: '22px',
                        }}
                      >
                        <span
                          style={{
                            display: 'block',
                            fontSize: '0.68rem',
                            fontWeight: 800,
                            letterSpacing: '0.08em',
                            color: 'var(--tw-text-muted)',
                            textTransform: 'uppercase',
                            marginBottom: '4px',
                          }}
                        >
                          YOUR ORIGINAL WORDS
                        </span>
                        <p
                          style={{
                            margin: 0,
                            fontSize: '0.92rem',
                            fontStyle: 'italic',
                            color: 'var(--tw-text)',
                          }}
                        >
                          "{draft.expressText}"
                        </p>
                      </div>

                      {/* Emotion / Feelings Picker */}
                      <div style={{ marginBottom: '26px' }}>
                        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '8px', flexWrap: 'wrap', gap: '6px' }}>
                          <label
                            style={{
                              display: 'block',
                              fontSize: '0.92rem',
                              fontWeight: 800,
                              color: 'var(--tw-text)',
                            }}
                          >
                            1. What feelings are underneath?
                          </label>
                          <span style={{ fontSize: '0.74rem', color: 'var(--tw-text-muted)', fontWeight: 600 }}>
                            Select all that apply, or add your own
                          </span>
                        </div>

                        <div
                          style={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: '8px',
                          }}
                        >
                          {FEELING_OPTIONS.map((emotion) => {
                            const isSelected = draft.selectedFeelings?.includes(emotion);
                            return (
                              <button
                                key={emotion}
                                type="button"
                                onClick={() => handleToggleFeeling(emotion)}
                                aria-pressed={isSelected}
                                style={{
                                  padding: '8px 14px',
                                  borderRadius: '10px',
                                  border: '2px solid var(--tw-border)',
                                  background: isSelected
                                    ? 'var(--tw-primary)'
                                    : 'var(--tw-surface)',
                                  color: isSelected
                                    ? 'var(--tw-primary-text, #ffffff)'
                                    : 'var(--tw-text)',
                                  fontWeight: 750,
                                  fontSize: '0.84rem',
                                  cursor: 'pointer',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '6px',
                                  boxShadow: isSelected
                                    ? '2.5px 2.5px 0px var(--tw-border)'
                                    : 'none',
                                  transform: isSelected ? 'translate(-1px, -1px)' : 'none',
                                  transition: 'all 120ms ease',
                                }}
                              >
                                <span>{isSelected ? '✓' : '+'}</span>
                                <span>{emotion}</span>
                              </button>
                            );
                          })}
                        </div>

                        {/* Other feeling free-text input */}
                        <div style={{ marginTop: '12px' }}>
                          <label
                            htmlFor="other-feeling-input"
                            style={{
                              display: 'block',
                              fontSize: '0.78rem',
                              fontWeight: 750,
                              color: 'var(--tw-text-muted)',
                              marginBottom: '6px',
                            }}
                          >
                            Other feeling:
                          </label>
                          <input
                            id="other-feeling-input"
                            type="text"
                            value={draft.otherFeeling || ''}
                            onChange={(e) => handleOtherFeelingChange(e.target.value)}
                            placeholder="Describe any emotion not listed (e.g. unheard, exhausted, numb)..."
                            style={{
                              width: '100%',
                              boxSizing: 'border-box',
                              padding: '10px 14px',
                              borderRadius: '10px',
                              border: '2px solid var(--tw-border)',
                              background: 'var(--tw-surface)',
                              color: 'var(--tw-text)',
                              fontSize: '0.88rem',
                              outline: 'none',
                              transition: 'border-color 120ms ease',
                            }}
                          />
                        </div>
                      </div>

                      {/* What do you need most? Picker */}
                      <div>
                        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '8px', flexWrap: 'wrap', gap: '6px' }}>
                          <label
                            style={{
                              display: 'block',
                              fontSize: '0.92rem',
                              fontWeight: 800,
                              color: 'var(--tw-text)',
                            }}
                          >
                            2. What do you need most?
                          </label>
                          <span style={{ fontSize: '0.74rem', color: 'var(--tw-text-muted)', fontWeight: 600 }}>
                            Choose what would help, or describe in your words
                          </span>
                        </div>

                        <div
                          style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                            gap: '8px',
                          }}
                        >
                          {NEED_OPTIONS.map((need) => {
                            const isSelected = draft.selectedNeeds?.includes(need);
                            return (
                              <button
                                key={need}
                                type="button"
                                onClick={() => handleToggleNeed(need)}
                                aria-pressed={isSelected}
                                style={{
                                  padding: '11px 15px',
                                  textAlign: 'left',
                                  borderRadius: '10px',
                                  border: '2px solid var(--tw-border)',
                                  background: isSelected
                                    ? 'var(--tw-primary)'
                                    : 'var(--tw-surface)',
                                  color: isSelected
                                    ? 'var(--tw-primary-text, #ffffff)'
                                    : 'var(--tw-text)',
                                  fontWeight: 750,
                                  fontSize: '0.86rem',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '10px',
                                  boxShadow: isSelected
                                    ? '2.5px 2.5px 0px var(--tw-border)'
                                    : 'none',
                                  transform: isSelected ? 'translate(-1px, -1px)' : 'none',
                                  transition: 'all 120ms ease',
                                }}
                              >
                                <span
                                  style={{
                                    width: '18px',
                                    height: '18px',
                                    borderRadius: '5px',
                                    border: isSelected
                                      ? '2px solid var(--tw-primary-text, #ffffff)'
                                      : '2px solid var(--tw-border)',
                                    background: isSelected
                                      ? 'var(--tw-primary-text, #ffffff)'
                                      : 'transparent',
                                    color: 'var(--tw-primary)',
                                    display: 'grid',
                                    placeItems: 'center',
                                    fontSize: '0.75rem',
                                    fontWeight: 900,
                                    flexShrink: 0,
                                  }}
                                >
                                  {isSelected ? '✓' : ''}
                                </span>
                                <span>{need}</span>
                              </button>
                            );
                          })}
                        </div>

                        {/* Other / Something else free-text */}
                        <div style={{ marginTop: '12px' }}>
                          <label
                            htmlFor="other-need-input"
                            style={{
                              display: 'block',
                              fontSize: '0.78rem',
                              fontWeight: 750,
                              color: 'var(--tw-text-muted)',
                              marginBottom: '6px',
                            }}
                          >
                            Other / Something else (in your own words):
                          </label>
                          <textarea
                            id="other-need-input"
                            value={draft.otherNeed || ''}
                            onChange={(e) => handleOtherNeedChange(e.target.value)}
                            placeholder="Explain what you need in your own words rather than choosing a preset..."
                            rows={2}
                            style={{
                              width: '100%',
                              boxSizing: 'border-box',
                              padding: '10px 14px',
                              borderRadius: '10px',
                              border: '2px solid var(--tw-border)',
                              background: 'var(--tw-surface)',
                              color: 'var(--tw-text)',
                              fontSize: '0.88rem',
                              lineHeight: 1.55,
                              outline: 'none',
                              resize: 'vertical',
                              transition: 'border-color 120ms ease',
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ========================================================
                      STAGE 3: REPHRASE
                     ======================================================== */}
                  {currentStage.id === 'rephrase' && (
                    <div style={{ marginTop: '20px' }}>
                      <label
                        style={{
                          display: 'block',
                          fontSize: '0.88rem',
                          fontWeight: 800,
                          marginBottom: '10px',
                        }}
                      >
                        Select tone framing:
                      </label>

                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(3, 1fr)',
                          gap: '10px',
                          marginBottom: '18px',
                        }}
                      >
                        {(
                          [
                            { id: 'balanced', label: 'Balanced', desc: 'Clear and calm' },
                            { id: 'gentle', label: 'Gentle', desc: 'Soft and connecting' },
                            { id: 'direct', label: 'Direct', desc: 'Firm and concise' },
                          ] as const
                        ).map((t) => {
                          const isSelected = draft.selectedTone === t.id;
                          return (
                            <button
                              key={t.id}
                              type="button"
                              onClick={() => {
                                const newOption = rephraseOptions[t.id];
                                setDraft((prev) => ({
                                  ...prev,
                                  selectedTone: t.id,
                                  customRephrase: newOption,
                                }));
                              }}
                              style={{
                                padding: '12px 14px',
                                textAlign: 'left',
                                borderRadius: '12px',
                                border: '2px solid var(--tw-border)',
                                background: isSelected
                                  ? 'var(--tw-primary)'
                                  : 'var(--tw-surface)',
                                color: isSelected
                                  ? 'var(--tw-primary-text, #ffffff)'
                                  : 'var(--tw-text)',
                                cursor: 'pointer',
                                boxShadow: isSelected
                                  ? '2px 2px 0px var(--tw-border)'
                                  : 'none',
                              }}
                            >
                              <strong style={{ display: 'block', fontSize: '0.88rem' }}>
                                {t.label}
                              </strong>
                              <span
                                style={{
                                  fontSize: '0.72rem',
                                  opacity: 0.85,
                                  fontWeight: 600,
                                }}
                              >
                                {t.desc}
                              </span>
                            </button>
                          );
                        })}
                      </div>

                      <label
                        htmlFor="rephraseInput"
                        style={{
                          display: 'block',
                          fontSize: '0.85rem',
                          fontWeight: 800,
                          marginBottom: '8px',
                        }}
                      >
                        Refined Draft (you can edit directly):
                      </label>

                      <textarea
                        id="rephraseInput"
                        className="tw-textarea"
                        value={activeRefinedText}
                        onChange={(e) => {
                          setDraft((prev) => ({
                            ...prev,
                            customRephrase: e.target.value,
                          }));
                          setValidationError(null);
                        }}
                        style={{
                          width: '100%',
                          minHeight: '140px',
                          boxSizing: 'border-box',
                          lineHeight: 1.55,
                        }}
                      />
                    </div>
                  )}

                  {/* ========================================================
                      STAGE 4: REVIEW
                     ======================================================== */}
                  {currentStage.id === 'review' && (
                    <div style={{ marginTop: '20px' }}>
                      <div
                        style={{
                          padding: '24px',
                          background: 'var(--tw-surface-soft)',
                          border: '2px solid var(--tw-border)',
                          borderRadius: '16px',
                          boxShadow: '3px 3px 0px var(--tw-border)',
                        }}
                      >
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '12px',
                          }}
                        >
                          <span
                            style={{
                              fontSize: '0.7rem',
                              fontWeight: 900,
                              letterSpacing: '0.1em',
                              textTransform: 'uppercase',
                              color: 'var(--tw-primary)',
                            }}
                          >
                            REFINED MESSAGE · READY TO DECIDE
                          </span>

                          <button
                            type="button"
                            onClick={handleCopyMessage}
                            style={{
                              padding: '6px 12px',
                              borderRadius: '8px',
                              border: '1.5px solid var(--tw-border)',
                              background: 'var(--tw-surface)',
                              color: 'var(--tw-text)',
                              font: 'inherit',
                              fontSize: '0.74rem',
                              fontWeight: 800,
                              cursor: 'pointer',
                            }}
                          >
                            {copyFeedback ? '✓ Copied' : 'Copy Text'}
                          </button>
                        </div>

                        <p
                          style={{
                            margin: 0,
                            fontSize: '1.05rem',
                            lineHeight: 1.6,
                            fontWeight: 650,
                            color: 'var(--tw-text)',
                            whiteSpace: 'pre-wrap',
                          }}
                        >
                          {activeRefinedText}
                        </p>
                      </div>

                      {/* Summary of reflection */}
                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(2, 1fr)',
                          gap: '12px',
                          marginTop: '16px',
                        }}
                      >
                        <div
                          style={{
                            padding: '12px 16px',
                            borderRadius: '10px',
                            background: 'var(--tw-surface)',
                            border: '1.5px solid var(--tw-border)',
                          }}
                        >
                          <span
                            style={{
                              display: 'block',
                              fontSize: '0.68rem',
                              fontWeight: 800,
                              color: 'var(--tw-text-muted)',
                            }}
                          >
                            IDENTIFIED EMOTION
                          </span>
                          <strong style={{ fontSize: '0.88rem' }}>
                            {draft.primaryEmotion}
                          </strong>
                        </div>

                        <div
                          style={{
                            padding: '12px 16px',
                            borderRadius: '10px',
                            background: 'var(--tw-surface)',
                            border: '1.5px solid var(--tw-border)',
                          }}
                        >
                          <span
                            style={{
                              display: 'block',
                              fontSize: '0.68rem',
                              fontWeight: 800,
                              color: 'var(--tw-text-muted)',
                            }}
                          >
                            CORE NEED
                          </span>
                          <strong style={{ fontSize: '0.88rem' }}>
                            {draft.coreNeed}
                          </strong>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ========================================================
                      STAGE 5: USER-CONTROLLED DECISION & RECIPIENT FLOW
                     ======================================================== */}
                  {currentStage.id === 'decision' && (
                    <div style={{ marginTop: '20px' }}>

                      {/* SUB-STEP 1: OPTIONS MENU */}
                      {decisionSubStep === 'options' && (
                        <div>
                          <div
                            style={{
                              padding: '18px 22px',
                              background: 'var(--tw-surface-soft)',
                              border: '2px solid var(--tw-border)',
                              borderRadius: '14px',
                              marginBottom: '24px',
                            }}
                          >
                            <span
                              style={{
                                display: 'block',
                                fontSize: '0.68rem',
                                fontWeight: 800,
                                color: 'var(--tw-text-muted)',
                                letterSpacing: '0.08em',
                                textTransform: 'uppercase',
                                marginBottom: '6px',
                              }}
                            >
                              FINAL REVIEWED DRAFT
                            </span>
                            <p
                              style={{
                                margin: 0,
                                fontSize: '0.98rem',
                                lineHeight: 1.55,
                                fontWeight: 650,
                              }}
                            >
                              {activeRefinedText}
                            </p>
                          </div>

                          {havenSaveFeedback && (
                            <div
                              style={{
                                padding: '12px 16px',
                                borderRadius: '10px',
                                background: 'var(--tw-primary-soft)',
                                border: '2px solid var(--tw-primary)',
                                color: 'var(--tw-primary)',
                                fontWeight: 800,
                                fontSize: '0.82rem',
                                marginBottom: '18px',
                              }}
                              role="status"
                            >
                              ✓ {havenSaveFeedback}
                            </div>
                          )}

                          <label
                            style={{
                              display: 'block',
                              fontSize: '0.88rem',
                              fontWeight: 800,
                              marginBottom: '12px',
                            }}
                          >
                            Choose an action:
                          </label>

                          <div style={{ display: 'grid', gap: '12px' }}>
                            {/* Primary Choice: Choose Recipient in Circle */}
                            <button
                              type="button"
                              onClick={() => {
                                setCircleConnections(loadCircleConnections());
                                setDecisionSubStep('select-recipient');
                              }}
                              style={{
                                padding: '18px 20px',
                                borderRadius: '14px',
                                border: '2.5px solid var(--tw-border)',
                                background: 'var(--tw-surface)',
                                color: 'var(--tw-text)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                cursor: 'pointer',
                                boxShadow: '4px 4px 0px var(--tw-border)',
                                textAlign: 'left',
                              }}
                            >
                              <div>
                                <strong
                                  style={{
                                    display: 'block',
                                    fontSize: '1rem',
                                    color: 'var(--tw-primary)',
                                  }}
                                >
                                  👥 Choose Recipient &amp; Send in Two-Way
                                </strong>
                                <span
                                  style={{
                                    fontSize: '0.8rem',
                                    color: 'var(--tw-text-muted)',
                                    fontWeight: 600,
                                  }}
                                >
                                  Select an accepted connection from My Circle and confirm before delivering.
                                </span>
                              </div>
                              <span style={{ fontWeight: 900, fontSize: '0.9rem' }}>
                                Select →
                              </span>
                            </button>

                            {/* Option 2: Copy to Clipboard */}
                            <button
                              type="button"
                              onClick={handleCopyMessage}
                              style={{
                                padding: '14px 20px',
                                borderRadius: '12px',
                                border: '2px solid var(--tw-border)',
                                background: 'var(--tw-surface)',
                                color: 'var(--tw-text)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                cursor: 'pointer',
                                textAlign: 'left',
                              }}
                            >
                              <div>
                                <strong style={{ display: 'block', fontSize: '0.92rem' }}>
                                  📋 Copy to Clipboard
                                </strong>
                                <span
                                  style={{
                                    fontSize: '0.78rem',
                                    color: 'var(--tw-text-muted)',
                                  }}
                                >
                                  Paste it into SMS, email, or your preferred messaging app.
                                </span>
                              </div>
                              <span style={{ fontWeight: 800, fontSize: '0.8rem' }}>
                                {copyFeedback ? '✓ Copied!' : 'Copy'}
                              </span>
                            </button>

                            {/* Option 3: Save to My Haven */}
                            <button
                              type="button"
                              onClick={handleSaveToHaven}
                              style={{
                                padding: '14px 20px',
                                borderRadius: '12px',
                                border: '2px solid var(--tw-border)',
                                background: 'var(--tw-surface)',
                                color: 'var(--tw-text)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                cursor: 'pointer',
                                textAlign: 'left',
                              }}
                            >
                              <div>
                                <strong style={{ display: 'block', fontSize: '0.92rem' }}>
                                  {isParent
                                    ? '🔒 Keep in Private Notes'
                                    : '🔒 Keep in My Haven (Private Thoughts)'}
                                </strong>
                                <span
                                  style={{
                                    fontSize: '0.78rem',
                                    color: 'var(--tw-text-muted)',
                                  }}
                                >
                                  {isParent
                                    ? 'Save to your private unshared notes to reflect on later.'
                                    : 'Save to your private unshared scratchpad to reflect on later.'}
                                </span>
                              </div>
                              <span style={{ fontWeight: 800, fontSize: '0.8rem' }}>
                                Save
                              </span>
                            </button>

                            {/* Option 4: Save as Draft */}
                            <button
                              type="button"
                              onClick={handleSaveCurrentAsDraft}
                              style={{
                                padding: '14px 20px',
                                borderRadius: '12px',
                                border: '2px solid var(--tw-border)',
                                background: 'var(--tw-surface)',
                                color: 'var(--tw-text)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                cursor: 'pointer',
                                textAlign: 'left',
                              }}
                            >
                              <div>
                                <strong style={{ display: 'block', fontSize: '0.92rem' }}>
                                  💾 Keep as Draft
                                </strong>
                                <span
                                  style={{
                                    fontSize: '0.78rem',
                                    color: 'var(--tw-text-muted)',
                                  }}
                                >
                                  Save your progress in Clarity Drafts so you can return anytime.
                                </span>
                              </div>
                              <span style={{ fontWeight: 800, fontSize: '0.8rem' }}>
                                Save Draft
                              </span>
                            </button>
                          </div>

                          <div
                            style={{
                              display: 'flex',
                              justifyContent: 'flex-start',
                              marginTop: '22px',
                            }}
                          >
                            <button
                              type="button"
                              onClick={handleStartNewMessage}
                              style={{
                                padding: '10px 16px',
                                borderRadius: '10px',
                                border: '2px solid var(--tw-border)',
                                background: 'transparent',
                                color: 'var(--tw-text-muted)',
                                font: 'inherit',
                                fontSize: '0.78rem',
                                fontWeight: 800,
                                cursor: 'pointer',
                              }}
                            >
                              Start a new message
                            </button>
                          </div>
                        </div>
                      )}

                      {/* SUB-STEP 2: SELECT RECIPIENT */}
                      {decisionSubStep === 'select-recipient' && (
                        <div>
                          <div
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              marginBottom: '14px',
                            }}
                          >
                            <div>
                              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 900 }}>
                                Choose Recipient from My Circle
                              </h3>
                              <p
                                className="text-secondary"
                                style={{ margin: '4px 0 0 0', fontSize: '0.82rem' }}
                              >
                                Select the accepted connection you want to send this message to.
                              </p>
                            </div>

                            <button
                              type="button"
                              onClick={() => setDecisionSubStep('options')}
                              style={{
                                padding: '6px 12px',
                                borderRadius: '8px',
                                border: '1.5px solid var(--tw-border)',
                                background: 'var(--tw-surface)',
                                fontSize: '0.76rem',
                                fontWeight: 800,
                                cursor: 'pointer',
                              }}
                            >
                              ← Options
                            </button>
                          </div>

                          {circleConnections.length === 0 ? (
                            <div
                              style={{
                                padding: '32px 20px',
                                borderRadius: '14px',
                                border: '2px dashed var(--tw-border)',
                                background: 'var(--tw-surface-soft)',
                                textAlign: 'center',
                              }}
                            >
                              <div style={{ fontSize: '1.8rem', marginBottom: '8px' }}>👥</div>
                              <h4 style={{ margin: '0 0 6px 0', fontSize: '1rem', fontWeight: 900 }}>
                                No eligible Circle connections found
                              </h4>
                              <p
                                className="text-muted"
                                style={{
                                  maxWidth: '440px',
                                  margin: '0 auto 18px auto',
                                  fontSize: '0.84rem',
                                  lineHeight: 1.5,
                                }}
                              >
                                Two-Way requires an accepted mutual connection before messages can be delivered. Add someone to your Circle using their Two-Way ID first.
                              </p>

                              <button
                                type="button"
                                className="tw-button tw-button-primary"
                                onClick={() => navigate(`${baseRoute}/circle/add-id`)}
                              >
                                + Add Connection in My Circle
                              </button>
                            </div>
                          ) : (
                            <div style={{ display: 'grid', gap: '10px' }}>
                              {circleConnections.map((conn) => {
                                const accountInfo = lookupRegisteredAccount(conn.twoWayId);
                                const displayName =
                                  conn.displayName || accountInfo?.displayName || conn.twoWayId;
                                const role = conn.role || accountInfo?.role || 'Circle Connection';
                                const isSelected = selectedRecipient?.twoWayId === conn.twoWayId;

                                return (
                                  <div
                                    key={conn.id || conn.twoWayId}
                                    onClick={() => setSelectedRecipient(conn)}
                                    style={{
                                      padding: '16px 18px',
                                      borderRadius: '12px',
                                      border: isSelected
                                        ? '2.5px solid var(--tw-primary)'
                                        : '2px solid var(--tw-border)',
                                      background: isSelected
                                        ? 'var(--tw-surface-raised)'
                                        : 'var(--tw-surface)',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'space-between',
                                      cursor: 'pointer',
                                      boxShadow: isSelected
                                        ? '3px 3px 0px var(--tw-primary)'
                                        : '2px 2px 0px var(--tw-border)',
                                      transition: 'all 120ms ease',
                                    }}
                                  >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                                      <div
                                        style={{
                                          width: '40px',
                                          height: '40px',
                                          borderRadius: '50%',
                                          background: 'var(--tw-primary-soft)',
                                          border: '2px solid var(--tw-border)',
                                          display: 'grid',
                                          placeItems: 'center',
                                          fontWeight: 900,
                                          fontSize: '1rem',
                                          color: 'var(--tw-primary)',
                                        }}
                                      >
                                        👤
                                      </div>

                                      <div>
                                        <strong style={{ display: 'block', fontSize: '0.96rem' }}>
                                          {displayName}
                                        </strong>
                                        <div
                                          style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px',
                                            marginTop: '3px',
                                          }}
                                        >
                                          <span
                                            style={{
                                              fontSize: '0.72rem',
                                              fontWeight: 700,
                                              color: 'var(--tw-text-muted)',
                                            }}
                                          >
                                            {role}
                                          </span>
                                          <span
                                            style={{
                                              fontSize: '0.72rem',
                                              fontWeight: 800,
                                              color: 'var(--tw-primary)',
                                              letterSpacing: '0.04em',
                                            }}
                                          >
                                            {conn.twoWayId}
                                          </span>
                                        </div>
                                      </div>
                                    </div>

                                    <div
                                      style={{
                                        width: '22px',
                                        height: '22px',
                                        borderRadius: '50%',
                                        border: '2px solid var(--tw-border)',
                                        background: isSelected ? 'var(--tw-primary)' : 'transparent',
                                        display: 'grid',
                                        placeItems: 'center',
                                        color: '#ffffff',
                                        fontSize: '0.75rem',
                                        fontWeight: 900,
                                      }}
                                    >
                                      {isSelected && '✓'}
                                    </div>
                                  </div>
                                );
                              })}

                              <div
                                style={{
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  alignItems: 'center',
                                  marginTop: '16px',
                                }}
                              >
                                <button
                                  type="button"
                                  className="tw-button tw-button-ghost"
                                  onClick={() => setDecisionSubStep('options')}
                                >
                                  ← Cancel
                                </button>

                                <button
                                  type="button"
                                  className="tw-button tw-button-primary"
                                  disabled={!selectedRecipient}
                                  onClick={() => setDecisionSubStep('confirm-send')}
                                  style={{
                                    opacity: selectedRecipient ? 1 : 0.5,
                                    cursor: selectedRecipient ? 'pointer' : 'not-allowed',
                                  }}
                                >
                                  Continue to Confirmation →
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* SUB-STEP 3: CONFIRM & SEND */}
                      {decisionSubStep === 'confirm-send' && selectedRecipient && (
                        <div>
                          <div
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              marginBottom: '14px',
                            }}
                          >
                            <span
                              className="tw-badge"
                              style={{
                                background: 'var(--tw-primary-soft)',
                                color: 'var(--tw-primary)',
                                border: '1.5px solid var(--tw-primary)',
                                fontWeight: 850,
                              }}
                            >
                              STEP 2 OF 2 · FINAL CONFIRMATION
                            </span>

                            <button
                              type="button"
                              onClick={() => setDecisionSubStep('select-recipient')}
                              style={{
                                padding: '6px 12px',
                                borderRadius: '8px',
                                border: '1.5px solid var(--tw-border)',
                                background: 'var(--tw-surface)',
                                fontSize: '0.76rem',
                                fontWeight: 800,
                                cursor: 'pointer',
                              }}
                            >
                              ← Change Recipient
                            </button>
                          </div>

                          <h3 style={{ margin: '0 0 6px 0', fontSize: '1.2rem', fontWeight: 900 }}>
                            Ready to send?
                          </h3>
                          <p
                            className="text-secondary"
                            style={{ margin: '0 0 18px 0', fontSize: '0.84rem' }}
                          >
                            Review the details below. This message will only be sent when you click the confirmation button.
                          </p>

                          {/* RECIPIENT CARD */}
                          <div
                            style={{
                              padding: '16px 20px',
                              background: 'var(--tw-surface)',
                              border: '2px solid var(--tw-border)',
                              borderRadius: '12px',
                              marginBottom: '16px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                            }}
                          >
                            <div>
                              <span
                                style={{
                                  display: 'block',
                                  fontSize: '0.7rem',
                                  fontWeight: 800,
                                  color: 'var(--tw-text-muted)',
                                  textTransform: 'uppercase',
                                }}
                              >
                                DELIVERING TO
                              </span>
                              <strong style={{ fontSize: '1rem' }}>
                                {selectedRecipient.displayName || selectedRecipient.twoWayId}
                              </strong>
                              <span
                                style={{
                                  display: 'block',
                                  fontSize: '0.74rem',
                                  color: 'var(--tw-primary)',
                                  fontWeight: 750,
                                  marginTop: '2px',
                                }}
                              >
                                {selectedRecipient.twoWayId} · {selectedRecipient.role || 'Circle Connection'}
                              </span>
                            </div>

                            <button
                              type="button"
                              onClick={() => setDecisionSubStep('select-recipient')}
                              style={{
                                background: 'none',
                                border: 'none',
                                color: 'var(--tw-primary)',
                                fontWeight: 800,
                                fontSize: '0.78rem',
                                textDecoration: 'underline',
                                cursor: 'pointer',
                              }}
                            >
                              Change
                            </button>
                          </div>

                          {/* MESSAGE QUOTE */}
                          <div
                            style={{
                              padding: '20px',
                              background: 'var(--tw-surface-soft)',
                              border: '2px solid var(--tw-border)',
                              borderRadius: '14px',
                              marginBottom: '18px',
                            }}
                          >
                            <span
                              style={{
                                display: 'block',
                                fontSize: '0.7rem',
                                fontWeight: 900,
                                color: 'var(--tw-text-muted)',
                                letterSpacing: '0.08em',
                                textTransform: 'uppercase',
                                marginBottom: '8px',
                              }}
                            >
                              MESSAGE PREVIEW
                            </span>
                            <p
                              style={{
                                margin: 0,
                                fontSize: '0.98rem',
                                lineHeight: 1.6,
                                color: 'var(--tw-text)',
                                whiteSpace: 'pre-wrap',
                              }}
                            >
                              {activeRefinedText}
                            </p>
                          </div>

                          {/* PRIVACY NOTICE */}
                          <div
                            style={{
                              padding: '14px 18px',
                              background: 'var(--tw-surface-raised)',
                              border: '2px solid var(--tw-border)',
                              borderRadius: '12px',
                              marginBottom: '22px',
                              display: 'flex',
                              gap: '12px',
                              alignItems: 'flex-start',
                            }}
                          >
                            <span style={{ fontSize: '1.2rem' }}>🔒</span>
                            <div>
                              <strong
                                style={{
                                  display: 'block',
                                  fontSize: '0.82rem',
                                  color: 'var(--tw-text)',
                                }}
                              >
                                Strictly Private &amp; Shielded
                              </strong>
                              <p
                                style={{
                                  margin: '3px 0 0 0',
                                  fontSize: '0.78rem',
                                  lineHeight: 1.45,
                                  color: 'var(--tw-text-muted)',
                                }}
                              >
                                Only this specific message will be shared with{' '}
                                {selectedRecipient.displayName || selectedRecipient.twoWayId}. Your
                                drafts, Private Journal, Private Thoughts, and emotional calendar are
                                never shared.
                              </p>
                            </div>
                          </div>

                          {/* ERROR ALERT */}
                          {sendError && (
                            <div
                              style={{
                                padding: '12px 16px',
                                background: 'var(--tw-surface-raised)',
                                border: '2px solid var(--tw-accent-red, #dc2626)',
                                borderRadius: '10px',
                                color: 'var(--tw-accent-red, #dc2626)',
                                fontWeight: 800,
                                fontSize: '0.82rem',
                                marginBottom: '18px',
                              }}
                              role="alert"
                            >
                              {sendError}
                            </div>
                          )}

                          {/* CONFIRMATION ACTIONS */}
                          <div
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              gap: '12px',
                            }}
                          >
                            <button
                              type="button"
                              className="tw-button tw-button-ghost"
                              disabled={isSending}
                              onClick={() => setDecisionSubStep('select-recipient')}
                            >
                              ← Change Recipient or Edit
                            </button>

                            <button
                              type="button"
                              className="tw-button tw-button-primary"
                              disabled={isSending}
                              onClick={handleConfirmSend}
                              style={{
                                minWidth: '180px',
                                opacity: isSending ? 0.7 : 1,
                              }}
                            >
                              {isSending ? 'Sending...' : 'Confirm & Send Message →'}
                            </button>
                          </div>
                        </div>
                      )}

                      {/* SUB-STEP 4: SEND SUCCESS */}
                      {decisionSubStep === 'sent-success' && sentSuccessDetails && (
                        <div style={{ textAlign: 'center', padding: '24px 10px' }}>
                          <div
                            style={{
                              width: '64px',
                              height: '64px',
                              borderRadius: '50%',
                              background: 'var(--tw-primary)',
                              color: 'var(--tw-primary-text, #ffffff)',
                              display: 'grid',
                              placeItems: 'center',
                              fontSize: '2rem',
                              fontWeight: 900,
                              margin: '0 auto 18px auto',
                              boxShadow: '3px 3px 0px var(--tw-border)',
                            }}
                          >
                            ✓
                          </div>

                          <h3 style={{ margin: '0 0 8px 0', fontSize: '1.35rem', fontWeight: 900 }}>
                            Message Sent!
                          </h3>

                          <p
                            className="text-secondary"
                            style={{
                              maxWidth: '480px',
                              margin: '0 auto 28px auto',
                              fontSize: '0.92rem',
                              lineHeight: 1.5,
                            }}
                          >
                            Your refined message has been delivered to{' '}
                            <strong>{sentSuccessDetails.recipientName}</strong> (
                            {sentSuccessDetails.recipientId}).
                          </p>

                          <div
                            style={{
                              display: 'flex',
                              justifyContent: 'center',
                              gap: '14px',
                              flexWrap: 'wrap',
                            }}
                          >
                            <button
                              type="button"
                              className="tw-button tw-button-primary"
                              onClick={() =>
                                navigate(`${baseRoute}/conversations/${sentSuccessDetails.recipientId}`)
                              }
                            >
                              View Conversation →
                            </button>

                            <button
                              type="button"
                              className="tw-button tw-button-ghost"
                              onClick={handleStartNewMessage}
                            >
                              Write another message
                            </button>
                          </div>
                        </div>
                      )}

                    </div>
                  )}

                  {/* VALIDATION ERROR BANNER */}
                  {validationError && (
                    <div
                      style={{
                        marginTop: '16px',
                        padding: '12px 16px',
                        background: 'var(--tw-surface-raised)',
                        border: '2px solid var(--tw-accent-red, #dc2626)',
                        borderRadius: '10px',
                        color: 'var(--tw-accent-red, #dc2626)',
                        fontWeight: 750,
                        fontSize: '0.82rem',
                      }}
                      role="alert"
                    >
                      {validationError}
                    </div>
                  )}

                  {/* ACTION FOOTER */}
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginTop: '24px',
                      paddingTop: '16px',
                      borderTop: '2px solid var(--tw-border)',
                    }}
                  >
                    <button
                      type="button"
                      className="tw-button tw-button-ghost"
                      onClick={handleBack}
                    >
                      {currentStageIndex === 0 ? '← Exit' : '← Back'}
                    </button>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <button
                        type="button"
                        onClick={handleSaveCurrentAsDraft}
                        style={{
                          padding: '8px 16px',
                          borderRadius: '10px',
                          border: '2px solid var(--tw-border)',
                          background: 'transparent',
                          color: 'var(--tw-text)',
                          fontSize: '0.8rem',
                          fontWeight: 800,
                          cursor: 'pointer',
                        }}
                      >
                        Save Progress
                      </button>

                      {currentStage.id !== 'decision' && (
                        <button
                          type="button"
                          className="tw-button tw-button-primary"
                          onClick={handleContinue}
                        >
                          Continue →
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </motion.section>
            </AnimatePresence>
          </>
        )}

        {/* DELETE DRAFT CONFIRMATION MODAL */}
        {draftToDelete && (
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
                Delete this draft?
              </h3>
              <p
                style={{
                  fontSize: '0.88rem',
                  lineHeight: 1.5,
                  color: 'var(--tw-text-muted)',
                  margin: '0 0 20px 0',
                }}
              >
                This will permanently remove this unsent message progress from your device.
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
                  onClick={() => setDraftToDelete(null)}
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
                  onClick={handleConfirmDeleteDraft}
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
                  Delete Draft
                </button>
              </div>
            </div>
          </div>
        )}

        {/* PRIVACY FOOTER */}
        <section
          style={{
            marginTop: '24px',
            paddingBottom: '30px',
          }}
        >
          <p
            className="text-muted"
            style={{
              fontSize: '0.78rem',
              textAlign: 'center',
            }}
          >
            Your drafts stay private on this device until you explicitly confirm and send them.
          </p>
        </section>

      </div>
    </main>
  );
}