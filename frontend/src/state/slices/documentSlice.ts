import { StateCreator } from 'zustand';
import { RequestBlock, EditorMode, KeyValue } from '../../types';
import { parseHttpFile } from '../../utils/http-parser';
import { serializeHttpFile } from '../../utils/http-serializer';
import { useStore } from '../store';
import { syncFromDocument, syncToDocument } from '../../services/documentService';

export interface TabDocumentState {
  requestBlocks: RequestBlock[];
  activeBlockIndex: number;
  undoStack: RequestBlock[][];
  redoStack: RequestBlock[][];
  editorMode: EditorMode;
  initialSerialized: string;
}

export interface VisualDocumentState {
  // Shortcut states for the active tab (for ease of UI consumption)
  activeDocument: RequestBlock | null;
  requestBlocks: RequestBlock[];
  activeBlockIndex: number;
  editorMode: EditorMode;
  isSaving: boolean;
  
  // Registry of all open tab document states
  documents: Record<string, TabDocumentState>;
  
  // Actions
  initializeTabDocument: (tabId: string, content: string) => void;
  setActiveDocument: (doc: RequestBlock | null) => void;
  updateDocument: (doc: Partial<RequestBlock>) => void;
  setEditorMode: (mode: EditorMode) => void;
  setActiveBlockIndex: (index: number) => void;
  syncFromText: (text: string) => void;
  getSerializedContent: () => string;
  
  // High-level setters for specific parts of the request
  setMethod: (method: string) => void;
  setUrl: (url: string) => void;
  setHeaders: (headers: RequestBlock['headers']) => void;
  setParams: (params: RequestBlock['params']) => void;
  setBody: (body: RequestBlock['body']) => void;
  setFormBody: (formBody: RequestBlock['formBody']) => void;
  setAuth: (auth: any) => void;
  
  // Undo/Redo operations
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
  
  // Append a request block
  appendRequestBlock: (block: RequestBlock) => void;
}

export const createDocumentSlice: StateCreator<VisualDocumentState> = (set, get) => ({
  activeDocument: null,
  requestBlocks: [],
  activeBlockIndex: 0,
  editorMode: 'form',
  isSaving: false,
  documents: {},

  initializeTabDocument: (tabId, content) => {
    // 1. Instant fallback parse for high-performance visual-first launch
    const parsedBlocks = parseHttpFile(content);
    const newDocState: TabDocumentState = {
      requestBlocks: parsedBlocks,
      activeBlockIndex: 0,
      undoStack: [],
      redoStack: [],
      editorMode: 'form',
      initialSerialized: content
    };

    set((state) => {
      if (state.documents[tabId]) return state;
      const isCurrentActive = (state as any).activeTabId === tabId;
      const nextShortcutState = isCurrentActive ? {
        requestBlocks: parsedBlocks,
        activeBlockIndex: 0,
        activeDocument: parsedBlocks[0] || null,
        editorMode: 'form'
      } : {};

      return {
        documents: {
          ...state.documents,
          [tabId]: newDocState
        },
        ...nextShortcutState
      };
    });

    // 2. Background async Go AST-backed parse for maximum fidelity
    syncFromDocument(content).then((astBlocks) => {
      set((state) => {
        const currentDoc = state.documents[tabId];
        if (!currentDoc) return {};

        // Only refine if the user hasn't edited yet
        const currentBlocksStr = JSON.stringify(currentDoc.requestBlocks.map(b => ({ ...b, id: '' })));
        const fallbackBlocksStr = JSON.stringify(parsedBlocks.map(b => ({ ...b, id: '' })));
        if (currentBlocksStr === fallbackBlocksStr) {
          const updatedDoc = { ...currentDoc, requestBlocks: astBlocks };
          const isCurrentActive = (state as any).activeTabId === tabId;
          const nextShortcutState = isCurrentActive ? {
            requestBlocks: astBlocks,
            activeDocument: astBlocks[currentDoc.activeBlockIndex] || astBlocks[0] || null
          } : {};

          return {
            documents: {
              ...state.documents,
              [tabId]: updatedDoc
            },
            ...nextShortcutState
          };
        }
        return {};
      });
    }).catch((e) => {
      console.error('Failed to parse AST in background on initialize:', e);
    });
  },

  setActiveDocument: (doc) => set((state) => {
    const fullState = state as any;
    const tabId = fullState.activeTabId;
    if (!tabId) return state;

    const docState = state.documents[tabId];
    if (!docState) return state;

    const updatedBlocks = [...docState.requestBlocks];
    if (doc) {
      updatedBlocks[docState.activeBlockIndex] = doc;
    }

    return {
      activeDocument: doc,
      requestBlocks: updatedBlocks,
      documents: {
        ...state.documents,
        [tabId]: {
          ...docState,
          requestBlocks: updatedBlocks
        }
      }
    };
  }),
  
  updateDocument: (doc) => set((state) => {
    const fullState = state as any;
    const tabId = fullState.activeTabId;
    if (!tabId) return state;

    const docState = state.documents[tabId];
    if (!docState) return state;

    const currentBlocks = docState.requestBlocks;
    const currentIndex = docState.activeBlockIndex;
    const currentBlock = currentBlocks[currentIndex];
    if (!currentBlock) return state;

    // Deep clone blocks for undo history
    const prevBlocks = JSON.parse(JSON.stringify(currentBlocks));

    let updatedBlock = { ...currentBlock, ...doc };
    
    // Sync URL -> Params if URL changed
    if (doc.url !== undefined && doc.url !== currentBlock.url) {
      try {
        const url = new URL(doc.url.startsWith('http') ? doc.url : `http://localhost${doc.url.startsWith('/') ? '' : '/'}${doc.url}`);
        const params = Array.from(url.searchParams.entries()).map(([key, value]) => ({
          id: crypto.randomUUID(),
          key,
          value,
          enabled: true
        }));
        if (params.length > 0 || currentBlock.params.length > 0) {
          updatedBlock.params = params;
        }
      } catch (e) {
        // Ignore invalid URL parsing during typing
      }
    }
    
    // Sync Params -> URL if Params changed
    if (doc.params !== undefined && JSON.stringify(doc.params) !== JSON.stringify(currentBlock.params)) {
      try {
        const urlStr = updatedBlock.url;
        const base = urlStr.split('?')[0];
        const searchParams = new URLSearchParams();
        updatedBlock.params.filter(p => p.enabled && p.key).forEach(p => {
          searchParams.append(p.key, p.value);
        });
        const qs = searchParams.toString();
        updatedBlock.url = base + (qs ? `?${qs}` : '');
      } catch (e) {
        // Ignore
      }
    }

    const updatedBlocks = [...currentBlocks];
    updatedBlocks[currentIndex] = updatedBlock;
    
    const newUndoStack = [...docState.undoStack, prevBlocks].slice(-50);
    const updatedDocState: TabDocumentState = {
      ...docState,
      requestBlocks: updatedBlocks,
      undoStack: newUndoStack,
      redoStack: [] // Clear redo on any new action
    };

    // Seamless background serialization via Wails / Go Serializer
    syncToDocument(updatedBlocks).then((serialized) => {
      const isDirty = serialized !== docState.initialSerialized;
      const storeState = useStore.getState();
      storeState.updateTabContent(tabId, serialized);
      storeState.markTabDirty(tabId, isDirty);
    }).catch((e) => {
      console.error('Failed background AST serialization, falling back to local:', e);
      const serialized = serializeHttpFile(updatedBlocks);
      const isDirty = serialized !== docState.initialSerialized;
      const storeState = useStore.getState();
      storeState.updateTabContent(tabId, serialized);
      storeState.markTabDirty(tabId, isDirty);
    });
    
    return {
      documents: {
        ...state.documents,
        [tabId]: updatedDocState
      },
      requestBlocks: updatedBlocks,
      activeDocument: updatedBlock
    };
  }),

  setEditorMode: (editorMode) => set((state) => {
    const fullState = state as any;
    const tabId = fullState.activeTabId;
    if (!tabId) return { editorMode };

    const docState = state.documents[tabId];
    if (!docState) return { editorMode };

    return {
      editorMode,
      documents: {
        ...state.documents,
        [tabId]: {
          ...docState,
          editorMode
        }
      }
    };
  }),

  setActiveBlockIndex: (activeBlockIndex) => set((state) => {
    const fullState = state as any;
    const tabId = fullState.activeTabId;
    if (!tabId) return { activeBlockIndex };

    const docState = state.documents[tabId];
    if (!docState) return { activeBlockIndex };

    const activeDocument = docState.requestBlocks[activeBlockIndex] || null;

    return {
      activeBlockIndex,
      activeDocument,
      documents: {
        ...state.documents,
        [tabId]: {
          ...docState,
          activeBlockIndex
        }
      }
    };
  }),

  syncFromText: (text) => {
    const tabId = (get() as any).activeTabId;
    if (!tabId) return;

    const docState = get().documents[tabId];
    if (!docState) return;

    // Use backend Go AST parser via Wails
    syncFromDocument(text).then((parsedBlocks) => {
      const isDirty = text !== docState.initialSerialized;
      const activeDocument = parsedBlocks[docState.activeBlockIndex] || parsedBlocks[0] || null;

      set((state) => {
        const updatedDocState: TabDocumentState = {
          ...state.documents[tabId],
          requestBlocks: parsedBlocks
        };

        return {
          documents: {
            ...state.documents,
            [tabId]: updatedDocState
          },
          requestBlocks: parsedBlocks,
          activeDocument
        };
      });

      const storeState = useStore.getState();
      storeState.updateTabContent(tabId, text);
      storeState.markTabDirty(tabId, isDirty);
    }).catch((e) => {
      console.error('Failed to sync from text using backend Go AST, using fallback:', e);
      const parsedBlocks = parseHttpFile(text);
      const isDirty = text !== docState.initialSerialized;
      const activeDocument = parsedBlocks[docState.activeBlockIndex] || parsedBlocks[0] || null;

      set((state) => {
        const updatedDocState: TabDocumentState = {
          ...state.documents[tabId],
          requestBlocks: parsedBlocks
        };

        return {
          documents: {
            ...state.documents,
            [tabId]: updatedDocState
          },
          requestBlocks: parsedBlocks,
          activeDocument
        };
      });

      const storeState = useStore.getState();
      storeState.updateTabContent(tabId, text);
      storeState.markTabDirty(tabId, isDirty);
    });
  },

  getSerializedContent: () => {
    return serializeHttpFile(get().requestBlocks);
  },

  setMethod: (method) => get().updateDocument({ method }),
  setUrl: (url) => get().updateDocument({ url }),
  setHeaders: (headers) => get().updateDocument({ headers }),
  setParams: (params) => get().updateDocument({ params }),
  setBody: (body) => get().updateDocument({ body }),
  setFormBody: (formBody) => get().updateDocument({ formBody }),
  
  setAuth: (auth: { type: 'bearer' | 'basic' | 'none', token?: string, username?: string, password?: string }) => {
    const currentHeaders = [...(get().activeDocument?.headers || [])];
    const otherHeaders = currentHeaders.filter(h => h.key.toLowerCase() !== 'authorization');
    
    let authHeader = null;
    if (auth.type === 'bearer' && auth.token) {
      authHeader = { id: crypto.randomUUID(), key: 'Authorization', value: `Bearer ${auth.token}`, enabled: true };
    } else if (auth.type === 'basic' && auth.username) {
      const credentials = btoa(`${auth.username}:${auth.password || ''}`);
      authHeader = { id: crypto.randomUUID(), key: 'Authorization', value: `Basic ${credentials}`, enabled: true };
    }
    
    const newHeaders = authHeader ? [...otherHeaders, authHeader] : otherHeaders;
    get().updateDocument({ headers: newHeaders });
  },

  undo: () => set((state) => {
    const fullState = state as any;
    const tabId = fullState.activeTabId;
    if (!tabId) return state;

    const docState = state.documents[tabId];
    if (!docState || docState.undoStack.length === 0) return state;

    const previousBlocks = docState.undoStack[docState.undoStack.length - 1];
    const newUndoStack = docState.undoStack.slice(0, -1);
    const newRedoStack = [...docState.redoStack, docState.requestBlocks];

    const updatedDocState: TabDocumentState = {
      ...docState,
      requestBlocks: previousBlocks,
      undoStack: newUndoStack,
      redoStack: newRedoStack
    };

    const serialized = serializeHttpFile(previousBlocks);
    const isDirty = serialized !== docState.initialSerialized;

    setTimeout(() => {
      const storeState = useStore.getState();
      storeState.updateTabContent(tabId, serialized);
      storeState.markTabDirty(tabId, isDirty);
    }, 0);

    return {
      documents: {
        ...state.documents,
        [tabId]: updatedDocState
      },
      requestBlocks: previousBlocks,
      activeDocument: previousBlocks[docState.activeBlockIndex] || null
    };
  }),

  redo: () => set((state) => {
    const fullState = state as any;
    const tabId = fullState.activeTabId;
    if (!tabId) return state;

    const docState = state.documents[tabId];
    if (!docState || docState.redoStack.length === 0) return state;

    const nextBlocks = docState.redoStack[docState.redoStack.length - 1];
    const newRedoStack = docState.redoStack.slice(0, -1);
    const newUndoStack = [...docState.undoStack, docState.requestBlocks];

    const updatedDocState: TabDocumentState = {
      ...docState,
      requestBlocks: nextBlocks,
      undoStack: newUndoStack,
      redoStack: newRedoStack
    };

    const serialized = serializeHttpFile(nextBlocks);
    const isDirty = serialized !== docState.initialSerialized;

    setTimeout(() => {
      const storeState = useStore.getState();
      storeState.updateTabContent(tabId, serialized);
      storeState.markTabDirty(tabId, isDirty);
    }, 0);

    return {
      documents: {
        ...state.documents,
        [tabId]: updatedDocState
      },
      requestBlocks: nextBlocks,
      activeDocument: nextBlocks[docState.activeBlockIndex] || null
    };
  }),

  canUndo: () => {
    const fullState = get() as any;
    const tabId = fullState.activeTabId;
    if (!tabId) return false;
    const docState = get().documents[tabId];
    return docState ? docState.undoStack.length > 0 : false;
  },

  canRedo: () => {
    const fullState = get() as any;
    const tabId = fullState.activeTabId;
    if (!tabId) return false;
    const docState = get().documents[tabId];
    return docState ? docState.redoStack.length > 0 : false;
  },

  appendRequestBlock: (block) => set((state) => {
    const fullState = state as any;
    const tabId = fullState.activeTabId;
    if (!tabId) return state;

    const docState = state.documents[tabId];
    if (!docState) return state;

    const updatedBlocks = [...docState.requestBlocks, block];
    const prevBlocks = JSON.parse(JSON.stringify(docState.requestBlocks));

    const updatedDocState: TabDocumentState = {
      ...docState,
      requestBlocks: updatedBlocks,
      undoStack: [...docState.undoStack, prevBlocks].slice(-50),
      redoStack: []
    };

    // Seamless background serialization
    syncToDocument(updatedBlocks).then((serialized) => {
      const isDirty = serialized !== docState.initialSerialized;
      const storeState = useStore.getState();
      storeState.updateTabContent(tabId, serialized);
      storeState.markTabDirty(tabId, isDirty);
    }).catch((e) => {
      console.error('Failed background AST serialization:', e);
      const serialized = serializeHttpFile(updatedBlocks);
      const isDirty = serialized !== docState.initialSerialized;
      const storeState = useStore.getState();
      storeState.updateTabContent(tabId, serialized);
      storeState.markTabDirty(tabId, isDirty);
    });

    return {
      documents: {
        ...state.documents,
        [tabId]: updatedDocState
      },
      requestBlocks: updatedBlocks
    };
  })
});
