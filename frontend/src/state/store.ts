import { create } from 'zustand';
import { devtools, persist, createJSONStorage, StateStorage } from 'zustand/middleware';
import * as WorkspaceHandler from '../wailsjs/go/handlers/WorkspaceHandler';
import { createWorkspaceSlice, WorkspaceSlice } from './slices/workspaceSlice';
import { createCollectionSlice, CollectionSlice } from './slices/collectionSlice';
import { createHistorySlice, HistorySlice } from './slices/historySlice';
import { createSettingsSlice, SettingsSlice } from './slices/settingsSlice';
import { createExecutionSlice, ExecutionSlice } from './slices/executionSlice';
import { createDocumentSlice, VisualDocumentState } from './slices/documentSlice';

export type RootState = WorkspaceSlice & 
                       CollectionSlice & 
                       HistorySlice & 
                       SettingsSlice &
                       ExecutionSlice &
                       VisualDocumentState;

let saveTimeout: any = null;
let pendingSaves: { [name: string]: string } = {};

const wailsStorage: StateStorage = {
  getItem: async (name: string): Promise<string | null> => {
    try {
      const data = await WorkspaceHandler.GetMetadata(name);
      return data || null;
    } catch {
      return null;
    }
  },
  setItem: async (name: string, value: string): Promise<void> => {
    pendingSaves[name] = value;

    if (saveTimeout) {
      clearTimeout(saveTimeout);
    }

    return new Promise<void>((resolve) => {
      saveTimeout = setTimeout(async () => {
        saveTimeout = null;
        const currentPending = { ...pendingSaves };
        pendingSaves = {};

        try {
          const promises = Object.entries(currentPending).map(([key, val]) => 
            WorkspaceHandler.SaveMetadata(key, val)
          );
          await Promise.all(promises);
        } catch (e) {
          console.error("Failed to save state to Wails", e);
        }
        resolve();
      }, 500);
    });
  },
  removeItem: async (name: string): Promise<void> => {
    try {
      await WorkspaceHandler.SaveMetadata(name, "");
    } catch (e) {
      console.error("Failed to remove state from Wails", e);
    }
  },
};

export const useStore = create<RootState>()(
  devtools(
    persist(
      (...a) => ({
        ...createWorkspaceSlice(...a),
        ...createCollectionSlice(...a),
        ...createHistorySlice(...a),
        ...createSettingsSlice(...a),
        ...createExecutionSlice(...a),
        ...createDocumentSlice(...a),
      }),
      {
        name: 'rester-app-storage',
        storage: createJSONStorage(() => wailsStorage),
        partialize: (state) => ({
          settings: state.settings,
          history: state.history,
          tabs: state.tabs,
          activeTabId: state.activeTabId,
        }),
      }
    )
  )
);

// High-performance selectors
export const useActiveTab = () => useStore((state) => state.tabs.find(t => t.id === state.activeTabId));
export const useEditorSettings = () => useStore((state) => state.settings.editor);
export const useTheme = () => useStore((state) => state.settings.theme);
