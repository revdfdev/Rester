import { StateCreator } from 'zustand';
import { Tab } from '../../types';
import * as App from '../../wailsjs/go/main/App';
import * as WorkspaceHandler from '../../wailsjs/go/handlers/WorkspaceHandler';

export interface WorkspaceSlice {
  tabs: Tab[];
  activeTabId: string | null;
  
  // Actions
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
  createFile: (parentPath: string, name: string) => Promise<void>;
  createFolder: (parentPath: string, name: string) => Promise<void>;
  deleteItem: (path: string) => Promise<void>;
  renameItem: (oldPath: string, newPath: string) => Promise<void>;
  refreshWorkspace: () => Promise<void>;
}

export const createWorkspaceSlice: StateCreator<WorkspaceSlice> = (set, get) => ({
  tabs: [],
  activeTabId: null,

  persistWorkspaceState: async () => {
    const state = get();
    try {
      await (App as any).SaveWorkspaceMetadata({
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
      const meta = await (App as any).GetWorkspaceMetadata();
      if (meta && meta.openTabs && meta.openTabs.length > 0) {
        set({ 
          tabs: meta.openTabs, 
          activeTabId: meta.activeTabId 
        });
      }
    } catch (e) {
      // It's fine if metadata doesn't exist yet
    }
  },

  addTab: (tabData) => {
    set((state) => {
      const exists = state.tabs.find((t) => t.id === tabData.id);
      const now = Date.now();
      let nextState;
      if (exists) {
        nextState = { 
          activeTabId: tabData.id,
          tabs: state.tabs.map(t => t.id === tabData.id ? { ...t, lastAccessed: now } : t)
        };
      } else {
        const newTab: Tab = { 
          ...tabData, 
          lastAccessed: now,
          content: tabData.content || ''
        };
        nextState = {
          tabs: [...state.tabs, newTab],
          activeTabId: tabData.id,
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
    // We don't necessarily want to persist on every keystroke, 
    // maybe only on blur or periodic? For now, we'll skip persisting content-only changes.
  },

  closeTab: (id) => {
    set((state) => {
      const newTabs = state.tabs.filter((t) => t.id !== id);
      let newActiveTabId = state.activeTabId;
      if (state.activeTabId === id) {
        newActiveTabId = newTabs.length > 0 ? newTabs[newTabs.length - 1].id : null;
      }
      return { tabs: newTabs, activeTabId: newActiveTabId };
    });
    get().persistWorkspaceState();
  },

  closeAllTabs: () => {
    set({ tabs: [], activeTabId: null });
    get().persistWorkspaceState();
  },

  closeOtherTabs: (id) => {
    set((state) => {
      const tab = state.tabs.find(t => t.id === id);
      return {
        tabs: tab ? [tab] : [],
        activeTabId: tab ? tab.id : null
      };
    });
    get().persistWorkspaceState();
  },

  setActiveTab: (id) => {
    set((state) => ({
      activeTabId: id,
      tabs: state.tabs.map(t => t.id === id ? { ...t, lastAccessed: Date.now() } : t)
    }));
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
      let savePath = tab.path;
      
      if (!savePath) {
        savePath = await (App as any).SaveFileDialog(tab.name + '.http');
        if (!savePath) return;
        
        // Update tab in store with new path and ID (since ID = path for files)
        set((state) => ({
          tabs: state.tabs.map(t => t.id === id ? { ...t, id: savePath, path: savePath, name: savePath.split(/[\\/]/).pop() || t.name } : t),
          activeTabId: state.activeTabId === id ? savePath : state.activeTabId
        }));
      }

      await WorkspaceHandler.SaveFile(savePath, contentToSave);
      state.markTabDirty(savePath, false);
      
      // Refresh sidebar if it's a new file
      if (!tab.path) {
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

  createFile: async (parentPath, name) => {
    const state = get() as any;
    const fullPath = `${parentPath}/${name}.http`.replace(/\/+/g, '/');
    try {
      await WorkspaceHandler.SaveFile(fullPath, 'GET https://api.example.com\n');
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
      await WorkspaceHandler.CreateFolder(fullPath);
      await state.loadCollections();
    } catch (e) {
      console.error("Failed to create folder", e);
    }
  },

  deleteItem: async (path) => {
    const state = get() as any;
    try {
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
      await WorkspaceHandler.Rename(oldPath, newPath);
      // Update tabs related to this path
      set((state) => ({
        tabs: state.tabs.map(t => {
          if (t.path === oldPath) {
            return { ...t, id: newPath, path: newPath, name: newPath.split('/').pop() || t.name };
          }
          if (t.path?.startsWith(oldPath + '/')) {
            const updatedPath = t.path.replace(oldPath, newPath);
            return { ...t, id: updatedPath, path: updatedPath };
          }
          return t;
        }),
        activeTabId: state.activeTabId === oldPath ? newPath : (state.activeTabId?.startsWith(oldPath + '/') ? state.activeTabId.replace(oldPath, newPath) : state.activeTabId)
      }));
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
});
