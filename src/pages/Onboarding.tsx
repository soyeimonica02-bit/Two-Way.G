import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PaletteSelector from '../components/PaletteSelector';
import {
  getSelectedPaletteId,
  setSelectedPalette,
} from '../utils/themePalettes';

type Role =
  | 'teen'
  | 'parent'
  | 'partner'
  | 'spouse'
  | 'sibling'
  | 'counselor';

const roleNames: Record<Role, string> = {
  teen: 'Teen',
  parent: 'Parent',
  partner: 'Partner',
  spouse: 'Spouse',
  sibling: 'Sibling',
  counselor: 'Counselor',
};

export default function Onboarding() {
  const navigate = useNavigate();

  const registeredRole = localStorage.getItem(
    'twoway_registered_role',
  ) as Role | null;

  const selectedRole = localStorage.getItem(
    'twoway_selected_role',
  ) as Role | null;

  const role = registeredRole || selectedRole;

  const [step, setStep] = useState<'details' | 'appearance'>('details');

  const [name, setName] = useState(
    localStorage.getItem('twoway_profile_name') || '',
  );

  const [goal, setGoal] = useState(
    localStorage.getItem('twoway_profile_goal') || '',
  );

  const [selectedPaletteId, setPaletteId] = useState<string | null>(
    () => getSelectedPaletteId(),
  );

  const roleName = useMemo(() => {
    if (!role || !roleNames[role]) {
      return 'Two-Way';
    }

    return roleNames[role];
  }, [role]);

  const handleDetailsSubmit = (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    if (!role) {
      navigate('/roles');
      return;
    }

    if (!name.trim() || !goal) {
      return;
    }

    localStorage.setItem('twoway_profile_name', name.trim());
    localStorage.setItem('twoway_profile_goal', goal);

    // Proceed to appearance step
    setStep('appearance');
  };

  const handleFinishOnboarding = () => {
    if (!role) {
      navigate('/roles');
      return;
    }

    if (!selectedPaletteId) {
      return;
    }

    localStorage.setItem('twoway_selected_palette', selectedPaletteId);
    setSelectedPalette(selectedPaletteId);
    localStorage.setItem('twoway_onboarding_complete', 'true');

    navigate(`/app/${role}`);
  };

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
    );
  }

  // STEP 2: APPEARANCE SELECTION
  if (step === 'appearance') {
    return (
      <main
        className="tw-page"
        style={{
          background: 'var(--tw-background, #f8f8f5)',
          minHeight: '100vh',
          paddingBottom: '80px',
        }}
      >
        <div
          className="tw-container"
          style={{ maxWidth: '960px', margin: '0 auto', padding: '0 24px' }}
        >
          {/* TOP BAR WITH ARROW-ONLY BACK BUTTON */}
          <header
            style={{
              minHeight: '70px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: '2.5px solid var(--tw-border)',
              marginBottom: '36px',
            }}
          >
            <button
              type="button"
              aria-label="Go back"
              onClick={() => setStep('details')}
              style={{
                width: '44px',
                height: '44px',
                display: 'grid',
                placeItems: 'center',
                background: 'var(--tw-surface)',
                border: '2.5px solid var(--tw-border)',
                borderRadius: '12px',
                color: 'var(--tw-text)',
                fontSize: '1.25rem',
                fontWeight: 800,
                cursor: 'pointer',
                boxShadow: '2.5px 2.5px 0px var(--tw-border)',
                transition: 'transform 120ms ease, box-shadow 120ms ease',
              }}
            >
              ←
            </button>

            <span
              style={{
                fontSize: '0.68rem',
                fontWeight: 850,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: 'var(--tw-primary)',
              }}
            >
              STEP 2 OF 2 · APPEARANCE
            </span>

            <div style={{ width: '44px' }} />
          </header>

          <PaletteSelector
            initialSelectedId={selectedPaletteId}
            onPaletteSelect={(id) => setPaletteId(id)}
          />

          <div
            style={{
              marginTop: '36px',
              paddingTop: '24px',
              borderTop: '2.5px solid var(--tw-border)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '12px',
            }}
          >
            <button
              type="button"
              className="tw-button tw-button-primary"
              disabled={!selectedPaletteId}
              onClick={handleFinishOnboarding}
              style={{
                width: '100%',
                maxWidth: '420px',
                minHeight: '52px',
                background: selectedPaletteId ? 'var(--tw-primary)' : 'var(--tw-surface-soft)',
                color: selectedPaletteId ? 'var(--tw-primary-text, #ffffff)' : 'var(--tw-text-muted)',
                border: '2.5px solid var(--tw-border)',
                borderRadius: '14px',
                fontWeight: 900,
                fontSize: '0.88rem',
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                boxShadow: selectedPaletteId ? '4px 4px 0px var(--tw-border)' : 'none',
                cursor: selectedPaletteId ? 'pointer' : 'not-allowed',
              }}
            >
              {selectedPaletteId
                ? 'Enter Two-Way'
                : 'Choose a palette to continue'}
            </button>

            <p
              style={{
                margin: 0,
                fontSize: '0.75rem',
                color: 'var(--tw-text-secondary)',
              }}
            >
              You can change your palette at any time in Settings → Appearance.
            </p>
          </div>
        </div>
      </main>
    );
  }

  // STEP 1: BASIC ONBOARDING DETAILS
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
              onSubmit={handleDetailsSubmit}
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
                Continue
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
  );
}