import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import ParentLayout from '../layouts/ParentLayout';
import TeenLayout from '../layouts/TeenLayout';
import {
  normalizeTwoWayId,
  isValidTwoWayIdFormat,
  getCurrentUserTwoWayId,
  loadCircleConnections,
  loadConnectionRequests,
  saveConnectionRequests,
  lookupRegisteredAccount,
  generateCircleRecordId,
} from '../utils/circleStorage';
import type {
  CircleConnection,
  ConnectionRequest,
  RegisteredAccountLookupResult,
} from '../utils/circleStorage';

export default function AddConnectionId() {
  const navigate = useNavigate();
  const location = useLocation();

  const isParent = location.pathname.startsWith('/app/parent');
  const baseCircleRoute = isParent ? '/app/parent/circle' : '/app/teen/circle';
  const Layout = isParent ? ParentLayout : TeenLayout;

  const [connections] = useState<CircleConnection[]>(() =>
    loadCircleConnections(),
  );
  const [requests, setRequests] = useState<ConnectionRequest[]>(() =>
    loadConnectionRequests(),
  );

  const [targetIdInput, setTargetIdInput] = useState('');
  const [inputError, setInputError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isSending, setIsSending] = useState(false);

  // Searched account preview (if found)
  const [foundAccount, setFoundAccount] =
    useState<RegisteredAccountLookupResult | null>(null);

  const currentUserId = getCurrentUserTwoWayId();

  // Sync connection requests
  useEffect(() => {
    saveConnectionRequests(requests);
  }, [requests]);

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate(baseCircleRoute);
    }
  };

  // Find account by entered Two-Way ID
  const handleFindAccount = (e: React.FormEvent) => {
    e.preventDefault();
    setInputError(null);
    setSuccessMessage(null);
    setFoundAccount(null);

    const trimmedDigits = targetIdInput.trim();

    if (!trimmedDigits) {
      setInputError('Please enter a Two-Way ID number.');
      return;
    }

    // Canonical format: permanent non-removable prefix "TW-" with the entered numeric digits
    const normalized = normalizeTwoWayId(trimmedDigits);

    // Format validation: must be TW- followed by exactly 6 digits
    if (!isValidTwoWayIdFormat(normalized)) {
      setInputError(
        'Invalid ID format. Please enter exactly 6 digits for the Two-Way ID (e.g. 004920 for TW-004920).',
      );
      return;
    }

    // Prevent user from adding themselves
    if (normalized === currentUserId) {
      setInputError('You cannot send a connection request to yourself.');
      return;
    }

    // Check if already connected
    const alreadyConnected = connections.some(
      (c) => normalizeTwoWayId(c.twoWayId) === normalized,
    );
    if (alreadyConnected) {
      setInputError(`You are already connected with ${normalized}.`);
      return;
    }

    // Check if outgoing request is already pending
    const alreadyPending = requests.some(
      (r) =>
        r.status === 'pending' &&
        normalizeTwoWayId(r.recipientTwoWayId) === normalized,
    );
    if (alreadyPending) {
      setInputError(
        `A connection request to ${normalized} is already pending.`,
      );
      return;
    }

    setIsSearching(true);

    // Look up registered account
    setTimeout(() => {
      setIsSearching(false);
      const account = lookupRegisteredAccount(normalized);

      if (!account) {
        setInputError(
          `No registered Two-Way account was found for ID "${normalized}". Please verify the digits with the person.`,
        );
        return;
      }

      setFoundAccount(account);
    }, 350);
  };

  // Send real pending connection request (does NOT auto-accept)
  const handleSendRequest = () => {
    if (!foundAccount) return;

    setIsSending(true);

    setTimeout(() => {
      setIsSending(false);

      const senderName =
        localStorage.getItem('twoway_profile_name') || (isParent ? 'Parent' : 'Teen');
      const storedRole =
        localStorage.getItem('twoway_registered_role') || (isParent ? 'parent' : 'teen');

      const formattedRole =
        storedRole === 'teen'
          ? 'Teenager'
          : storedRole === 'parent'
            ? 'Parent'
            : storedRole;

      const newRequest: ConnectionRequest = {
        id: generateCircleRecordId('req'),
        senderTwoWayId: currentUserId,
        recipientTwoWayId: foundAccount.twoWayId,
        senderName,
        senderRole: formattedRole,
        status: 'pending',
        createdAt: new Date().toISOString(),
      };

      setRequests((prev) => [newRequest, ...prev]);
      setSuccessMessage(
        `Connection request sent to ${foundAccount.displayName} (${foundAccount.twoWayId}). It will remain pending until accepted.`,
      );
      setFoundAccount(null);
      setTargetIdInput('');
    }, 400);
  };

  // -------------------------------------------------------------
  // PARENT PRESENTATION: MONOCHROMATIC BLACK & WHITE
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
                onClick={handleBack}
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
                ADD CONNECTION
              </span>
            </div>

            <h1>Add Someone by ID.</h1>
            <p>
              Enter another verified person&apos;s Two-Way ID to look them up and send a connection request. Mutual acceptance is required.
            </p>
          </motion.section>

          {/* FORM CARD */}
          <motion.section
            className="parent-card"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.05 }}
          >
            <form onSubmit={handleFindAccount}>
              <label
                htmlFor="twoWayIdInputParent"
                style={{
                  display: 'block',
                  fontSize: '0.84rem',
                  fontWeight: 800,
                  marginBottom: '8px',
                  color: 'var(--parent-text)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                }}
              >
                Enter Two-Way ID
              </label>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  border: '1.5px solid var(--parent-border)',
                  borderRadius: '8px',
                  background: 'var(--parent-surface)',
                  overflow: 'hidden',
                }}
              >
                <span
                  style={{
                    padding: '14px 16px',
                    font: 'inherit',
                    fontSize: '1.05rem',
                    fontWeight: 850,
                    letterSpacing: '0.06em',
                    color: 'var(--parent-text)',
                    background: 'var(--parent-surface-subtle)',
                    borderRight: '1.5px solid var(--parent-border)',
                    userSelect: 'none',
                  }}
                  aria-hidden="true"
                >
                  TW-
                </span>

                <input
                  id="twoWayIdInputParent"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={targetIdInput}
                  onChange={(e) => {
                    const raw = e.target.value;
                    const digitsOnly = raw.replace(/[^0-9]/g, '');
                    setTargetIdInput(digitsOnly);
                    setInputError(null);
                    setSuccessMessage(null);
                    setFoundAccount(null);
                  }}
                  placeholder="004920"
                  autoFocus
                  disabled={isSearching || isSending}
                  style={{
                    flex: 1,
                    border: 'none',
                    outline: 'none',
                    padding: '14px 16px',
                    background: 'transparent',
                    color: 'var(--parent-text)',
                    font: 'inherit',
                    fontSize: '1.05rem',
                    fontWeight: 800,
                    letterSpacing: '0.08em',
                  }}
                  aria-label="Two-Way ID digits following TW-"
                />
              </div>

              <p style={{ margin: '8px 0 0', fontSize: '0.78rem', color: 'var(--parent-text-secondary)' }}>
                The <strong>TW-</strong> prefix is fixed. Enter the person&apos;s 6-digit ID number (e.g. 004920). Leading zeros are preserved.
              </p>

              {inputError && (
                <div
                  style={{
                    marginTop: '14px',
                    padding: '12px 16px',
                    border: '1.5px solid var(--parent-border-strong)',
                    borderRadius: '8px',
                    background: 'var(--parent-surface-subtle)',
                    color: 'var(--parent-text)',
                    fontSize: '0.86rem',
                    fontWeight: 650,
                  }}
                  role="alert"
                >
                  {inputError}
                </div>
              )}

              {successMessage && (
                <div
                  style={{
                    marginTop: '14px',
                    padding: '12px 16px',
                    border: '1.5px solid var(--parent-border-strong)',
                    borderRadius: '8px',
                    background: 'var(--parent-accent-soft)',
                    color: 'var(--parent-text)',
                    fontSize: '0.86rem',
                    fontWeight: 650,
                  }}
                  role="status"
                >
                  ✓ {successMessage}
                </div>
              )}

              <div style={{ display: 'flex', gap: '10px', marginTop: '22px' }}>
                <button
                  type="submit"
                  className="parent-btn-primary"
                  disabled={isSearching || isSending}
                >
                  {isSearching ? 'Looking up ID…' : 'Look Up Account'}
                </button>

                <button
                  type="button"
                  className="parent-btn-secondary"
                  onClick={handleBack}
                >
                  Cancel
                </button>
              </div>
            </form>

            {/* FOUND ACCOUNT PREVIEW */}
            <AnimatePresence>
              {foundAccount && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  style={{
                    marginTop: '24px',
                    padding: '20px',
                    border: '1.5px solid var(--parent-border)',
                    borderRadius: '8px',
                    background: 'var(--parent-surface-subtle)',
                  }}
                >
                  <span className="parent-card-label">
                    ACCOUNT VERIFIED
                  </span>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '8px 0 14px' }}>
                    <div>
                      <strong style={{ display: 'block', fontSize: '1.15rem', color: 'var(--parent-text)' }}>
                        {foundAccount.displayName}
                      </strong>
                      <span style={{ fontSize: '0.82rem', color: 'var(--parent-text-secondary)' }}>
                        ID: {foundAccount.twoWayId} · {foundAccount.role}
                      </span>
                    </div>

                    <span
                      style={{
                        fontSize: '0.68rem',
                        fontWeight: 850,
                        padding: '4px 8px',
                        background: 'var(--parent-text)',
                        color: 'var(--parent-bg)',
                        borderRadius: '4px',
                      }}
                    >
                      MATCH FOUND
                    </span>
                  </div>

                  <p style={{ margin: '0 0 18px', fontSize: '0.82rem', color: 'var(--parent-text-secondary)', lineHeight: 1.55 }}>
                    Sending a request shares only your display name and Two-Way ID. It requires their confirmation before establishing a connection. Private notes and personal spaces are never shared.
                  </p>

                  <button
                    type="button"
                    className="parent-btn-primary"
                    style={{ width: '100%' }}
                    onClick={handleSendRequest}
                    disabled={isSending}
                  >
                    {isSending ? 'Sending request…' : 'Send Connection Request'}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.section>

        </div>
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
              className="teen-back-btn"
              aria-label="Go back"
              title="Go back"
              onClick={handleBack}
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

            <div className="circle-header-title">
              <span>MY CIRCLE</span>
              <h1>Add Someone</h1>
            </div>

            <div style={{ width: '44px' }} />
          </header>

          {/* INTRO HERO */}
          <motion.section
            className="circle-intro"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <span className="circle-eyebrow">ENTER TWO-WAY ID</span>

            <h2>
              Connect with
              <br />
              <em>someone you know.</em>
            </h2>

            <p className="circle-description">
              Enter another person's verified Two-Way ID to look them up and send
              a connection request. Connections require mutual acceptance.
            </p>
          </motion.section>

          {/* LOOKUP FORM CARD */}
          <section style={{ marginTop: '32px', marginBottom: '36px' }}>
            <div
              style={{
                padding: '28px',
                border: '3px solid var(--tw-border)',
                borderRadius: '20px',
                background: 'var(--tw-surface)',
                boxShadow: '4px 4px 0px var(--tw-border)',
                maxWidth: '560px',
              }}
            >
              <form onSubmit={handleFindAccount}>
                <label
                  htmlFor="twoWayIdInputTeen"
                  style={{
                    display: 'block',
                    fontSize: '0.88rem',
                    fontWeight: 800,
                    marginBottom: '8px',
                    color: 'var(--tw-text)',
                  }}
                >
                  Two-Way ID
                </label>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    border: '2.5px solid var(--tw-border)',
                    borderRadius: '12px',
                    background: 'var(--tw-background)',
                    overflow: 'hidden',
                    transition: 'border-color 150ms ease',
                  }}
                >
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      padding: '14px 14px 14px 16px',
                      font: 'inherit',
                      fontSize: '1.05rem',
                      fontWeight: 900,
                      letterSpacing: '0.06em',
                      color: 'var(--tw-primary)',
                      background: 'var(--tw-surface-raised)',
                      borderRight: '2px solid var(--tw-border)',
                      userSelect: 'none',
                    }}
                    aria-hidden="true"
                  >
                    TW-
                  </span>

                  <input
                    id="twoWayIdInputTeen"
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={targetIdInput}
                    onChange={(e) => {
                      const raw = e.target.value;
                      const digitsOnly = raw.replace(/[^0-9]/g, '');
                      setTargetIdInput(digitsOnly);
                      setInputError(null);
                      setSuccessMessage(null);
                      setFoundAccount(null);
                    }}
                    placeholder="004920"
                    autoFocus
                    disabled={isSearching || isSending}
                    style={{
                      flex: 1,
                      border: 'none',
                      outline: 'none',
                      padding: '14px 16px',
                      background: 'transparent',
                      color: 'var(--tw-text)',
                      font: 'inherit',
                      fontSize: '1.05rem',
                      fontWeight: 800,
                      letterSpacing: '0.08em',
                    }}
                    aria-label="Two-Way ID numbers following TW-"
                  />
                </div>

                <p
                  style={{
                    margin: '8px 0 0',
                    fontSize: '0.76rem',
                    color: 'var(--tw-text-muted)',
                  }}
                >
                  The <strong>TW-</strong> prefix is fixed. Enter the person's 6-digit number (e.g. 004920). Leading zeros are preserved.
                </p>

                {inputError && (
                  <div
                    className="circle-status-banner circle-status-banner--error"
                    role="alert"
                  >
                    {inputError}
                  </div>
                )}

                {successMessage && (
                  <div
                    className="circle-status-banner circle-status-banner--success"
                    role="status"
                  >
                    ✓ {successMessage}
                  </div>
                )}

                <div
                  style={{
                    display: 'flex',
                    gap: '12px',
                    marginTop: '22px',
                  }}
                >
                  <button
                    type="submit"
                    className="circle-primary-button"
                    style={{
                      margin: 0,
                      flex: 1,
                      minHeight: '48px',
                      display: 'grid',
                      placeItems: 'center',
                    }}
                    disabled={isSearching || isSending}
                  >
                    {isSearching ? 'Looking up ID…' : 'Look Up Account'}
                  </button>

                  <button
                    type="button"
                    onClick={handleBack}
                    style={{
                      padding: '12px 20px',
                      border: '2.5px solid var(--tw-border)',
                      borderRadius: '12px',
                      background: 'var(--tw-surface-raised)',
                      color: 'var(--tw-text)',
                      font: 'inherit',
                      fontSize: '0.82rem',
                      fontWeight: 800,
                      cursor: 'pointer',
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>

              {/* ACCOUNT FOUND PREVIEW & SEND REQUEST */}
              <AnimatePresence>
                {foundAccount && (
                  <motion.div
                    className="circle-lookup-result"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    style={{ marginTop: '24px' }}
                  >
                    <span
                      style={{
                        display: 'block',
                        fontSize: '0.68rem',
                        fontWeight: 900,
                        letterSpacing: '0.12em',
                        textTransform: 'uppercase',
                        color: 'var(--tw-primary)',
                        marginBottom: '8px',
                      }}
                    >
                      ACCOUNT FOUND
                    </span>

                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: '14px',
                      }}
                    >
                      <div>
                        <strong
                          style={{
                            display: 'block',
                            fontSize: '1.15rem',
                            fontWeight: 900,
                          }}
                        >
                          {foundAccount.displayName}
                        </strong>
                        <span
                          style={{
                            fontSize: '0.8rem',
                            color: 'var(--tw-text-muted)',
                            fontWeight: 700,
                          }}
                        >
                          ID: {foundAccount.twoWayId} · {foundAccount.role}
                        </span>
                      </div>

                      <span
                        style={{
                          fontSize: '0.68rem',
                          fontWeight: 900,
                          color: 'var(--tw-primary)',
                          background: 'var(--tw-primary-soft)',
                          padding: '4px 8px',
                          borderRadius: '6px',
                          border: '1.5px solid var(--tw-border)',
                        }}
                      >
                        VERIFIED ACCOUNT
                      </span>
                    </div>

                    <p
                      style={{
                        margin: '0 0 18px',
                        fontSize: '0.78rem',
                        color: 'var(--tw-text-muted)',
                        lineHeight: 1.5,
                      }}
                    >
                      Privacy notice: Your connection request shares only your Two-Way
                      ID and display name. Your Haven journals, mood entries, and private
                      thoughts are never shared.
                    </p>

                    <button
                      type="button"
                      className="circle-primary-button"
                      style={{
                        margin: 0,
                        width: '100%',
                        minHeight: '48px',
                      }}
                      onClick={handleSendRequest}
                      disabled={isSending}
                    >
                      {isSending ? 'Sending request…' : 'Send Connection Request'}
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </section>

          {/* PRIVACY FOOTNOTE */}
          <section className="circle-privacy">
            <div className="circle-privacy-icon">🔒</div>
            <div>
              <span>YOUR PRIVACY IS ENFORCED</span>
              <p>
                Adding someone requires that they accept your request. Sending a
                request never exposes your private journal entries or reflections.
              </p>
            </div>
          </section>
        </div>
      </main>
    </Layout>
  );
}
