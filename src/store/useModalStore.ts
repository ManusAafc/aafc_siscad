import { create } from 'zustand';

export type ModalType = 'alert' | 'confirm';

export interface ModalState {
  isOpen: boolean;
  type: ModalType;
  title: string;
  message: string;
  variant: 'success' | 'error' | 'warning' | 'info';
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
}

interface ModalStore {
  modal: ModalState;
  openAlert: (options: {
    title: string;
    message: string;
    variant?: 'success' | 'error' | 'warning' | 'info';
    confirmLabel?: string;
  }) => void;
  openConfirm: (options: {
    title: string;
    message: string;
    variant?: 'success' | 'error' | 'warning' | 'info';
    confirmLabel?: string;
    cancelLabel?: string;
    onConfirm: () => void;
    onCancel?: () => void;
  }) => void;
  closeModal: () => void;
}

const initialModalState: ModalState = {
  isOpen: false,
  type: 'alert',
  title: '',
  message: '',
  variant: 'info',
};

export const useModalStore = create<ModalStore>((set) => ({
  modal: initialModalState,

  openAlert: (options) =>
    set({
      modal: {
        isOpen: true,
        type: 'alert',
        title: options.title,
        message: options.message,
        variant: options.variant || 'info',
        confirmLabel: options.confirmLabel || 'OK',
      },
    }),

  openConfirm: (options) =>
    set({
      modal: {
        isOpen: true,
        type: 'confirm',
        title: options.title,
        message: options.message,
        variant: options.variant || 'info',
        confirmLabel: options.confirmLabel || 'Confirmar',
        cancelLabel: options.cancelLabel || 'Cancelar',
        onConfirm: options.onConfirm,
        onCancel: options.onCancel,
      },
    }),

  closeModal: () => set({ modal: initialModalState }),
}));
