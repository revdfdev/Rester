import React from 'react';
import { Wifi, Clock, Database, ChevronDown } from 'lucide-react';

export const StatusBar: React.FC = () => {
  return (
    <div className="h-7 bg-dark-950 border-t border-dark-900 flex items-center justify-between px-3 text-[11px] text-slate-500 select-none">
      <div className="flex items-center gap-4">
        {/* Environment Selector */}
        <div className="flex items-center gap-1.5 hover:text-brand-primary cursor-pointer transition-colors">
          <Database size={12} />
          <span>production</span>
          <ChevronDown size={10} />
        </div>

        {/* Sync Status */}
        <div className="flex items-center gap-1.5 text-emerald-500/80">
          <Wifi size={12} />
          <span>Connected</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Last Execution Info */}
        <div className="flex items-center gap-1.5 border-r border-dark-800 pr-4">
          <Clock size={12} />
          <span>Last: 142ms</span>
        </div>

        {/* Status indicator */}
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
          <span className="font-medium text-slate-300">Rester Engine Ready</span>
        </div>
      </div>
    </div>
  );
};
