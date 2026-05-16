import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Tab {
  id: string;
  name: string;
  path: string;
  type: 'http' | 'graphql' | 'grpc';
  method?: string;
  isDirty: boolean;
  lastAccessed: number;
}

export interface WorkspaceState {
  tabs: Tab[];
  activeTabId: string | null;
  collections: any[];
  addTab: (tab: Omit<Tab, 'lastAccessed'>) => void;
  closeTab: (id: string) => void;
  closeAllTabs: () => void;
  closeOtherTabs: (id: string) => void;
  setActiveTab: (id: string | null) => void;
  setCollections: (collections: any[]) => void;
  renameRequest: (id: string, newName: string) => void;
  reorderTabs: (ids: string[]) => void;
}

export const useWorkspaceStore = create<WorkspaceState>()(
  persist(
    (set) => ({
      tabs: [],
      activeTabId: null,
      collections: [],
      renameRequest: (id, newName) =>
        set((state) => {
          const newTabs = state.tabs.map((t) =>
            t.id === id ? { ...t, name: newName } : t
          );
          return { tabs: newTabs };
        }),
      addTab: (tabData) =>
        set((state) => {
          const exists = state.tabs.find((t) => t.id === tabData.id);
          const now = Date.now();
          if (exists) {
            return { 
              activeTabId: tabData.id,
              tabs: state.tabs.map(t => t.id === tabData.id ? { ...t, lastAccessed: now } : t)
            };
          }
          const newTab: Tab = { ...tabData, lastAccessed: now };
          return {
            tabs: [...state.tabs, newTab],
            activeTabId: tabData.id,
          };
        }),
      closeTab: (id) =>
        set((state) => {
          const newTabs = state.tabs.filter((t) => t.id !== id);
          let newActiveTabId = state.activeTabId;
          if (state.activeTabId === id) {
            newActiveTabId = newTabs.length > 0 ? newTabs[newTabs.length - 1].id : null;
          }
          return { tabs: newTabs, activeTabId: newActiveTabId };
        }),
      closeAllTabs: () => set({ tabs: [], activeTabId: null }),
      closeOtherTabs: (id) =>
        set((state) => {
          const tab = state.tabs.find(t => t.id === id);
          return {
            tabs: tab ? [tab] : [],
            activeTabId: tab ? tab.id : null
          };
        }),
      setActiveTab: (id) =>
        set((state) => ({
          activeTabId: id,
          tabs: state.tabs.map(t => t.id === id ? { ...t, lastAccessed: Date.now() } : t)
        })),
      setCollections: (collections) => set({ collections }),
      reorderTabs: (ids) =>
        set((state) => {
          const tabMap = new Map(state.tabs.map(t => [t.id, t]));
          const newTabs = ids.map(id => tabMap.get(id)).filter((t): t is Tab => !!t);
          return { tabs: newTabs };
        }),
    }),
    {
      name: 'workspace-storage',
    }
  )
);
