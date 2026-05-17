import { StateCreator } from 'zustand';
import { CollectionNode, EnvironmentNode } from '../../types';

let metadataTimeout: any = null;

export interface CollectionSlice {
  collections: CollectionNode[];
  environments: EnvironmentNode[];
  expandedIds: Set<string>;
  activeId: string | null;
  activeEnvId: string | null;
  isEnvironmentModalOpen: boolean;

  // Actions
  setCollections: (collections: CollectionNode[]) => void;
  setEnvironments: (envs: EnvironmentNode[]) => void;
  toggleExpand: (id: string) => void;
  setActiveId: (id: string | null) => void;
  setActiveEnvId: (id: string | null) => void;
  setEnvironmentModalOpen: (open: boolean) => void;
  loadCollections: () => Promise<void>;
  loadEnvironments: () => Promise<void>;
  loadMetadata: () => Promise<void>;
  saveMetadata: () => Promise<void>;
  
  // Environment Management
  createEnvironment: (name: string) => Promise<void>;
  deleteEnvironment: (name: string) => Promise<void>;
  updateEnvironmentVariable: (envName: string, oldKey: string, newKey: string, newValue: string) => Promise<void>;
  deleteEnvironmentVariable: (envName: string, key: string) => Promise<void>;
}

export const createCollectionSlice: StateCreator<CollectionSlice> = (set, get) => ({
  collections: [],
  environments: [],
  expandedIds: new Set(),
  activeId: null,
  activeEnvId: null,
  isEnvironmentModalOpen: false,

  setCollections: (collections) => set({ collections }),
  setEnvironments: (environments) => set({ environments }),
  setEnvironmentModalOpen: (isEnvironmentModalOpen) => set({ isEnvironmentModalOpen }),
  
  toggleExpand: (id) => {
    set((state) => {
      const next = new Set(state.expandedIds);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return { expandedIds: next };
    });
    // Fire and forget save
    (get() as any).saveMetadata();
  },

  setActiveId: (activeId) => set({ activeId }),
  setActiveEnvId: (activeEnvId) => set({ activeEnvId }),

  loadCollections: async () => {
    try {
      const { GetCollections } = await import('../../wailsjs/go/handlers/WorkspaceHandler');
      const collections = await GetCollections();
      
      // Map core.Collection to CollectionNode
      const mapCollection = (c: any): any => ({
        id: c.Path,
        name: c.Name,
        type: c.Requests && c.Requests.length > 0 ? 'collection' : 'folder',
        children: [
          ...(c.Folders || []).map(mapCollection),
          ...(c.Requests || []).map((r: any) => ({
            id: r.ID,
            name: r.Name,
            type: 'request',
            method: r.Method || 'GET'
          }))
        ]
      });

      set({ collections: collections.map(mapCollection) });
    } catch (e) {
      console.error("Failed to load collections", e);
    }
  },
  
  loadEnvironments: async () => {
    try {
      const { GetEnvironments } = await import('../../wailsjs/go/handlers/WorkspaceHandler');
      const envs = await GetEnvironments();
      
      // Map core.Environment to EnvironmentNode
      const mappedEnvs: EnvironmentNode[] = (envs || []).map((e: any) => ({
        id: e.Name,
        name: e.Name,
        path: '', // Path is not strictly needed for UI if we use Name as ID
        isActive: e.IsActive,
        variables: e.Variables || {}
      }));

      set({ environments: mappedEnvs });
      
      // Auto-set active environment if one is marked active in backend
      const active = mappedEnvs.find(e => e.isActive);
      if (active) {
        set({ activeEnvId: active.id });
      }
    } catch (e) {
      console.error("Failed to load environments", e);
    }
  },

  loadMetadata: async () => {
    try {
      const { GetWorkspaceMetadata } = await import('../../wailsjs/go/handlers/WorkspaceHandler');
      const meta = await (GetWorkspaceMetadata as any)();
      if (meta && meta.expandedFolders) {
        set({ expandedIds: new Set(meta.expandedFolders) });
      }
    } catch (e) {
      console.error("Failed to load metadata", e);
    }
  },

  saveMetadata: async () => {
    if (metadataTimeout) {
      clearTimeout(metadataTimeout);
    }

    metadataTimeout = setTimeout(async () => {
      metadataTimeout = null;
      try {
        const { SaveWorkspaceMetadata } = await import('../../wailsjs/go/handlers/WorkspaceHandler');
        const state = get() as any;
        await (SaveWorkspaceMetadata as any)({
          openTabs: state.tabs || [],
          activeTabId: state.activeTabId || null,
          expandedFolders: Array.from(state.expandedIds)
        });
      } catch (e) {
        console.error("Failed to save metadata", e);
      }
    }, 500);
  },

  createEnvironment: async (name) => {
    try {
      const { SaveEnvironments } = await import('../../wailsjs/go/handlers/WorkspaceHandler');
      const state = get();
      const exists = state.environments.find(e => e.name === name);
      if (exists) return;

      const newEnv: EnvironmentNode = {
        id: name,
        name,
        path: '',
        isActive: false,
        variables: {}
      };

      const updatedEnvs = [...state.environments, newEnv];
      const coreEnvs = updatedEnvs.map(e => ({
        name: e.name,
        variables: e.variables || {},
        is_active: e.id === state.activeEnvId
      }));

      await SaveEnvironments(coreEnvs);
      await state.loadEnvironments();
    } catch (e) {
      console.error("Failed to create environment", e);
    }
  },

  deleteEnvironment: async (name) => {
    try {
      const { SaveEnvironments } = await import('../../wailsjs/go/handlers/WorkspaceHandler');
      const state = get();
      const updatedEnvs = state.environments.filter(e => e.name !== name);
      const coreEnvs = updatedEnvs.map(e => ({
        name: e.name,
        variables: e.variables || {},
        is_active: e.id === state.activeEnvId && e.name !== name
      }));

      await SaveEnvironments(coreEnvs);
      if (state.activeEnvId === name) {
        set({ activeEnvId: null });
      }
      await state.loadEnvironments();
    } catch (e) {
      console.error("Failed to delete environment", e);
    }
  },

  updateEnvironmentVariable: async (envName, oldKey, newKey, newValue) => {
    try {
      const { SaveEnvironments } = await import('../../wailsjs/go/handlers/WorkspaceHandler');
      const state = get();
      const updatedEnvs = state.environments.map(e => {
        if (e.name !== envName) return e;

        const newVars = { ...e.variables };
        if (oldKey !== newKey) {
          delete newVars[oldKey];
        }
        newVars[newKey] = newValue;

        return { ...e, variables: newVars };
      });

      const coreEnvs = updatedEnvs.map(e => ({
        name: e.name,
        variables: e.variables || {},
        is_active: e.id === state.activeEnvId
      }));

      await SaveEnvironments(coreEnvs);
      await state.loadEnvironments();
    } catch (e) {
      console.error("Failed to update environment variable", e);
    }
  },

  deleteEnvironmentVariable: async (envName, key) => {
    try {
      const { SaveEnvironments } = await import('../../wailsjs/go/handlers/WorkspaceHandler');
      const state = get();
      const updatedEnvs = state.environments.map(e => {
        if (e.name !== envName) return e;

        const newVars = { ...e.variables };
        delete newVars[key];

        return { ...e, variables: newVars };
      });

      const coreEnvs = updatedEnvs.map(e => ({
        name: e.name,
        variables: e.variables || {},
        is_active: e.id === state.activeEnvId
      }));

      await SaveEnvironments(coreEnvs);
      await state.loadEnvironments();
    } catch (e) {
      console.error("Failed to delete environment variable", e);
    }
  },
});
