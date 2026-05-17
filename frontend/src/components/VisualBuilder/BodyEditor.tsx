import React from 'react';
import { useStore } from '../../state/store';
import Editor from '@monaco-editor/react';
import { Database, FileJson, Layers, Type, Plus, Trash2, CheckCircle2, Circle } from 'lucide-react';
import { cn } from '../../utils/cn';
import { BodyType, KeyValue } from '../../types';

export const BodyEditor: React.FC = () => {
  const activeDocument = useStore((state) => state.activeDocument);
  const setBody = useStore((state) => state.setBody);
  const setFormBody = useStore((state) => state.setFormBody);

  if (!activeDocument) return null;

  const handleTypeChange = (type: BodyType) => {
    setBody({ ...activeDocument.body, type });
  };

  const handleContentChange = (content: string | undefined) => {
    setBody({ ...activeDocument.body, content: content || '' });
  };

  const formBody = activeDocument.formBody || [];

  const handleAddFormField = () => {
    setFormBody([
      ...formBody,
      { id: crypto.randomUUID(), key: '', value: '', enabled: true, type: 'text' }
    ]);
  };

  const handleUpdateFormField = (index: number, updates: Partial<KeyValue>) => {
    const updated = [...formBody];
    updated[index] = { ...updated[index], ...updates };
    setFormBody(updated);
  };

  const handleRemoveFormField = (index: number) => {
    setFormBody(formBody.filter((_, i) => i !== index));
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
        {(activeDocument.body.type === 'form-data' || activeDocument.body.type === 'x-www-form-urlencoded') && (
          <button
            onClick={handleAddFormField}
            className="flex items-center gap-2 px-4 py-2 bg-dark-800 hover:bg-dark-700 text-slate-300 hover:text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all border border-dark-700/50 hover:border-cyan-500/30"
          >
            <Plus size={14} />
            Add Parameter
          </button>
        )}
      </div>

      <div className="flex gap-2 p-1 bg-dark-950/60 rounded-2xl border border-dark-800 shadow-inner">
        {[
          { id: 'none', label: 'None', icon: Type },
          { id: 'json', label: 'JSON', icon: FileJson },
          { id: 'form-data', label: 'Form Data', icon: Layers },
          { id: 'x-www-form-urlencoded', label: 'Urlencoded', icon: Layers },
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

      <div className="rounded-2xl border border-dark-800 overflow-hidden bg-dark-950/40 relative">
        {activeDocument.body.type === 'none' ? (
          <div className="flex flex-col items-center justify-center h-[300px] gap-3 opacity-20">
            <Type size={48} className="text-slate-400" />
            <p className="text-sm font-medium text-slate-400 italic">No payload for this request</p>
          </div>
        ) : activeDocument.body.type === 'json' ? (
          <div className="h-[300px]">
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
                smoothScrolling: true
              }}
            />
          </div>
        ) : (
          <div className="overflow-x-auto max-h-[300px]">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-dark-900/80 border-b border-dark-800 sticky top-0 z-10">
                  <th className="w-12 px-4 py-3 text-center"></th>
                  <th className="px-4 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest">Key</th>
                  <th className="px-4 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest border-l border-dark-800">Value</th>
                  {activeDocument.body.type === 'form-data' && (
                    <th className="w-24 px-4 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest border-l border-dark-800">Type</th>
                  )}
                  <th className="w-12 px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-800/50">
                {formBody.length === 0 && (
                  <tr>
                    <td colSpan={activeDocument.body.type === 'form-data' ? 5 : 4} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center gap-3 opacity-20">
                        <Layers size={48} className="text-slate-400" />
                        <p className="text-sm font-medium text-slate-400 italic">No parameters defined</p>
                      </div>
                    </td>
                  </tr>
                )}
                {formBody.map((field, index) => (
                  <tr key={field.id} className={cn(
                    "group transition-all hover:bg-dark-800/20",
                    !field.enabled && "opacity-40"
                  )}>
                    <td className="px-4 py-2 text-center">
                      <button 
                        onClick={() => handleUpdateFormField(index, { enabled: !field.enabled })}
                        className="text-slate-600 hover:text-cyan-400 transition-colors"
                      >
                        {field.enabled ? <CheckCircle2 size={16} className="text-cyan-400" /> : <Circle size={16} />}
                      </button>
                    </td>
                    <td className="px-0 py-0">
                      <input
                        type="text"
                        value={field.key}
                        onChange={(e) => handleUpdateFormField(index, { key: e.target.value })}
                        placeholder="Key"
                        className="w-full bg-transparent px-4 py-3 text-sm focus:outline-none placeholder:text-slate-800 font-bold text-cyan-300"
                      />
                    </td>
                    <td className="px-0 py-0 border-l border-dark-800/50">
                      <input
                        type="text"
                        value={field.value}
                        onChange={(e) => handleUpdateFormField(index, { value: e.target.value })}
                        placeholder="Value"
                        className="w-full bg-transparent px-4 py-3 text-sm focus:outline-none placeholder:text-slate-800 font-medium text-slate-200"
                      />
                    </td>
                    {activeDocument.body.type === 'form-data' && (
                      <td className="px-2 py-0 border-l border-dark-800/50">
                        <select
                          value={field.type || 'text'}
                          onChange={(e) => handleUpdateFormField(index, { type: e.target.value as 'text' | 'file' })}
                          className="bg-dark-900 border border-dark-850 text-slate-300 text-xs rounded-lg focus:outline-none p-1 w-full"
                        >
                          <option value="text">Text</option>
                          <option value="file">File</option>
                        </select>
                      </td>
                    )}
                    <td className="px-4 py-2 text-center">
                      <button
                        onClick={() => handleRemoveFormField(index)}
                        className="p-1.5 text-slate-700 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
