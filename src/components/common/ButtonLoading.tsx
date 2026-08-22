import React from 'react';
import { RefreshCw } from 'lucide-react';
import { useLoadingStore } from '../../store/useLoadingStore';

interface ButtonLoadingProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  icon?: React.ReactNode;
  loadingText?: string;
  children: React.ReactNode;
}

export const ButtonLoading: React.FC<ButtonLoadingProps> = ({
  loading = false,
  icon,
  loadingText,
  children,
  disabled,
  className = '',
  onClick,
  ...rest
}) => {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (loading) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    onClick?.(e);
  };

  return (
    <button
      {...rest}
      disabled={disabled || loading}
      onClick={handleClick}
      className={`${className} ${loading ? 'btn-loading' : ''}`}
    >
      {loading ? (
        <RefreshCw size={18} style={{ animation: 'spin 0.75s linear infinite' }} />
      ) : icon ? (
        icon
      ) : null}
      <span>{loading ? (loadingText || 'Processando...') : children}</span>
    </button>
  );
};

export function dispatchLoadingStart() {
  useLoadingStore.getState().startLoading();
}

export function dispatchLoadingEnd() {
  useLoadingStore.getState().stopLoading();
}
