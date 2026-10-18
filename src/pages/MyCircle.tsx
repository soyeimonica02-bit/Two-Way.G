import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import type {
  CircleConnection,
  ConnectionRequest,
} from '../utils/circleStorage';
import {
  getCurrentUserTwoWayId,
  loadCircleConnections,
  saveCircleConnections,
  loadConnectionRequests,
  saveConnectionRequests,
  generateCircleRecordId,
  normalizeTwoWayId,
} from '../utils/circleStorage';

function MyCircle() {
  const navigate = useNavigate();
  const location = useLocation();

  const isParent = location.pathname.startsWith('/app/parent');
  const baseRoute = isParent ? '/app/parent' : '/app/teen';

  const [connections, setConnections] = useState<CircleConnection[]>(() =>
    loadCircleConnections(),
  );
  const [requests, setRequests] = useState<ConnectionRequest[]>(() =>
    loadConnectionRequests(),
  );

  const currentUserId = getCurrentUserTwoWayId();

  // Keep storage in sync
  useEffect(() => {
    saveCircleConnections(connections);
  }, [connections]);

  useEffect(() => {
    saveConnectionRequests(requests);
  }, [requests]);

  // Navigate to Add ID screen on any plus button tap
  const handleNavigateToAddId = () => {
    navigate(`${baseRoute}/circle/add-id`);
  };

  // Recipient accepts request
  const handleAcceptRequest = (requestId: string) => {
    const req = requests.find((r) => r.id === requestId);
    if (!req) return;

    const peerId =
      req.senderTwoWayId === currentUserId
        ? req.recipientTwoWayId
        : req.senderTwoWayId;

    const newConnection: CircleConnection = {
      id: generateCircleRecordId('conn'),
      twoWayId: peerId,
      displayName: req.senderName || peerId,
      role: req.senderRole || 'Circle Member',
      connectedAt: new Date().toISOString(),
    };

    setConnections((prev) => [newConnection, ...prev]);
    setRequests((prev) => prev.filter((r) => r.id !== requestId));
  };

  // Recipient declines or sender cancels request
  const handleDeclineRequest = (requestId: string) => {
    setRequests((prev) => prev.filter((r) => r.id !== requestId));
  };

  // Separate incoming requests addressed to current user vs outgoing requests sent by current user
  const incomingRequests = requests.filter(
    (r) =>
      r.status === 'pending' &&
      normalizeTwoWayId(r.recipientTwoWayId) === normalizeTwoWayId(currentUserId),
  );

  const outgoingRequests = requests.filter(
    (r) =>
      r.status === 'pending' &&
      normalizeTwoWayId(r.senderTwoWayId) === normalizeTwoWayId(currentUserId),
  );

  return (
    <main className="circle-page">
      <div className="circle-shell">

        {/* =========================================
            HEADER
        ========================================= */}
        <header className="circle-header">
          <button
            type="button"
            className="circle-back"
            aria-label="Go back"
            onClick={() => navigate(baseRoute)}
          >
            ←
          </button>

          <div className="circle-header-title">
            <span>YOUR WORLD</span>
            <h1>My Circle</h1>
          </div>

          <button
            type="button"
            className="circle-add"
            aria-label="Add Someone by Two-Way ID"
            title="Add Someone (Add ID)"
            onClick={handleNavigateToAddId}
          >
            +
          </button>
        </header>


        {/* =========================================
            INTRO
        ========================================= */}
        <motion.section
          className="circle-intro"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
        >
          <p className="circle-eyebrow">
            YOUR PEOPLE
          </p>

          <h2>
            The people
            <br />
            <em>you choose.</em>
          </h2>

          <p className="circle-description">
            Your Circle is made up of real people you choose
            to connect with. It is separate from Nova and
            your private spaces.
          </p>
        </motion.section>

        {/* =========================================
            INCOMING CONNECTION REQUESTS (DECISION REQUIRED)
        ========================================= */}
        {incomingRequests.length > 0 && (
          <section className="circle-requests-section" style={{ marginTop: '28px' }}>
            <span
              style={{
                display: 'block',
                fontSize: '0.72rem',
                fontWeight: 900,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: 'var(--tw-primary)',
                marginBottom: '12px',
              }}
            >
              INCOMING REQUESTS ({incomingRequests.length})
            </span>

            {incomingRequests.map((req) => (
              <div key={req.id} className="circle-connection-item">
                <div>
                  <strong style={{ display: 'block', fontSize: '1rem' }}>
                    {req.senderName || req.senderTwoWayId}
                  </strong>
                  <span
                    style={{
                      fontSize: '0.78rem',
                      color: 'var(--tw-text-muted)',
                      fontWeight: 650,
                    }}
                  >
                    ID: {req.senderTwoWayId} wants to connect to your Circle
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <button
                    type="button"
                    onClick={() => handleAcceptRequest(req.id)}
                    style={{
                      padding: '8px 14px',
                      borderRadius: '10px',
                      border: '2px solid var(--tw-border)',
                      background: 'var(--tw-primary)',
                      color: 'var(--tw-primary-text, #ffffff)',
                      font: 'inherit',
                      fontSize: '0.74rem',
                      fontWeight: 800,
                      cursor: 'pointer',
                      boxShadow: '2px 2px 0px var(--tw-border)',
                    }}
                    title="Accept connection request"
                  >
                    Accept
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeclineRequest(req.id)}
                    style={{
                      padding: '8px 14px',
                      borderRadius: '10px',
                      border: '2px solid var(--tw-border)',
                      background: 'var(--tw-surface-raised)',
                      color: 'var(--tw-text)',
                      font: 'inherit',
                      fontSize: '0.74rem',
                      fontWeight: 800,
                      cursor: 'pointer',
                    }}
                    title="Decline connection request"
                  >
                    Decline
                  </button>
                </div>
              </div>
            ))}
          </section>
        )}

        {/* =========================================
            OUTGOING PENDING REQUESTS
        ========================================= */}
        {outgoingRequests.length > 0 && (
          <section className="circle-requests-section" style={{ marginTop: '24px' }}>
            <span
              style={{
                display: 'block',
                fontSize: '0.72rem',
                fontWeight: 900,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: 'var(--tw-text-muted)',
                marginBottom: '12px',
              }}
            >
              OUTGOING PENDING REQUESTS ({outgoingRequests.length})
            </span>

            {outgoingRequests.map((req) => (
              <div key={req.id} className="circle-connection-item">
                <div>
                  <strong style={{ display: 'block', fontSize: '0.98rem' }}>
                    {req.recipientTwoWayId}
                  </strong>
                  <span
                    style={{
                      fontSize: '0.78rem',
                      color: 'var(--tw-text-muted)',
                      fontWeight: 650,
                    }}
                  >
                    Request sent · Awaiting their acceptance
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => handleDeclineRequest(req.id)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '8px',
                    border: '2px solid var(--tw-border)',
                    background: 'var(--tw-surface-raised)',
                    color: 'var(--tw-text)',
                    font: 'inherit',
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                  }}
                  title="Cancel outgoing request"
                >
                  Cancel
                </button>
              </div>
            ))}
          </section>
        )}

        {/* =========================================
            CONNECTED PEOPLE (IF ANY)
        ========================================= */}
        {connections.length > 0 && (
          <section style={{ marginTop: '24px', marginBottom: '28px' }}>
            <span
              style={{
                display: 'block',
                fontSize: '0.72rem',
                fontWeight: 900,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: 'var(--tw-primary)',
                marginBottom: '12px',
              }}
            >
              YOUR CONNECTIONS ({connections.length})
            </span>

            {connections.map((conn) => (
              <div key={conn.id} className="circle-connection-item">
                <div>
                  <strong style={{ display: 'block', fontSize: '1rem' }}>
                    {conn.displayName || conn.twoWayId}
                  </strong>
                  <span
                    style={{
                      fontSize: '0.76rem',
                      color: 'var(--tw-text-muted)',
                      fontWeight: 650,
                    }}
                  >
                    {conn.twoWayId} · {conn.role || 'Member'}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {!isParent && (
                    <button
                      type="button"
                      onClick={() => navigate(`${baseRoute}/conversations/${conn.twoWayId}`)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '8px',
                        border: '1.5px solid var(--tw-primary)',
                        background: 'var(--tw-primary-soft)',
                        color: 'var(--tw-primary)',
                        font: 'inherit',
                        fontSize: '0.72rem',
                        fontWeight: 800,
                        cursor: 'pointer',
                      }}
                      title="Send a message in Clarity"
                    >
                      💬 Message
                    </button>
                  )}
                  <span
                    style={{
                      fontSize: '0.7rem',
                      fontWeight: 900,
                      letterSpacing: '0.06em',
                      color: 'var(--tw-primary)',
                      background: 'var(--tw-surface-raised)',
                      padding: '4px 8px',
                      borderRadius: '6px',
                      border: '1.5px solid var(--tw-border)',
                    }}
                  >
                    CONNECTED
                  </span>
                </div>
              </div>
            ))}
          </section>
        )}

        {/* =========================================
            EMPTY CIRCLE (IF NO CONNECTIONS & NO REQUESTS)
        ========================================= */}
        {connections.length === 0 && incomingRequests.length === 0 && outgoingRequests.length === 0 && (
          <motion.section
            className="circle-empty"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <button
              type="button"
              className="circle-empty-symbol"
              onClick={handleNavigateToAddId}
              aria-label="Add Someone by Two-Way ID"
              title="Add Someone"
              style={{ cursor: 'pointer' }}
            >
              +
            </button>

            <div className="circle-empty-content">
              <span>
                YOUR CIRCLE IS EMPTY
              </span>

              <h3>
                Start with someone you trust.
              </h3>

              <p>
                Add a person to your Circle when you're ready.
                They'll become a real connection inside Two-Way.
              </p>

              <button
                type="button"
                className="circle-primary-button"
                onClick={handleNavigateToAddId}
              >
                + Add someone
              </button>
            </div>
          </motion.section>
        )}


        {/* =========================================
            HOW IT WORKS
        ========================================= */}
        <section className="circle-info">
          <div className="circle-info-heading">
            <span>
              HOW YOUR CIRCLE WORKS
            </span>

            <h3>
              Human connections only.
            </h3>
          </div>

          <div className="circle-info-grid">
            <article className="circle-info-card">
              <span>01</span>
              <h4>Choose</h4>
              <p>You decide who belongs in your Circle.</p>
            </article>

            <article className="circle-info-card">
              <span>02</span>
              <h4>Connect</h4>
              <p>Your connections are real people, not AI participants.</p>
            </article>

            <article className="circle-info-card">
              <span>03</span>
              <h4>Communicate</h4>
              <p>Conversations happen when you're ready to have them.</p>
            </article>
          </div>
        </section>


        {/* =========================================
            PRIVACY
        ========================================= */}
        <section className="circle-privacy">
          <div className="circle-privacy-icon">
            🔒
          </div>

          <div>
            <span>
              YOUR PRIVATE SPACES STAY PRIVATE
            </span>

            <p>
              Your Haven, Journal, Emotional Calendar,
              and other private spaces are not shared
              with people in your Circle.
            </p>
          </div>
        </section>


        {/* =========================================
            FOOTER
        ========================================= */}
        <footer className="circle-footer">
          <button
            type="button"
            onClick={() => navigate(baseRoute)}
          >
            Return to your world
          </button>
        </footer>

      </div>
    </main>
  );
}

export default MyCircle;