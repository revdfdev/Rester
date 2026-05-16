import { StateCreator } from 'zustand';
import { CollectionNode, EnvironmentNode } from '../../types';

export interface CollectionSlice {
  collections: CollectionNode[];
  environments: EnvironmentNode[];
  expandedIds: Set<string>;
  activeId: string | null;
  activeEnvId: string | null;

  // Actions
  setCollections: (collections: CollectionNode[]) => void;
  setEnvironments: (envs: EnvironmentNode[]) => void;
  toggleExpand: (id: string) => void;
  setActiveId: (id: string | null) => void;
  setActiveEnvId: (id: string | null) => void;
  loadCollections: () => Promise<void>;
  loadEnvironments: () => Promise<void>;
  loadMetadata: () => Promise<void>;
  saveMetadata: () => Promise<void>;
}

export const createCollectionSlice: StateCreator<CollectionSlice> = (set, get) => ({
  collections: [],
  environments: [],
  expandedIds: new Set(),
  activeId: null,
  activeEnvId: null,

  setCollections: (collections) => set({ collections }),
  setEnvironments: (environments) => set({ environments }),
  
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
      const mappedEnvs: EnvironmentNode[] = envs.map((e: any) => ({
        id: e.Name,
        name: e.Name,
        path: '', // Path is not strictly needed for UI if we use Name as ID
        isActive: e.IsActive,
        variables: e.Variables
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
      if (meta && meta.expanded_folders) {
        set({ expandedIds: new Set(meta.expanded_folders) });
      }
    } catch (e) {
      console.error("Failed to load metadata", e);
    }
  },

  saveMetadata: async () => {
    try {
      const { SaveWorkspaceMetadata } = await import('../../wailsjs/go/handlers/WorkspaceHandler');
      const state = get();
      await (SaveWorkspaceMetadata as any)({
        expanded_folders: Array.from(state.expandedIds),
        pinned_requests: []
      });
    } catch (e) {
      console.error("Failed to save metadata", e);
    }
  },
});
