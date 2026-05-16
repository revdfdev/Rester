import React, { useState, useEffect } from 'react';
import { Plus, Search, Settings, FolderPlus, FilePlus } from 'lucide-react';
import { TreeExplorer } from './TreeExplorer';
import { EnvironmentSection } from './EnvironmentSection';
import { useCollectionStore } from '../../state/collectionStore';
import { MOCK_COLLECTIONS, MOCK_ENVIRONMENTS } from '../../mocks/collectionData';

export const Sidebar: React.FC = () => {
  const collections = useCollectionStore((state) => state.collections);
  const setCollections = useCollectionStore((state) => state.setCollections);
  const setEnvironments = useCollectionStore((state) => state.setEnvironments);

  // Initialize with mock data for now
  useEffect(() => {
    setCollections(MOCK_COLLECTIONS);
    setEnvironments(MOCK_ENVIRONMENTS);
  }, [setCollections, setEnvironments]);

  return (
    <div className="h-full flex flex-col bg-dark-950 border-r border-dark-900 overflow-hidden">
      {/* Sidebar Header */}
      <div className="p-4 flex items-center justify-between flex-shrink-0">
        <h2 className="text-[10px] font-black tracking-[0.2em] text-slate-500 uppercase">Collections</h2>
        <div className="flex items-center gap-1">
          <button className="p-1.5 hover:bg-dark-800 rounded transition-colors text-slate-400 hover:text-brand-primary" title="New Folder">
            <FolderPlus size={14} />
          </button>
          <button className="p-1.5 hover:bg-dark-800 rounded transition-colors text-slate-400 hover:text-brand-primary" title="New Request">
            <Plus size={16} />
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="px-4 mb-2 flex-shrink-0">
        <div className="relative group">
          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-brand-primary transition-colors" />
          <input 
            type="text" 
            placeholder="Search..." 
            className="w-full bg-dark-900/50 border border-dark-800/50 rounded py-1.5 pl-8 pr-3 text-xs focus:outline-none focus:border-brand-primary/40 transition-all placeholder:text-slate-600 focus:bg-dark-900"
          />
        </div>
      </div>

      {/* Collection Tree */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <TreeExplorer nodes={collections} />
      </div>

      {/* Environments Section */}
      <EnvironmentSection />

      {/* Bottom Actions */}
      <div className="p-3 bg-dark-950/40 border-t border-dark-900 flex items-center justify-between text-slate-500 flex-shrink-0">
        <button className="p-1.5 hover:bg-dark-800 rounded hover:text-brand-primary transition-colors">
          <Settings size={16} />
        </button>
        <span className="text-[9px] font-black tracking-widest opacity-30 italic">RESTER V0.1</span>
      </div>
    </div>
  );
};
