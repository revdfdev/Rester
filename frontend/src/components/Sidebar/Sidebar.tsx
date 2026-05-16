import React, { useState, useEffect } from 'react';
import { Plus, Search, Settings, FolderPlus, History as HistoryIcon, Layers, RotateCw } from 'lucide-react';
import * as App from '../../wailsjs/go/main/App';
import * as WorkspaceHandler from '../../wailsjs/go/handlers/WorkspaceHandler';
import { TreeExplorer } from './TreeExplorer';
import { HistorySidebar } from './HistorySidebar';
import { EnvironmentSection } from './EnvironmentSection';
import { IconButton } from '../common/IconButton';
import { useStore } from '../../state/store';

type SidebarTab = 'collections' | 'history';

export const Sidebar: React.FC = () => {
  const [activeTab, setActiveTab] = useState<SidebarTab>('collections');
  
  // Unified store selectors
  const collections = useStore((state) => state.collections);
  const setCollections = useStore((state) => state.setCollections);
  const setEnvironments = useStore((state) => state.setEnvironments);
  const setSettingsOpen = useStore((state) => state.setSettingsOpen);
  const loadCollections = useStore((state) => state.loadCollections);
  const loadEnvironments = useStore((state) => state.loadEnvironments);
  const loadMetadata = useStore((state) => state.loadMetadata);
  const addTab = useStore((state) => state.addTab);
  const refreshWorkspace = useStore((state) => state.refreshWorkspace);
  const environments = useStore((state) => state.environments);

  // Load collections on mount
  useEffect(() => {
    loadCollections();
    loadEnvironments();
    loadMetadata();
  }, [loadCollections, loadEnvironments, loadMetadata]);

  const handleOpenWorkspace = async () => {
    try {
      const path = await (App as any).SelectDirectory();
      if (path) {
        await WorkspaceHandler.OpenWorkspace(path);
        await refreshWorkspace();
      }
    } catch (e) {
      console.error("Failed to open workspace", e);
    }
  };

  const handleNewRequest = () => {
    const id = `new-${Date.now()}`;
    addTab({
      id,
      name: 'New Request',
      type: 'http',
      path: '',
      isDirty: false,
      content: 'GET https://api.example.com\n'
    });
  };

  return (
    <div className="h-full flex flex-col bg-dark-950 border-r border-dark-900 overflow-hidden">
      {/* Sidebar Tabs */}
      <div className="flex bg-dark-950 border-b border-dark-900 px-2 pt-2 flex-shrink-0">
        <button
          onClick={() => setActiveTab('collections')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 text-[10px] font-black uppercase tracking-widest transition-all rounded-t-xl ${
            activeTab === 'collections'
              ? 'bg-dark-900/50 text-brand-primary border-b-2 border-brand-primary shadow-[0_-4px_12px_rgba(56,189,248,0.1)]'
              : 'text-slate-600 hover:text-slate-400'
          }`}
        >
          <Layers size={14} />
          Collections
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 text-[10px] font-black uppercase tracking-widest transition-all rounded-t-xl ${
            activeTab === 'history'
              ? 'bg-dark-900/50 text-brand-primary border-b-2 border-brand-primary shadow-[0_-4px_12px_rgba(56,189,248,0.1)]'
              : 'text-slate-600 hover:text-slate-400'
          }`}
        >
          <HistoryIcon size={14} />
          History
        </button>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        {activeTab === 'collections' ? (
          <>
            {/* Sidebar Header */}
            <div className="p-4 pb-2 flex items-center justify-between flex-shrink-0">
              <h2 className="text-[10px] font-black tracking-[0.2em] text-slate-500 uppercase">Collections</h2>
              <div className="flex items-center gap-1">
                <IconButton 
                  icon={<RotateCw size={14} />} 
                  size="sm" 
                  title="Refresh" 
                  onClick={refreshWorkspace}
                />
                <IconButton 
                  icon={<FolderPlus size={14} />} 
                  size="sm" 
                  title="Open Workspace" 
                  onClick={handleOpenWorkspace}
                />
                <IconButton 
                  icon={<Plus size={16} />} 
                  size="sm" 
                  title="New Request" 
                  variant="primary"
                  className="rounded-lg shadow-sm shadow-brand-primary/20"
                  onClick={handleNewRequest}
                />
              </div>
            </div>

            {/* Search */}
            <div className="px-4 py-2 flex-shrink-0">
              <div className="relative group">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-brand-primary transition-colors" />
                <input 
                  type="text" 
                  placeholder="Search..." 
                  className="w-full bg-dark-900/50 border border-dark-800/50 rounded-xl py-2 pl-9 pr-3 text-xs focus:outline-none focus:border-brand-primary/40 focus:ring-1 focus:ring-brand-primary/10 transition-all placeholder:text-slate-600 focus:bg-dark-900"
                />
              </div>
            </div>

            {/* Collection Tree */}
            <div className="flex-1 overflow-y-auto custom-scrollbar px-2">
              {collections.length > 0 ? (
                <TreeExplorer nodes={collections} />
              ) : (
                <div className="h-full flex flex-col items-center justify-center p-8 text-center animate-in fade-in zoom-in duration-500">
                  <div className="w-12 h-12 rounded-full bg-dark-900 flex items-center justify-center mb-4 border border-dark-800/50">
                    <Layers size={20} className="text-slate-600" />
                  </div>
                  <h3 className="text-xs font-bold text-slate-400 mb-1">No Workspace Open</h3>
                  <p className="text-[10px] text-slate-500 mb-6 leading-relaxed">
                    Open a folder containing .http files to start managing your collections.
                  </p>
                  <button 
                    onClick={handleOpenWorkspace}
                    className="flex items-center gap-2 px-4 py-2 bg-dark-900 hover:bg-dark-800 text-slate-300 rounded-xl border border-dark-800 transition-all text-[10px] font-bold"
                  >
                    <FolderPlus size={14} className="text-brand-primary" />
                    Open Folder
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <HistorySidebar />
        )}
      </div>

      {/* Environments Section */}
      <EnvironmentSection />

      {/* Bottom Actions */}
      <div className="p-3 bg-dark-950/40 border-t border-dark-900 flex items-center justify-between text-slate-500 flex-shrink-0">
        <IconButton 
          icon={<Settings size={16} />} 
          size="sm" 
          onClick={() => setSettingsOpen(true)}
          title="Settings"
        />
        <div className="flex flex-col items-end">
          <span className="text-[9px] font-black tracking-widest opacity-20 italic uppercase leading-none">RESTER</span>
          <span className="text-[7px] font-bold tracking-tighter opacity-10 uppercase">V0.1.0-BETA</span>
        </div>
      </div>
    </div>
  );
};
