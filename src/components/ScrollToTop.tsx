import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Global scroll restoration component.
 * Automatically scrolls to the top of the window, document, and any independent
 * scrollable containers whenever the user navigates to a new route.
 * Does not fire during intra-page state changes or interactions.
 */
export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // 1. Reset document / window scroll
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    if (document.documentElement) {
      document.documentElement.scrollTop = 0;
    }
    if (document.body) {
      document.body.scrollTop = 0;
    }

    // 2. Reset any independently scrollable main content containers
    const scrollContainers = document.querySelectorAll<HTMLElement>(
      'main, .teen-layout, .teen-layout-content, .settings-page, .profile-page, .teen-dashboard, .emotional-calendar-page, .mood-reflection-page, .haven-page, .haven-journal-page, .haven-thoughts-page, .circle-page, .conversations-page, .conversation-view, .nova-page'
    );
    scrollContainers.forEach((el) => {
      if (el && el.scrollTop > 0) {
        el.scrollTop = 0;
      }
    });
  }, [pathname]);

  return null;
}
