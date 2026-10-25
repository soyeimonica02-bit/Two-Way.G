import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import ParentLayout from '../layouts/ParentLayout';
import TeenLayout from '../layouts/TeenLayout';
import {
  loadMessagesForConversation,
  sendDirectMessage,
  type DirectMessage,
} from '../utils/clarityStorage';
import {
  loadCircleConnections,
  lookupRegisteredAccount,
  getCurrentUserTwoWayId,
} from '../utils/circleStorage';

function ConversationView() {
  const navigate = useNavigate();
  const location = useLocation();
  const { conversationId } = useParams();
  const peerId = conversationId || 'direct';

  const isParent = location.pathname.startsWith('/app/parent');
  const baseConversationsRoute = isParent
    ? '/app/parent/circle'
    : '/app/teen/conversations';
  const Layout = isParent ? ParentLayout : TeenLayout;

  const currentUserId = getCurrentUserTwoWayId();

  // Peer identification
  const peerAccount = lookupRegisteredAccount(peerId);
  const connections = loadCircleConnections();
  const matchedConnection = connections.find(
    (c) => c.twoWayId === peerId || c.id === peerId,
  );
  const peerDisplayName =
    matchedConnection?.displayName ||
    peerAccount?.displayName ||
    (peerId === 'direct' ? 'Two-Way Conversation' : peerId);

  const initialMsg =
    (location.state as { initialMessage?: string } | null)?.initialMessage || '';

  const [messageText, setMessageText] = useState(initialMsg);
  const [messages, setMessages] = useState<DirectMessage[]>(() =>
    loadMessagesForConversation(peerId),
  );

  useEffect(() => {
    const handleUpdate = () => {
      setMessages(loadMessagesForConversation(peerId));
    };
    window.addEventListener('twoway-messages-updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('twoway-messages-updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, [peerId]);

  const handleSend = () => {
    if (!messageText.trim()) return;
    const res = sendDirectMessage(peerId, messageText.trim());
    if (res.success && res.message) {
      setMessages((prev) => [...prev, res.message!]);
      setMessageText('');
    }
  };

  // -------------------------------------------------------------
  // PARENT PRESENTATION: MONOCHROMATIC BLACK & WHITE
  // -------------------------------------------------------------
  if (isParent) {
    return (
      <Layout>
        <div className="parent-dashboard">

          {/* HEADER */}
          <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <button
                type="button"
                className="parent-back-btn"
                aria-label="Go back"
                title="Go back"
                onClick={() => {
                  if (window.history.length > 1) {
                    navigate(-1);
                  } else {
                    navigate(baseConversationsRoute);
                  }
                }}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
              </button>

              <div>
                <span className="parent-card-label">SHARED CONVERSATION</span>
                <h1 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 850 }}>{peerDisplayName}</h1>
              </div>
            </div>

            <button
              type="button"
              className="parent-btn-ghost"
              onClick={() => navigate('/app/parent/perspective')}
              style={{ fontSize: '0.78rem', padding: '6px 12px' }}
            >
              Perspective Guidance →
            </button>
          </header>

          {/* CONVERSATION CONTAINER */}
          <div
            style={{
              border: '1.5px solid #000000',
              borderRadius: '12px',
              background: '#FFFFFF',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              minHeight: '440px',
            }}
          >
            {/* NOTICE */}
            <div style={{ padding: '14px 20px', background: '#FAFAFA', borderBottom: '1px solid #E5E5E5' }}>
              <p style={{ margin: 0, fontSize: '0.82rem', color: '#666666', lineHeight: 1.5 }}>
                🔒 This is a shared dialogue with <strong>{peerDisplayName}</strong> ({peerId}). Only messages deliberately sent here are visible. Private notes, journals, and personal spaces are never shared.
              </p>
            </div>

            {/* MESSAGES LIST */}
            <div style={{ flex: 1, padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', overflowY: 'auto' }}>
              {messages.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 20px', color: '#666666' }}>
                  <p style={{ margin: '0 0 8px', fontSize: '0.95rem', fontWeight: 700, color: '#000000' }}>
                    No messages yet in this shared conversation.
                  </p>
                  <span style={{ fontSize: '0.82rem' }}>
                    Send a thoughtful opening message below or wait for your teen to share what is on their mind.
                  </span>
                </div>
              ) : (
                messages.map((msg) => {
                  const isMe = msg.senderTwoWayId === currentUserId;
                  return (
                    <div
                      key={msg.id}
                      style={{
                        alignSelf: isMe ? 'flex-end' : 'flex-start',
                        maxWidth: '80%',
                        padding: '14px 18px',
                        borderRadius: '10px',
                        background: isMe ? '#000000' : '#F5F5F5',
                        color: isMe ? '#FFFFFF' : '#000000',
                        border: isMe ? '1px solid #000000' : '1px solid #E5E5E5',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', marginBottom: '6px' }}>
                        <span style={{ fontSize: '0.68rem', fontWeight: 850, letterSpacing: '0.08em', opacity: 0.8 }}>
                          {isMe ? 'YOU (PARENT)' : peerDisplayName}
                        </span>
                        <span style={{ fontSize: '0.68rem', opacity: 0.65 }}>
                          {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p style={{ margin: 0, fontSize: '0.92rem', lineHeight: 1.55 }}>{msg.text}</p>
                    </div>
                  );
                })
              )}
            </div>

            {/* MESSAGE INPUT */}
            <div style={{ padding: '16px 20px', borderTop: '1px solid #E5E5E5', background: '#FAFAFA' }}>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                style={{ display: 'flex', gap: '10px' }}
              >
                <input
                  type="text"
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder={`Write a calm reply to ${peerDisplayName}...`}
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
                  className="parent-btn-primary"
                  disabled={!messageText.trim()}
                  style={{ padding: '10px 22px' }}
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

  // -------------------------------------------------------------
  // TEEN PRESENTATION: EXISTING TEEN VISUAL IDENTITY INTACT
  // -------------------------------------------------------------
  return (
    <Layout>
      <main className="conversation-view-page">
        <div className="conversation-view-shell">

          {/* HEADER */}
          <header className="conversation-view-header">
            <button
              type="button"
              className="conversation-view-back"
              aria-label="Go back"
              onClick={() => navigate(baseConversationsRoute)}
            >
              ←
            </button>

            <div className="conversation-view-title">
              <span>CLARITY · CONVERSATION</span>
              <h1>{peerDisplayName}</h1>
            </div>

            <div style={{ width: '44px' }} />
          </header>

          {/* INTRO */}
          <motion.section
            className="conversation-view-intro"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
          >
            <p className="conversation-view-eyebrow">
              YOUR SPACE TO TALK
            </p>

            <h2>
              Say what you mean.
              <br />
              <strong>Be understood.</strong>
            </h2>

            <p>
              This conversation is a place to communicate
              honestly and at your own pace.
            </p>
          </motion.section>

          {/* MESSAGES */}
          <section className="conversation-view-messages">
            {messages.length > 0 ? (
              messages.map((msg) => {
                const isMe = msg.senderTwoWayId === currentUserId;
                return (
                  <div
                    key={msg.id}
                    className={`conversation-message ${
                      isMe ? 'conversation-message-you' : 'conversation-message-other'
                    }`}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '4px',
                      }}
                    >
                      <span className="conversation-message-label">
                        {isMe ? 'YOU' : peerDisplayName}
                      </span>
                      <span style={{ fontSize: '0.68rem', opacity: 0.75 }}>
                        {new Date(msg.timestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>

                    <p>{msg.text}</p>
                  </div>
                );
              })
            ) : (
              <div
                style={{
                  textAlign: 'center',
                  padding: '28px 16px',
                  background: 'var(--tw-surface)',
                  border: '2px dashed var(--tw-border)',
                  borderRadius: '14px',
                  color: 'var(--tw-text-muted)',
                }}
              >
                <p style={{ margin: 0, fontWeight: 700 }}>No messages exchanged yet.</p>
                <span style={{ fontSize: '0.8rem' }}>
                  Write a message below to begin your conversation with {peerDisplayName}.
                </span>
              </div>
            )}
          </section>

          {/* COMPOSER */}
          <section className="conversation-view-composer">
            <input
              type="text"
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder={`Message ${peerDisplayName}...`}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleSend();
                }
              }}
            />

            <button
              type="button"
              onClick={handleSend}
              disabled={!messageText.trim()}
            >
              Send
            </button>
          </section>

        </div>
      </main>
    </Layout>
  );
}

export default ConversationView;