import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { LogOut, Settings, ChevronDown, User as UserIcon, User as UserIcon2 } from 'lucide-react';
import { dispatchLoadingStart, dispatchLoadingEnd } from '../common/ButtonLoading';
import aafcLogo from '../../assets/aafc_logo.jpg';

interface HeaderProps {
}

export const Header: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuthStore();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  const handleLogoClick = () => {
    navigate('/');
  };

  const handleLogout = async () => {
    dispatchLoadingStart();
    await signOut();
    dispatchLoadingEnd();
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header style={styles.header}>
      <div style={styles.leftSection}>
        <button
          onClick={handleLogoClick}
          style={styles.logoButton}
          aria-label="Página inicial"
        >
          <img src={aafcLogo} alt="AAFCorsan" style={styles.logoImage} />
        </button>
      </div>

      <div style={styles.rightSection}>
        <div ref={profileRef} style={styles.userMenu}>
          <button 
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            style={styles.userButton}
            aria-label="Menu do usuário"
            aria-expanded={isProfileOpen}
          >
            <span style={styles.userName}>
              {user.nameShort || user.nameFull?.split(' ')[0] || user.email?.split('@')[0] || 'Usuário'}
            </span>
            <ChevronDown size={16} style={isProfileOpen ? styles.chevronUp : styles.chevronDown} />
          </button>
          
          {isProfileOpen && (
            <div style={styles.dropdown}>
              <div style={styles.dropdownHeader}>
                <div style={styles.avatar}>
                  <UserIcon size={20} />
                </div>
                <div>
                  <div style={styles.dropdownName}>
                    {user.nameShort || user.nameFull || user.email?.split('@')[0] || 'Usuário'}
                  </div>
                  <div style={styles.dropdownEmail}>{user.email}</div>
                </div>
              </div>
              <div style={styles.dropdownDivider} />
              {user.isAdminSuper && (
                <Link to="/settings" style={styles.dropdownItem} onClick={() => setIsProfileOpen(false)}>
                  <Settings size={16} style={styles.dropdownIcon} />
                  <span>Ajustes</span>
                </Link>
              )}
              <Link to="/profile" style={styles.dropdownItem} onClick={() => setIsProfileOpen(false)}>
                <UserIcon2 size={16} style={styles.dropdownIcon} />
                <span>Meu Perfil</span>
              </Link>
              <button onClick={handleLogout} style={styles.dropdownItem} aria-label="Sair">
                <LogOut size={16} style={styles.dropdownIcon} />
                <span>Sair</span>
              </button>
            </div>
          )}
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
  logoButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '42px',
    height: '42px',
    borderRadius: '10px',
    backgroundColor: 'transparent',
    color: 'hsl(var(--secondary-foreground))',
    border: 'none',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
    padding: 0,
    overflow: 'hidden',
  },
  logoImage: {
    width: '100%',
    height: '100%',
    objectFit: 'contain',
    borderRadius: '10px',
  },
  rightSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  userMenu: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  userButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.5rem 0.75rem',
    borderRadius: '8px',
    backgroundColor: 'hsl(var(--secondary))',
    color: 'hsl(var(--secondary-foreground))',
    border: 'none',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  userName: {
    fontSize: '0.875rem',
    fontWeight: 500,
    maxWidth: '150px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  chevronDown: {
    transition: 'transform 0.2s',
  },
  chevronUp: {
    transition: 'transform 0.2s',
    transform: 'rotate(180deg)',
  },
  dropdown: {
    position: 'absolute',
    top: '100%',
    right: 0,
    marginTop: '0.5rem',
    minWidth: '200px',
    backgroundColor: 'hsl(var(--card))',
    border: '1px solid hsl(var(--border))',
    borderRadius: 'var(--radius)',
    boxShadow: 'var(--shadow-lg)',
    zIndex: 200,
    overflow: 'hidden',
  },
  dropdownHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '1rem',
  },
  avatar: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    backgroundColor: 'hsla(var(--primary), 0.1)',
    color: 'hsl(var(--primary))',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  dropdownName: {
    fontSize: '0.875rem',
    fontWeight: 600,
    color: 'hsl(var(--foreground))',
  },
  dropdownEmail: {
    fontSize: '0.75rem',
    color: 'hsl(var(--muted-foreground))',
  },
  dropdownDivider: {
    height: '1px',
    backgroundColor: 'hsl(var(--border))',
    margin: '0.25rem 0',
  },
  dropdownItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    width: '100%',
    padding: '0.75rem 1rem',
    border: 'none',
    background: 'none',
    color: 'hsl(var(--foreground))',
    fontSize: '0.875rem',
    cursor: 'pointer',
    textAlign: 'left',
    textDecoration: 'none',
    transition: 'background-color 0.15s',
  },
  dropdownIcon: {
    color: 'hsl(var(--muted-foreground))',
    flexShrink: 0,
  },
};

export default Header;