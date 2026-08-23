import React, { useEffect } from 'react';
import { CheckCircle, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';
import { useModalStore } from '../../store/useModalStore';

const variantConfig = {
  success: {
    icon: CheckCircle,
    color: '#16a34a',
    bg: 'hsl(142, 76%, 96%)',
    border: 'hsl(142, 76%, 80%)',
  },
  error: {
    icon: AlertCircle,
    color: '#dc2626',
    bg: 'hsl(0, 84%, 96%)',
    border: 'hsl(0, 84%, 80%)',
  },
  warning: {
    icon: AlertTriangle,
    color: '#d97706',
    bg: 'hsl(38, 92%, 96%)',
    border: 'hsl(38, 92%, 80%)',
  },
  info: {
    icon: Info,
    color: '#2563eb',
    bg: 'hsl(221, 83%, 96%)',
    border: 'hsl(221, 83%, 80%)',
  },
};

export const AlertDialog: React.FC = () => {
  const { modal, closeModal } = useModalStore();

  useEffect(() => {
    if (!modal.isOpen || modal.type !== 'alert') return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeModal();
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [modal.isOpen, modal.type, closeModal]);

  if (!modal.isOpen || modal.type !== 'alert') return null;

  const config = variantConfig[modal.variant];
  const Icon = config.icon;

  return (
    <div style={styles.overlay} onClick={closeModal}>
      <div style={styles.dialog} onClick={(e) => e.stopPropagation()}>
        <button style={styles.closeBtn} onClick={closeModal} aria-label="Fechar">
          <X size={18} />
        </button>

        <div style={{ ...styles.iconContainer, backgroundColor: config.bg, borderColor: config.border }}>
          <Icon size={28} color={config.color} />
        </div>

        <h3 style={styles.title}>{modal.title}</h3>
        <p style={styles.message}>{modal.message}</p>

        <button
          style={{ ...styles.confirmBtn, backgroundColor: config.color }}
          onClick={closeModal}
          autoFocus
        >
          {modal.confirmLabel || 'OK'}
        </button>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10000,
    padding: '1rem',
    animation: 'fadeIn 0.2s ease',
  },
  dialog: {
    backgroundColor: 'hsl(var(--card))',
    borderRadius: 'var(--radius)',
    padding: '2rem',
    width: '100%',
    maxWidth: '400px',
    boxShadow: 'var(--shadow-lg)',
    position: 'relative',
    textAlign: 'center',
    animation: 'scaleIn 0.2s ease',
  },
  closeBtn: {
    position: 'absolute',
    top: '0.75rem',
    right: '0.75rem',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '0.25rem',
    color: 'hsl(var(--muted-foreground))',
    borderRadius: 'var(--radius)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'color 0.2s',
  },
  iconContainer: {
    width: '56px',
    height: '56px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 1rem',
    border: '2px solid',
  },
  title: {
    fontSize: '1.125rem',
    fontWeight: 600,
    color: 'hsl(var(--foreground))',
    marginBottom: '0.5rem',
  },
  message: {
    fontSize: '0.9rem',
    color: 'hsl(var(--muted-foreground))',
    lineHeight: 1.6,
    marginBottom: '1.5rem',
  },
  confirmBtn: {
    width: '100%',
    padding: '0.75rem 1.5rem',
    borderRadius: 'var(--radius)',
    border: 'none',
    color: '#fff',
    fontWeight: 600,
    fontSize: '0.9rem',
    cursor: 'pointer',
    transition: 'opacity 0.2s',
  },
};
