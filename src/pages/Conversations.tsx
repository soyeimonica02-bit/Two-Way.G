import { useNavigate } from 'react-router-dom';

function Conversation() {
  const navigate = useNavigate();

  return (
    <main className="tw-page">
      <div className="tw-container">

        {/* HEADER */}
        <header className="tw-page-header">
          <div
            className="tw-page-header-content"
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '16px',
            }}
          >
            <button
              className="tw-button tw-button-ghost"
              aria-label="Go back"
              onClick={() => navigate('/app/teen')}
              style={{
                marginLeft: '-14px',
                minWidth: '42px',
                height: '42px',
                padding: '0 12px',
                fontSize: '1.2rem',
                display: 'grid',
                placeItems: 'center',
                flexShrink: 0,
              }}
            >
              ←
            </button>

            <div>
              <h1 style={{ marginTop: '0px' }}>Clarity</h1>

              <p className="text-secondary" style={{ marginTop: '4px' }}>
                Say what you actually mean.
              </p>
            </div>
          </div>
        </header>


        {/* STEP INDICATOR */}
        <section className="tw-card" style={{ marginTop: '20px' }}>
          <div style={{ padding: '22px' }}>
            <span className="text-muted">
              YOUR PROCESS
            </span>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(6, 1fr)',
                gap: '8px',
                marginTop: '18px',
              }}
            >
              {[
                'Express',
                'Understand',
                'Translate',
                'Review',
                'Communicate',
                'Understood',
              ].map((step, index) => (
                <div key={step}>
                  <div
                    style={{
                      height: '4px',
                      background:
                        index === 0
                          ? 'var(--tw-primary)'
                          : 'var(--tw-border)',
                      borderRadius: '999px',
                    }}
                  />

                  <span
                    className="text-muted"
                    style={{
                      display: 'block',
                      marginTop: '7px',
                      fontSize: '0.68rem',
                    }}
                  >
                    {step}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>


        {/* EXPRESS */}
        <section
          className="tw-card"
          style={{ marginTop: '20px' }}
        >
          <div style={{ padding: '28px' }}>
            <span className="tw-badge tw-badge-primary">
              EXPRESS
            </span>

            <h2 style={{ marginTop: '14px' }}>
              What do you want to say?
            </h2>

            <p
              className="text-secondary"
              style={{
                marginTop: '8px',
                maxWidth: '620px',
              }}
            >
              Start however feels natural. You don't need to make
              it sound perfect.
            </p>

            <textarea
              className="tw-textarea"
              placeholder="Write what you're really trying to say..."
              style={{
                marginTop: '20px',
                minHeight: '190px',
              }}
            />

            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                marginTop: '14px',
              }}
            >
              <button
                type="button"
                className="tw-button tw-button-primary"
                onClick={() => {
                  // Nova understanding step connection
                }}
              >
                Continue
              </button>
            </div>
          </div>
        </section>


        {/* NOVA PREVIEW */}
        <section
          className="tw-card"
          style={{
            marginTop: '20px',
            background: 'var(--tw-surface-soft)',
          }}
        >
          <div style={{ padding: '26px' }}>
            <span className="text-muted">
              NOVA
            </span>

            <h3 style={{ marginTop: '8px' }}>
              Your words can be understood before they're sent.
            </h3>

            <p
              className="text-secondary"
              style={{
                marginTop: '8px',
                maxWidth: '650px',
              }}
            >
              Nova will help you understand what you're trying to
              communicate and offer a clearer version without
              changing what you mean.
            </p>

            <button
              type="button"
              className="tw-button tw-button-secondary"
              style={{ marginTop: '18px' }}
              onClick={() => navigate('/app/teen/nova')}
            >
              Open Nova
            </button>
          </div>
        </section>


        {/* PRIVACY */}
        <section
          style={{
            marginTop: '24px',
            paddingBottom: '30px',
          }}
        >
          <p
            className="text-muted"
            style={{
              fontSize: '0.78rem',
              textAlign: 'center',
            }}
          >
            Your draft stays private until you choose to communicate it.
          </p>
        </section>

      </div>
    </main>
  );
}

export default Conversation;