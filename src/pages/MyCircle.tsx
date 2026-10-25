import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import ParentLayout from '../layouts/ParentLayout';
import TeenLayout from '../layouts/TeenLayout';
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
import {
  loadGroupConversations,
  createGroupConversation,
  type GroupConversation,
} from '../utils/groupStorage';
import UpgradeModal from '../components/UpgradeModal';
import { canAccessGroupConversations } from '../utils/subscriptionStorage';

export default function MyCircle() {
  const navigate = useNavigate();
  const location = useLocation();

  const isParent = location.pathname.startsWith('/app/parent');
  const baseRoute = isParent ? '/app/parent' : '/app/teen';
  const Layout = isParent ? ParentLayout : TeenLayout;

  const [connections, setConnections] = useState<CircleConnection[]>(() =>
    loadCircleConnections(),
  );
  const [requests, setRequests] = useState<ConnectionRequest[]>(() =>
    loadConnectionRequests(),
  );
  const [groups, setGroups] = useState<GroupConversation[]>(() => loadGroupConversations());
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [groupNameInput, setGroupNameInput] = useState('');
  const [selectedGroupMembers, setSelectedGroupMembers] = useState<string[]>([]);
  const [groupError, setGroupError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState(false);

  const currentUserId = getCurrentUserTwoWayId();

  // Keep storage in sync
  useEffect(() => {
    saveCircleConnections(connections);
  }, [connections]);

  useEffect(() => {
    saveConnectionRequests(requests);
  }, [requests]);

  useEffect(() => {
    const handleGroupsUpdate = () => setGroups(loadGroupConversations());
    window.addEventListener('twoway-groups-updated', handleGroupsUpdate);
    window.addEventListener('storage', handleGroupsUpdate);
    return () => {
      window.removeEventListener('twoway-groups-updated', handleGroupsUpdate);
      window.removeEventListener('storage', handleGroupsUpdate);
    };
  }, []);

  const handleOpenCreateGroup = () => {
    if (!canAccessGroupConversations()) {
      setShowUpgradeModal(true);
      return;
    }
    setShowGroupModal(true);
  };

  const handleOpenGroupChat = (groupId: string) => {
    if (!canAccessGroupConversations()) {
      setShowUpgradeModal(true);
      return;
    }
    navigate(`${baseRoute}/groups/${groupId}`);
  };

  const handleCreateGroupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setGroupError(null);

    if (!canAccessGroupConversations()) {
      setShowGroupModal(false);
      setShowUpgradeModal(true);
      return;
    }

    const res = createGroupConversation(groupNameInput, selectedGroupMembers);
    if (res.success && res.group) {
      setGroups(loadGroupConversations());
      setShowGroupModal(false);
      setGroupNameInput('');
      setSelectedGroupMembers([]);
      navigate(`${baseRoute}/groups/${res.group.id}`);
    } else {
      if (res.upgradeRequired) {
        setShowGroupModal(false);
        setShowUpgradeModal(true);
      } else {
        setGroupError(res.error || 'Failed to create group conversation.');
      }
    }
  };

  const handleNavigateToAddId = () => {
    navigate(`${baseRoute}/circle/add-id`);
  };

  const handleCopyId = () => {
    navigator.clipboard.writeText(currentUserId);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
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
      role: req.senderRole || (isParent ? 'Teenager' : 'Circle Member'),
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

  // -------------------------------------------------------------
  // PARENT PRESENTATION: STRICTLY MONOCHROMATIC BLACK & WHITE
  // -------------------------------------------------------------
  if (isParent) {
    return (
      <Layout>
        <div className="parent-dashboard">

          {/* HEADER */}
          <motion.section
            className="parent-hero"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '14px' }}>
              <button
                type="button"
                className="parent-back-btn"
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

              <span className="parent-hero-pill" style={{ margin: 0 }}>
                CONNECTION MANAGEMENT
              </span>
            </div>

            <h1>My Circle.</h1>
            <p>
              Your trusted connections in Two-Way. Connect with your teen by sharing your Two-Way ID or looking up theirs.
            </p>
          </motion.section>

          {/* PARENT TWO-WAY ID CARD */}
          <motion.section
            className="parent-card"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.05 }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
              <div>
                <span className="parent-card-label">YOUR TWO-WAY ID</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '6px' }}>
                  <strong style={{ fontFamily: 'var(--font-display, monospace)', fontSize: '1.4rem', letterSpacing: '0.06em', color: '#000000' }}>
                    {currentUserId}
                  </strong>
                  <span style={{ fontSize: '0.68rem', fontWeight: 800, padding: '3px 8px', borderRadius: '4px', background: '#F0F0F0', border: '1px solid #E5E5E5' }}>
                    VERIFIED ID
                  </span>
                </div>
                <p style={{ margin: '6px 0 0', fontSize: '0.86rem', color: '#666666' }}>
                  Give this ID to your teen so they can send you a connection request from their Circle.
                </p>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  className="parent-btn-secondary"
                  onClick={handleCopyId}
                >
                  {copiedId ? 'Copied ✓' : '📋 Copy ID'}
                </button>
                <button
                  type="button"
                  className="parent-btn-primary"
                  onClick={handleNavigateToAddId}
                >
                  + Add Someone by ID
                </button>
              </div>
            </div>
          </motion.section>

          {/* INCOMING CONNECTION REQUESTS */}
          {incomingRequests.length > 0 && (
            <motion.section
              className="parent-card"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.1 }}
            >
              <div className="parent-card-header">
                <div>
                  <span className="parent-card-label">INCOMING REQUESTS</span>
                  <h2>Awaiting Your Response ({incomingRequests.length})</h2>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {incomingRequests.map((req) => (
                  <div
                    key={req.id}
                    style={{
                      padding: '16px 20px',
                      border: '1.5px solid #000000',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '12px',
                    }}
                  >
                    <div>
                      <strong style={{ display: 'block', fontSize: '1rem', color: '#000000' }}>
                        {req.senderName || req.senderTwoWayId}
                      </strong>
                      <span style={{ fontSize: '0.82rem', color: '#666666' }}>
                        ID: {req.senderTwoWayId} · {req.senderRole || 'Connection Request'}
                      </span>
                    </div>

                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        type="button"
                        className="parent-btn-primary"
                        onClick={() => handleAcceptRequest(req.id)}
                        style={{ padding: '8px 18px', fontSize: '0.84rem' }}
                      >
                        Accept
                      </button>
                      <button
                        type="button"
                        className="parent-btn-ghost"
                        onClick={() => handleDeclineRequest(req.id)}
                        style={{ padding: '8px 16px', fontSize: '0.84rem' }}
                      >
                        Decline
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.section>
          )}

          {/* OUTGOING PENDING REQUESTS */}
          {outgoingRequests.length > 0 && (
            <motion.section
              className="parent-card"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.12 }}
            >
              <span className="parent-card-label">OUTGOING REQUESTS</span>
              <h3 style={{ fontSize: '1.1rem', margin: '4px 0 14px' }}>
                Pending Acceptance ({outgoingRequests.length})
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {outgoingRequests.map((req) => (
                  <div
                    key={req.id}
                    style={{
                      padding: '14px 18px',
                      border: '1px solid #E5E5E5',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      background: '#FAFAFA',
                    }}
                  >
                    <div>
                      <strong style={{ display: 'block', fontSize: '0.95rem', color: '#000000' }}>
                        {req.recipientTwoWayId}
                      </strong>
                      <span style={{ fontSize: '0.8rem', color: '#666666' }}>
                        Request sent · Awaiting their confirmation
                      </span>
                    </div>

                    <button
                      type="button"
                      className="parent-btn-ghost"
                      onClick={() => handleDeclineRequest(req.id)}
                      style={{ fontSize: '0.78rem', padding: '6px 12px' }}
                    >
                      Cancel Request
                    </button>
                  </div>
                ))}
              </div>
            </motion.section>
          )}

          {/* ACCEPTED CONNECTIONS */}
          <motion.section
            className="parent-card"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.15 }}
          >
            <div className="parent-card-header">
              <div>
                <span className="parent-card-label">ACTIVE CONNECTIONS</span>
                <h2>Your Circle ({connections.length})</h2>
              </div>
            </div>

            {connections.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {connections.map((conn) => (
                  <div
                    key={conn.id}
                    style={{
                      padding: '18px 20px',
                      border: '1px solid #E5E5E5',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '12px',
                    }}
                  >
                    <div>
                      <strong style={{ display: 'block', fontSize: '1.05rem', color: '#000000' }}>
                        {conn.displayName || conn.twoWayId}
                      </strong>
                      <span style={{ fontSize: '0.82rem', color: '#666666' }}>
                        {conn.twoWayId} · {conn.role || 'Member'}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <button
                        type="button"
                        className="parent-btn-primary"
                        onClick={() => navigate(`/app/parent/conversations/${conn.twoWayId}`)}
                        style={{ fontSize: '0.82rem', padding: '8px 16px' }}
                      >
                        View Conversation →
                      </button>
                      <span
                        style={{
                          fontSize: '0.68rem',
                          fontWeight: 850,
                          letterSpacing: '0.08em',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          background: '#F0F0F0',
                          border: '1px solid #E5E5E5',
                        }}
                      >
                        CONNECTED
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ padding: '24px 0', textAlign: 'center' }}>
                <p style={{ margin: '0 0 16px', color: '#666666', fontSize: '0.92rem', lineHeight: 1.6 }}>
                  No connections yet. When your teen connects with you, you will be able to read shared conversations and communicate directly.
                </p>
                <button
                  type="button"
                  className="parent-btn-primary"
                  onClick={handleNavigateToAddId}
                >
                  + Add Person by Two-Way ID
                </button>
              </div>
            )}
          </motion.section>

          {/* PARENT GROUP CONVERSATIONS SECTION */}
          <motion.section
            className="parent-card"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.18 }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <span className="parent-card-label">CIRCLE & FAMILY GROUPS</span>
                <h2>Group Conversations ({groups.length})</h2>
              </div>
              <button
                type="button"
                className="parent-btn-primary"
                onClick={handleOpenCreateGroup}
                style={{ fontSize: '0.84rem' }}
              >
                + Create Group
              </button>
            </div>

            {groups.length === 0 ? (
              <p style={{ fontSize: '0.88rem', color: '#666666', margin: 0 }}>
                No group conversations yet. Create a group with your connected family members or circle connections.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {groups.map((g) => (
                  <div
                    key={g.id}
                    style={{
                      padding: '14px 18px',
                      border: '1px solid #E5E5E5',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      background: '#FAFAFA',
                    }}
                  >
                    <div>
                      <strong style={{ fontSize: '1rem', color: '#000000' }}>{g.name}</strong>
                      <span style={{ display: 'block', fontSize: '0.78rem', color: '#666666' }}>
                        Participants: {g.participants.length} members · Created {new Date(g.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <button
                      type="button"
                      className="parent-btn-secondary"
                      onClick={() => handleOpenGroupChat(g.id)}
                      style={{ padding: '8px 16px', fontSize: '0.82rem' }}
                    >
                      Open Chat →
                    </button>
                  </div>
                ))}
              </div>
            )}
          </motion.section>

        </div>

        <UpgradeModal
          isOpen={showUpgradeModal}
          onClose={() => setShowUpgradeModal(false)}
          isParent={isParent}
          featureName="Group Conversations"
        />
      </Layout>
    );
  }

  // -------------------------------------------------------------
  // TEEN PRESENTATION: EXISTING TEEN VISUAL IDENTITY INTACT
  // -------------------------------------------------------------
  return (
    <Layout>
      <main className="circle-page">
        <div className="circle-shell">

          {/* HEADER */}
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

          {/* INTRO */}
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

          {/* INCOMING CONNECTION REQUESTS */}
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

          {/* OUTGOING PENDING REQUESTS */}
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

          {/* CONNECTED PEOPLE */}
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

          {/* TEEN GROUP CONVERSATIONS SECTION */}
          <section style={{ marginTop: '28px', marginBottom: '28px', background: 'var(--tw-surface-raised, #FFFFFF)', padding: '24px', borderRadius: '16px', border: '1.5px solid var(--tw-border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <span style={{ display: 'block', fontSize: '0.72rem', fontWeight: 900, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--tw-primary)', marginBottom: '4px' }}>
                  CIRCLE GROUPS
                </span>
                <h3 style={{ margin: 0, fontSize: '1.15rem' }}>Group Conversations ({groups.length})</h3>
              </div>
              <button
                type="button"
                className="tw-button tw-button-primary"
                onClick={handleOpenCreateGroup}
                style={{ fontSize: '0.84rem', padding: '8px 16px' }}
              >
                + Create Group
              </button>
            </div>

            {groups.length === 0 ? (
              <p style={{ fontSize: '0.88rem', color: 'var(--tw-text-muted)', margin: 0 }}>
                No group conversations yet. Create a group with your trusted connections.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {groups.map((g) => (
                  <div
                    key={g.id}
                    style={{
                      padding: '14px 18px',
                      border: '1.5px solid var(--tw-border)',
                      borderRadius: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      background: 'var(--tw-card-bg, #FFFFFF)',
                    }}
                  >
                    <div>
                      <strong style={{ display: 'block', fontSize: '1rem' }}>{g.name}</strong>
                      <span style={{ fontSize: '0.78rem', color: 'var(--tw-text-muted)' }}>
                        Participants: {g.participants.length} members · Created {new Date(g.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <button
                      type="button"
                      className="tw-button"
                      onClick={() => handleOpenGroupChat(g.id)}
                      style={{ padding: '8px 16px', fontSize: '0.82rem' }}
                    >
                      Open Chat →
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* EMPTY CIRCLE */}
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

          {/* HOW IT WORKS */}
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

          {/* PRIVACY */}
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

          {/* FOOTER */}
          <footer className="circle-footer">
            <button
              type="button"
              onClick={() => navigate(baseRoute)}
            >
              Return to your world
            </button>
          </footer>

        </div>

        {/* CREATE GROUP MODAL */}
        {showGroupModal && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
              padding: '20px',
            }}
          >
            <div
              style={{
                width: '100%',
                maxWidth: '500px',
                background: '#FFFFFF',
                borderRadius: '16px',
                padding: '24px',
                border: '2px solid #000000',
                boxShadow: '4px 4px 0px rgba(0,0,0,0.2)',
              }}
            >
              <h3 style={{ margin: '0 0 8px', fontSize: '1.25rem', fontWeight: 850, color: '#000000' }}>
                Create Group Conversation
              </h3>
              <p style={{ margin: '0 0 16px', fontSize: '0.86rem', color: '#666666' }}>
                Give your group a name and select participants from your authorized circle connections.
              </p>

              {groupError && (
                <div style={{ marginBottom: '14px', padding: '10px 14px', borderRadius: '8px', background: '#FFEEEE', color: '#CC0000', border: '1px solid #FFCCCC', fontSize: '0.84rem', fontWeight: 600 }}>
                  {groupError}
                </div>
              )}

              <form onSubmit={handleCreateGroupSubmit}>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.06em', color: '#000000' }}>
                    Group Name
                  </label>
                  <input
                    type="text"
                    value={groupNameInput}
                    onChange={(e) => setGroupNameInput(e.target.value)}
                    placeholder="e.g. Family Check-in, Support Circle..."
                    required
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      borderRadius: '8px',
                      border: '1.5px solid #000000',
                      fontSize: '0.92rem',
                      outline: 'none',
                      boxSizing: 'border-box',
                      color: '#000000',
                    }}
                  />
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.06em', color: '#000000' }}>
                    Select Participants ({selectedGroupMembers.length} selected)
                  </label>
                  {connections.length === 0 ? (
                    <p style={{ fontSize: '0.85rem', color: '#666666', fontStyle: 'italic', margin: 0 }}>
                      You need accepted circle connections before you can add them to a group.
                    </p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '180px', overflowY: 'auto', border: '1px solid #E5E5E5', padding: '10px', borderRadius: '8px' }}>
                      {connections.map((c) => {
                        const isSelected = selectedGroupMembers.includes(c.twoWayId);
                        return (
                          <label
                            key={c.twoWayId}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '10px',
                              padding: '8px',
                              borderRadius: '6px',
                              background: isSelected ? '#F5F5F5' : '#FFFFFF',
                              cursor: 'pointer',
                            }}
                          >
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedGroupMembers((prev) => [...prev, c.twoWayId]);
                                } else {
                                  setSelectedGroupMembers((prev) => prev.filter((id) => id !== c.twoWayId));
                                }
                              }}
                              style={{ width: '16px', height: '16px', accentColor: '#000000' }}
                            />
                            <span style={{ fontSize: '0.88rem', fontWeight: 650, color: '#000000' }}>
                              {c.displayName || c.twoWayId} ({c.twoWayId})
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={() => setShowGroupModal(false)}
                    style={{ padding: '10px 16px', borderRadius: '8px', border: '1.5px solid #000000', background: '#FFFFFF', color: '#000000', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="parent-btn-primary"
                    style={{ padding: '10px 20px', fontSize: '0.85rem' }}
                  >
                    Create Group Conversation →
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* UPGRADE MODAL FOR TEEN CIRCLE */}
        <UpgradeModal
          isOpen={showUpgradeModal}
          onClose={() => setShowUpgradeModal(false)}
          isParent={false}
          featureName="Group Conversations"
        />
      </main>
    </Layout>
  );
}