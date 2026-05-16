import { StateCreator } from 'zustand';
import { Settings } from '../../types';

export interface SettingsSlice {
  settings: Settings;
  isSettingsOpen: boolean;
  
  // Actions
  setSettingsOpen: (open: boolean) => void;
  updateSettings: (settings: Partial<Settings>) => void;
  updateEditorSettings: (settings: Partial<Settings['editor']>) => void;
  resetToDefaults: () => void;
}

const DEFAULT_SETTINGS: Settings = {
  theme: 'dark',
  requestTimeout: 30000,
  editor: {
    fontSize: 14,
    lineNumbers: 'on',
    minimap: false,
    wordWrap: 'on',
  },
  telemetry: true,
};

export const createSettingsSlice: StateCreator<SettingsSlice> = (set) => ({
  settings: DEFAULT_SETTINGS,
  isSettingsOpen: false,

  setSettingsOpen: (isSettingsOpen) => set({ isSettingsOpen }),

  updateSettings: (newSettings) => set((state) => ({
    settings: { ...state.settings, ...newSettings }
  })),

  updateEditorSettings: (newEditorSettings) => set((state) => ({
    settings: {
      ...state.settings,
      editor: { ...state.settings.editor, ...newEditorSettings }
    }
  })),

  resetToDefaults: () => set({ settings: DEFAULT_SETTINGS }),
});
