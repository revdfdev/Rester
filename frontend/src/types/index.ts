export type NodeType = 'file' | 'folder';

export interface CollectionNode {
  id: string;
  name: string;
  type: NodeType;
  path: string;
  children?: CollectionNode[];
  method?: string; // Only for files (e.g., GET, POST)
  isDirty?: boolean;
}

export interface EnvironmentNode {
  id: string;
  name: string;
  path: string;
  isActive: boolean;
}

export interface WorkspaceState {
  collections: CollectionNode[];
  environments: EnvironmentNode[];
  expandedIds: Set<string>;
  activeId: string | null;
}
