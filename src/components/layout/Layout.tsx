import React, { useEffect, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { Header } from './Header';
import { 
  LogOut, 
  X, 
  RefreshCw,
  ChevronLeft
} from 'lucide-react';
import { dispatchLoadingStart, dispatchLoadingEnd } from '../common/ButtonLoading';

export const Layout: React.FC = () => {
  const { user, signOut } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    dispatchLoadingStart();
    await signOut();
    dispatchLoadingEnd();
    navigate('/login');
  };

  return (
    <div className="layout-container" style={styles.layout}>
      {/* Main Content Area */}
      <div className="layout-main-wrapper" style={styles.mainWrapper}>
        {/* Header */}
        <Header />

        {/* Page Content Outlet */}
        <main style={styles.content}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  layout: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
    backgroundColor: 'hsl(var(--background))',
  },
  mainWrapper: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    minWidth: 0,
  },
  content: {
    flex: 1,
    padding: '2rem 1.5rem',
    overflowY: 'auto',
  },
  mobileOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    zIndex: 99,
    display: 'flex',
  },
  mobileDrawer: {
    width: '280px',
    backgroundColor: 'hsl(var(--card))',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: 'var(--shadow-lg)',
    position: 'relative',
    zIndex: 1,
  },
  mobileCloseButton: {
    position: 'absolute',
    top: '1rem',
    right: '1rem',
    color: 'hsl(var(--foreground))',
    zIndex: 1,
    padding: '0.25rem',
    backgroundColor: 'hsl(var(--card))',
    borderRadius: 'var(--radius)',
  },
};

export default Layout;