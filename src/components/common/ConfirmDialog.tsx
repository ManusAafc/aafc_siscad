import React, { useEffect } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { useModalStore } from '../../store/useModalStore';

export const ConfirmDialog: React.FC = () => {
  const { modal, closeModal } = useModalStore();

  useEffect(() => {
    if (!modal.isOpen || modal.type !== 'confirm') return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        modal.onCancel?.();
        closeModal();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [modal.isOpen, modal.type, modal.onCancel, closeModal]);

  if (!modal.isOpen || modal.type !== 'confirm') return null;

  const handleConfirm = () => {
    modal.onConfirm?.();
    closeModal();
  };

  const handleCancel = () => {
    modal.onCancel?.();
    closeModal();
  };

  return (
    <div style={styles.overlay} onClick={handleCancel}>
      <div style={styles.dialog} onClick={(e) => e.stopPropagation()}>
        <button style={styles.closeBtn} onClick={handleCancel} aria-label="Fechar">
          <X size={18} />
        </button>

        <div style={styles.iconContainer}>
          <AlertTriangle size={28} color="#d97706" />
        </div>

        <h3 style={styles.title}>{modal.title}</h3>
        <p style={styles.message}>{modal.message}</p>

        <div style={styles.buttonRow}>
          <button
            style={styles.cancelBtn}
            onClick={handleCancel}
          >
            {modal.cancelLabel || 'Cancelar'}
          </button>
          <button
            style={styles.confirmBtn}
            onClick={handleConfirm}
            autoFocus
          >
            {modal.confirmLabel || 'Confirmar'}
          </button>
        </div>
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
    backgroundColor: 'hsl(38, 92%, 96%)',
    border: '2px solid hsl(38, 92%, 80%)',
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
  buttonRow: {
    display: 'flex',
    gap: '0.75rem',
  },
  cancelBtn: {
    flex: 1,
    padding: '0.75rem 1rem',
    borderRadius: 'var(--radius)',
    border: 'none',
    backgroundColor: 'hsl(var(--destructive))',
    color: 'hsl(var(--destructive-foreground))',
    fontWeight: 500,
    fontSize: '0.9rem',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  confirmBtn: {
    flex: 1,
    padding: '0.75rem 1rem',
    borderRadius: 'var(--radius)',
    border: 'none',
    backgroundColor: 'hsl(var(--primary))',
    color: 'hsl(var(--primary-foreground))',
    fontWeight: 600,
    fontSize: '0.9rem',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
};
