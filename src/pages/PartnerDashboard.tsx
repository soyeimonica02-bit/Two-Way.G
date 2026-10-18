import { useNavigate } from 'react-router-dom';
import { getCurrentUserTwoWayId } from '../utils/circleStorage';

export default function PartnerDashboard() {
  const navigate = useNavigate();
  const name =
    localStorage.getItem('twoway_profile_name') || 'Partner';
  const userId = getCurrentUserTwoWayId();

  return (
    <main className="tw-page">
      <div className="tw-container" style={{ maxWidth: '640px', padding: '40px 24px' }}>
        <section
          className="tw-card"
          style={{
            padding: '32px 28px',
            display: 'flex',
            flexDirection: 'column',
            gap: '18px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span
              style={{
                fontSize: '0.72rem',
                fontWeight: 850,
                letterSpacing: '0.08em',
                color: 'var(--tw-primary)',
                textTransform: 'uppercase',
              }}
            >
              ★ PARTNER SPACE
            </span>
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 800,
                fontFamily: 'monospace',
                padding: '2px 8px',
                borderRadius: '6px',
                background: 'var(--tw-surface-raised)',
                border: '1px solid var(--tw-border)',
              }}
            >
              {userId}
            </span>
          </div>

          <h1 style={{ margin: 0, fontSize: '1.8rem', fontWeight: 900 }}>
            Welcome, {name}.
          </h1>

          <p className="text-secondary" style={{ margin: 0, lineHeight: 1.6, fontSize: '0.95rem' }}>
            A space to make difficult conversations easier and build shared understanding together.
          </p>

          <div style={{ display: 'flex', gap: '12px', marginTop: '12px', flexWrap: 'wrap' }}>

            <button
              type="button"
              className="tw-button tw-button-ghost"
              onClick={() => {
                localStorage.removeItem('twoway_logged_in');
                navigate('/');
              }}
            >
              Log out
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}
