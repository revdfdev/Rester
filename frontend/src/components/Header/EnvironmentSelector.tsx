import React from 'react';
import { Globe, ChevronDown } from 'lucide-react';
import { useEnvironmentStore } from '../../state/environmentStore';

export const EnvironmentSelector: React.FC = () => {
  const { activeEnv, environments, setActiveEnv } = useEnvironmentStore();
  const envNames = Object.keys(environments);

  return (
    <div className="relative group">
      <button className="flex items-center gap-2 px-3 py-1.5 bg-slate-800/40 hover:bg-slate-800/60 text-slate-300 rounded-lg text-xs font-bold border border-slate-700/30 transition-all">
        <Globe size={14} className="text-blue-500" />
        <span>{activeEnv}</span>
        <ChevronDown size={12} className="text-slate-500 group-hover:text-slate-300 transition-colors" />
      </button>

      {/* Dropdown Menu */}
      <div className="absolute right-0 top-full mt-2 w-48 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 p-1">
        <div className="px-3 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-slate-800 mb-1">
          Select Environment
        </div>
        <button
          onClick={() => setActiveEnv('No Environment')}
          className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
            activeEnv === 'No Environment' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
          }`}
        >
          No Environment
        </button>
        {envNames.map((name) => (
          <button
            key={name}
            onClick={() => setActiveEnv(name)}
            className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
              activeEnv === name ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            {name}
          </button>
        ))}
      </div>
    </div>
  );
};
