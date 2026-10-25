import { useMemo, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import PaletteSelector from '../components/PaletteSelector';
import {
  getSelectedPaletteId,
  setSelectedPalette,
  getParentAccentId,
  setParentAccentId,
  PARENT_ACCENTS,
} from '../utils/themePalettes';
import { useTheme } from '../context/useTheme';
import {
  normalizeTwoWayId,
  isValidTwoWayIdFormat,
  registerAccountInDirectory,
  generateSixDigitId,
} from '../utils/circleStorage';

type Role = 'teen' | 'parent';

const roleNames: Record<Role, string> = {
  teen: 'Teen',
  parent: 'Parent',
};

export default function Onboarding() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { setPalette, setParentAccentId: setContextParentAccentId } = useTheme();

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
    localStorage.getItem('twoway_profile_goal') || 'Expressing myself',
  );

  // Profile picture: load from existing user profile storage if already selected, optional
  const [avatarImage, setAvatarImage] = useState<string | null>(
    () => localStorage.getItem('twoway_profile_avatar') || null,
  );
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const [isProcessingImage, setIsProcessingImage] = useState(false);

  const [selectedPaletteId, setPaletteId] = useState<string | null>(
    () => (role === 'parent' ? (getParentAccentId() || 'slate') : (getSelectedPaletteId() || 'palette-01')),
  );

  const roleName = useMemo(() => {
    if (!role || !roleNames[role]) {
      return 'Two-Way';
    }

    return roleNames[role];
  }, [role]);

  const handlePhotoClick = () => {
    setAvatarError(null);
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';

    if (!file) return;

    setAvatarError(null);

    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];
    if (!validTypes.includes(file.type)) {
      setAvatarError('Please select a valid image file (JPG, PNG, WebP, or GIF).');
      return;
    }

    const maxSizeBytes = 4 * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      setAvatarError('The selected image is larger than 4MB. Please choose a smaller photo.');
      return;
    }

    setIsProcessingImage(true);

    const reader = new FileReader();
    reader.onerror = () => {
      setIsProcessingImage(false);
      setAvatarError('Failed to read the image file. Please try again.');
    };

    reader.onload = () => {
      const dataUrl = reader.result as string;
      try {
        localStorage.setItem('twoway_profile_avatar', dataUrl);
        setAvatarImage(dataUrl);
        setIsProcessingImage(false);
      } catch (storageErr) {
        setIsProcessingImage(false);
        console.error('Failed to store profile photo in localStorage:', storageErr);
        setAvatarError('Could not save photo to local device storage (quota exceeded).');
      }
    };

    reader.readAsDataURL(file);
  };

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
    if (avatarImage) {
      localStorage.setItem('twoway_profile_avatar', avatarImage);
    }

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

    // Ensure user has a canonical 6-digit Two-Way ID
    let userId = localStorage.getItem('twoway_user_id');
    if (!userId || !isValidTwoWayIdFormat(normalizeTwoWayId(userId))) {
      userId = generateSixDigitId();
      localStorage.setItem('twoway_user_id', userId);
    } else {
      userId = normalizeTwoWayId(userId);
      localStorage.setItem('twoway_user_id', userId);
    }

    // Register account in accounts directory so peers can look it up in My Circle
    const displayRole = role === 'teen' ? 'Teenager' : (roleNames[role] || 'Member');
    registerAccountInDirectory({
      twoWayId: userId,
      displayName: name.trim() || displayRole,
      role: displayRole,
    });

    localStorage.setItem('twoway_registered_role', role);
    if (role === 'parent') {
      setParentAccentId(selectedPaletteId);
      setContextParentAccentId(selectedPaletteId);
    } else {
      localStorage.setItem('twoway_selected_palette', selectedPaletteId);
      setSelectedPalette(selectedPaletteId);
      setPalette(selectedPaletteId);
    }
    localStorage.setItem('twoway_onboarding_complete', 'true');

    navigate(`/app/${role}`);
  };

  if (!role) {
    return (
      <main className="tw-page">
        <div className="tw-container">
          <section
            style={{
              minHeight: '80vh',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '24px',
              textAlign: 'center',
            }}
          >
            <div>
              <h1 style={{ fontSize: '1.5rem', marginBottom: '8px' }}>
                No role selected
              </h1>
              <p className="text-secondary" style={{ fontSize: '0.88rem' }}>
                Choose your role before continuing.
              </p>
              <button
                type="button"
                className="tw-button tw-button-primary"
                onClick={() => navigate('/roles')}
                style={{ marginTop: '16px' }}
              >
                Choose a role
              </button>
            </div>
          </section>
        </div>
      </main>
    );
  }

  // STEP 2: APPEARANCE SELECTION (COMPACT & RESPONSIVE)
  if (step === 'appearance') {
    return (
      <main
        className="tw-page"
        style={{
          background: 'var(--tw-background, #f8f8f5)',
          minHeight: '100vh',
          paddingBottom: '50px',
        }}
      >
        <div
          className="tw-container"
          style={{ maxWidth: '840px', margin: '0 auto', padding: '16px 20px' }}
        >
          {/* COMPACT TOP BAR WITH ACCESSIBLE ARROW-ONLY BACK BUTTON */}
          <header
            style={{
              minHeight: '52px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: '2px solid var(--tw-border)',
              marginBottom: '20px',
            }}
          >
            <button
              type="button"
              aria-label="Go back"
              title="Go back"
              onClick={() => setStep('details')}
              className="teen-back-btn"
              style={{
                width: '38px',
                height: '38px',
                display: 'grid',
                placeItems: 'center',
                background: 'var(--tw-surface)',
                border: '2px solid var(--tw-border)',
                borderRadius: '8px',
                color: 'var(--tw-text)',
                cursor: 'pointer',
                boxShadow: '1.5px 1.5px 0px var(--tw-border)',
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
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
              STEP 2 OF 2 · PALETTE
            </span>

            <div style={{ width: '38px' }} />
          </header>

          {role === 'parent' ? (
            <div style={{ background: '#FFFFFF', border: '2px solid #000000', borderRadius: '14px', padding: '24px', boxShadow: '4px 4px 0px #000000' }}>
              <h2 style={{ margin: '0 0 6px', fontSize: '1.25rem', fontWeight: 850, color: '#000000' }}>
                Choose Your Parent Accent
              </h2>
              <p style={{ margin: '0 0 20px', fontSize: '0.88rem', color: '#666666' }}>
                Select an accent highlight for your monochromatic Parent interface. You can change this at any time in Settings.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
                {PARENT_ACCENTS.map((acc) => {
                  const isSelected = selectedPaletteId === acc.id;
                  return (
                    <button
                      key={acc.id}
                      type="button"
                      onClick={() => setPaletteId(acc.id)}
                      style={{
                        padding: '14px 16px',
                        borderRadius: '10px',
                        border: isSelected ? '2.5px solid #000000' : '1.5px solid #E5E5E5',
                        background: isSelected ? '#F8F8F9' : '#FFFFFF',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '12px',
                        textAlign: 'left',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span
                          style={{
                            width: '24px',
                            height: '24px',
                            borderRadius: '50%',
                            background: acc.accent,
                            display: 'inline-block',
                            border: '2px solid #000000',
                          }}
                        />
                        <div>
                          <strong style={{ display: 'block', fontSize: '0.88rem', color: '#000000' }}>
                            {acc.name}
                          </strong>
                          <span style={{ fontSize: '0.74rem', color: '#666666' }}>
                            {acc.colorName} Highlight
                          </span>
                        </div>
                      </div>

                      {isSelected ? (
                        <span style={{ fontSize: '0.65rem', fontWeight: 850, textTransform: 'uppercase', color: acc.accent, background: acc.accentSoft, padding: '3px 7px', borderRadius: '4px', border: `1px solid ${acc.accent}` }}>
                          Selected
                        </span>
                      ) : (
                        <span style={{ fontSize: '0.75rem', color: '#666666' }}>Select</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <PaletteSelector
              initialSelectedId={selectedPaletteId}
              onPaletteSelect={(id) => setPaletteId(id)}
            />
          )}

          <div
            style={{
              marginTop: '24px',
              paddingTop: '18px',
              borderTop: '2px solid var(--tw-border)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '10px',
            }}
          >
            <button
              type="button"
              className="tw-button tw-button-primary"
              disabled={!selectedPaletteId}
              onClick={handleFinishOnboarding}
              style={{
                width: '100%',
                maxWidth: '380px',
                minHeight: '48px',
                background: selectedPaletteId ? 'var(--tw-primary)' : 'var(--tw-surface-soft)',
                color: selectedPaletteId ? 'var(--tw-primary-text, #ffffff)' : 'var(--tw-text-muted)',
                border: '2px solid var(--tw-border)',
                borderRadius: '10px',
                fontWeight: 850,
                fontSize: '0.86rem',
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                boxShadow: selectedPaletteId ? '3px 3px 0px var(--tw-border)' : 'none',
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
                fontSize: '0.72rem',
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

  // STEP 1: COMPACT ONBOARDING DETAILS
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
            padding: '24px 16px',
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '460px',
              background: 'var(--tw-surface)',
              border: '2px solid var(--tw-border)',
              borderRadius: '16px',
              padding: '24px 22px',
              boxShadow: '4px 4px 0px var(--tw-border)',
            }}
          >
            {/* COMPACT TOP NAVIGATION BAR */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <button
                type="button"
                aria-label="Go back"
                title="Go back"
                onClick={() => navigate('/roles')}
                className="teen-back-btn"
                style={{
                  border: '1.5px solid var(--tw-border)',
                  background: 'var(--tw-background)',
                  width: '34px',
                  height: '34px',
                  borderRadius: '6px',
                  display: 'grid',
                  placeItems: 'center',
                  cursor: 'pointer',
                  color: 'var(--tw-text)',
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
              </button>

              <span
                style={{
                  fontSize: '0.65rem',
                  fontWeight: 850,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: 'var(--tw-primary)',
                  background: 'var(--tw-primary-soft)',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  border: '1px solid var(--tw-border)',
                }}
              >
                {roleName} Onboarding
              </span>

              <div style={{ width: '34px' }} />
            </div>

            {/* BRAND HEADER */}
            <div style={{ textAlign: 'center', marginBottom: '16px' }}>
              <h1
                style={{
                  margin: '0 0 4px',
                  fontSize: '1.35rem',
                  fontWeight: 900,
                  lineHeight: 1.2,
                  color: 'var(--tw-text)',
                }}
              >
                Make Two-Way yours.
              </h1>
              <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--tw-text-secondary)' }}>
                Set your profile name and focus goal before starting.
              </p>
            </div>

            <form
              onSubmit={handleDetailsSubmit}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '14px',
              }}
            >
              {/* HIDDEN FILE INPUT */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif"
                style={{ display: 'none' }}
                onChange={handleFileChange}
                aria-label="Upload profile picture"
              />

              {/* COMPACT AVATAR ROW */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  border: '1.5px solid var(--tw-border)',
                  background: 'var(--tw-surface-soft)',
                }}
              >
                <div
                  onClick={handlePhotoClick}
                  title={avatarImage ? 'Click to replace photo' : 'Upload photo (optional)'}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handlePhotoClick();
                    }
                  }}
                  aria-label={avatarImage ? 'Change profile photo' : 'Upload profile photo (optional)'}
                  style={{
                    width: '52px',
                    height: '52px',
                    borderRadius: '50%',
                    background: 'var(--tw-surface)',
                    border: '2px solid var(--tw-border)',
                    display: 'grid',
                    placeItems: 'center',
                    cursor: 'pointer',
                    position: 'relative',
                    overflow: 'hidden',
                    flexShrink: 0,
                  }}
                >
                  {avatarImage ? (
                    <img
                      src={avatarImage}
                      alt="Avatar preview"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <span style={{ fontSize: '1.25rem', fontWeight: 800 }}>
                      {(name.trim().charAt(0) || '👤').toUpperCase()}
                    </span>
                  )}
                </div>

                <div style={{ flex: 1 }}>
                  <button
                    type="button"
                    onClick={handlePhotoClick}
                    disabled={isProcessingImage}
                    style={{
                      background: 'var(--tw-surface)',
                      border: '1.5px solid var(--tw-border)',
                      borderRadius: '6px',
                      padding: '4px 10px',
                      fontSize: '0.74rem',
                      fontWeight: 800,
                      color: 'var(--tw-text)',
                      cursor: isProcessingImage ? 'not-allowed' : 'pointer',
                    }}
                  >
                    {isProcessingImage ? 'Processing…' : avatarImage ? 'Change Photo' : '+ Add Photo (Optional)'}
                  </button>
                </div>
              </div>

              {avatarError && (
                <p
                  role="alert"
                  style={{
                    margin: 0,
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    color: '#dc2626',
                    lineHeight: 1.35,
                  }}
                >
                  {avatarError}
                </p>
              )}

              {/* NAME INPUT */}
              <label style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 750, color: 'var(--tw-text)' }}>
                  What should we call you?
                </span>
                <input
                  className="tw-input"
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Your display name"
                  required
                  style={{
                    padding: '9px 12px',
                    borderRadius: '8px',
                    border: '1.5px solid var(--tw-border)',
                    fontSize: '0.88rem',
                  }}
                />
              </label>

              {/* COMPACT GOAL CHIPS */}
              <fieldset style={{ margin: 0, padding: 0, border: 0 }}>
                <legend
                  style={{
                    marginBottom: '6px',
                    fontSize: '0.82rem',
                    fontWeight: 750,
                    color: 'var(--tw-text)',
                  }}
                >
                  What would you like Two-Way to help with?
                </legend>

                <div className="compact-chips-grid">
                  {[
                    'Expressing myself',
                    'Understanding others',
                    'Tough conversations',
                    'Better relationships',
                  ].map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setGoal(option)}
                      className={`compact-chip ${goal === option ? 'is-active' : ''}`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </fieldset>

              {/* COLLAPSIBLE ADVANCED PREFERENCES */}
              <details
                style={{
                  border: '1px solid var(--tw-border)',
                  borderRadius: '8px',
                  padding: '8px 12px',
                  background: 'var(--tw-surface-subtle)',
                  fontSize: '0.78rem',
                }}
              >
                <summary style={{ cursor: 'pointer', fontWeight: 700, color: 'var(--tw-text)' }}>
                  Advanced preferences (optional)
                </summary>
                <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input type="checkbox" defaultChecked />
                    <span>Enable notification badges for circle connection requests</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input type="checkbox" defaultChecked />
                    <span>Include gentle reflection prompts before sending messages</span>
                  </label>
                </div>
              </details>

              <button
                type="submit"
                className="tw-button tw-button-primary"
                style={{
                  width: '100%',
                  minHeight: '46px',
                  fontWeight: 850,
                  fontSize: '0.86rem',
                  borderRadius: '10px',
                  marginTop: '4px',
                }}
              >
                Continue to Appearance →
              </button>
            </form>

            <p
              className="text-secondary"
              style={{
                margin: '14px auto 0',
                maxWidth: '340px',
                textAlign: 'center',
                fontSize: '0.7rem',
                lineHeight: 1.45,
              }}
            >
              Account roles preserve private boundaries between parents and teens.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}