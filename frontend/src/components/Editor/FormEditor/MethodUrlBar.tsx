import React from 'react';
import { useStore } from '../../../state/store';
import { Loader2, Send, XCircle } from 'lucide-react';

const METHODS = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD'];

export const MethodUrlBar: React.FC = () => {
  const requestBlocks = useStore((state) => state.requestBlocks);
  const activeBlockIndex = useStore((state) => state.activeBlockIndex);
  const updateBlock = useStore((state) => state.updateBlock);
  const executeRequest = useStore((state) => state.executeRequest);
  const cancelRequest = useStore((state) => state.cancelRequest);
  
  const activeBlock = requestBlocks[activeBlockIndex];
  const isLoading = useStore((state) => activeBlock ? state.executionLoading[activeBlock.id] : false);

  if (!activeBlock) return null;

  const handleMethodChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateBlock(activeBlockIndex, { method: e.target.value });
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateBlock(activeBlockIndex, { url: e.target.value });
  };

  const handleSend = () => {
    if (!activeBlock || isLoading) return;
    executeRequest(activeBlock.id);
  };

  const handleCancel = () => {
    if (activeBlock && isLoading) {
      cancelRequest(activeBlock.id);
    }
  };

  return (
    <div className="flex items-center gap-2 p-2 bg-dark-900/80 rounded-2xl border border-dark-800 shadow-inner group">
      <div className="relative">
        <select
          value={activeBlock.method}
          onChange={handleMethodChange}
          disabled={isLoading}
          className="appearance-none bg-dark-800 text-brand-primary font-black px-5 py-2.5 pr-10 rounded-xl border border-dark-700/50 hover:bg-dark-700 hover:border-brand-primary/30 transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-primary/20 text-xs disabled:opacity-50 uppercase tracking-widest"
        >
          {METHODS.map((m) => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
          <svg width="10" height="6" viewBox="0 0 10 6" fill="none"><path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </div>
      </div>

      <input
        type="text"
        value={activeBlock.url}
        onChange={handleUrlChange}
        disabled={isLoading}
        placeholder="Enter request URL..."
        className="flex-1 bg-transparent text-slate-100 px-4 py-2.5 text-sm focus:outline-none placeholder:text-slate-600 font-bold disabled:opacity-50"
      />
      
      <div className="flex gap-2">
        {isLoading && (
          <button 
            onClick={handleCancel}
            className="flex items-center justify-center w-10 h-10 bg-dark-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-500 rounded-xl transition-all border border-dark-700 hover:border-rose-500/30"
            title="Cancel Request"
          >
            <XCircle size={18} />
          </button>
        )}
        
        <button 
          onClick={handleSend}
          disabled={isLoading}
          className="flex items-center gap-2 px-8 py-2.5 bg-brand-primary hover:bg-brand-400 text-dark-950 text-xs font-black uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-brand-primary/20 active:scale-95 disabled:bg-dark-800 disabled:text-brand-primary/50 disabled:shadow-none disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Send size={16} />
          )}
          {isLoading ? 'Sending' : 'Send'}
        </button>
      </div>
    </div>
  );
};
