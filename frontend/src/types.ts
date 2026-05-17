// UI Node Types
export interface CollectionNode {
  id: string;
  name: string;
  type: 'collection' | 'folder' | 'request';
  method?: string;
  children?: CollectionNode[];
}

export interface EnvironmentNode {
  id: string;
  name: string;
  variables: Record<string, string>;
  isActive?: boolean;
}

// Editor Types
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
  lineRange?: [number, number];
}

export type EditorMode = 'form' | 'text';

// History Types
export interface HistoryEntry {
  id: string;
  timestamp: number;
  request: RequestBlock;
  responseMetadata: {
    status: number;
    statusText: string;
    duration: number;
  };
}

// Settings Types
export type Theme = 'dark' | 'light' | 'system';

export interface Settings {
  theme: Theme;
  requestTimeout: number;
  editor: {
    fontSize: number;
    lineNumbers: 'on' | 'off';
    minimap: boolean;
    wordWrap: 'on' | 'off';
  };
  telemetry: boolean;
}

// Execution Types
export interface Cookie {
  name: string;
  value: string;
  domain?: string;
  path?: string;
  expires?: string;
  secure?: boolean;
  httpOnly?: boolean;
  sameSite?: string;
}

export interface DetailedTiming {
  dns: number;
  tcp: number;
  tls: number;
  ttfb: number;
  download: number;
}

export interface ExecutionResult {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  cookies: Cookie[];
  body: string;
  timing: {
    total: number;
    detailed?: DetailedTiming;
  };
  logs?: string[];
}

// Tab type (used by WorkspaceSlice)
export interface Tab {
  id: string;
  name: string;
  path: string;
  type: 'http' | 'graphql' | 'grpc';
  method?: string;
  isDirty: boolean;
  lastAccessed: number;
  content: string;
}

export interface WorkspaceMetadata {
  openTabs: Tab[];
  activeTabId: string | null;
  lastOpenedAt: string;
}
