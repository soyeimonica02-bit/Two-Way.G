import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
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
    ? '/app/parent'
    : '/app/teen/conversations';

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

  return (
    <main className="conversation-view-page">
      <div className="conversation-view-shell">

        {/* =========================================
            HEADER
        ========================================= */}

        <header className="conversation-view-header">

          <button
            type="button"
            className="conversation-view-back"
            aria-label="Go back"
            onClick={() =>
              navigate(baseConversationsRoute)
            }
          >
            ←
          </button>

          <div className="conversation-view-title">
            <span>{isParent ? 'SHARED CONVERSATION' : 'CLARITY · CONVERSATION'}</span>

            <h1>
              {peerDisplayName}
            </h1>
          </div>

          <button
            type="button"
            className="conversation-view-menu"
          >
            •••
          </button>

        </header>


        {/* =========================================
            CONVERSATION INTRO
        ========================================= */}

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


        {/* =========================================
            MESSAGES
        ========================================= */}

        <section className="conversation-view-messages">

          <div className="conversation-message conversation-message-other">

            <span className="conversation-message-label">
              THEM
            </span>

            <p>
              What's on your mind?
            </p>

          </div>


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
                  <p style={{ whiteSpace: 'pre-wrap' }}>
                    {msg.text}
                  </p>
                </div>
              );
            })
          ) : (
            <div className="conversation-message conversation-message-other">
              <span className="conversation-message-label">
                {peerDisplayName}
              </span>
              <p>
                Start communicating whenever you feel ready. This conversation is private between you two.
              </p>
            </div>
          )}

        </section>


        {/* =========================================
            INPUT
        ========================================= */}

        <section className="conversation-view-input">

          <textarea
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            placeholder="Write what you want to say..."
            rows={4}
          />

          <div className="conversation-view-input-footer">

            <span>
              You can take your time.
            </span>

            <button
              type="button"
              onClick={handleSend}
              disabled={!messageText.trim()}
              style={{
                opacity: messageText.trim() ? 1 : 0.6,
                cursor: messageText.trim() ? 'pointer' : 'not-allowed',
              }}
            >
              Send →
            </button>

          </div>

        </section>




        {/* =========================================
            FOOTER
        ========================================= */}

        <footer className="conversation-view-footer">

          <button
            type="button"
            onClick={() =>
              navigate(baseConversationsRoute)
            }
          >
            {isParent ? 'Back to Dashboard' : 'Back to Clarity'}
          </button>

        </footer>

      </div>
    </main>
  );
}

export default ConversationView;