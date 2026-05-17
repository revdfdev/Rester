import React from 'react';
import { ChevronRight, FileCode2 } from 'lucide-react';
import { useStore } from '../../state/store';

export const RequestNavigator: React.FC = () => {
  const requestBlocks = useStore((state) => state.requestBlocks);
  const activeBlockIndex = useStore((state) => state.activeBlockIndex);
  const setActiveBlockIndex = useStore((state) => state.setActiveBlockIndex);

  if (requestBlocks.length <= 1) return null;

  return (
    <div className="flex items-center gap-1.5 p-1 bg-dark-950/80 rounded-2xl border border-dark-800 shadow-inner mb-6 overflow-x-auto no-scrollbar">
      {requestBlocks.map((block, index) => (
        <button
          key={block.id}
          onClick={() => setActiveBlockIndex(index)}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-250 ${
            activeBlockIndex === index
              ? 'bg-brand-primary text-dark-950 shadow-lg shadow-brand-primary/10 active:scale-95'
              : 'text-slate-500 hover:text-slate-350 hover:bg-dark-900/40 active:scale-95'
          }`}
        >
          <FileCode2 size={12} className={activeBlockIndex === index ? 'text-dark-950' : 'text-slate-550'} />
          <span className="max-w-[150px] truncate">{block.name || `Request ${index + 1}`}</span>
          {index < requestBlocks.length - 1 && activeBlockIndex !== index && (
             <ChevronRight size={10} className="ml-1 text-slate-700" />
          )}
        </button>
      ))}
    </div>
  );
};
