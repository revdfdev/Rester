import React from 'react';
import { Command, CornerDownLeft, Save, Plus, X, Search, FileJson } from 'lucide-react';

export const ShortcutSection: React.FC = () => {
  const shortcuts = [
    { keys: ['CTRL', 'ENTER'], label: 'Send Request', icon: CornerDownLeft },
    { keys: ['CTRL', 'S'], label: 'Save Request', icon: Save },
    { keys: ['CTRL', 'N'], label: 'New Tab', icon: Plus },
    { keys: ['CTRL', 'W'], label: 'Close Tab', icon: X },
    { keys: ['CTRL', 'F'], label: 'Search Editor', icon: Search },
    { keys: ['CTRL', 'SHIFT', 'P'], label: 'Command Palette', icon: Command },
    { keys: ['CTRL', 'H'], label: 'Toggle History', icon: FileJson },
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="grid grid-cols-1 gap-2">
        {shortcuts.map((s, i) => (
          <div key={i} className="flex items-center justify-between p-5 bg-dark-900/30 rounded-2xl border border-dark-800 group hover:bg-dark-900/50 hover:border-dark-700 transition-all">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-dark-800 rounded-xl flex items-center justify-center text-slate-500 group-hover:text-brand-primary group-hover:bg-brand-primary/10 transition-all shadow-inner">
                <s.icon size={18} />
              </div>
              <span className="text-sm font-black text-slate-300 uppercase tracking-tight">{s.label}</span>
            </div>
            <div className="flex items-center gap-2">
              {s.keys.map((k, ki) => (
                <React.Fragment key={ki}>
                  <kbd className="bg-dark-950 border border-dark-800 px-3 py-1.5 rounded-xl text-[10px] font-black text-slate-500 min-w-[40px] text-center shadow-lg group-hover:text-brand-primary group-hover:border-brand-primary/30 transition-all">
                    {k}
                  </kbd>
                  {ki < s.keys.length - 1 && <span className="text-slate-700 text-xs font-black">+</span>}
                </React.Fragment>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="p-6 bg-brand-primary/5 rounded-2xl border border-brand-primary/10 flex gap-4 items-start">
        <div className="p-2 bg-brand-primary/10 rounded-lg text-brand-primary">
          <Command size={18} />
        </div>
        <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
          <strong className="text-slate-300 font-bold block mb-1 uppercase tracking-widest text-[9px]">Workflow Efficiency</strong>
          Rester shortcuts are optimized for speed. Custom shortcut remapping and global OS-level bindings are planned for the upcoming V0.2 release.
        </p>
      </div>
    </div>
  );
};
