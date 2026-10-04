import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

type Role =
  | 'teen'
  | 'parent'
  | 'partner'
  | 'spouse'
  | 'sibling'
  | 'counselor'

const roleNames: Record<Role, string> = {
  teen: 'Teen',
  parent: 'Parent',
  partner: 'Partner',
  spouse: 'Spouse',
  sibling: 'Sibling',
  counselor: 'Counselor',
}

export default function Onboarding() {
  const navigate = useNavigate()

  const registeredRole =
    localStorage.getItem('twoway_registered_role') as Role | null

  const selectedRole =
    localStorage.getItem('twoway_selected_role') as Role | null

  const role = registeredRole || selectedRole

  const [name, setName] = useState(
    localStorage.getItem('twoway_profile_name') || ''
  )

  const [goal, setGoal] = useState('')

  const roleName = useMemo(() => {
    if (!role || !roleNames[role]) {
      return 'Two-Way'
    }

    return roleNames[role]
  }, [role])

  const handleSubmit = (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault()

    if (!role) {
      navigate('/roles')
      return
    }

    if (!name.trim()) {
      return
    }

    if (!goal) {
      return
    }

    localStorage.setItem(
      'twoway_profile_name',
      name.trim()
    )

    localStorage.setItem(
      'twoway_profile_goal',
      goal
    )

    localStorage.setItem(
      'twoway_onboarding_complete',
      'true'
    )

    navigate(`/app/${role}`)
  }

  if (!role) {
    return (
      <main className="tw-page">
        <div className="tw-container">
          <section
            style={{
              minHeight: '100vh',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '24px',
              textAlign: 'center',
            }}
          >
            <div>
              <h1>Let's get you set up.</h1>

              <p className="text-secondary">
                Choose your role before continuing.
              </p>

              <button
                type="button"
                className="tw-button tw-button-primary"
                onClick={() => navigate('/roles')}
                style={{
                  marginTop: '20px',
                }}
              >
                Choose a role
              </button>
            </div>
          </section>
        </div>
      </main>
    )
  }

  return (
    <main className="tw-page">
      <div className="tw-container">
        <section
          className="tw-fade-in"
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
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                marginBottom: '32px',
              }}
            >
              <img
                src="/favicon.svg"
                alt="Two-Way"
                style={{
                  width: '82px',
                  height: '82px',
                  objectFit: 'contain',
                  marginBottom: '4px',
                }}
              />

              <strong
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '1.7rem',
                  letterSpacing: '-0.04em',
                }}
              >
                Two-Way
              </strong>
            </div>

            <div
              style={{
                textAlign: 'center',
                marginBottom: '28px',
              }}
            >
              <p
                style={{
                  margin: '0 0 8px',
                  color: 'var(--tw-primary)',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                }}
              >
                {roleName}
              </p>

              <h1
                style={{
                  margin: '0 0 12px',
                  fontSize: 'clamp(1.7rem, 4vw, 2.2rem)',
                  lineHeight: 1.2,
                }}
              >
                Make Two-Way yours.
              </h1>

              <p
                className="text-secondary"
                style={{
                  margin: 0,
                  lineHeight: 1.65,
                }}
              >
                Just a couple of things before you begin.
                These details help personalize your experience.
              </p>
            </div>

            <form
              onSubmit={handleSubmit}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '20px',
              }}
            >
              <label
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                }}
              >
                <span
                  style={{
                    fontSize: '0.9rem',
                    fontWeight: 650,
                  }}
                >
                  What should we call you?
                </span>

                <input
                  className="tw-input"
                  type="text"
                  value={name}
                  onChange={(event) =>
                    setName(event.target.value)
                  }
                  placeholder="Your name"
                  required
                />
              </label>

              <fieldset
                style={{
                  margin: 0,
                  padding: 0,
                  border: 0,
                }}
              >
                <legend
                  style={{
                    marginBottom: '10px',
                    fontSize: '0.9rem',
                    fontWeight: 650,
                  }}
                >
                  What would you like Two-Way to help with?
                </legend>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns:
                      'repeat(auto-fit, minmax(160px, 1fr))',
                    gap: '10px',
                  }}
                >
                  {[
                    'Expressing myself',
                    'Understanding others',
                    'Having difficult conversations',
                    'Building better relationships',
                  ].map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setGoal(option)}
                      style={{
                        minHeight: '58px',
                        padding: '12px 14px',
                        textAlign: 'left',
                        borderRadius: 'var(--radius-md)',
                        border:
                          goal === option
                            ? '2px solid var(--tw-primary)'
                            : '1px solid var(--tw-border)',
                        background:
                          goal === option
                            ? 'var(--tw-primary-soft)'
                            : 'var(--tw-surface)',
                        color: 'var(--tw-text)',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition:
                          'border-color 180ms ease, background 180ms ease',
                      }}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </fieldset>

              <button
                type="submit"
                className="tw-button tw-button-primary"
                style={{
                  width: '100%',
                  minHeight: '52px',
                  marginTop: '4px',
                }}
              >
                Enter Two-Way
              </button>
            </form>

            <p
              className="text-secondary"
              style={{
                margin: '20px auto 0',
                maxWidth: '360px',
                textAlign: 'center',
                fontSize: '0.75rem',
                lineHeight: 1.55,
              }}
            >
              Your role is part of your account identity and
              cannot be changed after registration.
            </p>
          </div>
        </section>
      </div>
    </main>
  )
}