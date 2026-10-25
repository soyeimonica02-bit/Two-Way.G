import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

export default function Auth() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const isLogin = searchParams.get('mode') === 'login'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [gender, setGender] = useState('')
  const [pronouns, setPronouns] = useState('')
  const [customPronouns, setCustomPronouns] = useState('')
  const [error, setError] = useState('')

  // Social Auth States
  const [socialLoading, setSocialLoading] = useState<'google' | 'apple' | null>(null)
  const [showSocialModal, setShowSocialModal] = useState<'google' | 'apple' | null>(null)
  const [socialEmail, setSocialEmail] = useState('')
  const [socialName, setSocialName] = useState('')

  const selectedRole = localStorage.getItem('twoway_selected_role')
  const selectedDob = localStorage.getItem('twoway_signup_dob')

  // When creating a new account, ensure role selection (and birthday if teen) was completed
  useEffect(() => {
    if (!isLogin) {
      if (!selectedRole) {
        navigate('/roles', { replace: true })
      } else if (selectedRole === 'teen' && !selectedDob) {
        navigate('/auth/birthday', { replace: true })
      }
    }
  }, [isLogin, selectedRole, selectedDob, navigate])

  const handleAuthBack = () => {
    if (isLogin) {
      navigate('/')
    } else if (selectedRole === 'teen') {
      navigate('/auth/birthday')
    } else {
      navigate('/roles')
    }
  }

  const initiateSocialSignIn = (provider: 'google' | 'apple') => {
    setError('')
    setShowSocialModal(provider)
    const defaultEmail = provider === 'google' ? 'alex.user@gmail.com' : 'alex.user@privaterelay.appleid.com'
    setSocialEmail(defaultEmail)
    setSocialName('Alex Rivera')
  }

  const handleExecuteSocialSignIn = async (provider: 'google' | 'apple') => {
    if (!socialEmail.trim() || !socialEmail.includes('@')) {
      setError('Please provide a valid account email.')
      return
    }

    setSocialLoading(provider)
    setError('')

    try {
      const role = isLogin
        ? (localStorage.getItem('twoway_registered_role') || 'teen')
        : (selectedRole || 'teen')
      const existingDob = selectedDob || localStorage.getItem('twoway_registered_dob')

      const response = await fetch(`/api/auth/${provider}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: socialEmail.trim(),
          name: socialName.trim() || undefined,
          role,
          birthDate: existingDob || undefined,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        if (data.error === 'UNDERAGE') {
          setError('Two-Way is available for teens aged 13–19.')
        } else {
          setError(data.message || `${provider === 'google' ? 'Google' : 'Apple'} authentication could not be completed.`)
        }
        setSocialLoading(null)
        setShowSocialModal(null)
        return
      }

      // Record session & user profile
      if (data.sessionToken) {
        localStorage.setItem('twoway_session_token', data.sessionToken)
      }
      localStorage.setItem('twoway_logged_in', 'true')
      localStorage.setItem('twoway_registered_email', data.user.email)
      localStorage.setItem('twoway_registered_role', data.user.role)
      localStorage.setItem('twoway_auth_provider', provider)
      if (data.user.twoWayId) {
        localStorage.setItem('twoway_user_id', data.user.twoWayId)
      }
      if (data.user.birthDate) {
        localStorage.setItem('twoway_registered_dob', data.user.birthDate)
      }

      setShowSocialModal(null)
      setSocialLoading(null)

      // CRITICAL: Google and Apple do not provide date of birth.
      // If teen and DOB is missing, redirect to birthday verification before access!
      if (data.requiresDob && data.user.role === 'teen') {
        navigate('/auth/birthday?returnTo=/app/teen', { replace: true })
        return
      }

      const isOnboarded = localStorage.getItem('twoway_onboarding_complete') === 'true'
      if (isOnboarded) {
        navigate(`/app/${data.user.role}`, { replace: true })
      } else {
        navigate('/onboarding', { replace: true })
      }
    } catch {
      setError(`Network error connecting to ${provider === 'google' ? 'Google' : 'Apple'} authentication.`)
      setSocialLoading(null)
      setShowSocialModal(null)
    }
  }

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
      const regRole = localStorage.getItem('twoway_registered_role')
      const isOnboarded = localStorage.getItem('twoway_onboarding_complete') === 'true'
      if (regRole && isOnboarded) {
        navigate(`/app/${regRole}`)
      } else if (regRole) {
        navigate('/onboarding')
      } else {
        navigate('/roles')
      }
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

    // Reset previous account's onboarding and profile state for the fresh account
    localStorage.removeItem('twoway_onboarding_complete')
    localStorage.removeItem('twoway_profile_name')
    localStorage.removeItem('twoway_profile_goal')
    localStorage.removeItem('twoway_profile_avatar')
    localStorage.removeItem('twoway_user_id')
    localStorage.removeItem('twoway_selected_palette')

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

    if (gender) {
      localStorage.setItem(
        'twoway_registered_gender',
        gender
      )
      localStorage.setItem('twoway_profile_gender', gender)
    } else {
      localStorage.removeItem('twoway_registered_gender')
    }

    const effectivePronouns = pronouns === 'Custom' ? customPronouns.trim() : pronouns
    if (effectivePronouns) {
      localStorage.setItem(
        'twoway_registered_pronouns',
        effectivePronouns
      )
      localStorage.setItem(
        'twoway_profile_pronouns',
        effectivePronouns
      )
    } else {
      localStorage.removeItem('twoway_registered_pronouns')
    }

    localStorage.setItem('twoway_email_verified', 'false')

    // Sync account verification with server API
    fetch('/api/auth/verify-dob', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: email.trim().toLowerCase(),
        role: selectedRole,
        birthDate: selectedDob || undefined,
      }),
    }).catch(() => {})

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
              aria-label="Go back"
              title="Go back"
              onClick={handleAuthBack}
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

            {!isLogin && selectedRole && (
              <div
                style={{
                  marginBottom: '16px',
                  padding: '10px 14px',
                  borderRadius: '12px',
                  border: '1.5px solid var(--tw-primary)',
                  background: 'var(--tw-primary-soft)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--tw-primary)' }}>
                    ROLE:
                  </span>
                  <strong style={{ fontSize: '0.92rem', color: 'var(--tw-text)' }}>
                    {selectedRole === 'teen' ? 'Teenager' : selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)}
                  </strong>
                </div>
              </div>
            )}

            {/* GOOGLE & APPLE SIGN-IN BUTTONS */}
            <div style={{ marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button
                type="button"
                onClick={() => initiateSocialSignIn('google')}
                disabled={socialLoading !== null}
                style={{
                  width: '100%',
                  padding: '13px 18px',
                  borderRadius: '12px',
                  border: '2px solid var(--tw-border)',
                  background: 'var(--tw-surface)',
                  color: 'var(--tw-text)',
                  fontSize: '0.95rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '12px',
                  cursor: socialLoading ? 'wait' : 'pointer',
                  boxShadow: '3px 3px 0 rgba(0, 0, 0, 0.08)',
                  transition: 'transform 0.1s ease',
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                </svg>
                {socialLoading === 'google' ? 'Connecting to Google...' : isLogin ? 'Continue with Google' : 'Sign up with Google'}
              </button>

              <button
                type="button"
                onClick={() => initiateSocialSignIn('apple')}
                disabled={socialLoading !== null}
                style={{
                  width: '100%',
                  padding: '13px 18px',
                  borderRadius: '12px',
                  border: '2px solid var(--tw-border)',
                  background: 'var(--tw-text)',
                  color: 'var(--tw-background)',
                  fontSize: '0.95rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '12px',
                  cursor: socialLoading ? 'wait' : 'pointer',
                  boxShadow: '3px 3px 0 rgba(0, 0, 0, 0.08)',
                  transition: 'transform 0.1s ease',
                }}
              >
                <svg width="20" height="20" viewBox="0 0 170 170" fill="currentColor">
                  <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.69-3.04-7.67-7.81-11.96-14.31-7.18-10.74-12.65-22.97-16.41-36.69-3.77-13.72-5.65-26.68-5.65-38.88 0-15.08 3.8-27.42 11.41-37.03 7.6-9.61 17.06-14.49 28.37-14.64 4.58 0 9.8 1.19 15.66 3.57 5.86 2.38 9.5 3.63 10.92 3.75 1.84-.23 5.63-1.6 11.36-4.11 5.73-2.51 10.78-3.66 15.15-3.46 11.96.65 21.6 4.97 28.91 12.98-10.42 6.31-15.52 14.99-15.3 26.04.22 8.79 3.58 16.27 10.09 22.44 6.51 6.17 14.18 9.69 23.01 10.57-2.17 6.31-4.77 12.8-7.79 19.46zM119.22 33.15c0-7.39 2.66-14.4 7.98-21.03 5.32-6.63 11.96-10.97 19.92-13.02.22 1.09.33 2.17.33 3.26 0 7.39-2.83 14.62-8.49 21.69-5.66 7.07-12.51 11.25-20.55 12.54-.33-1.09-.49-2.23-.49-3.44z"/>
                </svg>
                {socialLoading === 'apple' ? 'Connecting to Apple...' : isLogin ? 'Continue with Apple' : 'Sign up with Apple'}
              </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', margin: '22px 0 18px', gap: '14px' }}>
              <div style={{ flex: 1, height: '1.5px', background: 'var(--tw-border)' }} />
              <span style={{ fontSize: '0.78rem', color: 'var(--tw-text-secondary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                or with email
              </span>
              <div style={{ flex: 1, height: '1.5px', background: 'var(--tw-border)' }} />
            </div>

            {/* SOCIAL AUTHENTICATION MODAL */}
            {showSocialModal && (
              <div
                style={{
                  position: 'fixed',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: 'rgba(0, 0, 0, 0.65)',
                  backdropFilter: 'blur(3px)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '20px',
                  zIndex: 9999,
                }}
                role="dialog"
                aria-modal="true"
                aria-labelledby="social-modal-title"
              >
                <div
                  style={{
                    width: '100%',
                    maxWidth: '440px',
                    backgroundColor: 'var(--tw-surface)',
                    border: '2px solid var(--tw-border)',
                    borderRadius: '16px',
                    padding: '24px',
                    boxShadow: '6px 6px 0 rgba(0, 0, 0, 0.16)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                    {showSocialModal === 'google' ? (
                      <svg width="24" height="24" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                      </svg>
                    ) : (
                      <svg width="24" height="24" viewBox="0 0 170 170" fill="var(--tw-text)">
                        <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.69-3.04-7.67-7.81-11.96-14.31-7.18-10.74-12.65-22.97-16.41-36.69-3.77-13.72-5.65-26.68-5.65-38.88 0-15.08 3.8-27.42 11.41-37.03 7.6-9.61 17.06-14.49 28.37-14.64 4.58 0 9.8 1.19 15.66 3.57 5.86 2.38 9.5 3.63 10.92 3.75 1.84-.23 5.63-1.6 11.36-4.11 5.73-2.51 10.78-3.66 15.15-3.46 11.96.65 21.6 4.97 28.91 12.98-10.42 6.31-15.52 14.99-15.3 26.04.22 8.79 3.58 16.27 10.09 22.44 6.51 6.17 14.18 9.69 23.01 10.57-2.17 6.31-4.77 12.8-7.79 19.46zM119.22 33.15c0-7.39 2.66-14.4 7.98-21.03 5.32-6.63 11.96-10.97 19.92-13.02.22 1.09.33 2.17.33 3.26 0 7.39-2.83 14.62-8.49 21.69-5.66 7.07-12.51 11.25-20.55 12.54-.33-1.09-.49-2.23-.49-3.44z"/>
                      </svg>
                    )}
                    <h3 id="social-modal-title" style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800 }}>
                      Sign in with {showSocialModal === 'google' ? 'Google' : 'Apple'}
                    </h3>
                  </div>

                  <p style={{ margin: '0 0 16px', fontSize: '0.86rem', color: 'var(--tw-text-secondary)', lineHeight: 1.5 }}>
                    Connect your {showSocialModal === 'google' ? 'Google' : 'Apple'} profile. Neither Google nor Apple provides date of birth to Two-Way. Teen accounts require verified age confirmation.
                  </p>

                  <div style={{ marginBottom: '14px' }}>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: 700 }}>
                      Account email
                    </label>
                    <input
                      type="email"
                      value={socialEmail}
                      onChange={(e) => setSocialEmail(e.target.value)}
                      placeholder={showSocialModal === 'google' ? 'user@gmail.com' : 'user@icloud.com'}
                      style={{
                        width: '100%',
                        boxSizing: 'border-box',
                        padding: '11px 13px',
                        border: '2px solid var(--tw-border)',
                        borderRadius: '8px',
                        background: 'var(--tw-background)',
                        color: 'var(--tw-text)',
                        fontSize: '0.94rem',
                      }}
                    />
                  </div>

                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: 700 }}>
                      Full name
                    </label>
                    <input
                      type="text"
                      value={socialName}
                      onChange={(e) => setSocialName(e.target.value)}
                      placeholder="Your Name"
                      style={{
                        width: '100%',
                        boxSizing: 'border-box',
                        padding: '11px 13px',
                        border: '2px solid var(--tw-border)',
                        borderRadius: '8px',
                        background: 'var(--tw-background)',
                        color: 'var(--tw-text)',
                        fontSize: '0.94rem',
                      }}
                    />
                  </div>

                  <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                    <button
                      type="button"
                      onClick={() => setShowSocialModal(null)}
                      style={{
                        padding: '10px 16px',
                        border: '2px solid var(--tw-border)',
                        borderRadius: '8px',
                        background: 'transparent',
                        color: 'var(--tw-text)',
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => handleExecuteSocialSignIn(showSocialModal)}
                      disabled={socialLoading !== null}
                      style={{
                        padding: '10px 20px',
                        border: 'none',
                        borderRadius: '8px',
                        background: 'var(--tw-primary)',
                        color: 'var(--tw-primary-text, #ffffff)',
                        fontWeight: 800,
                        cursor: socialLoading ? 'wait' : 'pointer',
                      }}
                    >
                      {socialLoading ? 'Connecting...' : 'Continue'}
                    </button>
                  </div>
                </div>
              </div>
            )}

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
                <>
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

                  <div style={{ marginBottom: '18px' }}>
                    <label
                      htmlFor="pronouns"
                      style={{
                        display: 'block',
                        marginBottom: '8px',
                        fontSize: '0.9rem',
                        fontWeight: 700,
                      }}
                    >
                      Pronouns{' '}
                      <span
                        style={{
                          fontWeight: 400,
                          color: 'var(--tw-text-secondary)',
                          fontSize: '0.82rem',
                        }}
                      >
                        (Optional)
                      </span>
                    </label>

                    <select
                      id="pronouns"
                      value={pronouns}
                      onChange={(event) => setPronouns(event.target.value)}
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
                    >
                      <option value="">Select pronouns (or skip)</option>
                      <option value="She/her">She/her</option>
                      <option value="He/him">He/him</option>
                      <option value="They/them">They/them</option>
                      <option value="Prefer not to say">Prefer not to say</option>
                      <option value="Custom">Custom / Enter your own</option>
                    </select>

                    {pronouns === 'Custom' && (
                      <input
                        type="text"
                        value={customPronouns}
                        onChange={(event) => setCustomPronouns(event.target.value)}
                        placeholder="Enter your pronouns (e.g. ze/zir, she/they)"
                        style={{
                          width: '100%',
                          boxSizing: 'border-box',
                          marginTop: '8px',
                          padding: '12px 14px',
                          border: '2px solid var(--tw-border)',
                          borderRadius: '10px',
                          background: 'var(--tw-background)',
                          color: 'var(--tw-text)',
                          fontSize: '0.95rem',
                          outline: 'none',
                        }}
                      />
                    )}
                  </div>

                  <div style={{ marginBottom: '18px' }}>
                    <label
                      htmlFor="gender"
                      style={{
                        display: 'block',
                        marginBottom: '8px',
                        fontSize: '0.9rem',
                        fontWeight: 700,
                      }}
                    >
                      Gender{' '}
                      <span
                        style={{
                          fontWeight: 400,
                          color: 'var(--tw-text-secondary)',
                          fontSize: '0.82rem',
                        }}
                      >
                        (Optional)
                      </span>
                    </label>

                    <select
                      id="gender"
                      value={gender}
                      onChange={(event) => setGender(event.target.value)}
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
                    >
                      <option value="">Select gender</option>
                      <option value="Female">Female</option>
                      <option value="Male">Male</option>
                      <option value="Non-binary">Non-binary</option>
                      <option value="Prefer not to say">Prefer not to say</option>
                    </select>
                  </div>
                </>
              )}

              {error && (
                <div style={{ margin: '0 0 16px' }}>
                  <p
                    role="alert"
                    style={{
                      margin: '0 0 8px',
                      fontSize: '0.86rem',
                      lineHeight: 1.5,
                      color: '#d32f2f',
                    }}
                  >
                    {error}
                  </p>
                  {isLogin && error.includes('No Two-Way account was found') && (
                    <button
                      type="button"
                      onClick={() => navigate('/roles')}
                      className="tw-button tw-button-secondary"
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        fontSize: '0.85rem',
                        cursor: 'pointer',
                        marginTop: '4px',
                      }}
                    >
                      Create an account now →
                    </button>
                  )}
                </div>
              )}

              <button
                type="submit"
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
                {isLogin ? 'Log In' : 'Create Account'}
              </button>
            </form>

            <div style={{ marginTop: '20px', textAlign: 'center' }}>
              <button
                type="button"
                onClick={() => {
                  setError('')
                  if (isLogin) {
                    navigate('/roles')
                  } else {
                    navigate('/auth?mode=login')
                  }
                }}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--tw-primary)',
                  fontSize: '0.9rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  padding: '8px 12px',
                }}
              >
                {isLogin
                  ? "Don't have an account? Create one"
                  : 'Already have an account? Log in'}
              </button>
            </div>

            <p
              className="text-secondary"
              style={{
                marginTop: '16px',
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