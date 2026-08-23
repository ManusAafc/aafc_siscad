import React, { useEffect, useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { Header } from './Header';
import aafcLogo from '../../assets/aafc_logo.jpg';
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  LogOut, 
  X, 
  User as UserIcon,
  ChevronRight,
  Settings,
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
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('sidebarCollapsed') === 'true';
    }
    return false;
  });

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

  useEffect(() => {
    localStorage.setItem('sidebarCollapsed', isSidebarCollapsed.toString());
  }, [isSidebarCollapsed]);

  const menuItems = [
    { label: 'Dashboard', path: '/', icon: LayoutDashboard },
    { label: 'Socios', path: '/members', icon: Users },
    { label: 'Reuniões', path: '/meetings', icon: Calendar },
  ];

  if (user.isAdminSuper) {
    menuItems.push({ label: 'Ajustes', path: '/settings', icon: Settings });
  }

  const handleLogout = async () => {
    setIsLoggingOut(true);
    dispatchLoadingStart();
    await signOut();
    dispatchLoadingEnd();
    navigate('/login');
  };

  const displayName = (user.nameShort || user.nameFull || user.email?.split('@')[0] || 'Usuário').split(' ')[0];
  const sidebarWidth = isSidebarCollapsed ? '72px' : '260px';

  return (
    <div className="layout-container" style={styles.layout}>
      {/* Sidebar - Desktop */}
      <aside className="desktop-sidebar" style={{ ...styles.sidebar, width: sidebarWidth }}>
        <div style={styles.sidebarHeader}>
          {!isSidebarCollapsed && (
            <img src={aafcLogo} alt="AAFCorsan" style={styles.logoImage} />
          )}
        </div>

        <nav style={styles.navMenu}>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
            return (
              <Link 
                key={item.path} 
                to={item.path}
                style={{
                  ...styles.navLink,
                  ...(isActive ? styles.navLinkActive : {})
                }}
              >
                <Icon size={20} style={isActive ? styles.iconActive : styles.icon} />
                {!isSidebarCollapsed && <span>{item.label}</span>}
                {isActive && !isSidebarCollapsed && <ChevronRight size={16} style={{ marginLeft: 'auto' }} />}
              </Link>
            );
          })}
        </nav>

        <div style={styles.sidebarFooter}>
          {!isSidebarCollapsed && (
            <div style={styles.userProfile}>
              <div style={styles.avatar}>
                <UserIcon size={18} />
              </div>
              <div style={styles.userInfo}>
                <span style={styles.userName}>{displayName}</span>
                <span style={styles.userRole}>{user.isAdminSuper ? 'Super Admin' : user.isAdmin ? 'Admin' : 'Socio'}</span>
              </div>
            </div>
          )}
          <button 
            onClick={handleLogout} 
            style={{ ...styles.logoutBtn, justifyContent: isSidebarCollapsed ? 'center' : 'flex-start' }} 
            title="Sair" 
            disabled={isLoggingOut}
          >
            {isLoggingOut ? <RefreshCw size={20} className="spinner" /> : <LogOut size={20} />}
            {!isSidebarCollapsed && <span>Sair</span>}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="layout-main-wrapper" style={{ ...styles.mainWrapper, marginLeft: sidebarWidth }}>
        {/* Mobile Nav overlay */}
        {isMobileMenuOpen && (
          <div style={styles.mobileOverlay} onClick={() => setIsMobileMenuOpen(false)}>
            <div style={styles.mobileDrawer} onClick={(e) => e.stopPropagation()}>
              <div style={styles.sidebarHeader}>
                <img src={aafcLogo} alt="AAFCorsan" style={styles.logoImage} />
                <button
                  style={styles.mobileCloseButton}
                  onClick={() => setIsMobileMenuOpen(false)}
                  aria-label="Fechar menu"
                >
                  <X size={24} />
                </button>
              </div>
              <nav style={styles.navMenu}>
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
                  return (
                    <Link 
                      key={item.path} 
                      to={item.path}
                      style={{
                        ...styles.navLink,
                        ...(isActive ? styles.navLinkActive : {})
                      }}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Icon size={20} style={isActive ? styles.iconActive : styles.icon} />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
              <div style={{ ...styles.sidebarFooter, marginTop: 'auto' }}>
                <button onClick={handleLogout} style={styles.logoutBtn} disabled={isLoggingOut}>
                  {isLoggingOut ? <RefreshCw size={20} className="spinner" /> : <LogOut size={20} />}
                  <span>Sair</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <Header 
          onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          isSidebarCollapsed={isSidebarCollapsed}
        />

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
    minHeight: '100vh',
    backgroundColor: 'hsl(var(--background))',
  },
  sidebar: {
    backgroundColor: 'hsl(var(--card))',
    borderRight: '1px solid hsl(var(--border))',
    display: 'flex',
    flexDirection: 'column',
    position: 'fixed',
    top: 0,
    bottom: 0,
    left: 0,
    zIndex: 10,
    transition: 'width 0.3s ease',
    overflow: 'hidden',
  },
  sidebarHeader: {
    padding: '1rem',
    borderBottom: '1px solid hsl(var(--border))',
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: '60px',
  },
  logoImage: {
    width: '100%',
    maxWidth: '180px',
    height: 'auto',
    borderRadius: '12px',
    transition: 'opacity 0.2s ease',
  },
  navMenu: {
    padding: '0.75rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.125rem',
  },
  navLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.625rem 0.75rem',
    borderRadius: 'var(--radius)',
    color: 'hsl(var(--muted-foreground))',
    fontSize: '0.9rem',
    fontWeight: 500,
    transition: 'all 0.2s ease',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
  },
  navLinkActive: {
    backgroundColor: 'hsla(var(--primary), 0.1)',
    color: 'hsl(var(--primary))',
  },
  icon: {
    color: 'hsl(var(--muted-foreground))',
    flexShrink: 0,
  },
  iconActive: {
    color: 'hsl(var(--primary))',
    flexShrink: 0,
  },
  sidebarFooter: {
    marginTop: 'auto',
    padding: '0.75rem',
    borderTop: '1px solid hsl(var(--border))',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  userProfile: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.5rem',
    overflow: 'hidden',
  },
  avatar: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    backgroundColor: 'hsla(var(--primary), 0.1)',
    color: 'hsl(var(--primary))',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  userInfo: {
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    minWidth: 0,
  },
  userName: {
    fontSize: '0.875rem',
    fontWeight: 600,
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
    overflow: 'hidden',
  },
  userRole: {
    fontSize: '0.75rem',
    color: 'hsl(var(--muted-foreground))',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
    overflow: 'hidden',
  },
  logoutBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    width: '100%',
    padding: '0.625rem 0.75rem',
    borderRadius: 'var(--radius)',
    color: 'hsl(var(--destructive))',
    fontSize: '0.9rem',
    fontWeight: 500,
    transition: 'all 0.2s ease',
    textAlign: 'left',
    border: 'none',
    background: 'none',
    cursor: 'pointer',
  },
  mainWrapper: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    minWidth: 0,
    transition: 'margin-left 0.3s ease',
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
};