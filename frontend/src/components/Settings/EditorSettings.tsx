import React from 'react';
import { useStore } from '../../state/store';

export const EditorSettings: React.FC = () => {
  const settings = useStore((state) => state.settings);
  const updateEditorSettings = useStore((state) => state.updateEditorSettings);

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
      <h3 className="text-sm font-black text-slate-500 mb-4 uppercase tracking-widest">Monaco Editor</h3>
      
      <div className="flex items-center justify-between p-6 bg-dark-900/50 rounded-2xl border border-dark-800 group hover:border-dark-700 transition-colors">
        <div>
          <p className="text-sm font-bold text-slate-200">Font Size</p>
          <p className="text-[11px] text-slate-500 mt-1 font-medium">Adjust the text size in the request and response editors.</p>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-xs font-black font-mono text-brand-primary bg-brand-primary/10 px-2 py-1 rounded-md border border-brand-primary/20">
            {settings.editor.fontSize}PX
          </span>
          <input 
            type="range" 
            min="10" 
            max="24" 
            step="1"
            value={settings.editor.fontSize}
            onChange={(e) => updateEditorSettings({ fontSize: parseInt(e.target.value) })}
            className="w-32 accent-brand-primary cursor-pointer"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-center justify-between p-6 bg-dark-900/50 rounded-2xl border border-dark-800 group hover:border-dark-700 transition-colors">
          <div>
            <p className="text-sm font-bold text-slate-200">Line Numbers</p>
            <p className="text-[11px] text-slate-500 mt-1 font-medium">Toggle gutter numbers.</p>
          </div>
          <button
            onClick={() => updateEditorSettings({ lineNumbers: settings.editor.lineNumbers === 'on' ? 'off' : 'on' })}
            className={`w-12 h-6 rounded-full transition-all relative ${
              settings.editor.lineNumbers === 'on' ? 'bg-brand-primary' : 'bg-dark-700'
            }`}
          >
            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all shadow-sm ${
              settings.editor.lineNumbers === 'on' ? 'left-7' : 'left-1'
            }`} />
          </button>
        </div>

        <div className="flex items-center justify-between p-6 bg-dark-900/50 rounded-2xl border border-dark-800 group hover:border-dark-700 transition-colors">
          <div>
            <p className="text-sm font-bold text-slate-200">Minimap</p>
            <p className="text-[11px] text-slate-500 mt-1 font-medium">High-level overview.</p>
          </div>
          <button
            onClick={() => updateEditorSettings({ minimap: !settings.editor.minimap })}
            className={`w-12 h-6 rounded-full transition-all relative ${
              settings.editor.minimap ? 'bg-brand-primary' : 'bg-dark-700'
            }`}
          >
            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all shadow-sm ${
              settings.editor.minimap ? 'left-7' : 'left-1'
            }`} />
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between p-6 bg-dark-900/50 rounded-2xl border border-dark-800 group hover:border-dark-700 transition-colors">
        <div>
          <p className="text-sm font-bold text-slate-200">Word Wrap</p>
          <p className="text-[11px] text-slate-500 mt-1 font-medium">Wrap long lines to fit the editor width.</p>
        </div>
        <button
          onClick={() => updateEditorSettings({ wordWrap: settings.editor.wordWrap === 'on' ? 'off' : 'on' })}
          className={`w-12 h-6 rounded-full transition-all relative ${
            settings.editor.wordWrap === 'on' ? 'bg-brand-primary' : 'bg-dark-700'
          }`}
        >
          <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all shadow-sm ${
            settings.editor.wordWrap === 'on' ? 'left-7' : 'left-1'
          }`} />
        </button>
      </div>
    </div>
  );
};
