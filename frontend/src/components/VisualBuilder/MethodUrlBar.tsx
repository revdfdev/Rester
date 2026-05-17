import React from 'react';
import { useStore } from '../../state/store';
import { Loader2, Send, XCircle, Globe } from 'lucide-react';
import { cn } from '../../utils/cn';

const METHODS = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD'];

export const MethodUrlBar: React.FC = () => {
  const activeDocument = useStore((state) => state.activeDocument);
  const setMethod = useStore((state) => state.setMethod);
  const setUrl = useStore((state) => state.setUrl);
  const executeRequest = useStore((state) => state.executeRequest);
  const cancelRequest = useStore((state) => state.cancelRequest);
  
  const updateDocument = useStore((state) => state.updateDocument);
  const isLoading = useStore((state) => activeDocument ? state.executionLoading[activeDocument.id] : false);

  if (!activeDocument) return null;

  const handleSend = () => {
    if (!activeDocument || isLoading) return;
    executeRequest(activeDocument.id);
  };

  const handleCancel = () => {
    if (activeDocument && isLoading) {
      cancelRequest(activeDocument.id);
    }
  };

  return (
    <div className="flex flex-col gap-4 p-6 bg-dark-900/50 rounded-3xl border border-dark-800/50 backdrop-blur-xl shadow-2xl animate-in fade-in slide-in-from-top-4">
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-10 h-10 rounded-2xl bg-brand-primary/10 text-brand-primary border border-brand-primary/20 flex-shrink-0">
          <Globe size={20} />
        </div>
        <div className="flex-1 min-w-0">
          <input
            type="text"
            value={activeDocument.name || ''}
            onChange={(e) => updateDocument({ name: e.target.value })}
            placeholder="Unnamed Request"
            className="w-full bg-transparent text-slate-100 font-bold text-sm focus:outline-none placeholder:text-slate-650 focus:border-b focus:border-brand-primary/45 pb-0.5 border-b border-transparent transition-all"
          />
          <p className="text-[10px] text-slate-500 uppercase tracking-widest font-black mt-0.5">HTTP Configuration</p>
        </div>
      </div>

      <div className="flex items-center gap-3 p-2 bg-dark-950/80 rounded-2xl border border-dark-800 shadow-inner group">
        <div className="relative">
          <select
            value={activeDocument.method}
            onChange={(e) => setMethod(e.target.value)}
            disabled={isLoading}
            className="appearance-none bg-dark-800 text-brand-primary font-black px-6 py-3 pr-12 rounded-xl border border-dark-700/50 hover:bg-dark-700 hover:border-brand-primary/30 transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-primary/20 text-xs disabled:opacity-50 uppercase tracking-widest"
          >
            {METHODS.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
            <svg width="10" height="6" viewBox="0 0 10 6" fill="none"><path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
        </div>

        <input
          type="text"
          value={activeDocument.url}
          onChange={(e) => setUrl(e.target.value)}
          disabled={isLoading}
          placeholder="https://api.example.com/v1/resource"
          className="flex-1 bg-transparent text-slate-100 px-4 py-3 text-sm focus:outline-none placeholder:text-slate-600 font-bold disabled:opacity-50 selection:bg-brand-primary/30"
        />
        
        <div className="flex gap-2 pr-1">
          {isLoading ? (
            <button 
              onClick={handleCancel}
              className="flex items-center justify-center w-11 h-11 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 rounded-xl transition-all border border-rose-500/20 hover:border-rose-500/40"
              title="Cancel Request"
            >
              <XCircle size={20} />
            </button>
          ) : (
            <button 
              onClick={handleSend}
              disabled={isLoading || !activeDocument.url}
              className={cn(
                "flex items-center gap-2 px-8 py-3 bg-brand-primary hover:bg-brand-400 text-dark-950 text-xs font-black uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-brand-primary/20 active:scale-95",
                "disabled:bg-dark-800 disabled:text-slate-600 disabled:shadow-none disabled:cursor-not-allowed disabled:border-dark-700"
              )}
            >
              <Send size={16} />
              Send
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
