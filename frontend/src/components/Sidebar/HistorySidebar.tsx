import React, { useMemo } from 'react';
import { useStore } from '../../state/store';
import { HistoryEntry } from '../../types';
import { HistoryItem } from './HistoryItem';
import { Search, Trash2, History as HistoryIcon } from 'lucide-react';
import { Virtuoso } from 'react-virtuoso';

export const HistorySidebar: React.FC = () => {
  const history = useStore((state) => state.history);
  const searchTerm = useStore((state) => state.historySearchTerm);
  const setSearchTerm = useStore((state) => state.setHistorySearchTerm);
  const requestBlocks = useStore((state) => state.requestBlocks);
  const setActiveBlockIndex = useStore((state) => state.setActiveBlockIndex);
  const clearHistory = useStore((state) => state.clearHistory);

  const filteredHistory = useMemo(() => {
    if (!searchTerm) return history;
    const lowSearch = searchTerm.toLowerCase();
    return history.filter(entry => 
      entry.request.url.toLowerCase().includes(lowSearch) ||
      entry.request.method.toLowerCase().includes(lowSearch) ||
      entry.request.name?.toLowerCase().includes(lowSearch)
    );
  }, [history, searchTerm]);

  const appendRequestBlock = useStore((state) => state.appendRequestBlock);

  const handleSelect = (entry: HistoryEntry) => {
    const existingIndex = requestBlocks.findIndex(b => 
      b.url === entry.request.url && b.method === entry.request.method
    );

    if (existingIndex !== -1) {
      setActiveBlockIndex(existingIndex);
    } else {
      const newBlock = {
        ...entry.request,
        id: Math.random().toString(36).substr(2, 9),
      };
      appendRequestBlock(newBlock);
      setActiveBlockIndex(requestBlocks.length);
    }
  };

  const handleClear = async () => {
    if (window.confirm('Are you sure you want to clear your entire request history?')) {
      await clearHistory();
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#0a0a0a] border-r border-slate-800 w-full overflow-hidden">
      <div className="p-4 space-y-4 border-b border-slate-800 bg-slate-900/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-400">
            <HistoryIcon size={16} />
            <span className="text-xs font-black uppercase tracking-widest">History</span>
          </div>
          {history.length > 0 && (
            <button 
              onClick={handleClear}
              className="p-1.5 hover:bg-rose-500/10 text-slate-600 hover:text-rose-500 rounded transition-all"
              title="Clear All History"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" size={14} />
          <input
            type="text"
            placeholder="Search history..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-800/40 border border-slate-700/50 rounded-lg py-1.5 pl-9 pr-4 text-[11px] text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500/50 placeholder:text-slate-600 transition-all"
          />
        </div>
      </div>

      <div className="flex-1 min-h-0">
        {filteredHistory.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-700 italic p-8 text-center">
            <HistoryIcon size={48} className="mb-4 opacity-5" />
            <span className="text-xs">
              {searchTerm ? 'No matching requests' : 'Your execution history will appear here'}
            </span>
          </div>
        ) : (
          <Virtuoso
            style={{ height: '100%' }}
            totalCount={filteredHistory.length}
            itemContent={(index) => (
              <HistoryItem 
                entry={filteredHistory[index]} 
                onSelect={handleSelect} 
              />
            )}
            className="custom-scrollbar"
          />
        )}
      </div>
    </div>
  );
};
