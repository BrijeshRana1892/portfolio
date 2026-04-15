import { create } from 'zustand';

interface UIStore {
  theme: 'dark' | 'light';
  preloaderDone: boolean;
  activeSection: string;
  cursorType: 'default' | 'hover' | 'click' | 'view';
  setTheme: (t: 'dark' | 'light') => void;
  setPreloaderDone: () => void;
  setActiveSection: (s: string) => void;
  setCursorType: (t: UIStore['cursorType']) => void;
  toggleTheme: () => void;
}

export const useUIStore = create<UIStore>((set, get) => ({
  theme: 'dark',
  preloaderDone: false,
  activeSection: 'hero',
  cursorType: 'default',

  setTheme: (theme) => {
    set({ theme });
    if (typeof window !== 'undefined') {
      document.documentElement.classList.toggle('light', theme === 'light');
      localStorage.setItem('theme', theme);
    }
  },

  setPreloaderDone: () => set({ preloaderDone: true }),

  setActiveSection: (activeSection) => set({ activeSection }),

  setCursorType: (cursorType) => set({ cursorType }),

  toggleTheme: () => {
    const next = get().theme === 'dark' ? 'light' : 'dark';
    get().setTheme(next);
  },
}));
