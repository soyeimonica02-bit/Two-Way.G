import { motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';

function ConversationView() {
  const navigate = useNavigate();
  const { conversationId } = useParams();

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
            onClick={() =>
              navigate('/app/teen/conversations')
            }
          >
            ← Back
          </button>

          <div className="conversation-view-title">
            <span>CONVERSATION</span>

            <h1>
              {conversationId || 'Conversation'}
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


          <div className="conversation-message conversation-message-you">

            <span className="conversation-message-label">
              YOU
            </span>

            <p>
              Your message will appear here.
            </p>

          </div>

        </section>


        {/* =========================================
            INPUT
        ========================================= */}

        <section className="conversation-view-input">

          <textarea
            placeholder="Write what you want to say..."
          />

          <div className="conversation-view-input-footer">

            <span>
              You can take your time.
            </span>

            <button
              type="button"
            >
              Send →
            </button>

          </div>

        </section>


        {/* =========================================
            NOVA OPTION
        ========================================= */}

        <button
          type="button"
          className="conversation-view-nova"
          onClick={() =>
            navigate('/app/teen/nova')
          }
        >

          <div>
            <span>
              NEED HELP FINDING THE WORDS?
            </span>

            <strong>
              Talk to Nova first.
            </strong>
          </div>

          <span>
            →
          </span>

        </button>


        {/* =========================================
            FOOTER
        ========================================= */}

        <footer className="conversation-view-footer">

          <button
            type="button"
            onClick={() =>
              navigate('/app/teen/conversations')
            }
          >
            All conversations
          </button>

        </footer>

      </div>
    </main>
  );
}

export default ConversationView;