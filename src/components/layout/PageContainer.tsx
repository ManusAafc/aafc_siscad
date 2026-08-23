import React from 'react';
import { Header } from './Header';

interface PageContainerProps {
  children: React.ReactNode;
  header?: {
    onBack?: () => void;
    showBack?: boolean;
  };
  className?: string;
}

export const PageContainer: React.FC<PageContainerProps> = ({
  children,
  header,
  className = '',
}) => {
  return (
    <div className={`page-container ${className}`}>
      {header && (
        <Header
          onBack={header.onBack}
          showBack={header.showBack ?? !!header.onBack}
        />
      )}
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