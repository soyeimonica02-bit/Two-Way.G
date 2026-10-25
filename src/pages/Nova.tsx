import { useState, useEffect, useRef, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import TeenLayout from '../layouts/TeenLayout';
import ParentLayout from '../layouts/ParentLayout';
import {
  getCurrentTeenAgeStatus,
  syncServerAgeSession,
  AGE_OUT_BANNER_MESSAGE,
} from '../utils/ageVerification';

interface NovaMessage {
  id: string;
  role: 'user' | 'nova';
  text: string;
  timestamp: number;
}

interface NovaConversation {
  id: string;
  title: string;
  messages: NovaMessage[];
  createdAt: string;
  updatedAt: string;
}

function generateNovaReply(userText: string, isParent: boolean): string {
  const lower = userText.toLowerCase();

  if (isParent) {
    if (
      lower.includes('teen') ||
      lower.includes('child') ||
      lower.includes('son') ||
      lower.includes('daughter') ||
      lower.includes('kid')
    ) {
      return "Communicating with your teenager can feel challenging, especially when emotions flare. What do you most want them to feel from you right now—safety, being heard, or a calm boundary?";
    }
    if (
      lower.includes('anxious') ||
      lower.includes('scared') ||
      lower.includes('worry') ||
      lower.includes('nervous')
    ) {
      return "It is completely natural as a parent to feel anxious when communication breaks down. Take a slow breath—what is the one core message of care you want your teen to know?";
    }
    if (
      lower.includes('mad') ||
      lower.includes('angry') ||
      lower.includes('frustrated') ||
      lower.includes('disrespect')
    ) {
      return "Frustration usually peaks when we feel unappreciated or unheard. Before responding, let's step back: what boundary or need is most important for you to hold calmly?";
    }
    return "I'm here as your sounding board. What feels like the hardest part of communicating with your teen right now?";
  }

  if (
    lower.includes('anxious') ||
    lower.includes('scared') ||
    lower.includes('worry') ||
    lower.includes('nervous')
  ) {
    return "It makes total sense that you're feeling nervous. When anxiety kicks in, everything feels urgent. Take a slow breath—what is the one core thing you want the other person to understand?";
  }
  if (
    lower.includes('mad') ||
    lower.includes('angry') ||
    lower.includes('frustrated') ||
    lower.includes('unfair')
  ) {
    return "Frustration usually means a boundary was crossed or you didn't feel heard. Let's step back for a second: what actually caused that feeling, and how can we say it without sparking a fight?";
  }
  if (
    lower.includes('sad') ||
    lower.includes('low') ||
    lower.includes('alone') ||
    lower.includes('hurt')
  ) {
    return "I hear you. When you're feeling hurt or down, finding the words can take a lot of energy. You don't need a perfect speech—what's one simple sentence that describes how things feel right now?";
  }
  if (
    lower.includes('parent') ||
    lower.includes('mom') ||
    lower.includes('dad')
  ) {
    return "Talking to parents about difficult topics is tough because reactions can be unpredictable. What do you wish they would understand before you even start the conversation?";
  }
  return "I'm here with you. What feels like the hardest part to put into words right now?";
}

function generateTopicTitle(userText: string): string {
  const clean = userText.trim().replace(/[?!.,;:'"()]+/g, ' ').replace(/\s+/g, ' ');
  const lower = clean.toLowerCase();

  // Concise 2-6 word meaningful topic themes
  if (lower.includes('curfew') || lower.includes('late')) return 'Setting Curfew Boundaries';
  if (lower.includes('grade') || lower.includes('school') || lower.includes('homework') || lower.includes('test') || lower.includes('exam')) return 'Managing School Stress';
  if (lower.includes('friend') || lower.includes('drama') || lower.includes('argument')) return 'Resolving Friend Tension';
  if (lower.includes('anxious') || lower.includes('anxiety') || lower.includes('nervous') || lower.includes('panic') || lower.includes('scared')) return 'Working Through Anxiety';
  if (lower.includes('sad') || lower.includes('down') || lower.includes('hurt') || lower.includes('lonely') || lower.includes('alone')) return 'Processing Difficult Emotions';
  if (lower.includes('listen') || lower.includes('unheard') || lower.includes('ignore')) return 'Feeling Heard and Understood';
  if (lower.includes('screaming') || lower.includes('yell') || lower.includes('fight') || lower.includes('mad') || lower.includes('angry')) return 'De-Escalating Heated Conflict';
  if (lower.includes('trust') || lower.includes('privacy') || lower.includes('secret')) return 'Rebuilding Family Trust';
  if (lower.includes('phone') || lower.includes('screen') || lower.includes('device') || lower.includes('social media')) return 'Screen Time and Boundaries';
  if (lower.includes('respect') || lower.includes('attitude') || lower.includes('tone')) return 'Mutual Respect and Tone';
  if (lower.includes('overwhelm') || lower.includes('exhausted') || lower.includes('tired')) return 'Coping With Overwhelm';
  if (lower.includes('boundary') || lower.includes('boundaries') || lower.includes('space')) return 'Establishing Personal Boundaries';
  if (lower.includes('future') || lower.includes('college') || lower.includes('career')) return 'Planning for Future Steps';

  // Natural extraction: take first 3-5 words, stripping common filler openings
  const words = clean.split(' ').filter(Boolean);
  const filler = new Set(['i', 'im', "i'm", 'can', 'you', 'help', 'me', 'with', 'how', 'do', 'what', 'should', 'why', 'is', 'the', 'a', 'an', 'my', 'so', 'just', 'we', 'need', 'to', 'talk', 'about']);
  let startIdx = 0;
  while (startIdx < words.length - 2 && filler.has(words[startIdx].toLowerCase())) {
    startIdx++;
  }
  const slice = words.slice(startIdx, startIdx + 4);
  if (slice.length >= 2) {
    const topic = slice.map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
    return topic;
  }
  const fallback = words.slice(0, 3).map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
  return fallback || 'Conversation Reflection';
}

function createUniqueId(prefix: string): string {
  return `${prefix}_${Date.now()}`;
}

function getCurrentTimestamp(): number {
  return Date.now();
}

function getCurrentISODate(): string {
  return new Date().toISOString();
}

function Nova() {
  const navigate = useNavigate();
  const location = useLocation();
  const chatBottomRef = useRef<HTMLDivElement>(null);

  const isParent = location.pathname.startsWith('/app/parent');
  const baseRoute = isParent ? '/app/parent' : '/app/teen';

  const storageKey = isParent
    ? 'twoway_nova_conversations_parent'
    : 'twoway_nova_conversations';

  // Load conversations from localStorage (separate by role)
  const [conversations, setConversations] = useState<NovaConversation[]>(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          return parsed.map((conv: NovaConversation) => {
            const isGeneric = !conv.title || conv.title === 'Nova Chat' || conv.title === 'New Conversation' || conv.title === 'New Chat' || conv.title === 'Untitled';
            if (isGeneric && conv.messages && conv.messages.length > 0) {
              const firstUserMsg = conv.messages.find((m) => m.role === 'user');
              if (firstUserMsg && firstUserMsg.text) {
                return { ...conv, title: generateTopicTitle(firstUserMsg.text) };
              }
            }
            return conv;
          });
        }
      }
    } catch (e) {
      console.error('Error loading Nova conversations:', e);
    }
    return [];
  });

  // REQUIREMENT 1: FRESH CONVERSATIONS BY DEFAULT
  // Always initialize activeId to null so opening Nova presents a fresh, empty conversation
  const [activeId, setActiveId] = useState<string | null>(null);

  // REQUIREMENT 2: HIDE HISTORY BEHIND MENU DRAWER
  const [historyDrawerOpen, setHistoryDrawerOpen] = useState(false);

  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [ageStatus, setAgeStatus] = useState(() => getCurrentTeenAgeStatus());

  useEffect(() => {
    if (!isParent) {
      syncServerAgeSession().then((session) => {
        if (session) {
          setAgeStatus((prev) => ({
            ...prev,
            isAgedOut: session.isAgedOut,
            isEligibleTeen: session.canCreateContent,
          }));
        }
      });
    }
  }, [isParent]);

  // Sync conversations to localStorage whenever updated
  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(conversations));
  }, [conversations, storageKey]);

  // Keyboard navigation for History Drawer (Esc key closes drawer)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && historyDrawerOpen) {
        setHistoryDrawerOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [historyDrawerOpen]);

  // Current active conversation
  const currentConversation = conversations.find((c) => c.id === activeId) || null;
  const messages = useMemo(() => {
    return currentConversation ? currentConversation.messages : [];
  }, [currentConversation]);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleStartNewConversation = () => {
    if (!isParent && ageStatus.isAgedOut) {
      return;
    }
    setActiveId(null);
    setInputMessage('');
    setHistoryDrawerOpen(false);
  };

  const handleSelectConversation = (id: string) => {
    setActiveId(id);
    setInputMessage('');
    setHistoryDrawerOpen(false);
  };

  const handleSendMessage = async () => {
    const text = inputMessage.trim();
    if (!text || isTyping) return;

    if (!isParent && ageStatus.isAgedOut) {
      return;
    }

    // Server-side authorization verification
    if (!isParent) {
      try {
        const sessionToken = localStorage.getItem('twoway_session_token');
        const res = await fetch('/api/teen/nova', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(sessionToken ? { Authorization: `Bearer ${sessionToken}` } : {}),
          },
          body: JSON.stringify({ message: text }),
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          if (errData.error === 'AGE_RESTRICTED') {
            return;
          }
        }
      } catch {
        // Offline handling
      }
    }

    const now = getCurrentTimestamp();
    const userMsg: NovaMessage = {
      id: createUniqueId('msg_u'),
      role: 'user',
      text,
      timestamp: now,
    };

    let targetConvId = currentConversation?.id;

    if (currentConversation) {
      const updatedConv: NovaConversation = {
        ...currentConversation,
        messages: [...currentConversation.messages, userMsg],
        updatedAt: getCurrentISODate(),
      };
      setConversations((prev) =>
        prev.map((c) => (c.id === currentConversation.id ? updatedConv : c)),
      );
    } else {
      const title = generateTopicTitle(text);
      const newConvId = createUniqueId('nova');
      targetConvId = newConvId;
      const newConv: NovaConversation = {
        id: newConvId,
        title,
        messages: [userMsg],
        createdAt: getCurrentISODate(),
        updatedAt: getCurrentISODate(),
      };
      setConversations((prev) => [newConv, ...prev]);
      setActiveId(newConvId);
    }

    setInputMessage('');
    setIsTyping(true);

    // Thoughtful simulated response delay
    setTimeout(() => {
      const novaReplyText = generateNovaReply(text, isParent);
      const novaMsg: NovaMessage = {
        id: createUniqueId('msg_n'),
        role: 'nova',
        text: novaReplyText,
        timestamp: getCurrentTimestamp(),
      };

      setConversations((prev) =>
        prev.map((c) =>
          c.id === targetConvId
            ? { ...c, messages: [...c.messages, novaMsg], updatedAt: getCurrentISODate() }
            : c,
        ),
      );
      setIsTyping(false);
    }, 450);
  };

  // -------------------------------------------------------------
  // ACCESSIBLE CONVERSATION HISTORY DRAWER / SLIDE-OVER PANEL
  // -------------------------------------------------------------
  const renderHistoryDrawer = () => {
    if (!historyDrawerOpen) return null;

    return (
      <>
        {/* BACKDROP OVERLAY */}
        <div
          onClick={() => setHistoryDrawerOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(2px)',
            zIndex: 9998,
          }}
          aria-hidden="true"
        />

        {/* DRAWER PANEL */}
        <aside
          role="dialog"
          aria-modal="true"
          aria-label="Conversation History"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            bottom: 0,
            width: 'min(340px, 85vw)',
            backgroundColor: isParent ? 'var(--parent-surface, #ffffff)' : 'var(--tw-surface, #faf9f2)',
            color: isParent ? 'var(--parent-text, #000000)' : 'var(--tw-text, #1a1628)',
            borderRight: '2px solid var(--tw-border, #282436)',
            boxShadow: '8px 0 24px rgba(0, 0, 0, 0.15)',
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
            padding: '20px',
            overflowY: 'auto',
          }}
        >
          {/* HEADER WITH CLOSE BUTTON */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', paddingBottom: '12px', borderBottom: '1.5px solid var(--tw-border)' }}>
            <span style={{ fontSize: '0.74rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--tw-text-secondary)' }}>
              {isParent ? 'SAVED REFLECTIONS' : 'CONVERSATION HISTORY'}
            </span>

            <button
              type="button"
              onClick={() => setHistoryDrawerOpen(false)}
              aria-label="Close conversation history"
              title="Close conversation history"
              style={{
                background: 'transparent',
                border: '1.5px solid var(--tw-border)',
                borderRadius: '8px',
                padding: '4px 10px',
                fontSize: '1.1rem',
                fontWeight: 800,
                cursor: 'pointer',
                color: 'inherit',
              }}
            >
              ✕
            </button>
          </div>

          {/* NEW CONVERSATION ACTION INSIDE DRAWER */}
          {(!isParent && ageStatus.isAgedOut) ? null : (
            <button
              type="button"
              onClick={handleStartNewConversation}
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: '10px',
                border: '2px solid var(--tw-border)',
                background: 'var(--tw-primary, #5b4ee4)',
                color: '#ffffff',
                fontWeight: 800,
                fontSize: '0.9rem',
                cursor: 'pointer',
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
              }}
            >
              + Start New Conversation
            </button>
          )}

          {/* CONVERSATIONS LIST */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px', overflowY: 'auto' }}>
            {conversations.length === 0 ? (
              <p style={{ fontSize: '0.86rem', color: 'var(--tw-text-secondary)', lineHeight: 1.5, padding: '12px 0' }}>
                No saved conversations yet. Conversations you have with Nova remain private to your device.
              </p>
            ) : (
              conversations.map((conv) => {
                const isActive = conv.id === activeId;
                return (
                  <button
                    key={conv.id}
                    type="button"
                    onClick={() => handleSelectConversation(conv.id)}
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      borderRadius: '10px',
                      border: isActive ? '2px solid var(--tw-primary)' : '1.5px solid var(--tw-border)',
                      background: isActive ? 'var(--tw-surface-raised, #ebe7fe)' : 'var(--tw-background, #f3f1e7)',
                      color: 'var(--tw-text)',
                      textAlign: 'left',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px',
                      transition: 'all 120ms ease',
                    }}
                  >
                    <strong style={{ fontSize: '0.88rem', fontWeight: 800, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {conv.title}
                    </strong>
                    <span style={{ fontSize: '0.74rem', color: 'var(--tw-text-secondary)' }}>
                      {conv.messages.length} {conv.messages.length === 1 ? 'message' : 'messages'} · {new Date(conv.updatedAt).toLocaleDateString()}
                    </span>
                  </button>
                );
              })
            )}
          </div>
        </aside>
      </>
    );
  };

  // -------------------------------------------------------------
  // PARENT PRESENTATION: MONOCHROMATIC & HIGH CONTRAST LIGHT THEME
  // -------------------------------------------------------------
  if (isParent) {
    return (
      <ParentLayout>
        <div className="parent-dashboard" style={{ paddingBottom: '32px' }}>
          {renderHistoryDrawer()}

          {/* PARENT HEADER WITH HAMBURGER MENU BUTTON + BACK + NEW CHAT */}
          <header
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '20px',
              flexWrap: 'wrap',
              gap: '12px',
              position: 'sticky',
              top: 0,
              zIndex: 20,
              background: 'var(--parent-bg, #ffffff)',
              padding: '10px 0',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {/* ACCESSIBLE THREE-LINE HAMBURGER MENU BUTTON */}
              <button
                type="button"
                onClick={() => setHistoryDrawerOpen(true)}
                aria-label="Open conversation history"
                title="Open conversation history"
                style={{
                  background: 'transparent',
                  border: '1.5px solid var(--parent-border, #E4E4E7)',
                  borderRadius: '8px',
                  padding: '8px 12px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  minHeight: '40px',
                  color: 'var(--parent-text)',
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </svg>
              </button>

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
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
              </button>

              <h1 style={{ margin: 0, fontSize: '1.45rem', fontWeight: 850 }}>
                Nova
              </h1>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
              <button
                type="button"
                className="parent-btn-primary"
                onClick={handleStartNewConversation}
                title="Start a new reflection"
                style={{ fontSize: '0.82rem', padding: '8px 16px', minHeight: '44px', flexShrink: 0 }}
              >
                + New Chat
              </button>
            </div>
          </header>

          {/* MAIN FULL-WIDTH CHAT CONTAINER */}
          <main
            style={{
              background: 'var(--parent-surface, #ffffff)',
              border: '1.5px solid var(--parent-border, #E4E4E7)',
              borderRadius: '12px',
              display: 'flex',
              flexDirection: 'column',
              minHeight: '520px',
              overflow: 'hidden',
            }}
          >
            {/* INTRO BAR */}
            <div
              style={{
                padding: '18px 22px',
                borderBottom: '1px solid var(--parent-border, #E4E4E7)',
                background: 'var(--parent-surface-subtle, #F8F8F9)',
              }}
            >
              <span className="parent-card-label" style={{ marginBottom: '4px' }}>
                CONFIDENTIAL PARENT SOUNDING BOARD
              </span>
              <h2 style={{ margin: '0 0 4px', fontSize: '1.15rem', color: 'var(--parent-text)' }}>
                Pause. Reflect. Prepare your response.
              </h2>
              <p style={{ margin: 0, fontSize: '0.86rem', color: 'var(--parent-text-secondary)', lineHeight: 1.5 }}>
                Talk through sensitive parenting situations, test constructive phrasings, and find calm before you talk with your teen.
              </p>
            </div>

            {/* MESSAGES SCROLL AREA */}
            <div
              style={{
                flex: 1,
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '14px',
                overflowY: 'auto',
                maxHeight: '420px',
              }}
            >
              {messages.length === 0 ? (
                <div
                  style={{
                    margin: 'auto',
                    textAlign: 'center',
                    padding: '30px 20px',
                    maxWidth: '420px',
                  }}
                >
                  <p style={{ margin: '0 0 8px', fontSize: '0.92rem', color: 'var(--parent-text)', fontWeight: 700 }}>
                    Start a fresh reflection.
                  </p>
                  <p style={{ margin: 0, fontSize: '0.84rem', color: 'var(--parent-text-secondary)', lineHeight: 1.55 }}>
                    Type your situation below. Nova helps you clarify your thoughts and prepare a constructive, calm conversation.
                  </p>
                </div>
              ) : (
                messages.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      alignSelf: item.role === 'user' ? 'flex-end' : 'flex-start',
                      maxWidth: '82%',
                      padding: '12px 16px',
                      borderRadius: '10px',
                      background: item.role === 'user' ? 'var(--parent-primary, #000000)' : 'var(--parent-surface-subtle, #F8F8F9)',
                      color: item.role === 'user' ? '#FFFFFF' : 'var(--parent-text, #000000)',
                      border: '1px solid var(--parent-border, #E4E4E7)',
                      fontSize: '0.92rem',
                      lineHeight: 1.55,
                    }}
                  >
                    <span
                      style={{
                        display: 'block',
                        fontSize: '0.68rem',
                        fontWeight: 850,
                        letterSpacing: '0.08em',
                        marginBottom: '4px',
                        color: item.role === 'user' ? 'rgba(255,255,255,0.8)' : 'var(--parent-text-muted)',
                      }}
                    >
                      {item.role === 'user' ? 'YOU' : 'NOVA'}
                    </span>
                    <p style={{ margin: 0 }}>{item.text}</p>
                  </div>
                ))
              )}
              {isTyping && (
                <div
                  style={{
                    alignSelf: 'flex-start',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    background: 'var(--parent-surface-subtle)',
                    border: '1px solid var(--parent-border)',
                    fontSize: '0.82rem',
                    color: 'var(--parent-text-secondary)',
                    fontStyle: 'italic',
                  }}
                >
                  Nova is considering a thoughtful response...
                </div>
              )}
              <div ref={chatBottomRef} />
            </div>

            {/* COMPOSER */}
            <div
              style={{
                borderTop: '1px solid var(--parent-border)',
                padding: '16px 20px',
                background: 'var(--parent-surface)',
              }}
            >
              <textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder="Describe a tense moment, draft a boundary, or ask for another perspective..."
                rows={3}
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  borderRadius: '8px',
                  border: '1.5px solid var(--parent-border)',
                  background: 'var(--parent-surface-subtle)',
                  color: 'var(--parent-text)',
                  fontSize: '0.92rem',
                  lineHeight: 1.5,
                  outline: 'none',
                  resize: 'none',
                  boxSizing: 'border-box',
                  fontFamily: 'inherit',
                }}
              />

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px', flexWrap: 'wrap', gap: '10px' }}>
                <span style={{ fontSize: '0.74rem', color: 'var(--parent-text-muted)' }}>
                  Press Enter to send · Shift+Enter for newline
                </span>

                <button
                  type="button"
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim() || isTyping}
                  className="parent-btn-primary"
                  style={{
                    padding: '8px 22px',
                    fontSize: '0.86rem',
                    opacity: !inputMessage.trim() || isTyping ? 0.5 : 1,
                    cursor: !inputMessage.trim() || isTyping ? 'not-allowed' : 'pointer',
                  }}
                >
                  Send to Nova
                </button>
              </div>
            </div>

            {/* FOOTER NOTICE */}
            <div
              style={{
                padding: '10px 20px',
                background: 'var(--parent-surface-subtle)',
                borderTop: '1px solid var(--parent-border)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: '0.74rem',
                color: 'var(--parent-text-muted)',
              }}
            >
              <span>Nova is an AI sounding board. Not a human connection or medical provider.</span>
              <button
                type="button"
                onClick={() => navigate(baseRoute)}
                style={{ background: 'transparent', border: 'none', color: 'var(--parent-text)', fontWeight: 750, cursor: 'pointer', textDecoration: 'underline' }}
              >
                Exit Nova
              </button>
            </div>
          </main>
        </div>
      </ParentLayout>
    );
  }

  // -------------------------------------------------------------
  // TEEN PRESENTATION: LIGHT TACTILE BRUTALISM & ACCESSIBLE UI
  // -------------------------------------------------------------
  return (
    <TeenLayout>
      <div className="nova-page">
        {renderHistoryDrawer()}

        <div className="nova-shell">
          {/* TEEN HEADER WITH HAMBURGER MENU BUTTON + BACK + NEW CHAT */}
          <header className="nova-header" style={{ position: 'sticky', top: 0, zIndex: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {/* ACCESSIBLE THREE-LINE HAMBURGER MENU BUTTON */}
              <button
                type="button"
                onClick={() => setHistoryDrawerOpen(true)}
                aria-label="Open conversation history"
                title="Open conversation history"
                style={{
                  background: 'transparent',
                  border: '2px solid var(--tw-border, #282436)',
                  borderRadius: '10px',
                  padding: '8px 12px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  minHeight: '44px',
                  color: 'var(--tw-text, #1a1628)',
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </svg>
              </button>

              <button
                type="button"
                className="nova-back"
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
                ←
              </button>

              <div className="nova-brand">
                <h1>Nova</h1>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
              <button
                type="button"
                className="nova-new-chat-button"
                onClick={handleStartNewConversation}
                title="Start a new conversation"
                style={{ minHeight: '44px', flexShrink: 0 }}
              >
                + New Chat
              </button>
            </div>
          </header>

          {/* MAIN FULL-WIDTH CHAT WORKSPACE */}
          <div className="nova-workspace" style={{ display: 'block' }}>
            <main className="nova-main-chat" style={{ width: '100%' }}>

              {/* AGE-OUT RESTRICTION CALM NOTICE */}
              {ageStatus.isAgedOut && (
                <div
                  style={{
                    background: 'var(--tw-surface, #ffffff)',
                    border: '2px solid var(--tw-border)',
                    borderLeft: '5px solid #d97706',
                    borderRadius: '12px',
                    padding: '16px 20px',
                    marginBottom: '20px',
                    boxShadow: '3px 3px 0 rgba(0, 0, 0, 0.06)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    <span style={{ fontSize: '1.1rem' }}>⏳</span>
                    <strong style={{ fontSize: '0.94rem', color: 'var(--tw-text)', fontWeight: 800 }}>
                      Account Transition Notice (Read-Only Mode)
                    </strong>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.86rem', color: 'var(--tw-text-secondary)', lineHeight: 1.55 }}>
                    {AGE_OUT_BANNER_MESSAGE}
                  </p>
                </div>
              )}

              {/* INTRO */}
              <section className="nova-intro">
                <span className="teen-eyebrow">
                  AI SUPPORT / PRIVATE
                </span>

                <h2>
                  You don't have to figure it out alone.
                </h2>

                <p>
                  Talk through what's on your mind. Find the words. Untangle the complicated stuff.
                </p>
              </section>

              {/* CHAT MESSAGES */}
              <section className="nova-chat">
                {messages.length === 0 ? (
                  <div className="nova-empty-chat-notice">
                    <p>
                      Start typing below to talk with Nova. Your conversation is completely private.
                    </p>
                  </div>
                ) : (
                  messages.map((item) => (
                    <div
                      key={item.id}
                      className={`nova-message ${
                        item.role === 'user'
                          ? 'nova-message-user'
                          : 'nova-message-nova'
                      }`}
                    >
                      <span className="teen-label">
                        {item.role === 'user' ? 'YOU' : 'NOVA'}
                      </span>
                      <p>{item.text}</p>
                    </div>
                  ))
                )}
                {isTyping && (
                  <div className="nova-message nova-message-nova" style={{ fontStyle: 'italic', opacity: 0.8 }}>
                    <span className="teen-label">NOVA</span>
                    <p>Nova is thinking...</p>
                  </div>
                )}
                <div ref={chatBottomRef} />
              </section>

              {/* COMPOSER */}
              <section className="nova-input-section">
                <textarea
                  value={inputMessage}
                  disabled={ageStatus.isAgedOut}
                  onChange={(event) => setInputMessage(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' && !event.shiftKey) {
                      event.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder={
                    ageStatus.isAgedOut
                      ? 'At age 20, teen accounts transition to a restricted read-only state. Nova interactions are closed.'
                      : "What's on your mind? Talk it through with Nova..."
                  }
                  rows={3}
                  style={
                    ageStatus.isAgedOut
                      ? { opacity: 0.65, cursor: 'not-allowed', background: 'var(--tw-surface-subtle, #f4f4f5)' }
                      : undefined
                  }
                />

                <div className="nova-input-footer">
                  <span>
                    {ageStatus.isAgedOut
                      ? 'Read-only mode active · Historical chats preserved'
                      : 'Press Enter to send · Shift+Enter for newline'}
                  </span>

                  <button
                    type="button"
                    onClick={handleSendMessage}
                    disabled={!inputMessage.trim() || isTyping || ageStatus.isAgedOut}
                    style={
                      ageStatus.isAgedOut
                        ? { opacity: 0.5, cursor: 'not-allowed' }
                        : undefined
                    }
                  >
                    Send
                  </button>
                </div>
              </section>

              {/* FOOTER */}
              <footer className="nova-footer">
                <p>
                  Nova is an AI assistant, not a human connection or circle member. Conversations stay strictly private to you.
                </p>

                <button
                  type="button"
                  onClick={() => navigate(baseRoute)}
                >
                  Exit Nova
                </button>
              </footer>

            </main>
          </div>
        </div>
      </div>
    </TeenLayout>
  );
}

export default Nova;