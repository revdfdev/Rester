import React, { useState } from 'react';
import { Play, ShieldCheck, Code2 } from 'lucide-react';
import { useStore } from '../../../state/store';

export const ScriptTabs: React.FC = () => {
  const requestBlocks = useStore((state) => state.requestBlocks);
  const activeBlockIndex = useStore((state) => state.activeBlockIndex);
  const updateBlock = useStore((state) => state.updateBlock);
  const activeBlock = requestBlocks[activeBlockIndex];
  const [activeTab, setActiveTab] = useState<'pre' | 'test'>('pre');

  if (!activeBlock) return null;

  const handleScriptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (activeTab === 'pre') {
      updateBlock(activeBlockIndex, { preRequestScript: e.target.value });
    } else {
      updateBlock(activeBlockIndex, { testScript: e.target.value });
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between px-1">
        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Scripting</span>
      </div>

      <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-900/30 flex flex-col h-[250px]">
        {/* Tab Headers */}
        <div className="flex border-b border-slate-800 bg-slate-800/30">
          <button
            onClick={() => setActiveTab('pre')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold transition-all border-b-2 ${
              activeTab === 'pre'
                ? 'border-blue-500 text-blue-400 bg-blue-500/5'
                : 'border-transparent text-slate-500 hover:text-slate-300 hover:bg-slate-800/50'
            }`}
          >
            <Play size={12} />
            Pre-request Script
          </button>
          <button
            onClick={() => setActiveTab('test')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold transition-all border-b-2 ${
              activeTab === 'test'
                ? 'border-blue-500 text-blue-400 bg-blue-500/5'
                : 'border-transparent text-slate-500 hover:text-slate-300 hover:bg-slate-800/50'
            }`}
          >
            <ShieldCheck size={12} />
            Tests
          </button>
        </div>

        {/* Editor Area */}
        <div className="flex-1 relative group">
          <div className="absolute top-3 left-4 pointer-events-none opacity-20 group-focus-within:opacity-40 transition-opacity">
            <Code2 size={24} className="text-blue-500" />
          </div>
          <textarea
            value={activeTab === 'pre' ? activeBlock.preRequestScript || '' : activeBlock.testScript || ''}
            onChange={handleScriptChange}
            placeholder={activeTab === 'pre' ? "// Write JS to run before the request..." : "// Write JS to validate the response..."}
            className="w-full h-full bg-transparent p-4 pl-12 text-sm font-mono text-slate-300 focus:outline-none resize-none placeholder:text-slate-700 selection:bg-blue-500/30"
            spellCheck={false}
          />
        </div>

        {/* Footer Info */}
        <div className="px-4 py-2 bg-slate-800/20 border-t border-slate-800/50 flex items-center justify-between">
          <span className="text-[10px] text-slate-600 font-medium italic">
            {activeTab === 'pre' ? 'Runs before request execution' : 'Runs after response is received'}
          </span>
          <div className="flex items-center gap-2">
             <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
             <span className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">JS Runtime Active</span>
          </div>
        </div>
      </div>
    </div>
  );
};
