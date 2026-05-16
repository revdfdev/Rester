import { create } from 'zustand';

export type Theme = 'dark' | 'light' | 'system';

export interface Settings {
  theme: Theme;
  requestTimeout: number; // in milliseconds
  editor: {
    fontSize: number;
    lineNumbers: 'on' | 'off';
    minimap: boolean;
    wordWrap: 'on' | 'off';
  };
  telemetry: boolean;
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

interface SettingsState {
  settings: Settings;
  isOpen: boolean;
  
  // Actions
  setOpen: (open: boolean) => void;
  updateSettings: (settings: Partial<Settings>) => void;
  updateEditorSettings: (settings: Partial<Settings['editor']>) => void;
  resetToDefaults: () => void;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  settings: DEFAULT_SETTINGS,
  isOpen: false,

  setOpen: (open) => set({ isOpen: open }),

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
}));
