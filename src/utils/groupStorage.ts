import { getCurrentUserTwoWayId, loadCircleConnections, normalizeTwoWayId } from './circleStorage';
import { canAccessGroupConversations } from './subscriptionStorage';

export interface GroupConversation {
  id: string; // group_...
  name: string;
  creatorTwoWayId: string;
  participants: string[]; // Two-Way IDs of members (including creator)
  createdAt: string;
}

export interface GroupMessage {
  id: string;
  groupId: string;
  senderTwoWayId: string;
  text: string;
  timestamp: string;
}

export const STORAGE_KEY_GROUP_CONVERSATIONS = 'twoway_group_conversations';
export const STORAGE_KEY_GROUP_MESSAGES = 'twoway_group_messages';

export function loadGroupConversations(): GroupConversation[] {
  if (typeof localStorage === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY_GROUP_CONVERSATIONS);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    const myId = getCurrentUserTwoWayId();
    return parsed.filter(
      (g) =>
        g &&
        Array.isArray(g.participants) &&
        (g.creatorTwoWayId === myId || g.participants.includes(myId)),
    );
  } catch (err) {
    console.error('Failed to load group conversations:', err);
    return [];
  }
}

export function saveGroupConversations(groups: GroupConversation[]): void {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY_GROUP_CONVERSATIONS, JSON.stringify(groups));
  } catch (err) {
    console.error('Failed to save group conversations:', err);
  }
}

export function loadGroupMessages(groupId: string): GroupMessage[] {
  if (typeof localStorage === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY_GROUP_MESSAGES);
    if (!raw) return [];
    const all: GroupMessage[] = JSON.parse(raw);
    const myId = getCurrentUserTwoWayId();
    const groups = loadGroupConversations();
    const targetGroup = groups.find((g) => g.id === groupId);
    if (!targetGroup || (!targetGroup.participants.includes(myId) && targetGroup.creatorTwoWayId !== myId)) {
      return [];
    }
    return all.filter((m) => m.groupId === groupId);
  } catch (err) {
    console.error('Failed to load group messages:', err);
    return [];
  }
}

export function createGroupConversation(
  name: string,
  participantIds: string[],
): { success: boolean; group?: GroupConversation; error?: string; upgradeRequired?: boolean } {
  try {
    if (!canAccessGroupConversations()) {
      return {
        success: false,
        error: 'Group conversations are a paid feature. Please upgrade to Two-Way Family or Circle Plus.',
        upgradeRequired: true,
      };
    }

    const cleanName = name.trim();
    if (!cleanName) {
      return { success: false, error: 'Group name cannot be empty.' };
    }

    const myId = getCurrentUserTwoWayId();
    const connections = loadCircleConnections();
    const authorizedIds = new Set(connections.map((c) => normalizeTwoWayId(c.twoWayId)));

    const validParticipants: string[] = [myId];
    for (const pId of participantIds) {
      const norm = normalizeTwoWayId(pId);
      if (norm && norm !== myId && authorizedIds.has(norm) && !validParticipants.includes(norm)) {
        validParticipants.push(norm);
      }
    }

    if (validParticipants.length < 2) {
      return { success: false, error: 'A group conversation requires at least one other participant from your connected circle.' };
    }

    const allGroupsRaw = localStorage.getItem(STORAGE_KEY_GROUP_CONVERSATIONS);
    const allGroups: GroupConversation[] = allGroupsRaw ? JSON.parse(allGroupsRaw) : [];

    const newGroup: GroupConversation = {
      id: `group_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      name: cleanName,
      creatorTwoWayId: myId,
      participants: validParticipants,
      createdAt: new Date().toISOString(),
    };

    allGroups.push(newGroup);
    localStorage.setItem(STORAGE_KEY_GROUP_CONVERSATIONS, JSON.stringify(allGroups));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('twoway-groups-updated'));
    }

    return { success: true, group: newGroup };
  } catch (err) {
    console.error('Failed to create group conversation:', err);
    return { success: false, error: 'Storage error while creating group conversation.' };
  }
}

export function sendGroupMessage(
  groupId: string,
  text: string,
): { success: boolean; message?: GroupMessage; error?: string; upgradeRequired?: boolean } {
  try {
    if (!canAccessGroupConversations()) {
      return {
        success: false,
        error: 'Group conversations are a paid feature. Please upgrade to Two-Way Family or Circle Plus.',
        upgradeRequired: true,
      };
    }

    const cleanText = text.trim();
    if (!cleanText) {
      return { success: false, error: 'Message cannot be empty.' };
    }

    const myId = getCurrentUserTwoWayId();
    const groupsRaw = localStorage.getItem(STORAGE_KEY_GROUP_CONVERSATIONS);
    const allGroups: GroupConversation[] = groupsRaw ? JSON.parse(groupsRaw) : [];
    const targetGroup = allGroups.find((g) => g.id === groupId);

    if (!targetGroup || (!targetGroup.participants.includes(myId) && targetGroup.creatorTwoWayId !== myId)) {
      return { success: false, error: 'Unauthorized: You are not a member of this group conversation.' };
    }

    const msgRaw = localStorage.getItem(STORAGE_KEY_GROUP_MESSAGES);
    const allMessages: GroupMessage[] = msgRaw ? JSON.parse(msgRaw) : [];

    const newMsg: GroupMessage = {
      id: `gmsg_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      groupId,
      senderTwoWayId: myId,
      text: cleanText,
      timestamp: new Date().toISOString(),
    };

    allMessages.push(newMsg);
    localStorage.setItem(STORAGE_KEY_GROUP_MESSAGES, JSON.stringify(allMessages));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('twoway-group-messages-updated', { detail: { groupId } }));
    }

    return { success: true, message: newMsg };
  } catch (err) {
    console.error('Failed to send group message:', err);
    return { success: false, error: 'Storage error while sending group message.' };
  }
}

export function addGroupMember(
  groupId: string,
  participantId: string,
): { success: boolean; error?: string; upgradeRequired?: boolean } {
  try {
    if (!canAccessGroupConversations()) {
      return {
        success: false,
        error: 'Group conversations are a paid feature. Please upgrade to Two-Way Family or Circle Plus.',
        upgradeRequired: true,
      };
    }
    const myId = getCurrentUserTwoWayId();
    const normParticipant = normalizeTwoWayId(participantId);
    if (!normParticipant) return { success: false, error: 'Invalid participant ID.' };

    const groupsRaw = localStorage.getItem(STORAGE_KEY_GROUP_CONVERSATIONS);
    const allGroups: GroupConversation[] = groupsRaw ? JSON.parse(groupsRaw) : [];
    const index = allGroups.findIndex((g) => g.id === groupId);
    if (index < 0) return { success: false, error: 'Group conversation not found.' };

    const group = allGroups[index];
    if (!group.participants.includes(myId) && group.creatorTwoWayId !== myId) {
      return { success: false, error: 'Unauthorized: Only group members can add participants.' };
    }

    const connections = loadCircleConnections();
    const isConnected = connections.some((c) => normalizeTwoWayId(c.twoWayId) === normParticipant);
    if (!isConnected && group.creatorTwoWayId !== normParticipant) {
      return { success: false, error: 'Participant must be in your authorized circle connections.' };
    }

    if (group.participants.includes(normParticipant)) {
      return { success: false, error: 'User is already a participant in this group.' };
    }

    group.participants.push(normParticipant);
    allGroups[index] = group;
    localStorage.setItem(STORAGE_KEY_GROUP_CONVERSATIONS, JSON.stringify(allGroups));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('twoway-groups-updated'));
    }

    return { success: true };
  } catch (err) {
    console.error('Failed to add group member:', err);
    return { success: false, error: 'Storage error while adding group member.' };
  }
}

export function removeGroupMember(
  groupId: string,
  participantId: string,
): { success: boolean; error?: string } {
  try {
    const myId = getCurrentUserTwoWayId();
    const normParticipant = normalizeTwoWayId(participantId);

    const groupsRaw = localStorage.getItem(STORAGE_KEY_GROUP_CONVERSATIONS);
    const allGroups: GroupConversation[] = groupsRaw ? JSON.parse(groupsRaw) : [];
    const index = allGroups.findIndex((g) => g.id === groupId);
    if (index < 0) return { success: false, error: 'Group conversation not found.' };

    const group = allGroups[index];
    if (group.creatorTwoWayId !== myId && myId !== normParticipant) {
      return { success: false, error: 'Unauthorized: Only the group creator or yourself can remove membership.' };
    }

    group.participants = group.participants.filter((p) => p !== normParticipant);
    allGroups[index] = group;
    localStorage.setItem(STORAGE_KEY_GROUP_CONVERSATIONS, JSON.stringify(allGroups));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('twoway-groups-updated'));
    }

    return { success: true };
  } catch (err) {
    console.error('Failed to remove group member:', err);
    return { success: false, error: 'Storage error while removing group member.' };
  }
}
