import { create } from 'zustand';

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
}

interface ExecutionState {
  results: Record<string, ExecutionResult>;
  loading: Record<string, boolean>;
  setResult: (id: string, result: ExecutionResult) => void;
  setLoading: (id: string, isLoading: boolean) => void;
  setResults: (results: Record<string, ExecutionResult>) => void;
  clearResult: (id: string) => void;
}

export const useExecutionStore = create<ExecutionState>((set) => ({
  results: {},
  loading: {},
  setResult: (id, result) =>
    set((state) => ({
      results: { ...state.results, [id]: result },
      loading: { ...state.loading, [id]: false },
    })),
  setResults: (newResults) =>
    set((state) => ({
      results: { ...state.results, ...newResults },
      loading: Object.keys(newResults).reduce((acc, id) => ({ ...acc, [id]: false }), state.loading),
    })),
  setLoading: (id, isLoading) =>
    set((state) => ({
      loading: { ...state.loading, [id]: isLoading },
    })),
  clearResult: (id) =>
    set((state) => {
      const newResults = { ...state.results };
      delete newResults[id];
      return { results: newResults };
    }),
}));
