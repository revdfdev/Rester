import React from 'react';
import { Globe, ChevronDown } from 'lucide-react';
import { useStore } from '../../state/store';

export const EnvironmentSelector: React.FC = () => {
  const environments = useStore((state) => state.environments);
  const activeEnvId = useStore((state) => state.activeEnvId);
  const setActiveEnvId = useStore((state) => state.setActiveEnvId);

  const activeEnv = environments.find((e) => e.id === activeEnvId);

  return (
    <div className="relative group">
      <button className="flex items-center gap-2 px-3 py-1.5 bg-slate-800/40 hover:bg-slate-800/60 text-slate-300 rounded-lg text-xs font-bold border border-slate-700/30 transition-all">
        <Globe size={14} className="text-brand-primary" />
        <span>{activeEnv?.name || 'No Environment'}</span>
        <ChevronDown size={12} className="text-slate-500 group-hover:text-slate-300 transition-colors" />
      </button>

      {/* Dropdown Menu */}
      <div className="absolute right-0 top-full mt-2 w-48 bg-dark-900 border border-dark-800 rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 p-1">
        <div className="px-3 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-dark-800 mb-1">
          Select Environment
        </div>
        <button
          onClick={() => setActiveEnvId(null)}
          className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
            !activeEnvId ? 'bg-brand-primary text-dark-950 font-bold' : 'text-slate-400 hover:bg-dark-800 hover:text-slate-200'
          }`}
        >
          No Environment
        </button>
        {environments.map((env) => (
          <button
            key={env.id}
            onClick={() => setActiveEnvId(env.id)}
            className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
              activeEnvId === env.id ? 'bg-brand-primary text-dark-950 font-bold' : 'text-slate-400 hover:bg-dark-800 hover:text-slate-200'
            }`}
          >
            {env.name}
          </button>
        ))}
      </div>
    </div>
  );
};
