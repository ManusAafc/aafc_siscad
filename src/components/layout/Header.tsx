import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { LogOut, ChevronLeft, PanelLeftClose, PanelLeft } from 'lucide-react';
import { dispatchLoadingStart, dispatchLoadingEnd } from '../common/ButtonLoading';

interface HeaderProps {
  onBack?: () => void;
  showBack?: boolean;
  onToggleSidebar?: () => void;
  isSidebarCollapsed?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onBack,
  showBack = false,
  onToggleSidebar,
  isSidebarCollapsed,
}) => {
  const location = useLocation();
  const { user, signOut } = useAuthStore();

  const handleLogout = async () => {
    dispatchLoadingStart();
    await signOut();
    dispatchLoadingEnd();
  };

  return (
    <header style={styles.header}>
      <div style={styles.leftSection}>
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            style={styles.menuButton}
            aria-label={isSidebarCollapsed ? 'Expandir menu' : 'Colapsar menu'}
            title={isSidebarCollapsed ? 'Expandir menu' : 'Colapsar menu'}
          >
            {isSidebarCollapsed ? <PanelLeft size={20} /> : <PanelLeftClose size={20} />}
          </button>
        )}
        {showBack && onBack && (
          <button onClick={onBack} style={styles.backButton} aria-label="Voltar">
            <ChevronLeft size={20} />
          </button>
        )}
      </div>

      <div style={styles.rightSection}>
        <div style={styles.userMenu}>
          <span style={styles.userName}>
            {user.nameShort || user.nameFull?.split(' ')[0] || user.email?.split('@')[0] || 'Usuário'}
          </span>
          <button onClick={handleLogout} style={styles.logoutButton} aria-label="Sair">
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </header>
  );
};

const styles: Record<string, React.CSSProperties> = {
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0.75rem 1.5rem',
    backgroundColor: 'hsl(var(--card))',
    borderBottom: '1px solid hsl(var(--border))',
    position: 'sticky',
    top: 0,
    zIndex: 100,
  },
  leftSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  menuButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '36px',
    height: '36px',
    borderRadius: '8px',
    backgroundColor: 'hsl(var(--secondary))',
    color: 'hsl(var(--secondary-foreground))',
    border: 'none',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  backButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '36px',
    height: '36px',
    borderRadius: '8px',
    backgroundColor: 'hsl(var(--secondary))',
    color: 'hsl(var(--secondary-foreground))',
    border: 'none',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  rightSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  userMenu: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  userName: {
    fontSize: '0.875rem',
    fontWeight: 500,
    color: 'hsl(var(--foreground))',
    maxWidth: '150px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  logoutButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '36px',
    height: '36px',
    borderRadius: '8px',
    backgroundColor: 'hsl(var(--secondary))',
    color: 'hsl(var(--secondary-foreground))',
    border: 'none',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
};
