import { create } from 'zustand';

interface UIState {
  sidebarOpen: boolean;
  activeTabId: string | null;
  theme: 'dark' | 'light';
  toggleSidebar: () => void;
  setActiveTab: (id: string | null) => void;
  setTheme: (theme: 'dark' | 'light') => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: true,
  activeTabId: null,
  theme: 'dark',
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setActiveTab: (id) => set({ activeTabId: id }),
  setTheme: (theme) => set({ theme }),
}));
