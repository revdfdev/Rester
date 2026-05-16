import React from 'react';
import { X } from 'lucide-react';
import { Tab } from '../../state/workspaceStore';

interface TabItemProps {
  tab: Tab;
  isActive: boolean;
  onSelect: (id: string) => void;
  onClose: (id: string) => void;
}

const METHOD_COLORS: Record<string, string> = {
  GET: 'text-emerald-500',
  POST: 'text-amber-500',
  PUT: 'text-brand-primary',
  PATCH: 'text-indigo-400',
  DELETE: 'text-rose-500',
};

const TabItemBase: React.FC<TabItemProps> = ({ tab, isActive, onSelect, onClose }) => {
  const method = tab.method || 'GET';

  return (
    <div 
      onClick={() => onSelect(tab.id)}
      className={`
        h-full min-w-[120px] max-w-[200px] flex items-center justify-between px-3 border-r border-dark-900 cursor-pointer group transition-all relative
        ${isActive ? 'bg-dark-900/50' : 'hover:bg-dark-900/30'}
      `}
      title={tab.path}
    >
      <div className="flex items-center gap-2 overflow-hidden">
        <span className={`text-[10px] font-black ${isActive ? METHOD_COLORS[method] || 'text-brand-primary' : 'text-slate-500'}`}>
          {method}
        </span>
        <span className={`text-xs truncate ${isActive ? 'text-slate-200 font-medium' : 'text-slate-500 group-hover:text-slate-300'}`}>
          {tab.name}
        </span>
        {tab.isDirty && (
          <div className="w-1.5 h-1.5 rounded-full bg-amber-500/60 flex-shrink-0 animate-pulse"></div>
        )}
      </div>

      <button 
        onClick={(e) => {
          e.stopPropagation();
          onClose(tab.id);
        }}
        className={`
          p-0.5 rounded transition-all ml-2
          ${isActive ? 'hover:bg-dark-700 opacity-100' : 'opacity-0 group-hover:opacity-100 hover:bg-dark-800'}
        `}
      >
        <X size={12} className="text-slate-500 hover:text-slate-300" />
      </button>

      {isActive && (
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-primary shadow-[0_0_8px_rgba(56,189,248,0.4)]"></div>
      )}
    </div>
  );
};

export const TabItem = React.memo(TabItemBase);
