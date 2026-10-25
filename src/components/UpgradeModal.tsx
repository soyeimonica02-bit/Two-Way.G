import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  SUBSCRIPTION_PLANS,
  setCurrentSubscriptionTier,
  type SubscriptionTier,
} from '../utils/subscriptionStorage';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  featureName?: string;
  isParent?: boolean;
}

export default function UpgradeModal({
  isOpen,
  onClose,
  featureName = 'Group Conversations',
  isParent = false,
}: UpgradeModalProps) {
  const [selectedTier, setSelectedTier] = useState<SubscriptionTier>('family');
  const [upgradedSuccess, setUpgradedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSimulateUpgrade = () => {
    setCurrentSubscriptionTier(selectedTier);
    setUpgradedSuccess(true);
    setTimeout(() => {
      setUpgradedSuccess(false);
      onClose();
    }, 1400);
  };

  return (
    <AnimatePresence>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="upgrade-title"
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 100,
          background: 'rgba(0, 0, 0, 0.65)',
          backdropFilter: 'blur(3px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 8 }}
          transition={{ duration: 0.2 }}
          style={{
            width: '100%',
            maxWidth: '560px',
            background: isParent ? 'var(--parent-surface, #FFFFFF)' : 'var(--tw-surface, #FAF9F2)',
            color: isParent ? 'var(--parent-text, #000000)' : 'var(--tw-text, #1A1628)',
            border: isParent ? '2px solid var(--parent-border-strong, #000000)' : '2.5px solid var(--tw-border, #282436)',
            borderRadius: isParent ? '12px' : '16px',
            boxShadow: isParent ? '0 12px 36px rgba(0,0,0,0.22)' : '4px 4px 0px var(--tw-border, #282436)',
            padding: '24px',
            position: 'relative',
            maxHeight: '90vh',
            overflowY: 'auto',
          }}
        >
          {/* CLOSE BUTTON */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            title="Close"
            style={{
              position: 'absolute',
              top: '16px',
              right: '16px',
              width: '32px',
              height: '32px',
              borderRadius: '6px',
              border: isParent ? '1.5px solid var(--parent-border, #E4E4E7)' : '2px solid var(--tw-border, #282436)',
              background: 'transparent',
              color: 'inherit',
              cursor: 'pointer',
              display: 'grid',
              placeItems: 'center',
              fontWeight: 800,
              fontSize: '1rem',
            }}
          >
            ✕
          </button>

          {/* HEADER */}
          <div style={{ marginBottom: '18px', paddingRight: '36px' }}>
            <span
              style={{
                display: 'inline-block',
                fontSize: '0.65rem',
                fontWeight: 850,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: isParent ? 'var(--parent-accent, #7C3AED)' : 'var(--tw-primary, #6D46D4)',
                background: isParent ? 'var(--parent-accent-soft, #EDE9FE)' : 'var(--tw-primary-soft, #EBE7FE)',
                padding: '3px 8px',
                borderRadius: '4px',
                border: isParent ? '1px solid var(--parent-accent, #7C3AED)' : '1px solid var(--tw-border, #282436)',
                marginBottom: '8px',
              }}
            >
              SUBSCRIPTION REQUIRED
            </span>
            <h2 id="upgrade-title" style={{ margin: '0 0 6px', fontSize: '1.4rem', fontWeight: 850 }}>
              Unlock {featureName}
            </h2>
            <p style={{ margin: 0, fontSize: '0.88rem', opacity: 0.8, lineHeight: 1.5 }}>
              Group conversations connect multiple family members or circle members in one shared, respectful thread. Free Core plan covers one-to-one direct messages; upgrade to access groups.
            </p>
          </div>

          {upgradedSuccess ? (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                padding: '18px',
                borderRadius: '8px',
                background: isParent ? 'var(--parent-accent-soft, #EDE9FE)' : 'var(--tw-success-soft, #E9F8F1)',
                border: isParent ? '1.5px solid var(--parent-accent, #7C3AED)' : '2px solid var(--tw-success, #22A06B)',
                textAlign: 'center',
                margin: '20px 0',
              }}
            >
              <h3 style={{ margin: '0 0 4px', fontSize: '1.1rem' }}>✓ Subscription Activated!</h3>
              <p style={{ margin: 0, fontSize: '0.86rem' }}>
                Your account is now on the {SUBSCRIPTION_PLANS[selectedTier].name} plan. Unlocking {featureName}...
              </p>
            </motion.div>
          ) : (
            <>
              {/* PLAN OPTIONS */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', margin: '20px 0' }}>
                {(['family', 'circle_plus'] as SubscriptionTier[]).map((tierKey) => {
                  const plan = SUBSCRIPTION_PLANS[tierKey];
                  const isSelected = selectedTier === tierKey;
                  return (
                    <button
                      key={tierKey}
                      type="button"
                      onClick={() => setSelectedTier(tierKey)}
                      style={{
                        padding: '16px 14px',
                        borderRadius: '10px',
                        border: isSelected
                          ? isParent
                            ? '2.5px solid var(--parent-accent, #7C3AED)'
                            : '2.5px solid var(--tw-primary, #6D46D4)'
                          : isParent
                            ? '1.5px solid var(--parent-border, #E4E4E7)'
                            : '2px solid var(--tw-border, #282436)',
                        background: isSelected
                          ? isParent
                            ? 'var(--parent-surface-subtle, #F8F8F9)'
                            : 'var(--tw-surface-raised, #EBE7FE)'
                          : isParent
                            ? 'var(--parent-surface, #FFFFFF)'
                            : 'var(--tw-surface, #FAF9F2)',
                        color: 'inherit',
                        cursor: 'pointer',
                        textAlign: 'left',
                        position: 'relative',
                        boxShadow: isSelected && !isParent ? '2px 2px 0px var(--tw-border)' : 'none',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <span style={{ fontSize: '0.7rem', fontWeight: 850, textTransform: 'uppercase', opacity: 0.75 }}>
                          {plan.badge}
                        </span>
                        {isSelected && (
                          <span style={{ fontSize: '0.8rem', color: isParent ? 'var(--parent-accent)' : 'var(--tw-primary)' }}>
                            ●
                          </span>
                        )}
                      </div>
                      <strong style={{ display: 'block', fontSize: '1rem', marginBottom: '2px' }}>
                        {plan.name}
                      </strong>
                      <div style={{ fontSize: '1.15rem', fontWeight: 850, margin: '4px 0' }}>
                        {plan.monthlyPrice}
                      </div>
                      <span style={{ fontSize: '0.72rem', opacity: 0.75, display: 'block' }}>
                        {plan.annualPrice}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* FEATURES LIST OF SELECTED PLAN */}
              <div
                style={{
                  border: isParent ? '1px solid var(--parent-border, #E4E4E7)' : '1.5px solid var(--tw-border, #282436)',
                  borderRadius: '8px',
                  padding: '12px 16px',
                  marginBottom: '20px',
                  background: isParent ? 'var(--parent-surface-subtle, #F8F8F9)' : 'var(--tw-surface, #FAF9F2)',
                  fontSize: '0.84rem',
                }}
              >
                <strong style={{ display: 'block', marginBottom: '6px', fontSize: '0.86rem' }}>
                  Included in {SUBSCRIPTION_PLANS[selectedTier].name}:
                </strong>
                <ul style={{ margin: 0, paddingLeft: '18px', lineHeight: 1.5 }}>
                  {SUBSCRIPTION_PLANS[selectedTier].features.map((feat, i) => (
                    <li key={i}>{feat}</li>
                  ))}
                </ul>
              </div>

              {/* ACTIONS */}
              <div style={{ display: 'flex', gap: '10px', flexDirection: 'column' }}>
                <button
                  type="button"
                  onClick={handleSimulateUpgrade}
                  className={isParent ? 'parent-btn-primary' : 'tw-button tw-button-primary'}
                  style={{
                    width: '100%',
                    padding: '12px',
                    fontSize: '0.92rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                  }}
                >
                  Activate {SUBSCRIPTION_PLANS[selectedTier].name} (Demo Upgrade)
                </button>

                <p
                  style={{
                    margin: '4px 0 0',
                    fontSize: '0.72rem',
                    opacity: 0.7,
                    textAlign: 'center',
                    lineHeight: 1.4,
                  }}
                >
                  Simulation Notice: Payment processing is not connected to a live banking processor. Clicking activate stores entitlement status locally in your browser session for evaluation.
                </p>
              </div>
            </>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
