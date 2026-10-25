import type { ReactNode } from 'react';
import { NavLink, useLocation } from 'react-router-dom';

interface ParentLayoutProps {
  children: ReactNode;
}

export default function ParentLayout({ children }: ParentLayoutProps) {
  const location = useLocation();

  const isHomeActive = location.pathname === '/app/parent';
  const isPerspectiveActive = location.pathname.startsWith('/app/parent/perspective');
  const isCircleActive = location.pathname.startsWith('/app/parent/circle');
  const isNovaActive = location.pathname.startsWith('/app/parent/nova');
  const isProfileActive =
    location.pathname.startsWith('/app/parent/profile') ||
    location.pathname.startsWith('/app/parent/settings');

  const avatar = localStorage.getItem('twoway_profile_avatar');

  return (
    <div className="parent-layout">

      {/* =========================================
          TOP HEADER - MONOCHROMATIC
      ========================================= */}
      <header className="parent-header">
        <NavLink
          to="/app/parent"
          className="parent-brand"
        >
          <img
            src="/favicon.svg"
            alt="Two-Way"
            className="parent-brand-logo"
          />

          <span className="parent-brand-name">
            Two-Way
          </span>
        </NavLink>

        <NavLink
          to="/app/parent/profile"
          className="parent-profile-link"
          aria-label="Parent Profile"
          title="Profile"
        >
          {avatar ? (
            <img
              src={avatar}
              alt="Profile"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />
          ) : (
            <span style={{ fontSize: '1.05rem', lineHeight: 1 }} aria-hidden="true">
              👤
            </span>
          )}
        </NavLink>
      </header>

      {/* =========================================
          PAGE CONTENT
      ========================================= */}
      <main className="parent-content">
        {children}
      </main>

      {/* =========================================
          BOTTOM NAVIGATION - EXACTLY 5 TABS (PARENT)
      ========================================= */}
      <nav
        className="parent-nav"
        aria-label="Parent navigation"
      >
        <NavLink
          to="/app/parent"
          end
          className={`parent-nav-item ${isHomeActive ? 'is-active' : ''}`}
          aria-label="Home"
        >
          <span className="parent-nav-icon">🏠</span>
          <span>Home</span>
        </NavLink>

        <NavLink
          to="/app/parent/perspective"
          className={`parent-nav-item ${isPerspectiveActive ? 'is-active' : ''}`}
          aria-label="Perspective"
        >
          <span className="parent-nav-icon">
            <svg
              width="22"
              height="18"
              viewBox="0 0 36 28"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <circle cx="11" cy="14" r="9" stroke="currentColor" strokeWidth="2.5" fill="none" />
              <circle cx="25" cy="14" r="9" stroke="currentColor" strokeWidth="2.5" fill="none" />
              <path d="M14 11L18 14L14 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M22 11L18 14L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          <span>Perspective</span>
        </NavLink>

        <NavLink
          to="/app/parent/circle"
          className={`parent-nav-item ${isCircleActive ? 'is-active' : ''}`}
          aria-label="My Circle"
        >
          <span className="parent-nav-icon">👥</span>
          <span>My Circle</span>
        </NavLink>

        <NavLink
          to="/app/parent/nova"
          className={`parent-nav-item ${isNovaActive ? 'is-active' : ''}`}
          aria-label="Nova"
        >
          <span className="parent-nav-icon">✨</span>
          <span>Nova</span>
        </NavLink>

        <NavLink
          to="/app/parent/profile"
          className={`parent-nav-item ${isProfileActive ? 'is-active' : ''}`}
          aria-label="Profile"
        >
          <span className="parent-nav-icon">👤</span>
          <span>Profile</span>
        </NavLink>
      </nav>

    </div>
  );
}
