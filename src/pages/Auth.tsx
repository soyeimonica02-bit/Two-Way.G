import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

export default function Auth() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const isLogin = searchParams.get('mode') === 'login'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')

  const selectedRole = localStorage.getItem('twoway_selected_role')
  const selectedDob = localStorage.getItem('twoway_signup_dob')

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')

    if (!email.trim()) {
      setError('Please enter your email address.')
      return
    }

    if (!email.includes('@')) {
      setError('Please enter a valid email address.')
      return
    }

    if (!password) {
      setError('Please enter a password.')
      return
    }

    if (password.length < 8) {
      setError('Your password must be at least 8 characters.')
      return
    }

    if (isLogin) {
      const registeredEmail =
        localStorage.getItem('twoway_registered_email')

      if (!registeredEmail) {
        setError(
          'No Two-Way account was found. Please create an account first.'
        )
        return
      }

      if (email.trim().toLowerCase() !== registeredEmail) {
        setError('The email does not match your Two-Way account.')
        return
      }

      localStorage.setItem('twoway_logged_in', 'true')
      navigate('/onboarding')
      return
    }

    if (!selectedRole) {
      setError(
        'Please choose your Two-Way role before creating an account.'
      )
      return
    }

    if (selectedRole === 'teen' && !selectedDob) {
      navigate('/auth/birthday')
      return
    }

    if (password !== confirmPassword) {
      setError('Your passwords do not match.')
      return
    }

    localStorage.setItem(
      'twoway_registered_email',
      email.trim().toLowerCase()
    )

    localStorage.setItem(
      'twoway_registered_role',
      selectedRole
    )

    if (selectedDob) {
      localStorage.setItem(
        'twoway_registered_dob',
        selectedDob
      )
    }

    localStorage.setItem('twoway_email_verified', 'false')

    navigate('/verify-email')
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
              maxWidth: '480px',
            }}
          >
            <button
              type="button"
              onClick={() => navigate('/roles')}
              style={{
                border: 'none',
                background: 'transparent',
                padding: 0,
                marginBottom: '32px',
                cursor: 'pointer',
                fontSize: '0.9rem',
              }}
            >
              ← Back
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
                Two-Way
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
                {isLogin
                  ? 'Welcome back.'
                  : 'Create your account.'}
              </h1>

              <p
                className="text-secondary"
                style={{
                  margin: '14px 0 0',
                  fontSize: '1rem',
                  lineHeight: 1.6,
                }}
              >
                {isLogin
                  ? 'Log in to continue your Two-Way experience.'
                  : 'A few details and you’ll be ready to get started.'}
              </p>
            </div>

            <form
              onSubmit={handleSubmit}
              style={{
                padding: '24px',
                border: '2px solid var(--tw-border)',
                borderRadius: '16px',
                background: 'var(--tw-surface)',
                boxShadow:
                  '4px 4px 0 rgba(0, 0, 0, 0.08)',
              }}
            >
              <div style={{ marginBottom: '18px' }}>
                <label
                  htmlFor="email"
                  style={{
                    display: 'block',
                    marginBottom: '8px',
                    fontSize: '0.9rem',
                    fontWeight: 700,
                  }}
                >
                  Email address
                </label>

                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(event) => {
                    setEmail(event.target.value)
                    setError('')
                  }}
                  placeholder="you@example.com"
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
              </div>

              <div style={{ marginBottom: '18px' }}>
                <label
                  htmlFor="password"
                  style={{
                    display: 'block',
                    marginBottom: '8px',
                    fontSize: '0.9rem',
                    fontWeight: 700,
                  }}
                >
                  Password
                </label>

                <input
                  id="password"
                  type="password"
                  autoComplete={
                    isLogin
                      ? 'current-password'
                      : 'new-password'
                  }
                  value={password}
                  onChange={(event) => {
                    setPassword(event.target.value)
                    setError('')
                  }}
                  placeholder="At least 8 characters"
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
              </div>

              {!isLogin && (
                <div style={{ marginBottom: '18px' }}>
                  <label
                    htmlFor="confirmPassword"
                    style={{
                      display: 'block',
                      marginBottom: '8px',
                      fontSize: '0.9rem',
                      fontWeight: 700,
                    }}
                  >
                    Confirm password
                  </label>

                  <input
                    id="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(event) => {
                      setConfirmPassword(event.target.value)
                      setError('')
                    }}
                    placeholder="Enter your password again"
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
                </div>
              )}

              {error && (
                <p
                  role="alert"
                  style={{
                    margin: '0 0 16px',
                    fontSize: '0.86rem',
                    lineHeight: 1.5,
                  }}
                >
                  {error}
                </p>
              )}

              <button
                type="submit"
                style={{
                  width: '100%',
                  padding: '14px 18px',
                  border: '2px solid var(--tw-border)',
                  borderRadius: '10px',
                  background: '#6366f1',
                  color: '#ffffff',
                  fontSize: '0.95rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                }}
              >
                {isLogin ? 'Log In' : 'Create Account'}
              </button>
            </form>

            <p
              className="text-secondary"
              style={{
                marginTop: '20px',
                textAlign: 'center',
                fontSize: '0.82rem',
                lineHeight: 1.5,
              }}
            >
              {isLogin
                ? 'Your role is connected to your account and is not selected during login.'
                : 'Your role is saved as part of your account identity.'}
            </p>
          </div>
        </section>
      </div>
    </main>
  )
}