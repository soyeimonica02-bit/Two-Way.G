import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';

function Profile() {
  const navigate = useNavigate();
  const location = useLocation();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isParent = location.pathname.startsWith('/app/parent');
  const baseRoute = isParent ? '/app/parent' : '/app/teen';

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

  // Profile picture: load from persisted user profile storage
  const [avatarImage, setAvatarImage] = useState<string | null>(
    () => localStorage.getItem('twoway_profile_avatar') || null,
  );
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const [avatarNotice, setAvatarNotice] = useState<string | null>(null);
  const [isProcessingImage, setIsProcessingImage] = useState(false);

  const [isEditing, setIsEditing] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Two-Way ID is protected and unique to the user
  const [twoWayId] = useState(
    () => localStorage.getItem('twoway_user_id') || 'TW-4920',
  );

  const handleSave = () => {
    localStorage.setItem('twoway_profile_name', name.trim() || 'Alex');
    localStorage.setItem('twoway_profile_pronouns', pronouns.trim());
    localStorage.setItem('twoway_profile_gender', gender);
    setIsEditing(false);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const initialLetter = (name.trim().charAt(0) || 'T').toUpperCase();

  // Profile picture file handler
  const handlePhotoClick = () => {
    setAvatarError(null);
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    // Reset file input so selecting the same file again triggers change
    e.target.value = '';

    if (!file) {
      return;
    }

    setAvatarError(null);
    setAvatarNotice(null);

    // Validate mime type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];
    if (!validTypes.includes(file.type)) {
      setAvatarError('Please select a valid image file (JPG, PNG, WebP, or GIF).');
      return;
    }

    // Limit size to 4MB for responsive and safe local persistence
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
        setAvatarNotice('Profile photo updated.');
        setTimeout(() => setAvatarNotice(null), 3000);
      } catch (storageErr) {
        setIsProcessingImage(false);
        // If localStorage quota exceeded, compress or notify safely
        console.error('Failed to store profile photo in localStorage:', storageErr);
        setAvatarError('Could not save photo to local device storage (quota exceeded).');
      }
    };

    reader.readAsDataURL(file);
  };

  return (
    <main className="profile-page">
      <div className="profile-shell">

        {/* HEADER */}
        <header className="profile-header">
          <button
            type="button"
            aria-label="Go back"
            onClick={() => navigate(baseRoute)}
          >
            ←
          </button>

          <span>PROFILE</span>

          <div />
        </header>

        {/* PROFILE HERO */}
        <motion.section
          className="profile-hero"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {/* Real hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif"
            style={{ display: 'none' }}
            onChange={handleFileChange}
            aria-label="Upload profile picture"
          />

          <div className="profile-avatar-wrapper">
            <div
              className={`profile-avatar ${avatarImage ? 'has-image' : ''}`}
              title={avatarImage ? 'Click plus button to change picture' : 'Upload profile picture'}
            >
              {avatarImage ? (
                <img
                  src={avatarImage}
                  alt={`${name}'s profile`}
                  className="profile-avatar-img"
                />
              ) : (
                <span>{initialLetter}</span>
              )}

              {/* Working plus (+) button control for profile picture */}
              <button
                type="button"
                className="profile-picture-plus"
                onClick={handlePhotoClick}
                aria-label={avatarImage ? 'Change profile picture' : 'Add profile picture'}
                title={avatarImage ? 'Change profile picture' : 'Add profile picture'}
                disabled={isProcessingImage}
              >
                {isProcessingImage ? '…' : '+'}
              </button>
            </div>

            {avatarError && (
              <p
                role="alert"
                style={{
                  margin: '8px 0 0',
                  fontSize: '0.74rem',
                  fontWeight: 700,
                  color: 'var(--tw-accent-red, #dc2626)',
                  maxWidth: '220px',
                  lineHeight: 1.35,
                }}
              >
                {avatarError}
              </p>
            )}

            {avatarNotice && (
              <p
                role="status"
                style={{
                  margin: '8px 0 0',
                  fontSize: '0.74rem',
                  fontWeight: 800,
                  color: 'var(--tw-primary)',
                  maxWidth: '220px',
                  lineHeight: 1.35,
                }}
              >
                ✓ {avatarNotice}
              </p>
            )}
          </div>

          <div className="profile-identity">
            <span className="profile-eyebrow">
              YOUR PERSONAL SPACE
            </span>

            <h1>{name}</h1>

            <p>
              Manage your personal details. Account identity is kept protected.
            </p>
          </div>
        </motion.section>

        {/* PROFILE DETAILS */}
        <section className="profile-section">
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '14px',
            }}
          >
            <span className="profile-section-label" style={{ margin: 0 }}>
              YOUR DETAILS
            </span>

            {!isEditing ? (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                style={{
                  background: 'var(--tw-surface)',
                  border: '2px solid var(--tw-border)',
                  borderRadius: '10px',
                  padding: '6px 14px',
                  font: 'inherit',
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  color: 'var(--tw-text)',
                  boxShadow: '2px 2px 0px var(--tw-border)',
                  transition: 'transform 120ms ease, box-shadow 120ms ease',
                }}
              >
                Edit Details
              </button>
            ) : (
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  onClick={handleSave}
                  style={{
                    background: 'var(--tw-primary)',
                    color: 'var(--tw-primary-text, #ffffff)',
                    border: '2px solid var(--tw-border)',
                    borderRadius: '10px',
                    padding: '6px 14px',
                    font: 'inherit',
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    boxShadow: '2px 2px 0px var(--tw-border)',
                  }}
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  style={{
                    background: 'var(--tw-surface)',
                    border: '2px solid var(--tw-border)',
                    borderRadius: '10px',
                    padding: '6px 14px',
                    font: 'inherit',
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    color: 'var(--tw-text)',
                    boxShadow: '2px 2px 0px var(--tw-border)',
                  }}
                >
                  Cancel
                </button>
              </div>
            )}
          </div>

          {savedSuccess && (
            <div
              style={{
                padding: '12px 16px',
                background: 'var(--tw-primary-soft)',
                border: '2px solid var(--tw-border)',
                borderRadius: '10px',
                color: 'var(--tw-primary)',
                fontSize: '0.78rem',
                fontWeight: 800,
                marginBottom: '16px',
                boxShadow: '2px 2px 0px var(--tw-border)',
              }}
            >
              ✓ Profile details updated successfully.
            </div>
          )}

          <div className="profile-list">
            {/* NAME */}
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
                      background: 'var(--tw-surface-soft)',
                      color: 'var(--tw-text)',
                      padding: '8px 10px',
                      font: 'inherit',
                      fontSize: '0.9rem',
                      fontWeight: 600,
                      marginTop: '4px',
                      maxWidth: '300px',
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
                  <div>
                    <select
                      value={['She/her', 'He/him', 'They/them', 'Prefer not to say'].includes(pronouns) ? pronouns : (pronouns ? 'Custom' : '')}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === 'Custom') {
                          if (['She/her', 'He/him', 'They/them', 'Prefer not to say'].includes(pronouns)) {
                            setPronouns('');
                          }
                        } else {
                          setPronouns(val);
                        }
                      }}
                      style={{
                        border: '2px solid var(--tw-border)',
                        borderRadius: '8px',
                        background: 'var(--tw-surface-soft)',
                        color: 'var(--tw-text)',
                        padding: '8px 10px',
                        font: 'inherit',
                        fontSize: '0.9rem',
                        fontWeight: 600,
                        marginTop: '4px',
                        maxWidth: '300px',
                        width: '100%',
                        display: 'block',
                      }}
                    >
                      <option value="">Not specified / Select pronouns</option>
                      <option value="She/her">She/her</option>
                      <option value="He/him">He/him</option>
                      <option value="They/them">They/them</option>
                      <option value="Prefer not to say">Prefer not to say</option>
                      <option value="Custom">Custom / Enter your own</option>
                    </select>

                    {(!['She/her', 'He/him', 'They/them', 'Prefer not to say'].includes(pronouns) || pronouns === '') && (
                      <input
                        type="text"
                        value={pronouns}
                        onChange={(e) => setPronouns(e.target.value)}
                        placeholder="e.g. she/they, ze/zir, any pronouns"
                        style={{
                          border: '2px solid var(--tw-border)',
                          borderRadius: '8px',
                          background: 'var(--tw-surface-soft)',
                          color: 'var(--tw-text)',
                          padding: '8px 10px',
                          font: 'inherit',
                          fontSize: '0.9rem',
                          fontWeight: 600,
                          marginTop: '8px',
                          maxWidth: '300px',
                          width: '100%',
                          display: 'block',
                        }}
                      />
                    )}
                  </div>
                ) : (
                  <strong>{pronouns || 'Not specified'}</strong>
                )}
              </div>
            </div>

            {/* GENDER */}
            <div className="profile-row">
              <div style={{ flex: 1 }}>
                <span>Gender</span>
                {isEditing ? (
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    style={{
                      border: '2px solid var(--tw-border)',
                      borderRadius: '8px',
                      padding: '8px 10px',
                      font: 'inherit',
                      fontSize: '0.9rem',
                      fontWeight: 600,
                      marginTop: '4px',
                      maxWidth: '300px',
                      background: 'var(--tw-surface-soft)',
                      color: 'var(--tw-text)',
                    }}
                  >
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                    <option value="Non-binary">Non-binary</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                    <option value="Other">Other</option>
                  </select>
                ) : (
                  <strong>{gender}</strong>
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

        {/* =========================================
            SETTINGS AT BOTTOM OF PROFILE
        ========================================= */}
        <section className="profile-section" style={{ marginTop: '28px' }}>
          <span className="profile-section-label">
            SETTINGS &amp; PREFERENCES
          </span>

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
                <span
                  style={{
                    display: 'block',
                    fontSize: '0.8rem',
                    color: 'var(--tw-text-muted)',
                    fontWeight: 600,
                    marginTop: '2px',
                  }}
                >
                  Privacy, notifications, appearance, help &amp; account
                </span>
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
  );
}

export default Profile;