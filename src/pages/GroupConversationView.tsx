import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import ParentLayout from '../layouts/ParentLayout';
import TeenLayout from '../layouts/TeenLayout';
import {
  loadGroupConversations,
  loadGroupMessages,
  sendGroupMessage,
  addGroupMember,
  removeGroupMember,
  type GroupConversation,
  type GroupMessage,
} from '../utils/groupStorage';
import {
  getCurrentUserTwoWayId,
  loadCircleConnections,
  lookupRegisteredAccount,
} from '../utils/circleStorage';
import UpgradeModal from '../components/UpgradeModal';
import { canAccessGroupConversations } from '../utils/subscriptionStorage';

export default function GroupConversationView() {
  const navigate = useNavigate();
  const location = useLocation();
  const { groupId } = useParams();

  const isParent = location.pathname.startsWith('/app/parent');
  const baseRoute = isParent ? '/app/parent/circle' : '/app/teen/circle';
  const Layout = isParent ? ParentLayout : TeenLayout;

  const currentUserId = getCurrentUserTwoWayId();

  const [groups, setGroups] = useState<GroupConversation[]>(() => loadGroupConversations());
  const currentGroup = groups.find((g) => g.id === groupId);

  const [messages, setMessages] = useState<GroupMessage[]>(() =>
    groupId ? loadGroupMessages(groupId) : [],
  );
  const [messageText, setMessageText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showManageModal, setShowManageModal] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [selectedConnectionToAdd, setSelectedConnectionToAdd] = useState('');

  const circleConnections = loadCircleConnections();
  const hasGroupAccess = canAccessGroupConversations();

  useEffect(() => {
    const handleUpdate = () => {
      const updatedGroups = loadGroupConversations();
      setGroups(updatedGroups);
      if (groupId) {
        setMessages(loadGroupMessages(groupId));
      }
    };
    window.addEventListener('twoway-groups-updated', handleUpdate);
    window.addEventListener('twoway-group-messages-updated', handleUpdate);
    window.addEventListener('twoway-subscription-updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('twoway-groups-updated', handleUpdate);
      window.removeEventListener('twoway-group-messages-updated', handleUpdate);
      window.removeEventListener('twoway-subscription-updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, [groupId]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!groupId || !messageText.trim()) return;

    if (!canAccessGroupConversations()) {
      setShowUpgradeModal(true);
      return;
    }

    const res = sendGroupMessage(groupId, messageText.trim());
    if (res.success && res.message) {
      setMessages((prev) => [...prev, res.message!]);
      setMessageText('');
    } else {
      if (res.upgradeRequired) {
        setShowUpgradeModal(true);
      } else {
        setError(res.error || 'Failed to send message.');
      }
    }
  };

  const handleAddMember = () => {
    setError(null);
    setSuccess(null);
    if (!groupId || !selectedConnectionToAdd) {
      setError('Please select a connection to add.');
      return;
    }

    if (!canAccessGroupConversations()) {
      setShowUpgradeModal(true);
      return;
    }

    const res = addGroupMember(groupId, selectedConnectionToAdd);
    if (res.success) {
      setSuccess('Participant added successfully.');
      setSelectedConnectionToAdd('');
      setGroups(loadGroupConversations());
      setTimeout(() => setSuccess(null), 3000);
    } else {
      if (res.upgradeRequired) {
        setShowUpgradeModal(true);
      } else {
        setError(res.error || 'Could not add participant.');
      }
    }
  };

  const handleRemoveMember = (participantId: string) => {
    setError(null);
    setSuccess(null);
    if (!groupId) return;

    const res = removeGroupMember(groupId, participantId);
    if (res.success) {
      setSuccess('Participant removed.');
      setGroups(loadGroupConversations());
      setTimeout(() => setSuccess(null), 3000);
    } else {
      setError(res.error || 'Could not remove participant.');
    }
  };

  if (!hasGroupAccess) {
    return (
      <Layout>
        <div style={{ maxWidth: '600px', margin: '40px auto', padding: '32px 20px', textAlign: 'center' }}>
          <div
            style={{
              background: isParent ? 'var(--parent-surface, #FFFFFF)' : 'var(--tw-surface, #FAF9F2)',
              border: isParent ? '2px solid var(--parent-border-strong, #000000)' : '2.5px solid var(--tw-border, #282436)',
              borderRadius: isParent ? '12px' : '16px',
              padding: '32px 24px',
              boxShadow: isParent ? '0 4px 18px rgba(0,0,0,0.06)' : '4px 4px 0px var(--tw-border)',
            }}
          >
            <span
              style={{
                display: 'inline-block',
                fontSize: '0.65rem',
                fontWeight: 850,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: isParent ? 'var(--parent-accent, #7C3AED)' : 'var(--tw-primary, #6D46D4)',
                background: isParent ? 'var(--parent-accent-soft, #EDE9FE)' : 'var(--tw-primary-soft, #EBE7FE)',
                padding: '4px 10px',
                borderRadius: '4px',
                border: isParent ? '1px solid var(--parent-accent, #7C3AED)' : '1px solid var(--tw-border)',
                marginBottom: '14px',
              }}
            >
              PAID SUBSCRIPTION REQUIRED
            </span>

            <h2 style={{ fontSize: '1.45rem', fontWeight: 850, margin: '0 0 10px' }}>
              Group Conversations Require an Eligible Plan
            </h2>

            <p style={{ fontSize: '0.92rem', color: isParent ? '#666666' : 'var(--tw-text-muted)', lineHeight: 1.6, margin: '0 0 24px' }}>
              Multi-participant family and circle group messaging is exclusive to Two-Way Family and Two-Way Circle Plus plans. Free Core accounts include full one-to-one messaging and perspective tools.
            </p>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                type="button"
                className={isParent ? 'parent-btn-primary' : 'tw-button tw-button-primary'}
                onClick={() => setShowUpgradeModal(true)}
                style={{ padding: '12px 24px', fontSize: '0.9rem' }}
              >
                Upgrade to Two-Way Family →
              </button>

              <button
                type="button"
                className={isParent ? 'parent-btn-secondary' : 'tw-button'}
                onClick={() => navigate(baseRoute)}
                style={{ padding: '12px 20px', fontSize: '0.9rem' }}
              >
                Return to Circle
              </button>
            </div>
          </div>

          <UpgradeModal
            isOpen={showUpgradeModal}
            onClose={() => setShowUpgradeModal(false)}
            isParent={isParent}
            featureName="Group Conversations"
          />
        </div>
      </Layout>
    );
  }

  if (!currentGroup) {
    return (
      <Layout>
        <div style={{ padding: '40px 20px', textAlign: 'center' }}>
          <h2>Group conversation not found or access denied.</h2>
          <button
            type="button"
            className="tw-button tw-button-primary"
            onClick={() => navigate(baseRoute)}
            style={{ marginTop: '16px' }}
          >
            Return to Circle
          </button>
        </div>
      </Layout>
    );
  }

  const isCreator = currentGroup.creatorTwoWayId === currentUserId;

  return (
    <Layout>
      <div className={isParent ? 'parent-dashboard' : 'conversation-view-page'} style={{ maxWidth: '900px', margin: '0 auto', paddingBottom: '40px' }}>
        
        {/* HEADER */}
        <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <button
              type="button"
              className={isParent ? 'parent-back-btn' : 'conversation-view-back'}
              aria-label="Go back"
              title="Go back"
              onClick={() => {
                if (window.history.length > 1) {
                  navigate(-1);
                } else {
                  navigate(baseRoute);
                }
              }}
            >
              {isParent ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
              ) : (
                '←'
              )}
            </button>
            <div>
              <span className={isParent ? 'parent-card-label' : ''} style={{ fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', opacity: 0.7 }}>
                FAMILY & CIRCLE GROUP CONVERSATION
              </span>
              <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 850 }}>{currentGroup.name}</h1>
            </div>
          </div>

          <button
            type="button"
            className={isParent ? 'parent-btn-secondary' : 'tw-button'}
            onClick={() => setShowManageModal(!showManageModal)}
            style={{ fontSize: '0.84rem', padding: '8px 16px' }}
          >
            👥 Participants ({currentGroup.participants.length}) {showManageModal ? '▲' : '▼'}
          </button>
        </header>

        {/* ERROR / SUCCESS FEEDBACK */}
        {error && (
          <div style={{ marginBottom: '16px', padding: '12px 16px', borderRadius: '8px', background: '#FFEEEE', color: '#CC0000', border: '1px solid #FFCCCC', fontSize: '0.88rem', fontWeight: 600 }}>
            {error}
          </div>
        )}
        {success && (
          <div style={{ marginBottom: '16px', padding: '12px 16px', borderRadius: '8px', background: '#EEFFEE', color: '#008800', border: '1px solid #CCFFCC', fontSize: '0.88rem', fontWeight: 600 }}>
            {success}
          </div>
        )}

        {/* MANAGE PARTICIPANTS PANEL */}
        {showManageModal && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            style={{
              marginBottom: '24px',
              padding: '20px',
              borderRadius: '12px',
              border: isParent ? '1.5px solid #000000' : '1.5px solid var(--tw-border)',
              background: isParent ? '#FAFAFA' : 'var(--tw-card-bg, #FFFFFF)',
            }}
          >
            <h3 style={{ margin: '0 0 12px', fontSize: '1.05rem', fontWeight: 800 }}>Group Details & Participants</h3>
            <p style={{ margin: '0 0 16px', fontSize: '0.85rem', color: '#666666' }}>
              Created by {currentGroup.creatorTwoWayId === currentUserId ? 'You' : currentGroup.creatorTwoWayId} on {new Date(currentGroup.createdAt).toLocaleDateString()}. Group conversations are included in your subscription without separate per-group fees.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
              {currentGroup.participants.map((pId) => {
                const account = lookupRegisteredAccount(pId);
                const isMe = pId === currentUserId;
                return (
                  <div
                    key={pId}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: '1px solid #E5E5E5',
                      background: '#FFFFFF',
                    }}
                  >
                    <div>
                      <strong style={{ fontSize: '0.9rem', color: '#000000' }}>
                        {account?.displayName || pId} {isMe && '(You)'}
                      </strong>
                      <span style={{ display: 'block', fontSize: '0.78rem', color: '#666666' }}>
                        {pId} · {account?.role || 'Member'}
                      </span>
                    </div>

                    {(isCreator || isMe) && !isCreator && pId === currentUserId && (
                      <button
                        type="button"
                        onClick={() => handleRemoveMember(pId)}
                        style={{ background: 'transparent', border: 'none', color: '#CC0000', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer' }}
                      >
                        Leave Group
                      </button>
                    )}
                    {isCreator && !isMe && (
                      <button
                        type="button"
                        onClick={() => handleRemoveMember(pId)}
                        style={{ background: 'transparent', border: 'none', color: '#CC0000', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer' }}
                      >
                        Remove
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            {/* ADD PARTICIPANT FORM */}
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
              <select
                value={selectedConnectionToAdd}
                onChange={(e) => setSelectedConnectionToAdd(e.target.value)}
                style={{
                  flex: 1,
                  padding: '10px 14px',
                  borderRadius: '8px',
                  border: '1.5px solid #000000',
                  background: '#FFFFFF',
                  fontSize: '0.88rem',
                }}
              >
                <option value="">Select from authorized connections to add...</option>
                {circleConnections
                  .filter((c) => !currentGroup.participants.includes(c.twoWayId))
                  .map((c) => (
                    <option key={c.twoWayId} value={c.twoWayId}>
                      {c.displayName || c.twoWayId} ({c.twoWayId})
                    </option>
                  ))}
              </select>
              <button
                type="button"
                className={isParent ? 'parent-btn-primary' : 'tw-button tw-button-primary'}
                onClick={handleAddMember}
                style={{ padding: '10px 18px', fontSize: '0.86rem' }}
              >
                Add Member
              </button>
            </div>
          </motion.div>
        )}

        {/* CONVERSATION BOX */}
        <div
          style={{
            border: isParent ? '1.5px solid #000000' : '1.5px solid var(--tw-border)',
            borderRadius: '12px',
            background: isParent ? '#FFFFFF' : 'var(--tw-card-bg, #FFFFFF)',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            minHeight: '460px',
          }}
        >
          {/* NOTICE */}
          <div style={{ padding: '12px 20px', background: isParent ? '#FAFAFA' : 'rgba(0,0,0,0.03)', borderBottom: '1px solid #E5E5E5' }}>
            <p style={{ margin: 0, fontSize: '0.82rem', color: '#666666', lineHeight: 1.5 }}>
              🔒 Secure Group Conversation. Messages sent here are visible to all current group members only. Private journals and personal thoughts are never exposed.
            </p>
          </div>

          {/* MESSAGES LIST */}
          <div style={{ flex: 1, padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', overflowY: 'auto' }}>
            {messages.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '50px 20px', color: '#666666' }}>
                <p style={{ margin: '0 0 8px', fontSize: '1rem', fontWeight: 700, color: '#000000' }}>
                  No messages in {currentGroup.name} yet.
                </p>
                <span style={{ fontSize: '0.85rem' }}>
                  Start the family or circle conversation by sending a message below.
                </span>
              </div>
            ) : (
              messages.map((msg) => {
                const isMe = msg.senderTwoWayId === currentUserId;
                const senderAccount = lookupRegisteredAccount(msg.senderTwoWayId);
                const senderName = senderAccount?.displayName || msg.senderTwoWayId;
                return (
                  <div
                    key={msg.id}
                    style={{
                      alignSelf: isMe ? 'flex-end' : 'flex-start',
                      maxWidth: '75%',
                      padding: '14px 18px',
                      borderRadius: '10px',
                      background: isMe ? (isParent ? '#000000' : 'var(--tw-primary, #6366f1)') : '#F2F2F2',
                      color: isMe ? '#FFFFFF' : '#000000',
                      border: isMe ? 'none' : '1px solid #E5E5E5',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', marginBottom: '6px' }}>
                      <span style={{ fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.06em', opacity: 0.85 }}>
                        {isMe ? 'YOU' : senderName}
                      </span>
                      <span style={{ fontSize: '0.68rem', opacity: 0.7 }}>
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p style={{ margin: 0, fontSize: '0.94rem', lineHeight: 1.55, wordBreak: 'break-word' }}>{msg.text}</p>
                  </div>
                );
              })
            )}
          </div>

          {/* INPUT FORM */}
          <div style={{ padding: '16px 20px', borderTop: '1px solid #E5E5E5', background: isParent ? '#FAFAFA' : 'rgba(0,0,0,0.02)' }}>
            <form onSubmit={handleSend} style={{ display: 'flex', gap: '10px' }}>
              <input
                type="text"
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder={`Message ${currentGroup.name}...`}
                style={{
                  flex: 1,
                  padding: '12px 16px',
                  borderRadius: '8px',
                  border: '1.5px solid #000000',
                  background: '#FFFFFF',
                  color: '#000000',
                  fontSize: '0.92rem',
                  outline: 'none',
                }}
              />
              <button
                type="submit"
                className={isParent ? 'parent-btn-primary' : 'tw-button tw-button-primary'}
                disabled={!messageText.trim()}
                style={{ padding: '10px 22px', fontSize: '0.9rem' }}
              >
                Send →
              </button>
            </form>
          </div>
        </div>

      </div>
    </Layout>
  );
}
