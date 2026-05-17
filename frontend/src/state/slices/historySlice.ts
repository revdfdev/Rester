import { StateCreator } from 'zustand';
import { HistoryEntry, RequestBlock, KeyValue, BodyType } from '../../types';

export interface HistorySlice {
  history: HistoryEntry[];
  historySearchTerm: string;
  
  // Actions
  addHistoryEntry: (entry: any) => void;
  removeHistoryEntry: (id: string) => void;
  clearHistory: () => void;
  setHistorySearchTerm: (term: string) => void;
  setHistory: (history: any[]) => void;
  loadHistory: (limit?: number) => Promise<void>;
}

function mapCoreRequestToRequestBlock(req: any): RequestBlock {
  if (req && Array.isArray(req.headers)) {
    return req;
  }

  const headers: KeyValue[] = Object.entries(req?.headers || {}).map(([key, value]) => ({
    id: Math.random().toString(36).substr(2, 9),
    key,
    value: String(value),
    enabled: true
  }));

  // Parse URL params
  const params: KeyValue[] = [];
  const url = req?.url || '';
  if (url.includes('?')) {
    const queryStr = url.split('?')[1];
    const pairs = queryStr.split('&');
    pairs.forEach((p: string) => {
      const [k, v] = p.split('=');
      if (k) {
        params.push({
          id: Math.random().toString(36).substr(2, 9),
          key: decodeURIComponent(k),
          value: decodeURIComponent(v || ''),
          enabled: true
        });
      }
    });
  }

  // Infer body type
  let bodyType: BodyType = 'none';
  const contentType = Object.keys(req?.headers || {}).find(k => k.toLowerCase() === 'content-type');
  const contentTypeValue = contentType ? req.headers[contentType].toLowerCase() : '';
  if (contentTypeValue.includes('json')) bodyType = 'json';
  else if (contentTypeValue.includes('form-urlencoded')) bodyType = 'x-www-form-urlencoded';
  else if (contentTypeValue.includes('form-data')) bodyType = 'form-data';
  else if (req?.body) bodyType = 'raw';

  const formBody: KeyValue[] = [];
  if ((bodyType === 'x-www-form-urlencoded' || bodyType === 'form-data') && req?.body) {
    req.body.split('&').filter(Boolean).forEach((pair: string) => {
      const [key, rawValue] = pair.split('=');
      let value = decodeURIComponent(rawValue || '');
      let type: 'text' | 'file' = 'text';
      if (value.startsWith('< ')) {
        value = value.substring(2);
        type = 'file';
      }
      formBody.push({
        id: Math.random().toString(36).substr(2, 9),
        key: decodeURIComponent(key || ''),
        value,
        enabled: true,
        type
      });
    });
  }

  return {
    id: req?.id || Math.random().toString(36).substr(2, 9),
    name: req?.name || `${req?.method || 'GET'} ${url.split('?')[0]}`,
    method: req?.method || 'GET',
    url: url,
    headers: headers,
    params: params,
    body: {
      type: bodyType,
      content: req?.body || ''
    },
    formBody: formBody.length > 0 ? formBody : undefined,
    preRequestScript: req?.preRequestScript || req?.pre_request_script || '',
    testScript: req?.testScript || req?.test_script || ''
  };
}

function mapCoreHistoryToFrontend(entry: any): HistoryEntry {
  if (entry && entry.responseMetadata) {
    return entry;
  }

  const requestBlock = mapCoreRequestToRequestBlock(entry.request);
  const resp = entry.response || {};
  const timingTotal = resp.timing?.total || 0;
  
  return {
    id: String(entry.id || Math.random().toString(36).substr(2, 9)),
    timestamp: entry.created_at ? new Date(entry.created_at).getTime() : (entry.timestamp || Date.now()),
    request: requestBlock,
    responseMetadata: {
      status: resp.status || 0,
      statusText: resp.status_text || String(resp.status || ''),
      duration: timingTotal
    }
  };
}

export const createHistorySlice: StateCreator<HistorySlice> = (set) => ({
  history: [],
  historySearchTerm: '',

  addHistoryEntry: (entry) => set((state) => {
    const mappedEntry = mapCoreHistoryToFrontend(entry);
    const newHistory = [mappedEntry, ...state.history].slice(0, 1000);
    return { history: newHistory };
  }),

  removeHistoryEntry: (id) => set((state) => ({
    history: state.history.filter((e) => e.id !== id),
  })),

  clearHistory: async () => {
    try {
      const { ClearHistory } = await import('../../wailsjs/go/main/App');
      await ClearHistory();
    } catch (e) {
      console.error("Failed to clear history on backend", e);
    }
    set({ history: [] });
  },

  setHistorySearchTerm: (term) => set({ historySearchTerm: term }),

  setHistory: (history) => set({ 
    history: (history || []).map(mapCoreHistoryToFrontend) 
  }),
  
  loadHistory: async (limit = 1000) => {
    try {
      const { GetHistory } = await import('../../wailsjs/go/main/App');
      const history = await GetHistory(limit);
      if (history) {
        set({ history: (history || []).map(mapCoreHistoryToFrontend) });
      }
    } catch (e) {
      console.error("Failed to load history", e);
    }
  },
});
