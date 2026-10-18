import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import ParentLayout from '../layouts/ParentLayout';
import {
  getCurrentUserTwoWayId,
  loadCircleConnections,
  saveCircleConnections,
  loadConnectionRequests,
  saveConnectionRequests,
  lookupRegisteredAccount,
  generateCircleRecordId,
  type CircleConnection,
  type ConnectionRequest,
} from '../utils/circleStorage';
import {
  STORAGE_KEY_DIRECT_MESSAGES,
  type DirectMessage,
} from '../utils/clarityStorage';

interface ConversationSummary {
  peerId: string;
  peerDisplayName: string;
  peerRole: string;
  latestMessage: DirectMessage;
  isFromPeer: boolean;
  messageCount: number;
}

export default function ParentDashboard() {
  const navigate = useNavigate();

  const parentName =
    localStorage.getItem('twoway_profile_name') ||
    localStorage.getItem('twoway_demo_name') ||
    'Parent';

  const currentUserId = getCurrentUserTwoWayId();

  const [copiedId, setCopiedId] = useState(false);
  const [requests, setRequests] = useState<ConnectionRequest[]>(() =>
    loadConnectionRequests(),
  );
  const [connections, setConnections] = useState<CircleConnection[]>(() =>
    loadCircleConnections(),
  );
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [feedbackNotice, setFeedbackNotice] = useState<string | null>(null);

  // Compute pending requests for this parent
  const pendingRequests = requests.filter(
    (r) => r.recipientTwoWayId === currentUserId && r.status === 'pending',
  );

  // Load and summarize real authorized conversations
  useEffect(() => {
    const refreshConversations = () => {
      try {
        const raw = localStorage.getItem(STORAGE_KEY_DIRECT_MESSAGES);
        const allMessages: DirectMessage[] = raw ? JSON.parse(raw) : [];

        // Strictly authorized: messages where current user is sender or recipient
        const myMessages = allMessages.filter(
          (m) =>
            m.senderTwoWayId === currentUserId ||
            m.recipientTwoWayId === currentUserId,
        );

        const groupMap = new Map<string, DirectMessage[]>();

        myMessages.forEach((msg) => {
          const peerId =
            msg.senderTwoWayId === currentUserId
              ? msg.recipientTwoWayId
              : msg.senderTwoWayId;
          if (!groupMap.has(peerId)) {
            groupMap.set(peerId, []);
          }
          groupMap.get(peerId)!.push(msg);
        });

        const currentConns = loadCircleConnections();
        const summaries: ConversationSummary[] = [];

        groupMap.forEach((msgs, peerId) => {
          msgs.sort(
            (a, b) =>
              new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
          );
          const latest = msgs[0];
          const matchedConn = currentConns.find(
            (c) => c.twoWayId === peerId || c.id === peerId,
          );
          const peerAccount = lookupRegisteredAccount(peerId);

          const displayName =
            matchedConn?.displayName ||
            peerAccount?.displayName ||
            `Circle Connection (${peerId})`;

          const role =
            matchedConn?.role || peerAccount?.role || 'Teenager';

          summaries.push({
            peerId,
            peerDisplayName: displayName,
            peerRole: role,
            latestMessage: latest,
            isFromPeer: latest.senderTwoWayId !== currentUserId,
            messageCount: msgs.length,
          });
        });

        // Order by most recent message
        summaries.sort(
          (a, b) =>
            new Date(b.latestMessage.timestamp).getTime() -
            new Date(a.latestMessage.timestamp).getTime(),
        );

        setConversations(summaries);
      } catch (err) {
        console.error('Failed to load shared conversations for parent:', err);
      }
    };

    refreshConversations();

    const handleUpdate = () => {
      refreshConversations();
      setRequests(loadConnectionRequests());
      setConnections(loadCircleConnections());
    };

    window.addEventListener('twoway-messages-updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('twoway-messages-updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, [currentUserId]);

  const handleCopyId = () => {
    navigator.clipboard.writeText(currentUserId);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2200);
  };

  const handleAcceptRequest = (reqId: string) => {
    const req = requests.find((r) => r.id === reqId);
    if (!req) return;

    const updatedRequests = requests.map((r) =>
      r.id === reqId ? { ...r, status: 'accepted' as const } : r,
    );
    saveConnectionRequests(updatedRequests);
    setRequests(updatedRequests);

    const peerId =
      req.senderTwoWayId === currentUserId
        ? req.recipientTwoWayId
        : req.senderTwoWayId;

    const newConnection: CircleConnection = {
      id: generateCircleRecordId('conn'),
      twoWayId: peerId,
      displayName: req.senderName || peerId,
      role: req.senderRole || 'Teenager',
      connectedAt: new Date().toISOString(),
    };

    const updatedConnections = [...connections, newConnection];
    saveCircleConnections(updatedConnections);
    setConnections(updatedConnections);

    setFeedbackNotice(`Connected with ${req.senderName || peerId} ✓`);
    setTimeout(() => setFeedbackNotice(null), 3000);
  };

  const handleDeclineRequest = (reqId: string) => {
    const updatedRequests = requests.map((r) =>
      r.id === reqId ? { ...r, status: 'declined' as const } : r,
    );
    saveConnectionRequests(updatedRequests);
    setRequests(updatedRequests);
  };

  return (
    <ParentLayout>
      <div className="parent-dashboard">

        {/* =========================================
            1. WELCOMING GREETING
        ========================================= */}
        <motion.section
          className="parent-hero"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <span className="parent-hero-pill">
            ★ PARENT PERSPECTIVE
          </span>

          <h1>
            Welcome, {parentName}.
          </h1>

          <p>
            A calm, supportive space to stay connected, honor boundaries, and communicate thoughtfully.
          </p>
        </motion.section>

        {/* =========================================
            FEEDBACK NOTICE TOAST
        ========================================= */}
        {feedbackNotice && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              padding: '12px 18px',
              background: 'var(--parent-primary-soft)',
              border: '1.5px solid var(--parent-primary)',
              borderRadius: '12px',
              color: 'var(--parent-primary)',
              fontWeight: 800,
              fontSize: '0.88rem',
              textAlign: 'center',
              marginBottom: '20px',
            }}
          >
            {feedbackNotice}
          </motion.div>
        )}

        {/* =========================================
            2. PARENT TWO-WAY ID CARD
        ========================================= */}
        <motion.section
          className="parent-card"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '14px',
            }}
          >
            <div>
              <span className="parent-card-label">
                YOUR TWO-WAY ID
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '4px' }}>
                <strong
                  style={{
                    fontFamily: 'var(--font-display, monospace)',
                    fontSize: '1.35rem',
                    letterSpacing: '0.06em',
                    color: 'var(--parent-text)',
                  }}
                >
                  {currentUserId}
                </strong>
                <span
                  style={{
                    fontSize: '0.68rem',
                    fontWeight: 800,
                    padding: '2px 8px',
                    borderRadius: '6px',
                    background: 'var(--parent-surface-subtle)',
                    border: '1px solid var(--parent-border)',
                    color: 'var(--parent-text-secondary)',
                  }}
                >
                  PERMANENT
                </span>
              </div>
              <p
                style={{
                  margin: '6px 0 0',
                  fontSize: '0.84rem',
                  lineHeight: 1.45,
                  color: 'var(--parent-text-secondary)',
                }}
              >
                Share this ID with your teen so they can connect with you in their Circle.
              </p>
            </div>

            <button
              type="button"
              className="parent-btn-secondary"
              onClick={handleCopyId}
            >
              {copiedId ? 'Copied ✓' : '📋 Copy ID'}
            </button>
          </div>
        </motion.section>

        {/* =========================================
            3. ATTENTION & PENDING REQUESTS
        ========================================= */}
        <motion.section
          className="parent-card"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <div className="parent-card-header">
            <div>
              <span className="parent-card-label">ATTENTION</span>
              <h2>Pending Requests</h2>
            </div>
            {pendingRequests.length > 0 && (
              <span
                style={{
                  fontSize: '0.74rem',
                  fontWeight: 800,
                  color: 'var(--parent-primary)',
                  background: 'var(--parent-primary-soft)',
                  padding: '3px 10px',
                  borderRadius: '12px',
                }}
              >
                {pendingRequests.length} pending
              </span>
            )}
          </div>

          {pendingRequests.length > 0 ? (
            <div style={{ display: 'grid', gap: '12px' }}>
              {pendingRequests.map((req) => (
                <div
                  key={req.id}
                  style={{
                    padding: '16px 18px',
                    background: '#ffffff',
                    border: '1px solid var(--parent-border)',
                    borderLeft: '4px solid var(--parent-primary)',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '12px',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <strong style={{ fontSize: '0.96rem', fontWeight: 800, color: 'var(--parent-text)' }}>
                        {req.senderName || req.senderTwoWayId}
                      </strong>
                      <span
                        style={{
                          fontSize: '0.7rem',
                          fontWeight: 750,
                          padding: '2px 8px',
                          borderRadius: '6px',
                          background: 'var(--parent-primary-soft)',
                          color: 'var(--parent-primary)',
                        }}
                      >
                        {req.senderRole || 'Connection Request'}
                      </span>
                    </div>
                    <p
                      style={{
                        margin: '4px 0 0',
                        fontSize: '0.82rem',
                        color: 'var(--parent-text-secondary)',
                      }}
                    >
                      Invited you to connect in My Circle ({req.senderTwoWayId}).
                    </p>
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      type="button"
                      className="parent-btn-primary"
                      onClick={() => handleAcceptRequest(req.id)}
                    >
                      Accept
                    </button>
                    <button
                      type="button"
                      className="parent-btn-ghost"
                      onClick={() => handleDeclineRequest(req.id)}
                    >
                      Decline
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 0',
              }}
            >
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: 'var(--parent-sage)',
                  color: 'var(--parent-sage-text)',
                  display: 'grid',
                  placeItems: 'center',
                  fontSize: '0.9rem',
                  fontWeight: 900,
                }}
              >
                ✓
              </div>
              <div>
                <strong style={{ display: 'block', fontSize: '0.92rem', fontWeight: 750, color: 'var(--parent-text)' }}>
                  You're all caught up
                </strong>
                <span style={{ fontSize: '0.82rem', color: 'var(--parent-text-secondary)' }}>
                  No pending connection requests awaiting your response.
                </span>
              </div>
            </div>
          )}
        </motion.section>

        {/* =========================================
            4. MY CIRCLE CONNECTIONS
        ========================================= */}
        <motion.section
          className="parent-card"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
        >
          <div className="parent-card-header">
            <div>
              <span className="parent-card-label">HUMAN CONNECTIONS</span>
              <h2>My Circle</h2>
            </div>

            <button
              type="button"
              className="parent-btn-ghost"
              onClick={() => navigate('/app/parent/circle')}
            >
              Open Circle →
            </button>
          </div>

          {connections.length > 0 ? (
            <div style={{ display: 'grid', gap: '10px' }}>
              {connections.map((conn) => (
                <div
                  key={conn.id}
                  style={{
                    padding: '14px 16px',
                    background: '#ffffff',
                    border: '1px solid var(--parent-border-subtle)',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                        background: 'var(--parent-primary-soft)',
                        color: 'var(--parent-primary)',
                        display: 'grid',
                        placeItems: 'center',
                        fontWeight: 800,
                        fontSize: '0.95rem',
                      }}
                    >
                      {conn.displayName ? conn.displayName.charAt(0).toUpperCase() : 'C'}
                    </div>
                    <div>
                      <strong style={{ display: 'block', fontSize: '0.92rem', fontWeight: 800, color: 'var(--parent-text)' }}>
                        {conn.displayName || conn.twoWayId}
                      </strong>
                      <span style={{ fontSize: '0.76rem', color: 'var(--parent-text-secondary)' }}>
                        {conn.twoWayId} · {conn.role || 'Member'}
                      </span>
                    </div>
                  </div>

                  <span
                    style={{
                      fontSize: '0.7rem',
                      fontWeight: 800,
                      letterSpacing: '0.06em',
                      color: 'var(--parent-primary)',
                      background: 'var(--parent-primary-soft)',
                      padding: '4px 8px',
                      borderRadius: '6px',
                      border: '1px solid var(--parent-border)',
                    }}
                  >
                    CONNECTED
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ padding: '16px 0', textAlign: 'center' }}>
              <p
                style={{
                  margin: '0 0 16px',
                  fontSize: '0.88rem',
                  lineHeight: 1.5,
                  color: 'var(--parent-text-secondary)',
                }}
              >
                No connections in your Circle yet. Once connected, your teen can deliberately share messages with you.
              </p>
              <button
                type="button"
                className="parent-btn-primary"
                onClick={() => navigate('/app/parent/circle/add-id')}
              >
                + Add Connection by ID
              </button>
            </div>
          )}
        </motion.section>

        {/* =========================================
            5. SHARED MESSAGES (RECEIVED FROM TEEN)
        ========================================= */}
        <motion.section
          className="parent-card"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <div className="parent-card-header">
            <div>
              <span className="parent-card-label">SHARED CONVERSATIONS</span>
              <h2>Messages Shared With You</h2>
            </div>
          </div>

          {conversations.length > 0 ? (
            <div style={{ display: 'grid', gap: '14px' }}>
              {conversations.map((conv) => (
                <article
                  key={conv.peerId}
                  style={{
                    padding: '16px 18px',
                    background: '#ffffff',
                    border: '1px solid var(--parent-border)',
                    borderRadius: '12px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                    cursor: 'pointer',
                  }}
                  onClick={() =>
                    navigate(`/app/parent/conversations/${conv.peerId}`)
                  }
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
                      <strong style={{ fontSize: '0.94rem', fontWeight: 800, color: 'var(--parent-text)' }}>
                        {conv.peerDisplayName}
                      </strong>
                      <span style={{ fontSize: '0.74rem', color: 'var(--parent-text-secondary)' }}>
                        ({conv.peerRole})
                      </span>
                    </div>

                    <span style={{ fontSize: '0.74rem', color: 'var(--parent-text-secondary)' }}>
                      {new Date(conv.latestMessage.timestamp).toLocaleDateString([], {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>

                  <p
                    style={{
                      margin: 0,
                      fontSize: '0.88rem',
                      lineHeight: 1.5,
                      color: 'var(--parent-text)',
                      background: 'var(--parent-surface-subtle)',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      borderLeft: conv.isFromPeer
                        ? '3px solid var(--parent-primary)'
                        : '3px solid var(--parent-border)',
                    }}
                  >
                    {conv.latestMessage.text}
                  </p>

                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <span
                      style={{
                        fontSize: '0.78rem',
                        fontWeight: 800,
                        color: 'var(--parent-primary)',
                      }}
                    >
                      Read conversation →
                    </span>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div
              style={{
                padding: '24px 16px',
                textAlign: 'center',
                background: 'var(--parent-surface-subtle)',
                borderRadius: '12px',
                border: '1.5px dashed var(--parent-border)',
              }}
            >
              <h3
                style={{
                  margin: '0 0 6px',
                  fontSize: '1rem',
                  fontWeight: 800,
                  color: 'var(--parent-text)',
                }}
              >
                No shared messages yet
              </h3>
              <p
                style={{
                  maxWidth: '460px',
                  margin: '0 auto',
                  fontSize: '0.84rem',
                  lineHeight: 1.55,
                  color: 'var(--parent-text-secondary)',
                }}
              >
                When your connected teen finishes writing in their space and deliberately chooses to share a message with you, it will appear here. Their personal drafts, private journal, thoughts, and mood notes remain strictly private to them.
              </p>
            </div>
          )}
        </motion.section>

        {/* =========================================
            6. PARENTING GUIDANCE (ACTIVE LISTENING)
        ========================================= */}
        <motion.section
          className="parent-card"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.25 }}
        >
          <div className="parent-card-header">
            <div>
              <span className="parent-card-label">PARENT PERSPECTIVE</span>
              <h2>Guidance for Listening &amp; Responding</h2>
            </div>
          </div>

          <p
            style={{
              margin: '0 0 16px',
              fontSize: '0.86rem',
              lineHeight: 1.5,
              color: 'var(--parent-text-secondary)',
            }}
          >
            Communication during teenage years requires patience. Keep these core principles in mind whenever a conversation opens up:
          </p>

          <div className="parent-guidance-grid">
            <article className="parent-guidance-item">
              <span className="parent-guidance-num">01 · PAUSE</span>
              <strong className="parent-guidance-title">Pause before reacting</strong>
              <p className="parent-guidance-desc">
                When reading an emotional message, take a moment to breathe before formulating your reply.
              </p>
            </article>

            <article className="parent-guidance-item">
              <span className="parent-guidance-num">02 · VALIDATE</span>
              <strong className="parent-guidance-title">Validate feelings first</strong>
              <p className="parent-guidance-desc">
                Acknowledge what your teen feels before jumping into problem-solving, advice, or correction.
              </p>
            </article>

            <article className="parent-guidance-item">
              <span className="parent-guidance-num">03 · HONOR</span>
              <strong className="parent-guidance-title">Honor their vulnerability</strong>
              <p className="parent-guidance-desc">
                Reaching out takes courage. Thanking them for sharing builds trust for future conversations.
              </p>
            </article>

            <article className="parent-guidance-item">
              <span className="parent-guidance-num">04 · REFLECT</span>
              <strong className="parent-guidance-title">Use Nova to reflect</strong>
              <p className="parent-guidance-desc">
                Use Nova anytime as a private sounding board to talk through parenting emotions and prepare a calm response.
              </p>
            </article>
          </div>

          <div style={{ marginTop: '18px', display: 'flex', justifyContent: 'flex-end' }}>
            <button
              type="button"
              className="parent-btn-primary"
              onClick={() => navigate('/app/parent/nova')}
            >
              Open Nova Sounding Board →
            </button>
          </div>
        </motion.section>

      </div>
    </ParentLayout>
  );
}
