import { StateCreator } from 'zustand';
import { ExecutionResult } from '../../types';
import { executeRequest, cancelRequest } from '../../services/executionService';
import { RootState } from '../store';

export interface ExecutionSlice {
  executionResults: Record<string, ExecutionResult>;
  executionLoading: Record<string, boolean>;
  executionErrors: Record<string, string>;
  executionCancelled: Record<string, boolean>;
  setExecutionResult: (id: string, result: ExecutionResult) => void;
  setExecutionLoading: (id: string, isLoading: boolean) => void;
  clearExecutionResult: (id: string) => void;
  executeRequest: (blockId: string) => Promise<void>;
  cancelRequest: (blockId: string) => void;
}

export const createExecutionSlice: StateCreator<RootState, [], [], ExecutionSlice> = (set, get) => ({
  executionResults: {},
  executionLoading: {},
  executionErrors: {},
  executionCancelled: {},

  setExecutionResult: (id, result) =>
    set((state) => ({
      executionResults: { ...state.executionResults, [id]: result },
      executionLoading: { ...state.executionLoading, [id]: false },
      executionErrors: { ...state.executionErrors, [id]: '' },
      executionCancelled: { ...state.executionCancelled, [id]: false },
    })),

  setExecutionLoading: (id, isLoading) =>
    set((state) => ({
      executionLoading: { ...state.executionLoading, [id]: isLoading },
    })),

  clearExecutionResult: (id) =>
    set((state) => {
      const newResults = { ...state.executionResults };
      delete newResults[id];
      const newLoading = { ...state.executionLoading };
      delete newLoading[id];
      const newErrors = { ...state.executionErrors };
      delete newErrors[id];
      const newCancelled = { ...state.executionCancelled };
      delete newCancelled[id];
      return { 
        executionResults: newResults, 
        executionLoading: newLoading,
        executionErrors: newErrors,
        executionCancelled: newCancelled
      };
    }),

  executeRequest: async (blockId: string) => {
    // 1. Set loading state
    set((state) => ({
      executionLoading: { ...state.executionLoading, [blockId]: true },
      executionErrors: { ...state.executionErrors, [blockId]: '' },
      executionCancelled: { ...state.executionCancelled, [blockId]: false },
    }));

    // 2. Get data from store
    const rootState = get();
    const block = rootState.requestBlocks.find(b => b.id === blockId);
    if (!block) {
      set((state) => ({
        executionLoading: { ...state.executionLoading, [blockId]: false },
        executionErrors: { ...state.executionErrors, [blockId]: 'Request block not found' },
      }));
      return;
    }

    const activeEnvNode = rootState.environments.find(e => e.id === rootState.activeEnvId) || null;
    const timeoutMs = rootState.settings?.requestTimeout || 30000;

    // 3. Execute
    try {
      const result = await executeRequest(block, activeEnvNode, timeoutMs);

      // Check if cancelled while flying
      if (get().executionCancelled[blockId]) {
        return; // Ignore result
      }

      // 4. Update success state
      set((state) => ({
        executionResults: { ...state.executionResults, [blockId]: result },
        executionLoading: { ...state.executionLoading, [blockId]: false },
      }));

      // 5. Refresh history from backend
      get().loadHistory();
    } catch (error: any) {
      if (get().executionCancelled[blockId] || error.isCancelled) {
        set((state) => ({
          executionLoading: { ...state.executionLoading, [blockId]: false },
        }));
        return;
      }

      set((state) => ({
        executionLoading: { ...state.executionLoading, [blockId]: false },
        executionErrors: { ...state.executionErrors, [blockId]: error.message || 'Execution failed' },
      }));
    }
  },

  cancelRequest: (blockId: string) => {
    set((state) => ({
      executionCancelled: { ...state.executionCancelled, [blockId]: true },
      executionLoading: { ...state.executionLoading, [blockId]: false },
    }));
    cancelRequest(blockId).catch(() => {});
  },
});
