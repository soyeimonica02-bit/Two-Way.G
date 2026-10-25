import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import ParentLayout from '../layouts/ParentLayout';
import { loadCircleConnections } from '../utils/circleStorage';
import { loadParentReflections, loadSavedGuideIds } from '../utils/parentPerspectiveStorage';

export default function ParentDashboard() {
  const navigate = useNavigate();

  const parentName =
    localStorage.getItem('twoway_profile_name') ||
    localStorage.getItem('twoway_demo_name') ||
    'Parent';

  const [connectionCount, setConnectionCount] = useState(() => loadCircleConnections().length);
  const [reflectionCount, setReflectionCount] = useState(() => loadParentReflections().length);
  const [savedGuideCount, setSavedGuideCount] = useState(() => loadSavedGuideIds().length);

  useEffect(() => {
    const handleStorageUpdate = () => {
      setConnectionCount(loadCircleConnections().length);
      setReflectionCount(loadParentReflections().length);
      setSavedGuideCount(loadSavedGuideIds().length);
    };
    window.addEventListener('storage', handleStorageUpdate);
    window.addEventListener('twoway-circle-connections-updated', handleStorageUpdate);
    window.addEventListener('twoway-saved-guides-updated', handleStorageUpdate);
    return () => {
      window.removeEventListener('storage', handleStorageUpdate);
      window.removeEventListener('twoway-circle-connections-updated', handleStorageUpdate);
      window.removeEventListener('twoway-saved-guides-updated', handleStorageUpdate);
    };
  }, []);

  return (
    <ParentLayout>
      <div className="parent-dashboard">

        {/* =========================================
            1. DISTINCTIVE, WELCOMING GREETING
        ========================================= */}
        <motion.section
          className="parent-hero"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >
          <span className="parent-hero-pill">
            PARENT PERSPECTIVE
          </span>

          <h1>
            Welcome, {parentName}.
          </h1>

          <p>
            A calm, intentional space to pause, consider another point of view, and build constructive communication with your teen.
          </p>
        </motion.section>

        {/* =========================================
            2. PRIMARY ACTION: PERSPECTIVE PRACTICE
        ========================================= */}
        <motion.section
          className="parent-card"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.05 }}
          style={{
            border: '2px solid var(--parent-border-strong)',
            position: 'relative',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center' }}>
              <svg
                width="26"
                height="20"
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
            <span className="parent-card-label" style={{ color: 'var(--parent-text)' }}>
              CORE PRACTICE
            </span>
          </div>

          <h2 style={{ fontSize: '1.45rem', marginBottom: '8px' }}>
            See another side. Find a better way forward.
          </h2>

          <p style={{ color: 'var(--parent-text-secondary)', fontSize: '0.96rem', lineHeight: 1.6, margin: '0 0 24px' }}>
            When conversations feel tense or distant, pause to explore your teen&apos;s underlying perspective. Step back, reframe the interaction, and prepare a calm response.
          </p>

          <button
            type="button"
            className="parent-btn-primary"
            onClick={() => navigate('/app/parent/perspective')}
          >
            Open Perspective
          </button>
        </motion.section>

        {/* =========================================
            3. CONTEXTUAL OVERVIEW & GROUNDING
        ========================================= */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '18px' }}>

          {/* Contextual Circle Status */}
          <motion.section
            className="parent-card"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.1 }}
            style={{ margin: 0 }}
          >
            <span className="parent-card-label">CIRCLE STATUS</span>
            <h3 style={{ fontSize: '1.1rem', margin: '4px 0 8px' }}>
              {connectionCount > 0 ? `${connectionCount} Active Connection${connectionCount > 1 ? 's' : ''}` : 'No Connections Established'}
            </h3>
            <p style={{ color: 'var(--parent-text-secondary)', fontSize: '0.86rem', lineHeight: 1.55, margin: '0 0 16px' }}>
              {connectionCount > 0
                ? 'Your Circle is connected. View, message, and coordinate with your connected circle members in My Circle.'
                : 'Share your Two-Way ID with your teen or send them a connection request to begin connecting.'}
            </p>
            <button
              type="button"
              className="parent-btn-secondary"
              onClick={() => navigate('/app/parent/circle')}
              style={{ fontSize: '0.82rem', padding: '8px 16px' }}
            >
              Go to My Circle
            </button>
          </motion.section>

          {/* Saved Guides Retrieval Card */}
          <motion.section
            className="parent-card"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.15 }}
            style={{ margin: 0 }}
          >
            <span className="parent-card-label">SAVED GUIDES</span>
            <h3 style={{ fontSize: '1.1rem', margin: '4px 0 8px' }}>
              {savedGuideCount > 0 ? `${savedGuideCount} Saved Guide${savedGuideCount > 1 ? 's' : ''}` : 'Saved for Later'}
            </h3>
            <p style={{ color: 'var(--parent-text-secondary)', fontSize: '0.86rem', lineHeight: 1.55, margin: '0 0 16px' }}>
              {savedGuideCount > 0
                ? 'Quickly revisit conversation strategies, active listening guides, and reframing prompts you bookmarked.'
                : 'Bookmark communication guides in Perspective to review whenever you need quick reference before a conversation.'}
            </p>
            <button
              type="button"
              className="parent-btn-secondary"
              onClick={() => navigate('/app/parent/perspective?tab=saved')}
              style={{ fontSize: '0.82rem', padding: '8px 16px' }}
            >
              View Saved Guides
            </button>
          </motion.section>

          {/* Private Reflections & Sounding Board */}
          <motion.section
            className="parent-card"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.2 }}
            style={{ margin: 0 }}
          >
            <span className="parent-card-label">PRIVATE PRACTICE</span>
            <h3 style={{ fontSize: '1.1rem', margin: '4px 0 8px' }}>
              {reflectionCount > 0 ? `${reflectionCount} Saved Reflection${reflectionCount > 1 ? 's' : ''}` : 'Sounding Board with Nova'}
            </h3>
            <p style={{ color: 'var(--parent-text-secondary)', fontSize: '0.86rem', lineHeight: 1.55, margin: '0 0 16px' }}>
              {reflectionCount > 0
                ? 'Your private parenting notes and breakthroughs are kept safe on your device. Review or continue exploring with Nova.'
                : 'Need to talk through a challenging conversation before bringing it to your teen? Nova provides a confidential sounding board.'}
            </p>
            <button
              type="button"
              className="parent-btn-ghost"
              onClick={() => navigate('/app/parent/nova')}
              style={{ fontSize: '0.82rem', padding: '8px 16px' }}
            >
              Discuss with Nova
            </button>
          </motion.section>

        </div>

      </div>
    </ParentLayout>
  );
}
