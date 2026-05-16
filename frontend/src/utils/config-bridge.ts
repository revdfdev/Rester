import { GetSettings, UpdateSettings } from '../wailsjs/go/main/App';
import { useStore } from '../state/store';

/**
 * Initializes the settings store by loading persisted data from the backend.
 */
export const initSettingsPersistence = async () => {
  try {
    const settingsStr = await GetSettings();
    if (settingsStr) {
      const settings = JSON.parse(settingsStr);
      useStore.getState().updateSettings(settings);
    }
  } catch (err) {
    console.error('Failed to load settings:', err);
  }

  // Subscribe to changes and save to backend
  useStore.subscribe(
    (state) => state.settings,
    (settings) => {
      try {
        UpdateSettings(JSON.stringify(settings));
      } catch (err) {
        console.error('Failed to save settings:', err);
      }
    }
  );
};
