import React from 'react';
import { ChevronRight, FileCode2 } from 'lucide-react';
import { useStore } from '../../state/store';

export const RequestNavigator: React.FC = () => {
  const requestBlocks = useStore((state) => state.requestBlocks);
  const activeBlockIndex = useStore((state) => state.activeBlockIndex);
  const setActiveBlockIndex = useStore((state) => state.setActiveBlockIndex);

  if (requestBlocks.length <= 1) return null;

  return (
    <div className="flex items-center gap-1 p-1 bg-slate-900/50 rounded-xl border border-slate-800/50 mb-6 overflow-x-auto no-scrollbar">
      {requestBlocks.map((block, index) => (
        <button
          key={block.id}
          onClick={() => setActiveBlockIndex(index)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
            activeBlockIndex === index
              ? 'bg-blue-600 text-white shadow-lg'
              : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800'
          }`}
        >
          <FileCode2 size={12} className={activeBlockIndex === index ? 'text-blue-200' : 'text-slate-600'} />
          <span className="max-w-[150px] truncate">{block.name}</span>
          {index < requestBlocks.length - 1 && activeBlockIndex !== index && (
             <ChevronRight size={10} className="ml-1 text-slate-700" />
          )}
        </button>
      ))}
    </div>
  );
};
