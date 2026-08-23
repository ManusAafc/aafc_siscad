import React from 'react';
import { Header } from './Header';

export const PageContainer: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => {
  return (
    <div className={`page-container ${className}`}>
      <Header />
      <main style={styles.content}>
        {children}
      </main>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  content: {
    flex: 1,
    padding: '1.5rem',
    backgroundColor: 'hsl(var(--background))',
    minHeight: 'calc(100vh - 60px)',
  },
};