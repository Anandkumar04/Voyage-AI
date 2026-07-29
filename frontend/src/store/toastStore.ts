import { create } from 'zustand';

export interface ToastMessage {
  id: string;
  title: string;
  description?: string;
  type?: 'success' | 'info' | 'warning' | 'error';
  duration?: number;
}

interface ToastStore {
  toasts: ToastMessage[];
  addToast: (toast: Omit<ToastMessage, 'id'>) => void;
  removeToast: (id: string) => void;
}

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  addToast: (toast) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast = { ...toast, id };
    
    set((state) => ({
      toasts: [...state.toasts.slice(-4), newToast] // Keep max 5 toasts
    }));

    // Auto dismiss
    const duration = toast.duration || 3500;
    setTimeout(() => {
      set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id)
      }));
    }, duration);
  },
  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id)
    }))
}));

// Convenience hook / helper
export const toast = {
  success: (title: string, description?: string) => {
    useToastStore.getState().addToast({ title, description, type: 'success' });
  },
  info: (title: string, description?: string) => {
    useToastStore.getState().addToast({ title, description, type: 'info' });
  },
  warning: (title: string, description?: string) => {
    useToastStore.getState().addToast({ title, description, type: 'warning' });
  },
  error: (title: string, description?: string) => {
    useToastStore.getState().addToast({ title, description, type: 'error' });
  }
};
