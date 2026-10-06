import type { ReactNode } from 'react';
import { NavLink, useLocation } from 'react-router-dom';

interface TeenLayoutProps {
  children: ReactNode;
}

function TeenLayout({ children }: TeenLayoutProps) {
  const location = useLocation();

  const isChatsActive =
    location.pathname.startsWith('/app/teen/conversations');

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
          <span className="teen-profile-avatar" aria-hidden="true">
            ◯
          </span>
        </NavLink>
      </header>


      {/* =========================================
          PAGE CONTENT
      ========================================= */}

      <div className="teen-layout-content">
        {children}
      </div>


      {/* =========================================
          MOBILE NAVIGATION
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
        >
          <span className="teen-layout-nav-icon teen-mobile-nav-icon">
            ⌂
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
        >
          <span className="teen-layout-nav-icon teen-mobile-nav-icon">
            ○
          </span>

          <span>
            Chats
          </span>
        </NavLink>


        <NavLink
          to="/app/teen/nova"
          className={({ isActive }) =>
            `teen-mobile-nav-item ${
              isActive ? 'is-active' : ''
            }`
          }
        >
          <span className="teen-layout-nav-icon teen-mobile-nav-icon">
            ✦
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
            ◯
          </span>
        </NavLink>

      </nav>

    </div>
  );
}

export default TeenLayout;