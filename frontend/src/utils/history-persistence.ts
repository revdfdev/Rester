import { GetHistory, ClearHistory } from '../wailsjs/go/main/App';
import { useStore } from '../state/store';

/**
 * Initializes the history store by loading persisted data from the backend.
 */
export const initHistoryPersistence = async () => {
  try {
    const history = await GetHistory(1000);
    if (history) {
      useStore.getState().setHistory(history as any);
    }
  } catch (err) {
    console.error('Failed to load history:', err);
  }
};

/**
 * Clears the persisted history from the backend.
 */
export const clearPersistedHistory = async () => {
  try {
    await ClearHistory();
    useStore.getState().clearHistory();
  } catch (err) {
    console.error('Failed to clear history:', err);
  }
};
