import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import ParentLayout from '../layouts/ParentLayout';
import TeenLayout from '../layouts/TeenLayout';

function Profile() {
  const navigate = useNavigate();
  const location = useLocation();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isParent = location.pathname.startsWith('/app/parent');
  const baseRoute = isParent ? '/app/parent' : '/app/teen';
  const Layout = isParent ? ParentLayout : TeenLayout;

  const registeredRole = localStorage.getItem('twoway_registered_role');
  const userRoleDisplay =
    registeredRole === 'parent' || isParent
      ? 'Parent'
      : registeredRole === 'teen'
        ? 'Teenager'
        : 'Teenager';

  const [name, setName] = useState(
    () =>
      localStorage.getItem('twoway_profile_name') ||
      localStorage.getItem('twoway_demo_name') ||
      (isParent ? 'Parent' : 'Alex'),
  );

  const [pronouns, setPronouns] = useState(
    () =>
      localStorage.getItem('twoway_profile_pronouns') ||
      localStorage.getItem('twoway_registered_pronouns') ||
      'they/them',
  );

  const [gender, setGender] = useState(
    () =>
      localStorage.getItem('twoway_profile_gender') ||
      localStorage.getItem('twoway_registered_gender') ||
      'Prefer not to say',
  );

  const [avatarImage, setAvatarImage] = useState<string | null>(
    () => localStorage.getItem('twoway_profile_avatar') || null,
  );
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const [avatarNotice, setAvatarNotice] = useState<string | null>(null);
  const [isProcessingImage, setIsProcessingImage] = useState(false);

  const [isEditing, setIsEditing] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const [twoWayId] = useState(
    () => localStorage.getItem('twoway_user_id') || 'TW-4920',
  );

  const handleSave = () => {
    localStorage.setItem('twoway_profile_name', name.trim() || (isParent ? 'Parent' : 'Alex'));
    localStorage.setItem('twoway_profile_pronouns', pronouns.trim());
    localStorage.setItem('twoway_profile_gender', gender);
    setIsEditing(false);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const initialLetter = (name.trim().charAt(0) || (isParent ? 'P' : 'T')).toUpperCase();

  const handlePhotoClick = () => {
    setAvatarError(null);
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';

    if (!file) return;

    setAvatarError(null);
    setAvatarNotice(null);

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
      setAvatarError('Failed to read the selected image file. Please try again.');
    };

    reader.onload = () => {
      const dataUrl = reader.result as string;
      try {
        localStorage.setItem('twoway_profile_avatar', dataUrl);
        setAvatarImage(dataUrl);
        setIsProcessingImage(false);
        setAvatarNotice('Profile photo updated.');
        setTimeout(() => setAvatarNotice(null), 3000);
      } catch (storageErr) {
        setIsProcessingImage(false);
        console.error('Failed to store avatar in localStorage:', storageErr);
        setAvatarError('Could not save photo to device storage (quota exceeded).');
      }
    };

    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    localStorage.removeItem('twoway_profile_avatar');
    setAvatarImage(null);
    setAvatarNotice('Photo removed.');
    setTimeout(() => setAvatarNotice(null), 2500);
  };

  // -------------------------------------------------------------
  // PARENT PRESENTATION: MONOCHROMATIC BLACK & WHITE
  // -------------------------------------------------------------
  if (isParent) {
    return (
      <Layout>
        <div className="parent-dashboard">

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif"
            style={{ display: 'none' }}
            onChange={handleFileChange}
            aria-label="Upload profile picture"
          />

          {/* HEADER */}
          <motion.section
            className="parent-hero"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '14px' }}>
              <button
                type="button"
                className="parent-back-btn"
                aria-label="Go back"
                title="Go back"
                onClick={() => {
                  if (window.history.length > 1) {
                    navigate(-1);
                  } else {
                    navigate(baseRoute);
                  }
                }}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
              </button>

              <span className="parent-hero-pill" style={{ margin: 0 }}>
                ACCOUNT DETAILS
              </span>
            </div>

            <h1>Parent Profile.</h1>
            <p>
              Your personal profile and account settings. Your Two-Way ID and role are protected.
            </p>
          </motion.section>

          {/* PROFILE CARD */}
          <motion.section
            className="parent-card"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.05 }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div
                  onClick={handlePhotoClick}
                  style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    border: '2px solid var(--parent-border)',
                    background: 'var(--parent-surface-subtle)',
                    display: 'grid',
                    placeItems: 'center',
                    cursor: 'pointer',
                    overflow: 'hidden',
                  }}
                  title="Click to change photo"
                >
                  {avatarImage ? (
                    <img src={avatarImage} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <strong style={{ fontSize: '1.5rem', color: 'var(--parent-text)' }}>{initialLetter}</strong>
                  )}
                </div>

                <div>
                  <strong style={{ display: 'block', fontSize: '1.25rem', color: 'var(--parent-text)' }}>{name}</strong>
                  <span style={{ fontSize: '0.84rem', color: 'var(--parent-text-secondary)' }}>{userRoleDisplay} · {twoWayId}</span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                {isEditing ? (
                  <>
                    <button type="button" className="parent-btn-primary" onClick={handleSave}>
                      Save Changes
                    </button>
                    <button type="button" className="parent-btn-ghost" onClick={() => setIsEditing(false)}>
                      Cancel
                    </button>
                  </>
                ) : (
                  <button type="button" className="parent-btn-secondary" onClick={() => setIsEditing(true)}>
                    Edit Profile
                  </button>
                )}
              </div>
            </div>

            {avatarNotice && (
              <div style={{ padding: '8px 12px', background: 'var(--parent-accent-soft)', border: '1px solid var(--parent-border)', borderRadius: '6px', fontSize: '0.82rem', marginBottom: '16px', color: 'var(--parent-text)' }}>
                ✓ {avatarNotice}
              </div>
            )}
            {avatarError && (
              <div style={{ padding: '8px 12px', background: 'var(--parent-surface-subtle)', border: '1px solid var(--parent-border)', borderRadius: '6px', fontSize: '0.82rem', marginBottom: '16px', color: 'var(--parent-text)' }}>
                {avatarError}
              </div>
            )}

            {/* DETAILS TABLE */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', borderTop: '1px solid var(--parent-border)', paddingTop: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.88rem', color: 'var(--parent-text-secondary)' }}>Display Name</span>
                {isEditing ? (
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    style={{ border: '1px solid var(--parent-border)', borderRadius: '6px', padding: '6px 10px', fontSize: '0.9rem', width: '200px', background: 'var(--parent-surface)', color: 'var(--parent-text)' }}
                  />
                ) : (
                  <strong style={{ fontSize: '0.95rem', color: 'var(--parent-text)' }}>{name}</strong>
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.88rem', color: 'var(--parent-text-secondary)' }}>Pronouns</span>
                {isEditing ? (
                  <input
                    type="text"
                    value={pronouns}
                    onChange={(e) => setPronouns(e.target.value)}
                    placeholder="e.g. she/her, they/them"
                    style={{ border: '1px solid var(--parent-border)', borderRadius: '6px', padding: '6px 10px', fontSize: '0.9rem', width: '200px', background: 'var(--parent-surface)', color: 'var(--parent-text)' }}
                  />
                ) : (
                  <strong style={{ fontSize: '0.95rem', color: 'var(--parent-text)' }}>{pronouns || 'Not specified'}</strong>
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.88rem', color: 'var(--parent-text-secondary)' }}>Gender</span>
                {isEditing ? (
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    style={{ border: '1px solid var(--parent-border)', borderRadius: '6px', padding: '6px 10px', fontSize: '0.9rem', width: '200px', background: 'var(--parent-surface)', color: 'var(--parent-text)' }}
                  >
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                    <option value="Non-binary">Non-binary</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                    <option value="Other">Other</option>
                  </select>
                ) : (
                  <strong style={{ fontSize: '0.95rem', color: 'var(--parent-text)' }}>{gender}</strong>
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.88rem', color: 'var(--parent-text-secondary)' }}>Account Role</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <strong style={{ fontSize: '0.95rem', color: 'var(--parent-text)' }}>{userRoleDisplay}</strong>
                  <span style={{ fontSize: '0.65rem', fontWeight: 850, padding: '2px 6px', background: 'var(--parent-surface-subtle)', border: '1px solid var(--parent-border)', borderRadius: '4px', color: 'var(--parent-text)' }}>
                    ROLE
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.88rem', color: 'var(--parent-text-secondary)' }}>Two-Way ID</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <strong style={{ fontFamily: 'monospace', fontSize: '1.05rem', color: 'var(--parent-text)' }}>{twoWayId}</strong>
                  <span style={{ fontSize: '0.65rem', fontWeight: 850, padding: '2px 6px', background: 'var(--parent-surface-subtle)', border: '1px solid var(--parent-border)', borderRadius: '4px', color: 'var(--parent-text)' }}>
                    VERIFIED
                  </span>
                </div>
              </div>
            </div>
          </motion.section>

          {/* SETTINGS LINK CARD */}
          <motion.section
            className="parent-card"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.1 }}
            style={{ padding: 0, overflow: 'hidden' }}
          >
            <button
              type="button"
              onClick={() => navigate(`${baseRoute}/settings`, { state: { from: `${baseRoute}/profile` } })}
              style={{
                width: '100%',
                padding: '20px 24px',
                background: 'transparent',
                border: 'none',
                textAlign: 'left',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
              }}
            >
              <strong style={{ fontSize: '1.05rem', color: 'var(--parent-text)', fontWeight: 800 }}>
                Settings
              </strong>
            </button>
          </motion.section>

        </div>
      </Layout>
    );
  }

  // -------------------------------------------------------------
  // TEEN PRESENTATION: EXISTING TEEN VISUAL IDENTITY INTACT
  // -------------------------------------------------------------
  return (
    <Layout>
      <main className="profile-page">
        <div className="profile-shell">

          {/* Hidden file input for photo upload */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif"
            style={{ display: 'none' }}
            onChange={handleFileChange}
            aria-label="Upload profile picture"
          />

          {/* HEADER */}
          <header className="profile-header">
            <button
              type="button"
              className="teen-back-btn"
              aria-label="Go back"
              title="Go back"
              onClick={() => {
                if (window.history.length > 1) {
                  navigate(-1);
                } else {
                  navigate(baseRoute);
                }
              }}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
            </button>

            <span className="profile-header-title">
              ACCOUNT &amp; IDENTITY
            </span>

            <div />
          </header>

          {/* INTRO */}
          <motion.section
            className="profile-intro"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <p className="profile-eyebrow">
              ACCOUNT
            </p>

            <h1>
              {name || 'Your Profile'}.
            </h1>

            <p className="profile-description">
              Manage your personal details, profile picture, and identity.
            </p>
          </motion.section>

          {/* AVATAR + BASIC DETAILS */}
          <section className="profile-section">
            <div className="profile-hero-card">
              <div
                style={{ position: 'relative', width: '72px', height: '72px', flexShrink: 0 }}
              >
                <div
                  className="profile-avatar"
                  onClick={handlePhotoClick}
                  title={avatarImage ? 'Tap to change profile picture' : 'Tap to add profile photo'}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handlePhotoClick();
                    }
                  }}
                  aria-label={avatarImage ? 'Change profile picture' : 'Add profile photo'}
                  style={{ cursor: 'pointer', width: '100%', height: '100%' }}
                >
                  {avatarImage ? (
                    <img
                      src={avatarImage}
                      alt="Profile"
                      className="profile-avatar-img"
                    />
                  ) : (
                    <span>{initialLetter}</span>
                  )}
                </div>

                {/* CLEAR FUNCTIONAL PLUS (+) BUTTON */}
                <button
                  type="button"
                  className="profile-add-photo-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePhotoClick();
                  }}
                  disabled={isProcessingImage}
                  aria-label="Add profile photo"
                  title="Add profile photo"
                  style={{
                    position: 'absolute',
                    bottom: '-2px',
                    right: '-2px',
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    background: 'var(--tw-primary)',
                    color: 'var(--tw-primary-text, #ffffff)',
                    border: '2px solid var(--tw-border)',
                    display: 'grid',
                    placeItems: 'center',
                    cursor: isProcessingImage ? 'wait' : 'pointer',
                    boxShadow: '1px 1px 0px var(--tw-border)',
                    zIndex: 4,
                    opacity: isProcessingImage ? 0.6 : 1,
                  }}
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                </button>
              </div>

              <div className="profile-hero-info">
                <h2>{name}</h2>
                <p className="profile-handle">
                  Two-Way ID: <strong>{twoWayId}</strong>
                </p>

                {avatarImage && (
                  <div style={{ marginTop: '6px' }}>
                    <button
                      type="button"
                      onClick={handleRemovePhoto}
                      aria-label="Remove photo"
                      style={{
                        background: 'transparent',
                        border: '1px solid var(--tw-border)',
                        borderRadius: '6px',
                        padding: '3px 8px',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        color: 'var(--tw-text-muted)',
                      }}
                    >
                      Remove photo
                    </button>
                  </div>
                )}
              </div>
            </div>

            {avatarNotice && (
              <div
                className="circle-status-banner circle-status-banner--success"
                style={{ marginTop: '12px' }}
              >
                ✓ {avatarNotice}
              </div>
            )}

            {avatarError && (
              <div
                className="circle-status-banner circle-status-banner--error"
                style={{ marginTop: '12px' }}
              >
                {avatarError}
              </div>
            )}
          </section>

          {/* EDITABLE DETAILS */}
          <section className="profile-section">
            <div className="profile-section-header">
              <span className="profile-section-label">
                PERSONAL DETAILS
              </span>

              {isEditing ? (
                <button
                  type="button"
                  className="profile-edit-btn"
                  onClick={handleSave}
                >
                  Save Changes
                </button>
              ) : (
                <button
                  type="button"
                  className="profile-edit-btn"
                  onClick={() => setIsEditing(true)}
                >
                  Edit Profile
                </button>
              )}
            </div>

            {savedSuccess && (
              <div
                className="circle-status-banner circle-status-banner--success"
                style={{ marginBottom: '16px' }}
              >
                ✓ Profile saved successfully
              </div>
            )}

            <div className="profile-table">
              {/* DISPLAY NAME */}
              <div className="profile-row">
                <div style={{ flex: 1 }}>
                  <span>Display Name</span>
                  {isEditing ? (
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      style={{
                        border: '2px solid var(--tw-border)',
                        borderRadius: '8px',
                        padding: '8px 10px',
                        font: 'inherit',
                        fontSize: '0.95rem',
                        fontWeight: 700,
                        marginTop: '4px',
                        maxWidth: '300px',
                        width: '100%',
                      }}
                    />
                  ) : (
                    <strong>{name}</strong>
                  )}
                </div>
              </div>

              {/* PRONOUNS */}
              <div className="profile-row">
                <div style={{ flex: 1 }}>
                  <span>Pronouns</span>
                  {isEditing ? (
                    <input
                      type="text"
                      value={pronouns}
                      onChange={(e) => setPronouns(e.target.value)}
                      placeholder="e.g. she/her, they/them"
                      style={{
                        border: '2px solid var(--tw-border)',
                        borderRadius: '8px',
                        padding: '8px 10px',
                        font: 'inherit',
                        fontSize: '0.9rem',
                        fontWeight: 600,
                        marginTop: '4px',
                        maxWidth: '300px',
                        width: '100%',
                      }}
                    />
                  ) : (
                    <strong>{pronouns || 'Not specified'}</strong>
                  )}
                </div>
              </div>

              {/* ROLE - PROTECTED */}
              <div className="profile-row">
                <div>
                  <span>Account Role</span>
                  <strong>{userRoleDisplay}</strong>
                </div>
                <span
                  style={{
                    fontSize: '0.65rem',
                    fontWeight: 800,
                    letterSpacing: '0.08em',
                    color: 'var(--tw-primary)',
                    background: 'var(--tw-primary-soft)',
                    padding: '4px 8px',
                    border: '1px solid var(--tw-border)',
                  }}
                >
                  PROTECTED
                </span>
              </div>

              {/* TWO-WAY ID - PROTECTED */}
              <div className="profile-row">
                <div>
                  <span>Two-Way ID (Unique)</span>
                  <strong>{twoWayId}</strong>
                </div>
                <span
                  style={{
                    fontSize: '0.65rem',
                    fontWeight: 800,
                    letterSpacing: '0.08em',
                    color: 'var(--tw-text-muted)',
                    background: 'var(--tw-surface-raised)',
                    padding: '4px 8px',
                    borderRadius: '6px',
                    border: '1.5px solid var(--tw-border)',
                  }}
                >
                  VERIFIED ID
                </span>
              </div>
            </div>
          </section>

          {/* SETTINGS AT BOTTOM OF PROFILE */}
          <section className="profile-section" style={{ marginTop: '28px' }}>
            <div className="profile-links">
              <button
                type="button"
                className="profile-settings-link"
                onClick={() => navigate(`${baseRoute}/settings`, { state: { from: `${baseRoute}/profile` } })}
                aria-label="Settings"
              >
                <div>
                  <strong style={{ display: 'block', fontSize: '1rem', fontWeight: 900 }}>
                    Settings
                  </strong>
                </div>
              </button>
            </div>
          </section>

          {/* FOOTER */}
          <footer className="profile-footer">
            Your personal space stays yours.
          </footer>

        </div>
      </main>
    </Layout>
  );
}

export default Profile;