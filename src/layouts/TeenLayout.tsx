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

      <header className="teen-header">
        <NavLink
          to="/app/teen"
          className="teen-brand"
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
          className="teen-profile-link"
        >
          <span className="teen-profile-avatar">
            You
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
        className="teen-mobile-nav"
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
          <span className="teen-mobile-nav-icon">
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
          <span className="teen-mobile-nav-icon">
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
          <span className="teen-mobile-nav-icon">
            ✦
          </span>

          <span>
            Nova
          </span>
        </NavLink>


        <NavLink
          to="/app/teen/profile"
          className={`teen-mobile-nav-item ${
            isYouActive ? 'is-active' : ''
          }`}
        >
          <span className="teen-mobile-nav-icon">
            ◯
          </span>

          <span>
            You
          </span>
        </NavLink>

      </nav>

    </div>
  );
}

export default TeenLayout;