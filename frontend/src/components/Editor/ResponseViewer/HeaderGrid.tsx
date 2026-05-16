import React, { useState } from 'react';
import { Search, Copy } from 'lucide-react';

interface HeaderGridProps {
  headers: Record<string, string>;
}

export const HeaderGrid: React.FC<HeaderGridProps> = ({ headers }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredHeaders = Object.entries(headers).filter(([key, value]) => 
    key.toLowerCase().includes(searchTerm.toLowerCase()) || 
    value.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const copyHeader = (value: string) => {
    navigator.clipboard.writeText(value);
  };

  return (
    <div className="flex flex-col h-full bg-[#0a0a0a]">
      <div className="p-4 border-b border-slate-800 bg-slate-900/20">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
          <input
            type="text"
            placeholder="Search headers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-800/50 border border-slate-700 rounded-lg py-1.5 pl-9 pr-4 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500/50 placeholder:text-slate-600"
          />
        </div>
      </div>

      <div className="flex-1 overflow-auto custom-scrollbar">
        <table className="w-full text-xs font-mono">
          <thead className="sticky top-0 bg-slate-950 text-slate-500 border-b border-slate-800">
            <tr>
              <th className="text-left px-4 py-2 font-bold uppercase tracking-wider w-1/3">Name</th>
              <th className="text-left px-4 py-2 font-bold uppercase tracking-wider">Value</th>
            </tr>
          </thead>
          <tbody>
            {filteredHeaders.map(([key, value]) => (
              <tr key={key} className="border-b border-slate-800/50 group hover:bg-slate-900/30 transition-colors">
                <td className="px-4 py-2.5 text-slate-400 font-bold group-hover:text-blue-400">{key}</td>
                <td className="px-4 py-2.5 text-slate-300 break-all relative pr-12">
                  {value}
                  <button 
                    onClick={() => copyHeader(value)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-700 rounded opacity-0 group-hover:opacity-100 transition-all text-slate-500 hover:text-slate-200"
                    title="Copy value"
                  >
                    <Copy size={12} />
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
