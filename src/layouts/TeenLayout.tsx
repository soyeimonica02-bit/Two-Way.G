import type { ReactNode } from 'react';
import { NavLink, useLocation } from 'react-router-dom';

interface TeenLayoutProps {
  children: ReactNode;
}

function TeenLayout({ children }: TeenLayoutProps) {
  const location = useLocation();

  const isChatsActive =
    location.pathname.startsWith('/app/teen/conversations') ||
    location.pathname.startsWith('/app/teen/clarity');

  const isNovaActive =
    location.pathname.startsWith('/app/teen/nova');

  const isCircleActive =
    location.pathname.startsWith('/app/teen/circle');

  const isYouActive =
    location.pathname.startsWith('/app/teen/profile');

  return (
    <div className="teen-layout">

      {/* =========================================
          DESKTOP HEADER
      ========================================= */}

      <header className="teen-layout-header teen-header">
        <NavLink
          to="/app/teen"
          className="teen-layout-brand teen-brand"
        >
          <img
            src="/favicon.svg"
            alt="Two-Way"
            className="teen-brand-logo"
          />

          <span className="teen-brand-name">
            Two-Way
          </span>
        </NavLink>

        <NavLink
          to="/app/teen/profile"
          className="teen-layout-profile teen-profile-link"
          aria-label="Profile"
          title="Profile"
        >
          {localStorage.getItem('twoway_profile_avatar') ? (
            <img
              src={localStorage.getItem('twoway_profile_avatar') || ''}
              alt="Profile"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                borderRadius: '50%',
              }}
            />
          ) : (
            <span className="teen-profile-avatar" aria-hidden="true">
              👤
            </span>
          )}
        </NavLink>
      </header>


      {/* =========================================
          PAGE CONTENT
      ========================================= */}

      <div className="teen-layout-content">
        {children}
      </div>


      {/* =========================================
          BOTTOM NAVIGATION
      ========================================= */}

      <nav
        className="teen-layout-nav teen-mobile-nav"
        aria-label="Main navigation"
      >

        <NavLink
          to="/app/teen"
          end
          className={({ isActive }) =>
            `teen-mobile-nav-item ${
              isActive ? 'is-active' : ''
            }`
          }
          aria-label="Home"
        >
          <span className="teen-layout-nav-icon teen-mobile-nav-icon">
            🏠
          </span>

          <span>
            Home
          </span>
        </NavLink>


        <NavLink
          to="/app/teen/conversations"
          className={`teen-mobile-nav-item ${
            isChatsActive ? 'is-active' : ''
          }`}
          aria-label="Clarity"
        >
          <span className="teen-layout-nav-icon teen-mobile-nav-icon">
            💬
          </span>

          <span>
            Clarity
          </span>
        </NavLink>


        <NavLink
          to="/app/teen/circle"
          className={`teen-mobile-nav-item ${
            isCircleActive ? 'is-active' : ''
          }`}
          aria-label="My Circle"
        >
          <span className="teen-layout-nav-icon teen-mobile-nav-icon">
            👥
          </span>

          <span>
            My Circle
          </span>
        </NavLink>

        <NavLink
          to="/app/teen/nova"
          className={`teen-mobile-nav-item ${
            isNovaActive ? 'is-active' : ''
          }`}
          aria-label="Nova"
        >
          <span className="teen-layout-nav-icon teen-mobile-nav-icon">
            ✨
          </span>

          <span>
            Nova
          </span>
        </NavLink>


        <NavLink
          to="/app/teen/profile"
          aria-label="Profile"
          className={`teen-mobile-nav-item ${
            isYouActive ? 'is-active' : ''
          }`}
        >
          <span className="teen-layout-nav-icon teen-mobile-nav-icon">
            👤
          </span>

          <span>
            Profile
          </span>
        </NavLink>

      </nav>

    </div>
  );
}

export default TeenLayout;