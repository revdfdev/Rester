import React from 'react';
import { useStore } from '../../state/store';
import { Plus, Trash2, CheckCircle2, Circle, Settings2 } from 'lucide-react';
import { cn } from '../../utils/cn';

export const ParamsEditor: React.FC = () => {
  const activeDocument = useStore((state) => state.activeDocument);
  const setParams = useStore((state) => state.setParams);

  if (!activeDocument) return null;

  const handleAdd = () => {
    const newParams = [
      ...(activeDocument.params || []),
      { id: crypto.randomUUID(), key: '', value: '', enabled: true }
    ];
    setParams(newParams);
  };

  const handleUpdate = (index: number, updates: any) => {
    const newParams = [...(activeDocument.params || [])];
    newParams[index] = { ...newParams[index], ...updates };
    setParams(newParams);
  };

  const handleRemove = (index: number) => {
    const newParams = (activeDocument.params || []).filter((_, i) => i !== index);
    setParams(newParams);
  };

  return (
    <div className="flex flex-col gap-6 p-6 bg-dark-900/50 rounded-3xl border border-dark-800/50 backdrop-blur-xl shadow-2xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Settings2 size={20} />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-100">Query Parameters</h2>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-black">URL Configuration</p>
          </div>
        </div>
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 px-4 py-2 bg-dark-800 hover:bg-dark-700 text-slate-300 hover:text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all border border-dark-700/50 hover:border-indigo-500/30"
        >
          <Plus size={14} />
          Add Param
        </button>
      </div>

      <div className="overflow-hidden border border-dark-800 rounded-2xl bg-dark-950/40">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-dark-900/80 border-b border-dark-800">
              <th className="w-12 px-4 py-3 text-center"></th>
              <th className="px-4 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest">Key</th>
              <th className="px-4 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest border-l border-dark-800">Value</th>
              <th className="w-12 px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-dark-800/50">
            {(!activeDocument.params || activeDocument.params.length === 0) && (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center gap-3 opacity-20">
                    <Settings2 size={48} className="text-slate-400" />
                    <p className="text-sm font-medium text-slate-400 italic">No parameters defined for this request</p>
                  </div>
                </td>
              </tr>
            )}
            {(activeDocument.params || []).map((param, index) => (
              <tr key={param.id} className={cn(
                "group transition-all hover:bg-dark-800/20",
                !param.enabled && "opacity-40"
              )}>
                <td className="px-4 py-2 text-center">
                  <button 
                    onClick={() => handleUpdate(index, { enabled: !param.enabled })}
                    className="text-slate-600 hover:text-brand-primary transition-colors"
                  >
                    {param.enabled ? <CheckCircle2 size={16} className="text-brand-primary" /> : <Circle size={16} />}
                  </button>
                </td>
                <td className="px-0 py-0">
                  <input
                    type="text"
                    value={param.key}
                    onChange={(e) => handleUpdate(index, { key: e.target.value })}
                    placeholder="key"
                    className="w-full bg-transparent px-4 py-3.5 text-sm focus:outline-none placeholder:text-slate-800 font-bold text-indigo-300"
                  />
                </td>
                <td className="px-0 py-0 border-l border-dark-800/50">
                  <input
                    type="text"
                    value={param.value}
                    onChange={(e) => handleUpdate(index, { value: e.target.value })}
                    placeholder="value"
                    className="w-full bg-transparent px-4 py-3.5 text-sm focus:outline-none placeholder:text-slate-800 font-medium text-slate-200"
                  />
                </td>
                <td className="px-4 py-2 text-center">
                  <button
                    onClick={() => handleRemove(index)}
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
    </div>
  );
};
