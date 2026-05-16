import React, { useRef } from 'react';
import { Plus, Trash2, CheckCircle2, Circle, FileUp } from 'lucide-react';
import { KeyValue } from '../../../types';

interface KeyValueGridProps {
  title: string;
  data: KeyValue[];
  onChange: (data: KeyValue[]) => void;
  showTypeSelector?: boolean;
}

export const KeyValueGrid: React.FC<KeyValueGridProps> = ({ title, data, onChange, showTypeSelector = false }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const activeFileIndexRef = useRef<number | null>(null);

  const handleAdd = () => {
    onChange([...data, { id: crypto.randomUUID(), key: '', value: '', enabled: true, type: 'text' }]);
  };

  const handleUpdate = (index: number, updates: Partial<KeyValue>) => {
    const newData = [...data];
    newData[index] = { ...newData[index], ...updates };
    onChange(newData);
  };

  const handleRemove = (index: number) => {
    onChange(data.filter((_, i) => i !== index));
  };

  const toggleEnabled = (index: number) => {
    handleUpdate(index, { enabled: !data[index].enabled });
  };

  const triggerFilePicker = (index: number) => {
    activeFileIndexRef.current = index;
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && activeFileIndexRef.current !== null) {
      // In a real local app, we'd want the absolute path.
      // Web input only gives us the filename for security reasons.
      // However, if this is Wails, we might need a backend call to get the real path.
      // But for now, we'll use the file name as a placeholder or use the web path.
      handleUpdate(activeFileIndexRef.current, { value: file.name, type: 'file' });
    }
    activeFileIndexRef.current = null;
    e.target.value = ''; // Reset for same file selection
  };

  return (
    <div className="flex flex-col gap-2">
      {/* Hidden File Input for Native Dialog */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        className="hidden" 
      />

      <div className="flex items-center justify-between px-1">
        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">{title}</span>
        <button
          onClick={handleAdd}
          className="p-1 hover:bg-slate-800 rounded text-blue-500 transition-colors"
          title="Add Row"
        >
          <Plus size={14} />
        </button>
      </div>

      <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-900/30">
        <table className="w-full text-sm">
          <thead className="bg-slate-800/50 text-slate-400 text-[10px] font-bold uppercase">
            <tr>
              <th className="w-10 px-2 py-2 text-center border-r border-slate-800"></th>
              <th className="px-4 py-2 text-left border-r border-slate-800">Key</th>
              {showTypeSelector && <th className="w-20 px-2 py-2 text-center border-r border-slate-800">Type</th>}
              <th className="px-4 py-2 text-left border-r border-slate-800">Value</th>
              <th className="w-10 px-2 py-2 text-center"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {data.length === 0 && (
              <tr>
                <td colSpan={showTypeSelector ? 5 : 4} className="px-4 py-6 text-center text-slate-600 italic">
                  No {title.toLowerCase()} defined
                </td>
              </tr>
            )}
            {data.map((row, index) => (
              <tr key={row.id} className={`group hover:bg-slate-800/30 transition-colors ${!row.enabled ? 'opacity-50' : ''}`}>
                <td className="w-10 px-2 py-2 text-center border-r border-slate-800">
                  <button onClick={() => toggleEnabled(index)} className="text-slate-600 hover:text-blue-500 transition-colors">
                    {row.enabled ? <CheckCircle2 size={14} className="text-blue-500" /> : <Circle size={14} />}
                  </button>
                </td>
                <td className="px-0 py-0 border-r border-slate-800">
                  <input
                    type="text"
                    value={row.key}
                    onChange={(e) => handleUpdate(index, { key: e.target.value })}
                    placeholder="Key"
                    className="w-full bg-transparent px-4 py-2.5 focus:outline-none placeholder:text-slate-700 font-medium"
                  />
                </td>
                {showTypeSelector && (
                  <td className="w-20 px-0 py-0 border-r border-slate-800 text-center">
                    <select
                      value={row.type || 'text'}
                      onChange={(e) => handleUpdate(index, { type: e.target.value as any, value: '' })}
                      className="bg-transparent text-[10px] font-bold text-slate-400 focus:outline-none cursor-pointer uppercase"
                    >
                      <option value="text">Text</option>
                      <option value="file">File</option>
                    </select>
                  </td>
                )}
                <td className="px-0 py-0 border-r border-slate-800 relative">
                  {row.type === 'file' ? (
                    <div className="flex items-center w-full">
                      <input
                        type="text"
                        value={row.value}
                        onChange={(e) => handleUpdate(index, { value: e.target.value })}
                        placeholder="Select file..."
                        className="w-full bg-transparent px-4 py-2.5 focus:outline-none placeholder:text-slate-700 text-blue-400 font-mono text-xs"
                      />
                      <button 
                        onClick={() => triggerFilePicker(index)}
                        className="absolute right-2 p-1.5 hover:bg-slate-700 rounded text-slate-400 hover:text-blue-500 transition-all"
                        title="Open File Picker"
                      >
                        <FileUp size={14} />
                      </button>
                    </div>
                  ) : (
                    <input
                      type="text"
                      value={row.value}
                      onChange={(e) => handleUpdate(index, { value: e.target.value })}
                      placeholder="Value"
                      className="w-full bg-transparent px-4 py-2.5 focus:outline-none placeholder:text-slate-700"
                    />
                  )}
                </td>
                <td className="w-10 px-2 py-2 text-center">
                  <button
                    onClick={() => handleRemove(index)}
                    className="text-slate-700 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
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
