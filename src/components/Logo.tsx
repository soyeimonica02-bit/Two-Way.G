import { motion } from 'framer-motion';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showName?: boolean;
  showTagline?: boolean;
}

function Logo({
  size = 'md',
  showName = true,
  showTagline = false,
}: LogoProps) {
  const sizes = {
    sm: {
      image: 70,
      name: '1.35rem',
      tagline: '0.7rem',
    },
    md: {
      image: 110,
      name: '1.7rem',
      tagline: '0.78rem',
    },
    lg: {
      image: 180,
      name: '2.25rem',
      tagline: '0.85rem',
    },
  };

  const currentSize = sizes[size];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.55,
        ease: 'easeOut',
      }}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
      }}
    >
          <Logo size="lg" showName showTagline={false} />


      {showName && (
        <span
          style={{
            marginTop: '-4px',
            fontFamily: 'var(--font-display)',
            fontSize: currentSize.name,
            fontWeight: 800,
            lineHeight: 1,
            letterSpacing: '-0.04em',
        color: 'var(--tw-on-surface)',
              }}
        >
          Two-Way
        </span>
      )}

      {showTagline && (
        <span
          className="text-secondary"
          style={{
            marginTop: '8px',
            fontSize: currentSize.tagline,
            lineHeight: 1.5,
          }}
        >
          Say the hard thing. Be understood.
        </span>
      )}
    </motion.div>
  );
}

export default Logo;