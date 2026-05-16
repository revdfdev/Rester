import { create } from 'zustand';
import { RequestBlock } from '../types';

export interface HistoryEntry {
  id: string;
  timestamp: number;
  request: RequestBlock;
  responseMetadata: {
    status: number;
    statusText: string;
    duration: number;
  };
}

interface HistoryState {
  history: HistoryEntry[];
  searchTerm: string;
  
  // Actions
  addEntry: (entry: HistoryEntry) => void;
  removeEntry: (id: string) => void;
  clearHistory: () => void;
  setSearchTerm: (term: string) => void;
  setHistory: (history: HistoryEntry[]) => void;
}

export const useHistoryStore = create<HistoryState>((set) => ({
  history: [],
  searchTerm: '',

  addEntry: (entry) => set((state) => {
    // Keep only the last 1000 items
    const newHistory = [entry, ...state.history].slice(0, 1000);
    return { history: newHistory };
  }),

  removeEntry: (id) => set((state) => ({
    history: state.history.filter((e) => e.id !== id),
  })),

  clearHistory: () => set({ history: [] }),

  setSearchTerm: (term) => set({ searchTerm: term }),

  setHistory: (history) => set({ history }),
}));
