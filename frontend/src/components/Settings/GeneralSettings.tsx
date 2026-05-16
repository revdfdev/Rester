import React from 'react';
import { useStore } from '../../state/store';
import { Theme } from '../../types';
import { Moon, Sun, Monitor } from 'lucide-react';

export const GeneralSettings: React.FC = () => {
  const settings = useStore((state) => state.settings);
  const updateSettings = useStore((state) => state.updateSettings);

  const themes: { id: Theme; label: string; icon: typeof Moon }[] = [
    { id: 'light', label: 'Light', icon: Sun },
    { id: 'dark', label: 'Dark', icon: Moon },
    { id: 'system', label: 'System', icon: Monitor },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
      <section>
        <h3 className="text-sm font-black text-slate-500 mb-4 uppercase tracking-widest">Appearance</h3>
        <div className="grid grid-cols-3 gap-4">
          {themes.map((t) => (
            <button
              key={t.id}
              onClick={() => updateSettings({ theme: t.id })}
              className={`flex flex-col items-center gap-3 p-6 rounded-2xl border-2 transition-all group ${
                settings.theme === t.id
                  ? 'bg-brand-primary/10 border-brand-primary text-brand-primary shadow-lg shadow-brand-primary/10'
                  : 'bg-dark-900/30 border-dark-800 text-slate-500 hover:border-dark-700 hover:text-slate-300'
              }`}
            >
              <t.icon size={28} className="group-hover:scale-110 transition-transform" />
              <span className="text-xs font-black uppercase tracking-widest">{t.label}</span>
            </button>
          ))}
        </div>
      </section>

      <section>
        <h3 className="text-sm font-black text-slate-500 mb-4 uppercase tracking-widest">Privacy & Data</h3>
        <div className="flex items-center justify-between p-6 bg-dark-900/50 rounded-2xl border border-dark-800 group hover:border-dark-700 transition-colors">
          <div>
            <p className="text-sm font-bold text-slate-200">Usage Data & Telemetry</p>
            <p className="text-[11px] text-slate-500 mt-1 font-medium">Help improve Rester by sending anonymous telemetry data.</p>
          </div>
          <button
            onClick={() => updateSettings({ telemetry: !settings.telemetry })}
            className={`w-12 h-6 rounded-full transition-all relative ${
              settings.telemetry ? 'bg-brand-primary' : 'bg-dark-700'
            }`}
          >
            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all shadow-sm ${
              settings.telemetry ? 'left-7' : 'left-1'
            }`} />
          </button>
        </div>
      </section>
    </div>
  );
};
