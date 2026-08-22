import React from 'react';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { useToastStore, ToastType } from '../../store/useToastStore';

const iconMap: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle size={18} />,
  error: <AlertCircle size={18} />,
  warning: <AlertTriangle size={18} />,
  info: <Info size={18} />,
};

const colorMap: Record<ToastType, string> = {
  success: '#388E3C',
  error: '#D32F2F',
  warning: '#F57C00',
  info: '#1976D2',
};

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToastStore();

  if (toasts.length === 0) return null;

  return (
    <div style={styles.container}>
      {toasts.map((toast) => (
        <div key={toast.id} style={{ ...styles.toast, borderLeftColor: colorMap[toast.type] }}>
          <span style={{ color: colorMap[toast.type] }}>{iconMap[toast.type]}</span>
          <span style={styles.message}>{toast.message}</span>
          <button onClick={() => removeToast(toast.id)} style={styles.closeBtn}>
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    position: 'fixed',
    top: '1rem',
    right: '1rem',
    zIndex: 9999,
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    maxWidth: '360px',
  },
  toast: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.75rem 1rem',
    backgroundColor: '#fff',
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    borderLeft: '4px solid',
    animation: 'slideIn 0.3s ease',
  },
  message: {
    flex: 1,
    fontSize: '0.875rem',
    color: '#333',
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '4px',
    color: '#999',
    display: 'flex',
    alignItems: 'center',
  },
};
