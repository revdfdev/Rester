import { create } from 'zustand';
import { CollectionNode, EnvironmentNode } from '../types';

interface CollectionState {
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
}

export const useCollectionStore = create<CollectionState>((set) => ({
  collections: [],
  environments: [],
  expandedIds: new Set(),
  activeId: null,
  activeEnvId: null,

  setCollections: (collections) => set({ collections }),
  setEnvironments: (environments) => set({ environments }),
  
  toggleExpand: (id) => set((state) => {
    const next = new Set(state.expandedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    return { expandedIds: next };
  }),

  setActiveId: (activeId) => set({ activeId }),
  setActiveEnvId: (activeEnvId) => set({ activeEnvId }),
}));
