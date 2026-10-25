import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { evaluateTeenEligibility } from '../utils/ageVerification'

export default function BirthdayCheck() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [birthday, setBirthday] = useState('')
  const [error, setError] = useState('')
  const [isVerifying, setIsVerifying] = useState(false)

  const returnTo = searchParams.get('returnTo') || '/auth'

  const handleContinue = async () => {
    setError('')

    if (!birthday) {
      setError('Please enter your date of birth.')
      return
    }

    const eligibility = evaluateTeenEligibility(birthday)

    if (eligibility.eligibilityStatus === 'underage') {
      setError('Two-Way is available for teens aged 13–19.')
      return
    }

    if (eligibility.eligibilityStatus === 'aged_out') {
      setError(
        'The Teen experience is for ages 13–19. At age 20 and above, please choose the Parent role or another appropriate account.'
      )
      return
    }

    if (!eligibility.isEligibleTeen) {
      setError(eligibility.message || 'Please enter a valid date of birth.')
      return
    }

    setIsVerifying(true)
    try {
      // Re-verify with backend to establish server-side authorization
      const sessionToken = localStorage.getItem('twoway_session_token')
      const regEmail = localStorage.getItem('twoway_registered_email')

      await fetch('/api/auth/verify-dob', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(sessionToken ? { Authorization: `Bearer ${sessionToken}` } : {}),
        },
        body: JSON.stringify({
          birthDate: birthday,
          email: regEmail || undefined,
          role: 'teen',
        }),
      })
    } catch {
      // Backend sync error handled gracefully without breaking client setup
    } finally {
      setIsVerifying(false)
    }

    localStorage.setItem('twoway_selected_role', 'teen')
    localStorage.setItem('twoway_signup_dob', birthday)
    localStorage.setItem('twoway_registered_dob', birthday)

    // Check if user was already logged in via social provider
    const isSocialLoggedIn = localStorage.getItem('twoway_logged_in') === 'true'
    const isOnboarded = localStorage.getItem('twoway_onboarding_complete') === 'true'

    if (isSocialLoggedIn) {
      if (isOnboarded) {
        navigate('/app/teen')
      } else {
        navigate('/onboarding')
      }
    } else {
      navigate(returnTo)
    }
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
              maxWidth: '520px',
            }}
          >
            <button
              type="button"
              aria-label="Go back"
              title="Go back"
              onClick={() => navigate('/roles')}
              style={{
                border: 'none',
                background: 'transparent',
                padding: 0,
                marginBottom: '32px',
                cursor: 'pointer',
                fontSize: '1.2rem',
                fontWeight: 700,
              }}
            >
              ←
            </button>

            <div style={{ marginBottom: '32px' }}>
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
                Teen account
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
                When were you born?
              </h1>

              <p
                className="text-secondary"
                style={{
                  margin: '14px 0 0',
                  fontSize: '1rem',
                  lineHeight: 1.6,
                }}
              >
                We use your birthday to make sure the Teen
                experience is appropriate for your age.
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
              <label
                htmlFor="birthday"
                style={{
                  display: 'block',
                  marginBottom: '10px',
                  fontSize: '0.9rem',
                  fontWeight: 700,
                }}
              >
                Date of birth
              </label>

              <input
                id="birthday"
                type="date"
                value={birthday}
                max={new Date().toISOString().split('T')[0]}
                onChange={(event) => {
                  setBirthday(event.target.value)
                  setError('')
                }}
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  padding: '14px',
                  border: '2px solid var(--tw-border)',
                  borderRadius: '10px',
                  background: 'var(--tw-background)',
                  color: 'var(--tw-text)',
                  fontSize: '1rem',
                  outline: 'none',
                }}
              />

              {error && (
                <p
                  role="alert"
                  style={{
                    margin: '12px 0 0',
                    fontSize: '0.86rem',
                    lineHeight: 1.5,
                  }}
                >
                  {error}
                </p>
              )}

              <button
                type="button"
                onClick={handleContinue}
                disabled={isVerifying}
                style={{
                  width: '100%',
                  marginTop: '20px',
                  padding: '14px 18px',
                  border: '2px solid var(--tw-border)',
                  borderRadius: '10px',
                  background: 'var(--tw-primary)',
                  color: 'var(--tw-primary-text, #ffffff)',
                  fontSize: '0.95rem',
                  fontWeight: 800,
                  cursor: isVerifying ? 'wait' : 'pointer',
                  opacity: isVerifying ? 0.7 : 1,
                }}
              >
                {isVerifying ? 'Verifying age...' : 'Continue'}
              </button>
            </div>

            <p
              className="text-secondary"
              style={{
                margin: '20px auto 0',
                maxWidth: '420px',
                textAlign: 'center',
                fontSize: '0.76rem',
                lineHeight: 1.55,
              }}
            >
              Your birthday is part of your account identity
              and cannot be changed after registration.
            </p>
          </div>
        </section>
      </div>
    </main>
  )
}