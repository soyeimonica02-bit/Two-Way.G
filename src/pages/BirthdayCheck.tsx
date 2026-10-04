import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function BirthdayCheck() {
  const navigate = useNavigate()
  const [birthday, setBirthday] = useState('')
  const [error, setError] = useState('')

  const calculateAge = (dateOfBirth: string) => {
    const today = new Date()
    const birthDate = new Date(`${dateOfBirth}T00:00:00`)

    let age = today.getFullYear() - birthDate.getFullYear()

    const monthDifference =
      today.getMonth() - birthDate.getMonth()

    if (
      monthDifference < 0 ||
      (monthDifference === 0 &&
        today.getDate() < birthDate.getDate())
    ) {
      age--
    }

    return age
  }

  const handleContinue = () => {
    setError('')

    if (!birthday) {
      setError('Please enter your date of birth.')
      return
    }

    const selectedDate = new Date(`${birthday}T00:00:00`)
    const today = new Date()

    if (selectedDate > today) {
      setError('Your birthday cannot be in the future.')
      return
    }

    const age = calculateAge(birthday)

    if (age < 13) {
      setError(
        'Two-Way is currently available for teens aged 13–17.'
      )
      return
    }

    if (age > 17) {
      setError(
        'The Teen experience is for ages 13–17. Please go back and choose the role that fits you.'
      )
      return
    }

    localStorage.setItem('twoway_selected_role', 'teen')
    localStorage.setItem('twoway_signup_dob', birthday)

    navigate('/auth')
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
                style={{
                  width: '100%',
                  marginTop: '20px',
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
                Continue
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