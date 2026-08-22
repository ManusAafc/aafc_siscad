import React, { useEffect, useState } from 'react';
import aafcLogo from '../../assets/aafc_logo.jpg';

interface SplashScreenProps {
  onFinish: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  const [opacity, setOpacity] = useState(0);

  useEffect(() => {
    // Fade in
    const fadeInTimer = setTimeout(() => setOpacity(1), 50);

    // Fade out and finish
    const fadeOutTimer = setTimeout(() => setOpacity(0), 2200);
    const finishTimer = setTimeout(() => onFinish(), 2800);

    return () => {
      clearTimeout(fadeInTimer);
      clearTimeout(fadeOutTimer);
      clearTimeout(finishTimer);
    };
  }, [onFinish]);

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#D32F2F',
      zIndex: 9999,
      opacity,
      transition: 'opacity 0.6s ease-in-out',
    }}>
      <img
        src={aafcLogo}
        alt="AAFCorsan"
        style={{
          width: '280px',
          maxWidth: '80vw',
          height: 'auto',
          borderRadius: '16px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
        }}
      />
    </div>
  );
};
