import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import TeenLayout from '../layouts/TeenLayout';
import ParentLayout from '../layouts/ParentLayout';

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
    return "I'm here to support you as a parent. What feels like the hardest part of communicating with your teen right now?";
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

  const isParent = location.pathname.startsWith('/app/parent');
  const baseRoute = isParent ? '/app/parent' : '/app/teen';
  const Layout = isParent ? ParentLayout : TeenLayout;

  const storageKey = isParent
    ? 'twoway_nova_conversations_parent'
    : 'twoway_nova_conversations';
  const activeIdKey = isParent
    ? 'twoway_nova_active_id_parent'
    : 'twoway_nova_active_id';

  // Load conversations from localStorage (only user-created ones)
  const [conversations, setConversations] = useState<NovaConversation[]>(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        return JSON.parse(raw);
      }
    } catch (e) {
      console.error('Error loading Nova conversations:', e);
    }
    return [];
  });

  const [activeId, setActiveId] = useState<string | null>(() => {
    return localStorage.getItem(activeIdKey) || null;
  });

  const [inputMessage, setInputMessage] = useState('');
  const [mobileHistoryOpen, setMobileHistoryOpen] = useState(false);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(conversations));
  }, [conversations, storageKey]);

  useEffect(() => {
    if (activeId) {
      localStorage.setItem(activeIdKey, activeId);
    } else {
      localStorage.removeItem(activeIdKey);
    }
  }, [activeId, activeIdKey]);

  // Current active conversation
  const currentConversation = conversations.find((c) => c.id === activeId) || null;
  const messages = currentConversation ? currentConversation.messages : [];

  const handleStartNewConversation = () => {
    setActiveId(null);
    setInputMessage('');
    setMobileHistoryOpen(false);
  };

  const handleSelectConversation = (id: string) => {
    setActiveId(id);
    setInputMessage('');
    setMobileHistoryOpen(false);
  };

  const handleSendMessage = () => {
    const text = inputMessage.trim();
    if (!text) return;

    const now = getCurrentTimestamp();
    const userMsg: NovaMessage = {
      id: createUniqueId('msg_u'),
      role: 'user',
      text,
      timestamp: now,
    };

    const novaReplyText = generateNovaReply(text, isParent);
    const novaMsg: NovaMessage = {
      id: createUniqueId('msg_n'),
      role: 'nova',
      text: novaReplyText,
      timestamp: now + 1,
    };

    if (currentConversation) {
      // Continue existing conversation
      const updatedMessages = [...currentConversation.messages, userMsg, novaMsg];
      const updatedConv: NovaConversation = {
        ...currentConversation,
        messages: updatedMessages,
        updatedAt: getCurrentISODate(),
      };
      setConversations((prev) =>
        prev.map((c) => (c.id === currentConversation.id ? updatedConv : c)),
      );
    } else {
      // Create new conversation
      const title = text.length > 32 ? `${text.slice(0, 32)}...` : text;
      const newConv: NovaConversation = {
        id: createUniqueId('nova'),
        title,
        messages: [userMsg, novaMsg],
        createdAt: getCurrentISODate(),
        updatedAt: getCurrentISODate(),
      };
      setConversations((prev) => [newConv, ...prev]);
      setActiveId(newConv.id);
    }

    setInputMessage('');
  };

  return (
    <Layout>
      <div className="nova-page">
        <div className="nova-shell">

          {/* HEADER */}
          <header className="nova-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <button
                type="button"
                className="nova-back"
                aria-label="Go back"
                onClick={() => navigate(baseRoute)}
              >
                ←
              </button>

              <div className="nova-brand">
                <div>
                  <span className="teen-label">TWO-WAY</span>
                  <h1>Nova</h1>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {/* Mobile history toggle */}
              <button
                type="button"
                className="nova-history-mobile-toggle"
                onClick={() => setMobileHistoryOpen(!mobileHistoryOpen)}
                aria-label="Toggle conversation history"
              >
                ☰ History ({conversations.length})
              </button>

              <button
                type="button"
                className="nova-new-chat-button"
                onClick={handleStartNewConversation}
                title="Start a new conversation"
              >
                + New
              </button>

              <span className="nova-status">
                HERE WITH YOU
              </span>
            </div>
          </header>

          {/* MAIN 2-COLUMN LAYOUT: HISTORY SIDEBAR + CHAT */}
          <div className="nova-workspace">

            {/* CONVERSATION HISTORY SIDEBAR */}
            <aside
              className={`nova-sidebar ${
                mobileHistoryOpen ? 'is-mobile-open' : ''
              }`}
            >
              <div className="nova-sidebar-header">
                <div>
                  <span className="nova-sidebar-label">CONVERSATIONS</span>
                  <strong style={{ display: 'block', fontSize: '0.88rem' }}>
                    Your History
                  </strong>
                </div>

                <button
                  type="button"
                  className="nova-sidebar-new"
                  onClick={handleStartNewConversation}
                >
                  + New
                </button>
              </div>

              <div className="nova-history-list">
                {conversations.length === 0 ? (
                  <div className="nova-history-empty">
                    <p>No previous conversations yet.</p>
                    <small>Chats you have with Nova will be saved here.</small>
                  </div>
                ) : (
                  conversations.map((conv) => {
                    const isActive = conv.id === activeId;
                    return (
                      <button
                        key={conv.id}
                        type="button"
                        className={`nova-history-item ${
                          isActive ? 'is-active' : ''
                        }`}
                        onClick={() => handleSelectConversation(conv.id)}
                      >
                        <span className="nova-history-title">
                          {conv.title}
                        </span>
                        <span className="nova-history-meta">
                          {conv.messages.length} messages
                        </span>
                      </button>
                    );
                  })
                )}
              </div>
            </aside>

            {/* CONVERSATION AREA */}
            <main className="nova-main-chat">

              {/* INTRO */}
              <section className="nova-intro">
                <span className="teen-eyebrow">
                  AI SUPPORT / PRIVATE
                </span>

                <h2>
                  You don't have to
                  <br />
                  <strong>figure it out alone.</strong>
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
              </section>

              {/* COMPOSER */}
              <section className="nova-input-section">
                <textarea
                  value={inputMessage}
                  onChange={(event) => setInputMessage(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' && !event.shiftKey) {
                      event.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder="What's on your mind? Talk it through with Nova..."
                  rows={4}
                />

                <div className="nova-input-footer">
                  <span>Press Enter to send</span>

                  <button
                    type="button"
                    onClick={handleSendMessage}
                    disabled={!inputMessage.trim()}
                  >
                    Send
                  </button>
                </div>
              </section>

              {/* FOOTER */}
              <footer className="nova-footer">
                <p>
                  Nova is here to help you think things through. You stay in control of what you share.
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
    </Layout>
  );
}

export default Nova;