import { create } from 'zustand';

export type BodyType = 'none' | 'raw' | 'json' | 'form-data' | 'x-www-form-urlencoded';

export interface KeyValue {
  id: string;
  key: string;
  value: string;
  enabled: boolean;
  type?: 'text' | 'file';
}

export interface RequestBlock {
  id: string;
  name: string;
  method: string;
  url: string;
  headers: KeyValue[];
  params: KeyValue[];
  body: {
    type: BodyType;
    content: string;
  };
  formBody?: KeyValue[];
  preRequestScript?: string;
  testScript?: string;
  rawContent?: string;
}

export type EditorMode = 'form' | 'text';

interface EditorState {
  mode: EditorMode;
  activeBlockIndex: number;
  requestBlocks: RequestBlock[];
  
  // Actions
  setMode: (mode: EditorMode) => void;
  setActiveBlockIndex: (index: number) => void;
  updateBlock: (index: number, block: Partial<RequestBlock>) => void;
  setBlocks: (blocks: RequestBlock[]) => void;
  syncFromText: (text: string) => void;
  getSerializedContent: () => string;
}

import { parseHttpFile } from '../utils/http-parser';
import { serializeHttpFile } from '../utils/http-serializer';

export const useEditorStore = create<EditorState>((set, get) => ({
  mode: 'form',
  activeBlockIndex: 0,
  requestBlocks: [],

  setMode: (mode) => set({ mode }),
  setActiveBlockIndex: (index) => set({ activeBlockIndex: index }),
  setBlocks: (blocks) => set({ requestBlocks: blocks }),
  updateBlock: (index, block) => set((state) => {
    const newBlocks = [...state.requestBlocks];
    newBlocks[index] = { ...newBlocks[index], ...block };
    return { requestBlocks: newBlocks };
  }),
  syncFromText: (text) => {
    const blocks = parseHttpFile(text);
    set({ requestBlocks: blocks });
  },
  getSerializedContent: () => {
    return serializeHttpFile(get().requestBlocks);
  },
}));
