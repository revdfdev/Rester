import { StateCreator } from 'zustand';
import { RequestBlock, EditorMode } from '../../types';
import { parseHttpFile } from '../../utils/http-parser';
import { serializeHttpFile } from '../../utils/http-serializer';
import { useStore } from '../store';

export interface EditorSlice {
  editorMode: EditorMode;
  activeBlockIndex: number;
  requestBlocks: RequestBlock[];
  
  // Actions
  setEditorMode: (mode: EditorMode) => void;
  setActiveBlockIndex: (index: number) => void;
  updateBlock: (index: number, block: Partial<RequestBlock>) => void;
  setBlocks: (blocks: RequestBlock[]) => void;
  syncFromText: (text: string) => void;
  getSerializedContent: () => string;
}

export const createEditorSlice: StateCreator<EditorSlice> = (set, get) => ({
  editorMode: 'form',
  activeBlockIndex: 0,
  requestBlocks: [],

  setEditorMode: (editorMode) => set({ editorMode }),
  setActiveBlockIndex: (index) => set({ activeBlockIndex: index }),
  setBlocks: (requestBlocks) => set({ requestBlocks }),
  updateBlock: (index, block) => set((state) => {
    const newBlocks = [...state.requestBlocks];
    newBlocks[index] = { ...newBlocks[index], ...block };
    
    // Mark active tab dirty
    const fullState = state as any;
    if (fullState.activeTabId && fullState.markTabDirty) {
      // Use setTimeout to avoid zustand loop if calling set within set
      setTimeout(() => {
        useStore.getState().markTabDirty(fullState.activeTabId, true);
      }, 0);
    }
    
    return { requestBlocks: newBlocks };
  }),
  syncFromText: (text) => {
    const blocks = parseHttpFile(text);
    set({ requestBlocks: blocks });
    
    const fullState = get() as any;
    if (fullState.activeTabId && fullState.markTabDirty) {
      setTimeout(() => {
        useStore.getState().markTabDirty(fullState.activeTabId, true);
      }, 0);
    }
  },
  getSerializedContent: () => {
    return serializeHttpFile(get().requestBlocks);
  },
});
