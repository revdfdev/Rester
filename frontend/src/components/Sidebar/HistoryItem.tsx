import React from 'react';
import { HistoryEntry } from '../../types';
import { Clock, Globe, ArrowRight } from 'lucide-react';

interface HistoryItemProps {
  entry: HistoryEntry;
  onSelect: (entry: HistoryEntry) => void;
}

export const HistoryItem: React.FC<HistoryItemProps> = ({ entry, onSelect }) => {
  const getStatusColor = (status: number) => {
    if (status >= 200 && status < 300) return 'text-emerald-500';
    if (status >= 400) return 'text-rose-500';
    return 'text-amber-500';
  };

  const getMethodColor = (method: string) => {
    const m = method.toUpperCase();
    if (m === 'GET') return 'text-blue-400';
    if (m === 'POST') return 'text-emerald-400';
    if (m === 'PUT') return 'text-amber-400';
    if (m === 'DELETE') return 'text-rose-400';
    return 'text-slate-400';
  };

  const formatTime = (ts: number) => {
    return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div 
      onClick={() => onSelect(entry)}
      className="group p-3 border-b border-slate-800/50 hover:bg-slate-800/40 cursor-pointer transition-all active:scale-[0.98]"
    >
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-2">
          <span className={`text-[10px] font-black uppercase tracking-tighter ${getMethodColor(entry.request.method)}`}>
            {entry.request.method}
          </span>
          <span className={`text-[10px] font-mono font-bold ${getStatusColor(entry.responseMetadata.status)}`}>
            {entry.responseMetadata.status}
          </span>
        </div>
        <div className="flex items-center gap-1 text-[9px] text-slate-500 font-medium">
          <Clock size={10} />
          <span>{formatTime(entry.timestamp)}</span>
        </div>
      </div>
      
      <div className="text-[11px] text-slate-300 truncate font-medium group-hover:text-blue-300 transition-colors">
        {entry.request.url || 'untitled request'}
      </div>

      <div className="flex items-center justify-between mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="text-[9px] text-slate-500 flex items-center gap-1">
          <Globe size={10} />
          <span>{entry.responseMetadata.duration}ms</span>
        </div>
        <ArrowRight size={12} className="text-blue-500" />
      </div>
    </div>
  );
};
