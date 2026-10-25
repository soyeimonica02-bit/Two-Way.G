import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'

type Role =
  | 'teen'
  | 'parent'

const roles = [
  {
    id: 'teen' as Role,
    title: 'Teen',
    description:
      'A space to express yourself, think things through, and be heard.',
  },
  {
    id: 'parent' as Role,
    title: 'Parent',
    description:
      'Understand your teen better and create calmer conversations.',
  },
]

export default function RoleSelection() {
  const navigate = useNavigate()

  useEffect(() => {
    // When visiting role selection to create an account, clear transient signup state
    localStorage.removeItem('twoway_selected_role')
    localStorage.removeItem('twoway_signup_dob')
  }, [])

  const handleRoleSelect = (role: Role) => {
    localStorage.setItem('twoway_selected_role', role)

    if (role === 'teen') {
      navigate('/auth/birthday')
      return
    }

    navigate('/auth')
  }

  return (
    <main className="tw-page">
      <div className="tw-container">
        <motion.section
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.55,
            ease: 'easeOut',
          }}
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
              maxWidth: '680px',
            }}
          >
            <button
              type="button"
              aria-label="Go back"
              title="Go back"
              onClick={() => navigate('/')}
              style={{
                border: 'none',
                background: 'transparent',
                padding: 0,
                marginBottom: '28px',
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
                Get started
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
                How will you use Two-Way?
              </h1>

              <p
                className="text-secondary"
                style={{
                  margin: '14px 0 0',
                  maxWidth: '520px',
                  fontSize: '1rem',
                  lineHeight: 1.6,
                }}
              >
                Choose your role. Your Two-Way experience will be
                built around it.
              </p>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns:
                  'repeat(auto-fit, minmax(260px, 1fr))',
                gap: '14px',
              }}
            >
              {roles.map((role, index) => (
                <motion.button
                  key={role.id}
                  type="button"
                  initial={{
                    opacity: 0,
                    y: 14,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  transition={{
                    duration: 0.35,
                    delay: index * 0.05,
                  }}
                  whileHover={{
                    y: -3,
                  }}
                  whileTap={{
                    scale: 0.98,
                  }}
                  onClick={() => handleRoleSelect(role.id)}
                  style={{
                    width: '100%',
                    minHeight: '150px',
                    padding: '22px',
                    textAlign: 'left',
                    border: '2px solid var(--tw-border)',
                    borderRadius: '16px',
                    background: 'var(--tw-surface)',
                    color: 'var(--tw-text)',
                    cursor: 'pointer',
                    boxShadow:
                      '4px 4px 0 rgba(0, 0, 0, 0.08)',
                  }}
                >
                  <div
                    style={{
                      marginBottom: '8px',
                      fontFamily: 'var(--font-display)',
                      fontSize: '1.2rem',
                      fontWeight: 800,
                    }}
                  >
                    {role.title}
                  </div>

                  <div
                    className="text-secondary"
                    style={{
                      fontSize: '0.88rem',
                      lineHeight: 1.55,
                    }}
                  >
                    {role.description}
                  </div>
                </motion.button>
              ))}
            </div>

            <p
              className="text-secondary"
              style={{
                margin: '24px auto 0',
                maxWidth: '440px',
                textAlign: 'center',
                fontSize: '0.76rem',
                lineHeight: 1.55,
              }}
            >
              Your role is set when your account is created and
              cannot be changed later.
            </p>
          </div>
        </motion.section>
      </div>
    </main>
  )
}