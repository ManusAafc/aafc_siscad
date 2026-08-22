import React, { useEffect, useState } from 'react';

export const LoadingBar: React.FC = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleStart = () => setVisible(true);
    const handleEnd = () => {
      setTimeout(() => setVisible(false), 400);
    };

    window.addEventListener('fetch-start', handleStart);
    window.addEventListener('fetch-end', handleEnd);

    return () => {
      window.removeEventListener('fetch-start', handleStart);
      window.removeEventListener('fetch-end', handleEnd);
    };
  }, []);

  if (!visible) return null;

  return <div style={styles.bar} />;
};

const styles: Record<string, React.CSSProperties> = {
  bar: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '3px',
    zIndex: 9999,
    background: 'linear-gradient(90deg, hsl(var(--primary)), hsl(200, 80%, 50%), hsl(var(--primary)))',
    backgroundSize: '200% 100%',
    animation: 'loadingBar 1.5s ease-in-out infinite',
  },
};
