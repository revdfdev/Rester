import React from 'react';
import { useStore } from '../../state/store';
import Editor from '@monaco-editor/react';
import { Database, FileJson, Layers, Type } from 'lucide-react';
import { cn } from '../../utils/cn';
import { BodyType } from '../../types';

export const BodyEditor: React.FC = () => {
  const activeDocument = useStore((state) => state.activeDocument);
  const setBody = useStore((state) => state.setBody);

  if (!activeDocument) return null;

  const handleTypeChange = (type: BodyType) => {
    setBody({ ...activeDocument.body, type });
  };

  const handleContentChange = (content: string | undefined) => {
    setBody({ ...activeDocument.body, content: content || '' });
  };

  return (
    <div className="flex flex-col gap-6 p-6 bg-dark-900/50 rounded-3xl border border-dark-800/50 backdrop-blur-xl shadow-2xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Database size={20} />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-100">Request Body</h2>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-black">Payload Configuration</p>
          </div>
        </div>
      </div>

      <div className="flex gap-2 p-1 bg-dark-950/60 rounded-2xl border border-dark-800 shadow-inner">
        {[
          { id: 'none', label: 'None', icon: Type },
          { id: 'json', label: 'JSON', icon: FileJson },
          { id: 'form-data', label: 'Form Data', icon: Layers },
        ].map((type) => (
          <button
            key={type.id}
            onClick={() => handleTypeChange(type.id as BodyType)}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
              activeDocument.body.type === type.id 
                ? "bg-dark-800 text-cyan-400 border border-dark-700 shadow-lg" 
                : "text-slate-600 hover:text-slate-400"
            )}
          >
            <type.icon size={14} />
            {type.label}
          </button>
        ))}
      </div>

      <div className="h-[300px] rounded-2xl border border-dark-800 overflow-hidden bg-dark-950/40 relative">
        {activeDocument.body.type === 'none' ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 opacity-20">
            <Type size={48} className="text-slate-400" />
            <p className="text-sm font-medium text-slate-400 italic">No payload for this request</p>
          </div>
        ) : activeDocument.body.type === 'json' ? (
          <Editor
            height="100%"
            defaultLanguage="json"
            theme="rester-theme"
            value={activeDocument.body.content}
            onChange={handleContentChange}
            options={{
              minimap: { enabled: false },
              fontSize: 13,
              fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
              scrollBeyondLastLine: false,
              automaticLayout: true,
              padding: { top: 16, bottom: 16 },
              lineNumbers: 'on',
              renderLineHighlight: 'all',
              cursorSmoothCaretAnimation: 'on',
              smoothScrolling: true,
              backgroundColor: '#0a0c1000'
            }}
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full gap-3 opacity-20">
            <Layers size={48} className="text-slate-400" />
            <p className="text-sm font-medium text-slate-400 italic">Form Data editor coming soon</p>
          </div>
        )}
      </div>
    </div>
  );
};
