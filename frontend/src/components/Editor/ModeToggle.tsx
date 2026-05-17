import React from 'react';
import { Layout, Code } from 'lucide-react';
import { useStore } from '../../state/store';

export const ModeToggle: React.FC = () => {
  const mode = useStore((state) => state.editorMode);
  const setMode = useStore((state) => state.setEditorMode);

  return (
    <div className="flex items-center bg-dark-950/85 rounded-xl p-1 border border-dark-800 shadow-inner">
      <button
        onClick={() => setMode('form')}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all duration-200 ${
          mode === 'form'
            ? 'bg-brand-primary text-dark-950 shadow-lg shadow-brand-primary/10 active:scale-95'
            : 'text-slate-500 hover:text-slate-300 hover:bg-dark-900/40 active:scale-95'
        }`}
      >
        <Layout size={12} />
        Form
      </button>
      <button
        onClick={() => setMode('text')}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all duration-200 ${
          mode === 'text'
            ? 'bg-brand-primary text-dark-950 shadow-lg shadow-brand-primary/10 active:scale-95'
            : 'text-slate-500 hover:text-slate-300 hover:bg-dark-900/40 active:scale-95'
        }`}
      >
        <Code size={12} />
        Text
      </button>
    </div>
  );
};
