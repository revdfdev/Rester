import React from 'react';
import { Database, ChevronDown, Globe } from 'lucide-react';
import { useStore } from '../../state/store';

export const EnvironmentSection: React.FC = () => {
  const environments = useStore((state) => state.environments);
  const activeEnvId = useStore((state) => state.activeEnvId);
  const setActiveEnvId = useStore((state) => state.setActiveEnvId);

  return (
    <div className="border-t border-dark-900 bg-dark-950/20">
      <div className="px-4 py-2 flex items-center justify-between group cursor-default">
        <div className="flex items-center gap-2 text-[10px] font-bold tracking-widest text-slate-500 uppercase">
          <Globe size={12} className="text-slate-600" />
          <span>Environments</span>
        </div>
        <button className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-dark-800 rounded transition-all text-slate-500">
           <ChevronDown size={12} />
        </button>
      </div>

      <div className="px-2 pb-3 space-y-0.5">
        {environments.map((env) => {
          const isActive = activeEnvId === env.id;
          return (
            <div 
              key={env.id}
              onClick={() => setActiveEnvId(env.id)}
              className={`
                flex items-center gap-2 px-3 py-1.5 rounded cursor-pointer text-xs transition-all
                ${isActive 
                  ? 'bg-brand-primary/10 text-brand-primary font-medium' 
                  : 'text-slate-500 hover:bg-dark-900/50 hover:text-slate-300'}
              `}
            >
              <Database size={12} className={isActive ? 'text-brand-primary' : 'text-slate-600'} />
              <span className="truncate flex-1">{env.name}</span>
              {isActive && (
                <div className="w-1.5 h-1.5 rounded-full bg-brand-primary shadow-[0_0_8px_rgba(56,189,248,0.5)]"></div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
