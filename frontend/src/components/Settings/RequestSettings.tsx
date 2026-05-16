import React from 'react';
import { useStore } from '../../state/store';
import { Zap, Clock, ShieldAlert } from 'lucide-react';
import { Badge } from '../common/Badge';

export const RequestSettings: React.FC = () => {
  const settings = useStore((state) => state.settings);
  const updateSettings = useStore((state) => state.updateSettings);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
      <section className="space-y-4">
        <div className="p-6 bg-brand-primary/5 rounded-2xl border border-brand-primary/10 flex gap-5">
          <div className="w-12 h-12 bg-brand-primary/10 rounded-xl flex items-center justify-center text-brand-primary flex-shrink-0 shadow-inner">
            <Zap size={24} />
          </div>
          <div>
            <h4 className="text-sm font-black text-slate-100 uppercase tracking-tight">Execution Engine</h4>
            <p className="text-[11px] text-slate-500 leading-relaxed mt-1 font-medium">
              These settings control how Rester interacts with remote servers. Changes are applied immediately to all new requests.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between p-6 bg-dark-900/50 rounded-2xl border border-dark-800 group hover:border-dark-700 transition-colors">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-dark-800 rounded-lg text-slate-500 group-hover:text-brand-primary transition-colors">
              <Clock size={18} />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-200">Global Timeout</p>
              <p className="text-[11px] text-slate-500 mt-1 font-medium">Maximum time to wait for a response.</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <input 
              type="number" 
              value={settings.requestTimeout}
              onChange={(e) => updateSettings({ requestTimeout: parseInt(e.target.value) || 0 })}
              className="w-28 bg-dark-950 border border-dark-800 rounded-xl px-4 py-2 text-sm text-brand-primary focus:outline-none focus:border-brand-primary/50 focus:ring-1 focus:ring-brand-primary/10 font-black transition-all"
            />
            <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">ms</span>
          </div>
        </div>

        <div className="p-6 bg-dark-900/30 rounded-2xl border border-dark-800/50 flex items-center justify-between group">
          <div className="flex items-center gap-4 opacity-40">
            <div className="p-2 bg-dark-800 rounded-lg text-slate-600">
              <ShieldAlert size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="text-sm font-bold text-slate-400">SSL Verification</p>
                <Badge variant="slate" size="xs">PRO</Badge>
              </div>
              <p className="text-[11px] text-slate-600 mt-1 font-medium">Enable strict SSL certificate validation.</p>
            </div>
          </div>
          <button disabled className="w-12 h-6 rounded-full bg-dark-800 relative cursor-not-allowed border border-dark-700/50">
            <div className="absolute top-1 left-1 w-4 h-4 bg-dark-600 rounded-full" />
          </button>
        </div>
      </section>
    </div>
  );
};
