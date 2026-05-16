import { StateCreator } from 'zustand';
import { HistoryEntry } from '../../types';

export interface HistorySlice {
  history: HistoryEntry[];
  historySearchTerm: string;
  
  // Actions
  addHistoryEntry: (entry: HistoryEntry) => void;
  removeHistoryEntry: (id: string) => void;
  clearHistory: () => void;
  setHistorySearchTerm: (term: string) => void;
  setHistory: (history: HistoryEntry[]) => void;
  loadHistory: (limit?: number) => Promise<void>;
}

export const createHistorySlice: StateCreator<HistorySlice> = (set) => ({
  history: [],
  historySearchTerm: '',

  addHistoryEntry: (entry) => set((state) => {
    // Keep only the last 1000 items
    const newHistory = [entry, ...state.history].slice(0, 1000);
    return { history: newHistory };
  }),

  removeHistoryEntry: (id) => set((state) => ({
    history: state.history.filter((e) => e.id !== id),
  })),

  clearHistory: () => set({ history: [] }),

  setHistorySearchTerm: (term) => set({ historySearchTerm: term }),

  setHistory: (history) => set({ history }),
  
  loadHistory: async (limit = 1000) => {
    try {
      const { GetHistory } = await import('../../wailsjs/go/main/App');
      const history = await GetHistory(limit);
      if (history) {
        set({ history: history as any });
      }
    } catch (e) {
      console.error("Failed to load history", e);
    }
  },
});
