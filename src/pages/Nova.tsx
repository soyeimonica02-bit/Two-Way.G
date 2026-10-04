import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import TeenLayout from '../layouts/TeenLayout';

function Nova() {
  const navigate = useNavigate();

  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<
    { role: 'user' | 'nova'; text: string }[]
  >([]);

  const sendMessage = () => {
    const trimmed = message.trim();

    if (!trimmed) return;

    setMessages((current) => [
      ...current,
      {
        role: 'user',
        text: trimmed,
      },
      {
        role: 'nova',
        text:
          "I'm here with you. Tell me a little more about what's going on, and we'll work through it together.",
      },
    ]);

    setMessage('');
  };

  return (
    <TeenLayout>
      <div className="nova-page">
        <div className="nova-shell">

          {/* HEADER */}

          <header className="nova-header">
            <button
              type="button"
              className="nova-back"
              onClick={() => navigate('/app/teen')}
            >
              ← Home
            </button>

            <div className="nova-brand">
              <span className="nova-symbol">✦</span>

              <div>
                <span className="teen-label">
                  TWO-WAY
                </span>

                <h1>Nova</h1>
              </div>
            </div>

            <span className="nova-status">
              HERE WITH YOU
            </span>
          </header>

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
              Talk through what's on your mind.
              Find the words.
              Untangle the complicated stuff.
            </p>
          </section>

          {/* QUICK START */}

          {messages.length === 0 && (
            <section className="nova-prompts">

              <button
                type="button"
                onClick={() =>
                  setMessage(
                    "I don't know how to explain what I'm feeling."
                  )
                }
              >
                <span>01</span>
                <strong>
                  I don't know how to explain what I'm feeling.
                </strong>
                <span>↗</span>
              </button>

              <button
                type="button"
                onClick={() =>
                  setMessage(
                    "I need help having a difficult conversation."
                  )
                }
              >
                <span>02</span>
                <strong>
                  I need help having a difficult conversation.
                </strong>
                <span>↗</span>
              </button>

              <button
                type="button"
                onClick={() =>
                  setMessage(
                    "Something happened and I need to talk about it."
                  )
                }
              >
                <span>03</span>
                <strong>
                  Something happened and I need to talk about it.
                </strong>
                <span>↗</span>
              </button>

            </section>
          )}

          {/* CHAT */}

          <section className="nova-chat">

            {messages.map((item, index) => (
              <div
                key={`${item.role}-${index}`}
                className={`nova-message ${
                  item.role === 'user'
                    ? 'nova-message-user'
                    : 'nova-message-nova'
                }`}
              >
                <span className="teen-label">
                  {item.role === 'user'
                    ? 'YOU'
                    : 'NOVA'}
                </span>

                <p>{item.text}</p>
              </div>
            ))}

          </section>

          {/* INPUT */}

          <section className="nova-input-section">

            <textarea
              value={message}
              onChange={(event) =>
                setMessage(event.target.value)
              }
              onKeyDown={(event) => {
                if (
                  event.key === 'Enter' &&
                  !event.shiftKey
                ) {
                  event.preventDefault();
                  sendMessage();
                }
              }}
              placeholder="What's on your mind?"
              rows={4}
            />

            <div className="nova-input-footer">
              <span>
                Press Enter to send
              </span>

              <button
                type="button"
                onClick={sendMessage}
                disabled={!message.trim()}
              >
                Send →
              </button>
            </div>

          </section>

          {/* FOOTER */}

          <footer className="nova-footer">
            <p>
              Nova is here to help you think things through.
              You stay in control of what you share.
            </p>

            <button
              type="button"
              onClick={() => navigate('/app/teen')}
            >
              Exit Nova
            </button>
          </footer>

        </div>
      </div>
    </TeenLayout>
  );
}

export default Nova;