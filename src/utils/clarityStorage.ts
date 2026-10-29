import { getCurrentUserTwoWayId, normalizeTwoWayId } from './circleStorage';

export type ClarityStage = 'express' | 'understand' | 'rephrase' | 'review' | 'decision';

export interface ClaritySavedDraft {
  id: string;
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
  recipientTwoWayId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DirectMessage {
  id: string;
  conversationId: string; // canonical peer Two-Way ID
  senderTwoWayId: string;
  recipientTwoWayId: string;
  text: string;
  timestamp: string;
}

export const STORAGE_KEY_CLARITY_DRAFTS = 'twoway_clarity_saved_drafts';
export const STORAGE_KEY_ACTIVE_DRAFT = 'twoway_clarity_draft';
export const STORAGE_KEY_DIRECT_MESSAGES = 'twoway_direct_messages';

/**
 * Format ISO date for human display.
 */
export function formatDraftDate(isoString: string): string {
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

/**
 * Load all saved drafts for the user, ordered newest first.
 * Never loads sample or mock data; strictly reflects user storage.
 */
export function loadSavedDrafts(): ClaritySavedDraft[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CLARITY_DRAFTS);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed
      .filter((d) => d && typeof d.id === 'string')
      .sort((a, b) => {
        const timeA = new Date(a.updatedAt || a.createdAt).getTime();
        const timeB = new Date(b.updatedAt || b.createdAt).getTime();
        return timeB - timeA;
      });
  } catch (err) {
    console.error('Failed to load saved Clarity drafts:', err);
    return [];
  }
}

/**
 * Persist or update a Clarity draft.
 * If draft.id is provided and already exists, updates in-place to avoid duplicates.
 */
export function saveDraft(
  draftData: {
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
    recipientTwoWayId?: string;
    createdAt?: string;
  },
): { success: boolean; draft: ClaritySavedDraft; error?: string } {
  try {
    const existing = loadSavedDrafts();
    const nowIso = new Date().toISOString();

    if (draftData.id) {
      // Find and update existing draft
      const index = existing.findIndex((d) => d.id === draftData.id);
      if (index >= 0) {
        const target = existing[index];
        const updated: ClaritySavedDraft = {
          ...target,
          expressText: draftData.expressText,
          primaryEmotion: draftData.primaryEmotion,
          coreNeed: draftData.coreNeed,
          selectedFeelings: draftData.selectedFeelings ?? target.selectedFeelings,
          otherFeeling: draftData.otherFeeling ?? target.otherFeeling,
          selectedNeeds: draftData.selectedNeeds ?? target.selectedNeeds,
          otherNeed: draftData.otherNeed ?? target.otherNeed,
          selectedTone: draftData.selectedTone,
          rephrasedText: draftData.rephrasedText,
          customRephrase: draftData.customRephrase,
          stage: draftData.stage,
          recipientTwoWayId: draftData.recipientTwoWayId ?? target.recipientTwoWayId,
          updatedAt: nowIso,
        };
        existing[index] = updated;
        localStorage.setItem(STORAGE_KEY_CLARITY_DRAFTS, JSON.stringify(existing));
        window.dispatchEvent(new CustomEvent('twoway-clarity-drafts-updated'));
        return { success: true, draft: updated };
      }
    }

    // Creating new draft
    const newId = draftData.id || `draft_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const newDraft: ClaritySavedDraft = {
      id: newId,
      expressText: draftData.expressText,
      primaryEmotion: draftData.primaryEmotion,
      coreNeed: draftData.coreNeed,
      selectedFeelings: draftData.selectedFeelings,
      otherFeeling: draftData.otherFeeling,
      selectedNeeds: draftData.selectedNeeds,
      otherNeed: draftData.otherNeed,
      selectedTone: draftData.selectedTone,
      rephrasedText: draftData.rephrasedText,
      customRephrase: draftData.customRephrase,
      stage: draftData.stage,
      recipientTwoWayId: draftData.recipientTwoWayId,
      createdAt: draftData.createdAt || nowIso,
      updatedAt: nowIso,
    };

    const updatedList = [newDraft, ...existing];
    localStorage.setItem(STORAGE_KEY_CLARITY_DRAFTS, JSON.stringify(updatedList));
    window.dispatchEvent(new CustomEvent('twoway-clarity-drafts-updated'));
    return { success: true, draft: newDraft };
  } catch (err) {
    console.error('Failed to save Clarity draft:', err);
    return {
      success: false,
      draft: null as unknown as ClaritySavedDraft,
      error: 'Unable to write draft to storage.',
    };
  }
}

/**
 * Permanently delete a saved draft.
 */
export function deleteDraft(draftId: string): boolean {
  try {
    const existing = loadSavedDrafts();
    const filtered = existing.filter((d) => d.id !== draftId);
    localStorage.setItem(STORAGE_KEY_CLARITY_DRAFTS, JSON.stringify(filtered));
    window.dispatchEvent(new CustomEvent('twoway-clarity-drafts-updated'));
    return true;
  } catch (err) {
    console.error('Failed to delete Clarity draft:', err);
    return false;
  }
}

/**
 * Load all messages in a conversation with a specific peer.
 */
export function loadMessagesForConversation(conversationId: string): DirectMessage[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY_DIRECT_MESSAGES);
    if (!raw) return [];
    const all: DirectMessage[] = JSON.parse(raw);
    const normalizedTarget = normalizeTwoWayId(conversationId);

    return all.filter((m) => {
      const matchConv = normalizeTwoWayId(m.conversationId) === normalizedTarget;
      const matchRecipient = normalizeTwoWayId(m.recipientTwoWayId) === normalizedTarget;
      const matchSender = normalizeTwoWayId(m.senderTwoWayId) === normalizedTarget;
      return matchConv || matchRecipient || matchSender;
    });
  } catch (err) {
    console.error('Failed to load direct messages:', err);
    return [];
  }
}

/**
 * Send a direct message to an accepted Circle connection.
 * Sends strictly to that specific peer; sender's journals, thoughts, and mood remain shielded.
 */
export function sendDirectMessage(
  recipientTwoWayId: string,
  text: string,
): { success: boolean; message?: DirectMessage; error?: string } {
  try {
    const cleanText = text.trim();
    if (!cleanText) {
      return { success: false, error: 'Message cannot be empty.' };
    }

    const senderId = getCurrentUserTwoWayId();
    const normalizedRecipient = normalizeTwoWayId(recipientTwoWayId);

    const raw = localStorage.getItem(STORAGE_KEY_DIRECT_MESSAGES);
    const allMessages: DirectMessage[] = raw ? JSON.parse(raw) : [];

    const newMsg: DirectMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      conversationId: normalizedRecipient,
      senderTwoWayId: senderId,
      recipientTwoWayId: normalizedRecipient,
      text: cleanText,
      timestamp: new Date().toISOString(),
    };

    allMessages.push(newMsg);
    localStorage.setItem(STORAGE_KEY_DIRECT_MESSAGES, JSON.stringify(allMessages));
    window.dispatchEvent(new CustomEvent('twoway-messages-updated', { detail: { conversationId: normalizedRecipient } }));

    return { success: true, message: newMsg };
  } catch (err) {
    console.error('Failed to send direct message:', err);
    return { success: false, error: 'A storage error occurred while sending the message.' };
  }
}
