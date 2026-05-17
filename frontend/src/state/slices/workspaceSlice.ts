import { StateCreator } from 'zustand';
import { Tab, EditorMode } from '../../types';
import { parseHttpFile } from '../../utils/http-parser';
import { RootState } from '../store';

const autosaveTimeouts: { [key: string]: any } = {};

export interface RecentWorkspace {
  path: string;
  name: string;
  last_opened: string;
}

export interface WorkspaceSlice {
  tabs: Tab[];
  activeTabId: string | null;
  recentWorkspaces: RecentWorkspace[];
  isRecentWorkspacesOpen: boolean;
  
  // Actions
  setRecentWorkspacesOpen: (open: boolean) => void;
  persistWorkspaceState: () => Promise<void>;
  loadMetadata: () => Promise<void>;
  addTab: (tab: Omit<Tab, 'lastAccessed'>) => void;
  closeTab: (id: string) => void;
  closeAllTabs: () => void;
  closeOtherTabs: (id: string) => void;
  setActiveTab: (id: string | null) => void;
  renameTab: (id: string, newName: string) => void;
  reorderTabs: (ids: string[]) => void;
  markTabDirty: (id: string, isDirty: boolean) => void;
  updateTabContent: (id: string, content: string) => void;
  saveTab: (id: string) => Promise<void>;
  openFile: (path: string, name: string) => Promise<void>;
  createFile: (parentPath: string, name: string, initialContent?: string) => Promise<void>;
  createFolder: (parentPath: string, name: string) => Promise<void>;
  deleteItem: (path: string) => Promise<void>;
  renameItem: (oldPath: string, newPath: string) => Promise<void>;
  refreshWorkspace: () => Promise<void>;
  openWorkspace: () => Promise<void>;
  showInFolder: (path: string) => Promise<void>;
  
  // Recent Workspace Actions
  loadRecentWorkspaces: () => Promise<void>;
  removeRecentWorkspace: (path: string) => Promise<void>;
  openWorkspaceDirect: (path: string) => Promise<void>;
  
  // Window State Actions
  loadWindowState: () => Promise<void>;
  saveWindowState: (width: number, height: number, maximized: boolean) => Promise<void>;
}

export const createWorkspaceSlice: StateCreator<RootState, [], [], WorkspaceSlice> = (set, get) => ({
  tabs: [],
  activeTabId: null,
  recentWorkspaces: [],
  isRecentWorkspacesOpen: false,

  setRecentWorkspacesOpen: (open) => set({ isRecentWorkspacesOpen: open }),

  persistWorkspaceState: async () => {
    const state = get();
    try {
      const WorkspaceHandler = await import('../../wailsjs/go/handlers/WorkspaceHandler');
      await (WorkspaceHandler as any).SaveWorkspaceMetadata({
        openTabs: state.tabs,
        activeTabId: state.activeTabId,
        lastOpenedAt: new Date().toISOString()
      });
    } catch (e) {
      console.error("Failed to persist workspace state", e);
    }
  },

  loadMetadata: async () => {
    try {
      const WorkspaceHandler = await import('../../wailsjs/go/handlers/WorkspaceHandler');
      const meta = await (WorkspaceHandler as any).GetWorkspaceMetadata();
      if (meta && meta.openTabs && meta.openTabs.length > 0) {
        const nextDocuments: Record<string, any> = {};
        meta.openTabs.forEach((tab: Tab) => {
          const content = tab.content || '';
          const parsedBlocks = parseHttpFile(content);
          nextDocuments[tab.id] = {
            requestBlocks: parsedBlocks,
            activeBlockIndex: 0,
            undoStack: [],
            redoStack: [],
            editorMode: 'form' as EditorMode,
            initialSerialized: content
          };
        });

        const activeTabId = meta.activeTabId;
        const activeTab = meta.openTabs.find((t: Tab) => t.id === activeTabId);
        
        let nextShortcutState: any = {};
        if (activeTabId && activeTab) {
          const docState = nextDocuments[activeTabId];
          nextShortcutState = {
            requestBlocks: docState.requestBlocks,
            activeBlockIndex: 0,
            activeDocument: docState.requestBlocks[0] || null,
            editorMode: (docState.editorMode || 'form') as EditorMode
          };
        }

        set((state) => ({ 
          tabs: meta.openTabs, 
          activeTabId: meta.activeTabId,
          documents: {
            ...(state as any).documents,
            ...nextDocuments
          },
          ...nextShortcutState
        }));
      }
    } catch (e) {
      // It's fine if metadata doesn't exist yet
    }
  },

  addTab: (tabData) => {
    set((state) => {
      const fullState = state as any;
      const exists = state.tabs.find((t) => t.id === tabData.id);
      const now = Date.now();
      let nextState;
      
      const content = tabData.content || '';
      const parsedBlocks = parseHttpFile(content);
      const docState = {
        requestBlocks: parsedBlocks,
        activeBlockIndex: 0,
        undoStack: [],
        redoStack: [],
        editorMode: 'form' as EditorMode,
        initialSerialized: content
      };
      
      const newDocuments = {
        ...fullState.documents,
        [tabData.id]: docState
      };
      
      if (exists) {
        nextState = { 
          activeTabId: tabData.id,
          tabs: state.tabs.map(t => t.id === tabData.id ? { ...t, lastAccessed: now } : t),
          requestBlocks: fullState.documents[tabData.id]?.requestBlocks || parsedBlocks,
          activeBlockIndex: fullState.documents[tabData.id]?.activeBlockIndex || 0,
          activeDocument: fullState.documents[tabData.id]?.requestBlocks[fullState.documents[tabData.id]?.activeBlockIndex || 0] || parsedBlocks[0] || null,
          editorMode: (fullState.documents[tabData.id]?.editorMode || 'form') as EditorMode
        };
      } else {
        const newTab: Tab = { 
          ...tabData, 
          lastAccessed: now,
          content: content
        };
        nextState = {
          tabs: [...state.tabs, newTab],
          activeTabId: tabData.id,
          documents: newDocuments,
          requestBlocks: parsedBlocks,
          activeBlockIndex: 0,
          activeDocument: parsedBlocks[0] || null,
          editorMode: 'form' as EditorMode
        };
      }
      return nextState;
    });
    get().persistWorkspaceState();
  },

  updateTabContent: (id, content) => {
    set((state) => ({
      tabs: state.tabs.map(t => t.id === id ? { ...t, content } : t)
    }));

    const state = get();
    const tab = state.tabs.find(t => t.id === id);
    if (tab && tab.path) {
      if (autosaveTimeouts[id]) {
        clearTimeout(autosaveTimeouts[id]);
      }
      autosaveTimeouts[id] = setTimeout(async () => {
        delete autosaveTimeouts[id];
        try {
          const WorkspaceHandler = await import('../../wailsjs/go/handlers/WorkspaceHandler');
          await WorkspaceHandler.SaveFile(tab.path, content);
          
          set((state: any) => {
            const docState = state.documents[id];
            if (docState) {
              return {
                documents: {
                  ...state.documents,
                  [id]: {
                    ...docState,
                    initialSerialized: content
                  }
                }
              };
            }
            return {};
          });
          
          state.markTabDirty(id, false);
        } catch (e) {
          console.error("Autosave failed for tab: " + id, e);
        }
      }, 1000);
    }
  },

  closeTab: (id) => {
    set((state: any) => {
      const newTabs = state.tabs.filter((t: Tab) => t.id !== id);
      let newActiveTabId = state.activeTabId;
      if (state.activeTabId === id) {
        newActiveTabId = newTabs.length > 0 ? newTabs[newTabs.length - 1].id : null;
      }
      
      const newDocuments = { ...state.documents };
      delete newDocuments[id];
      
      let nextShortcutState = {};
      if (newActiveTabId) {
        const docState = newDocuments[newActiveTabId];
        if (docState) {
          nextShortcutState = {
            requestBlocks: docState.requestBlocks || [],
            activeBlockIndex: docState.activeBlockIndex || 0,
            activeDocument: (docState.requestBlocks && docState.requestBlocks[docState.activeBlockIndex]) || null,
            editorMode: docState.editorMode || 'form'
          };
        }
      } else {
        nextShortcutState = {
          requestBlocks: [],
          activeBlockIndex: 0,
          activeDocument: null
        };
      }

      return { 
        tabs: newTabs, 
        activeTabId: newActiveTabId, 
        documents: newDocuments,
        ...nextShortcutState 
      };
    });
    get().persistWorkspaceState();
  },

  closeAllTabs: () => {
    set({ 
      tabs: [], 
      activeTabId: null, 
      documents: {},
      requestBlocks: [],
      activeBlockIndex: 0,
      activeDocument: null
    });
    get().persistWorkspaceState();
  },

  closeOtherTabs: (id) => {
    set((state: any) => {
      const tab = state.tabs.find((t: Tab) => t.id === id);
      const newDocuments: Record<string, any> = {};
      if (tab && state.documents[id]) {
        newDocuments[id] = state.documents[id];
      }
      
      let nextShortcutState = {};
      if (tab && state.documents[id]) {
        const docState = state.documents[id];
        nextShortcutState = {
          requestBlocks: docState.requestBlocks || [],
          activeBlockIndex: docState.activeBlockIndex || 0,
          activeDocument: (docState.requestBlocks && docState.requestBlocks[docState.activeBlockIndex]) || null,
          editorMode: docState.editorMode || 'form'
        };
      } else {
        nextShortcutState = {
          requestBlocks: [],
          activeBlockIndex: 0,
          activeDocument: null
        };
      }

      return {
        tabs: tab ? [tab] : [],
        activeTabId: tab ? tab.id : null,
        documents: newDocuments,
        ...nextShortcutState
      };
    });
    get().persistWorkspaceState();
  },

  setActiveTab: (id) => {
    set((state) => {
      const fullState = state as any;
      const nextTabs = state.tabs.map(t => t.id === id ? { ...t, lastAccessed: Date.now() } : t);
      const activeTab = nextTabs.find(t => t.id === id);
      
      let nextShortcutState: any = {};
      let nextDocuments = { ...fullState.documents };
      
      if (id && activeTab) {
        let docState = nextDocuments[id];
        if (!docState) {
          const parsedBlocks = parseHttpFile(activeTab.content || '');
          docState = {
            requestBlocks: parsedBlocks,
            activeBlockIndex: 0,
            undoStack: [],
            redoStack: [],
            editorMode: 'form' as EditorMode,
            initialSerialized: activeTab.content || ''
          };
          nextDocuments[id] = docState;
        }
        
        nextShortcutState = {
          requestBlocks: docState.requestBlocks,
          activeBlockIndex: docState.activeBlockIndex,
          activeDocument: docState.requestBlocks[docState.activeBlockIndex] || null,
          editorMode: docState.editorMode as EditorMode,
          documents: nextDocuments
        };
      } else {
        nextShortcutState = {
          activeDocument: null,
          requestBlocks: [],
          activeBlockIndex: 0
        };
      }
      
      return {
        activeTabId: id,
        tabs: nextTabs,
        ...nextShortcutState
      };
    });
    get().persistWorkspaceState();
  },

  renameTab: (id, newName) => {
    set((state) => ({
      tabs: state.tabs.map((t) => t.id === id ? { ...t, name: newName } : t)
    }));
    get().persistWorkspaceState();
  },

  reorderTabs: (ids) => {
    set((state) => {
      const tabMap = new Map(state.tabs.map(t => [t.id, t]));
      const newTabs = ids.map(id => tabMap.get(id)).filter((t): t is Tab => !!t);
      return { tabs: newTabs };
    });
    get().persistWorkspaceState();
  },

  markTabDirty: (id, isDirty) => set((state) => ({
    tabs: state.tabs.map(t => t.id === id ? { ...t, isDirty } : t)
  })),

  saveTab: async (id) => {
    const state = get() as any; // Using any because we can't type get() with RootState easily without circular dependencies
    const tab = state.tabs.find((t: Tab) => t.id === id);
    if (!tab) return;
    
    let contentToSave = '';
    
    // If it's the active tab, the content is in the editor store (requestBlocks)
    if (state.activeTabId === id) {
      contentToSave = state.getSerializedContent();
    } else {
      // If not active, we would theoretically need to load it or we just don't allow saving non-active dirty tabs without activating them first
      return; 
    }

    try {
      const App = await import('../../wailsjs/go/main/App');
      const WorkspaceHandler = await import('../../wailsjs/go/handlers/WorkspaceHandler');
      let savePath = tab.path;
      const isNewFile = !savePath;
      
      if (isNewFile) {
        const defaultName = tab.name.endsWith('.http') ? tab.name : tab.name + '.http';
        savePath = await (App as any).SaveFileDialog(defaultName);
        if (!savePath) return;
        if (!savePath.endsWith('.http')) {
          savePath = savePath + '.http';
        }
      }

      await WorkspaceHandler.SaveFile(savePath, contentToSave);
      
      set((state: any) => {
        const nextDocuments = { ...state.documents };
        const docState = nextDocuments[id];
        
        if (docState) {
          if (isNewFile && id !== savePath) {
            delete nextDocuments[id];
          }
          nextDocuments[savePath] = {
            ...docState,
            initialSerialized: contentToSave
          };
        }
        
        const nextTabs = state.tabs.map((t: Tab) => 
          t.id === id 
            ? { ...t, id: savePath, path: savePath, name: savePath.split(/[\\/]/).pop() || t.name, isDirty: false } 
            : t
        );
        
        const nextActiveTabId = state.activeTabId === id ? savePath : state.activeTabId;
        
        // Also project shortcuts for ease of UI consumption
        let nextShortcutState = {};
        if (nextActiveTabId === savePath && nextDocuments[savePath]) {
          const activeDocState = nextDocuments[savePath];
          nextShortcutState = {
            requestBlocks: activeDocState.requestBlocks || [],
            activeBlockIndex: activeDocState.activeBlockIndex || 0,
            activeDocument: (activeDocState.requestBlocks && activeDocState.requestBlocks[activeDocState.activeBlockIndex]) || null,
            editorMode: activeDocState.editorMode || 'form'
          };
        }
        
        return {
          tabs: nextTabs,
          activeTabId: nextActiveTabId,
          documents: nextDocuments,
          ...nextShortcutState
        };
      });

      if (isNewFile) {
        state.loadCollections();
      }
    } catch (e) {
      console.error("Failed to save tab", e);
    }
  },

  openFile: async (path, name) => {
    const state = get() as any;
    
    // Check if already open
    const existing = state.tabs.find((t: Tab) => t.path === path);
    if (existing) {
      state.setActiveTab(existing.id);
      return;
    }

    try {
      const WorkspaceHandler = await import('../../wailsjs/go/handlers/WorkspaceHandler');
      const content = await WorkspaceHandler.ReadFile(path);
      
      state.addTab({
        id: path, // Use path as ID for files
        name: name,
        path: path,
        type: 'http',
        isDirty: false,
        content: content
      });
    } catch (e) {
      console.error("Failed to open file", e);
    }
  },

  createFile: async (parentPath, name, initialContent) => {
    const state = get() as any;
    const fullPath = `${parentPath}/${name}.http`.replace(/\/+/g, '/');
    try {
      const WorkspaceHandler = await import('../../wailsjs/go/handlers/WorkspaceHandler');
      await WorkspaceHandler.SaveFile(fullPath, initialContent || 'GET https://api.example.com\n');
      await state.loadCollections();
      await state.openFile(fullPath, `${name}.http`);
    } catch (e) {
      console.error("Failed to create file", e);
    }
  },

  createFolder: async (parentPath, name) => {
    const state = get() as any;
    const fullPath = `${parentPath}/${name}`.replace(/\/+/g, '/');
    try {
      const WorkspaceHandler = await import('../../wailsjs/go/handlers/WorkspaceHandler');
      await WorkspaceHandler.CreateFolder(fullPath);
      await state.loadCollections();
    } catch (e) {
      console.error("Failed to create folder", e);
    }
  },

  deleteItem: async (path) => {
    const state = get() as any;
    try {
      const WorkspaceHandler = await import('../../wailsjs/go/handlers/WorkspaceHandler');
      await WorkspaceHandler.Delete(path);
      // Close tabs related to this path
      state.tabs.forEach((t: Tab) => {
        if (t.path === path || t.path?.startsWith(path + '/')) {
          state.closeTab(t.id);
        }
      });
      await state.loadCollections();
    } catch (e) {
      console.error("Failed to delete item", e);
    }
  },

  renameItem: async (oldPath, newPath) => {
    const state = get() as any;
    try {
      const WorkspaceHandler = await import('../../wailsjs/go/handlers/WorkspaceHandler');
      await WorkspaceHandler.Rename(oldPath, newPath);
      
      set((state: any) => {
        const nextDocuments = { ...state.documents };
        
        // Rename matching documents keys
        Object.keys(nextDocuments).forEach((key) => {
          if (key === oldPath) {
            nextDocuments[newPath] = nextDocuments[key];
            delete nextDocuments[key];
          } else if (key.startsWith(oldPath + '/')) {
            const updatedPath = key.replace(oldPath, newPath);
            nextDocuments[updatedPath] = nextDocuments[key];
            delete nextDocuments[key];
          }
        });

        const nextTabs = state.tabs.map((t: Tab) => {
          if (t.path === oldPath) {
            return { ...t, id: newPath, path: newPath, name: newPath.split('/').pop() || t.name };
          }
          if (t.path?.startsWith(oldPath + '/')) {
            const updatedPath = t.path.replace(oldPath, newPath);
            return { ...t, id: updatedPath, path: updatedPath };
          }
          return t;
        });

        const nextActiveTabId = state.activeTabId === oldPath 
          ? newPath 
          : (state.activeTabId?.startsWith(oldPath + '/') ? state.activeTabId.replace(oldPath, newPath) : state.activeTabId);
          
        let nextShortcutState = {};
        if (nextActiveTabId && nextDocuments[nextActiveTabId]) {
          const docState = nextDocuments[nextActiveTabId];
          nextShortcutState = {
            requestBlocks: docState.requestBlocks || [],
            activeBlockIndex: docState.activeBlockIndex || 0,
            activeDocument: (docState.requestBlocks && docState.requestBlocks[docState.activeBlockIndex]) || null,
            editorMode: docState.editorMode || 'form'
          };
        }

        return {
          tabs: nextTabs,
          activeTabId: nextActiveTabId,
          documents: nextDocuments,
          ...nextShortcutState
        };
      });

      await state.loadCollections();
    } catch (e) {
      console.error("Failed to rename item", e);
    }
  },

  refreshWorkspace: async () => {
    const state = get() as any;
    try {
      await state.loadCollections();
      await state.loadEnvironments();
      await state.loadMetadata();
    } catch (e) {
      console.error("Failed to refresh workspace", e);
    }
  },

  openWorkspace: async () => {
    const state = get() as any;
    try {
      const App = await import('../../wailsjs/go/main/App');
      const path = await (App as any).SelectDirectory();
      if (path) {
        await state.openWorkspaceDirect(path);
      }
    } catch (e) {
      console.error("Failed to pick and open workspace", e);
    }
  },

  showInFolder: async (path: string) => {
    try {
      const App = await import('../../wailsjs/go/main/App');
      await (App as any).ShowInFolder(path);
    } catch (e) {
      console.error("Failed to show in folder", e);
    }
  },

  loadRecentWorkspaces: async () => {
    try {
      const WorkspaceHandler = await import('../../wailsjs/go/handlers/WorkspaceHandler');
      const workspaces = await (WorkspaceHandler as any).GetRecentWorkspaces();
      if (workspaces) {
        set({ recentWorkspaces: workspaces });
      }
    } catch (e) {
      console.error("Failed to load recent workspaces", e);
    }
  },

  removeRecentWorkspace: async (path) => {
    try {
      const WorkspaceHandler = await import('../../wailsjs/go/handlers/WorkspaceHandler');
      await (WorkspaceHandler as any).RemoveRecentWorkspace(path);
      await get().loadRecentWorkspaces();
    } catch (e) {
      console.error("Failed to remove recent workspace", e);
    }
  },

  openWorkspaceDirect: async (path) => {
    const state = get() as any;
    try {
      const WorkspaceHandler = await import('../../wailsjs/go/handlers/WorkspaceHandler');
      await (WorkspaceHandler as any).OpenWorkspace(path);
      await state.refreshWorkspace();
      await state.loadRecentWorkspaces();
    } catch (e) {
      console.error("Failed to open workspace direct", e);
    }
  },

  loadWindowState: async () => {
    try {
      const App = await import('../../wailsjs/go/main/App');
      const state = await (App as any).GetWindowState();
      if (state && (window as any).runtime) {
        const { WindowSetSize, WindowMaximize } = (window as any).runtime;
        if (state.maximized) {
          WindowMaximize();
        } else if (state.width > 0 && state.height > 0) {
          WindowSetSize(state.width, state.height);
        }
      }
    } catch (e) {
      console.error("Failed to load window state", e);
    }
  },

  saveWindowState: async (width, height, maximized) => {
    try {
      const App = await import('../../wailsjs/go/main/App');
      await (App as any).SaveWindowState(width, height, maximized);
    } catch (e) {
      console.error("Failed to save window state", e);
    }
  },
});
