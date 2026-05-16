import React from 'react';
import { Layout, Code } from 'lucide-react';
import { useEditorStore } from '../../state/editorStore';

export const ModeToggle: React.FC = () => {
  const { mode, setMode } = useEditorStore();

  return (
    <div className="flex items-center bg-slate-800/50 rounded-lg p-1 border border-slate-700/50">
      <button
        onClick={() => setMode('form')}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
          mode === 'form'
            ? 'bg-blue-600 text-white shadow-lg'
            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
        }`}
      >
        <Layout size={14} />
        Form
      </button>
      <button
        onClick={() => setMode('text')}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
          mode === 'text'
            ? 'bg-blue-600 text-white shadow-lg'
            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
        }`}
      >
        <Code size={14} />
        Text
      </button>
    </div>
  );
};
