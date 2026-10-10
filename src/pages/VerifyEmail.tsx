import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function VerifyEmail() {
  const navigate = useNavigate()

  const email =
    localStorage.getItem('twoway_registered_email') || ''

  const [verified, setVerified] = useState(
    localStorage.getItem('twoway_email_verified') === 'true'
  )

  const handleVerify = () => {
    localStorage.setItem('twoway_email_verified', 'true')
    setVerified(true)
  }

  const handleContinue = () => {
    if (!verified) {
      return
    }

    localStorage.removeItem('twoway_signup_role')
    localStorage.removeItem('twoway_signup_dob')

    navigate('/onboarding')
  }

  return (
    <main className="tw-page">
      <div className="tw-container">
        <section
          style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '40px 24px',
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '500px',
            }}
          >
            <div
              style={{
                marginBottom: '32px',
                textAlign: 'center',
              }}
            >
              <img
                src="/favicon.svg"
                alt="Two-Way"
                style={{
                  width: '64px',
                  height: '64px',
                  marginBottom: '24px',
                }}
              />

              <p
                className="text-secondary"
                style={{
                  margin: '0 0 8px',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                }}
              >
                Almost there
              </p>

              <h1
                style={{
                  margin: 0,
                  fontFamily: 'var(--font-display)',
                  fontSize: 'clamp(2rem, 6vw, 3rem)',
                  fontWeight: 800,
                  lineHeight: 1.05,
                  letterSpacing: '-0.04em',
                }}
              >
                Check your email.
              </h1>

              <p
                className="text-secondary"
                style={{
                  margin: '14px auto 0',
                  maxWidth: '430px',
                  fontSize: '1rem',
                  lineHeight: 1.6,
                }}
              >
                We sent a verification message to{' '}
                <strong>{email}</strong>.
              </p>
            </div>

            <div
              style={{
                padding: '24px',
                border: '2px solid var(--tw-border)',
                borderRadius: '16px',
                background: 'var(--tw-surface)',
                boxShadow:
                  '4px 4px 0 rgba(0, 0, 0, 0.08)',
              }}
            >
              {!verified ? (
                <>
                  <div
                    style={{
                      marginBottom: '20px',
                      padding: '16px',
                      borderRadius: '10px',
                      background:
                        'rgba(99, 102, 241, 0.08)',
                    }}
                  >
                    <p
                      style={{
                        margin: 0,
                        fontSize: '0.88rem',
                        lineHeight: 1.55,
                      }}
                    >
                      For this prototype, clicking the button
                      below simulates successfully verifying
                      your email.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleVerify}
                    style={{
                      width: '100%',
                      padding: '14px 18px',
                      border: '2px solid var(--tw-border)',
                      borderRadius: '10px',
                      background: 'var(--tw-primary)',
                      color: 'var(--tw-primary-text, #ffffff)',
                      fontSize: '0.95rem',
                      fontWeight: 800,
                      cursor: 'pointer',
                    }}
                  >
                    Verify Email
                  </button>
                </>
              ) : (
                <>
                  <div
                    style={{
                      marginBottom: '20px',
                      padding: '16px',
                      borderRadius: '10px',
                      background:
                        'rgba(34, 197, 94, 0.1)',
                    }}
                  >
                    <p
                      style={{
                        margin: 0,
                        fontSize: '0.9rem',
                        fontWeight: 700,
                      }}
                    >
                      ✓ Email verified successfully.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleContinue}
                    style={{
                      width: '100%',
                      padding: '14px 18px',
                      border: '2px solid var(--tw-border)',
                      borderRadius: '10px',
                      background: 'var(--tw-primary)',
                      color: 'var(--tw-primary-text, #ffffff)',
                      fontSize: '0.95rem',
                      fontWeight: 800,
                      cursor: 'pointer',
                    }}
                  >
                    Continue to Onboarding
                  </button>
                </>
              )}
            </div>

            <button
              type="button"
              onClick={() => navigate('/')}
              className="text-secondary"
              style={{
                display: 'block',
                margin: '24px auto 0',
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                fontSize: '0.82rem',
              }}
            >
              Return to home
            </button>
          </div>
        </section>
      </div>
    </main>
  )
}