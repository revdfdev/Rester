import React from 'react';
import { Plus, FolderPlus, Zap, History, Book, GitPullRequest } from 'lucide-react';
import { useStore } from '../../state/store';
import * as App from '../../wailsjs/go/main/App';
import * as WorkspaceHandler from '../../wailsjs/go/handlers/WorkspaceHandler';

export const WelcomeScreen: React.FC = () => {
  const addTab = useStore((state) => state.addTab);
  const refreshWorkspace = useStore((state) => state.refreshWorkspace);

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
    <div className="h-full w-full flex flex-col items-center justify-center p-12 bg-dark-950 overflow-y-auto custom-scrollbar">
      <div className="max-w-3xl w-full">
        {/* Header */}
        <div className="flex flex-col items-center mb-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-brand-primary/20 to-brand-secondary/20 border border-brand-primary/30 flex items-center justify-center mb-8 shadow-lg shadow-brand-primary/10">
            <Zap size={40} className="text-brand-primary" />
          </div>
          <h1 className="text-4xl font-black tracking-tight text-slate-100 mb-3 bg-clip-text text-transparent bg-gradient-to-r from-slate-100 to-slate-400">
            RESTER
          </h1>
          <p className="text-slate-500 text-lg font-medium text-center max-w-md leading-relaxed">
            A professional, high-performance API client for developers who love the filesystem.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-150">
          <button
            onClick={handleNewRequest}
            className="group flex items-start gap-5 p-6 bg-dark-900/40 hover:bg-dark-900/80 border border-dark-800/50 hover:border-brand-primary/40 rounded-2xl transition-all text-left shadow-sm"
          >
            <div className="p-3 rounded-xl bg-brand-primary/10 text-brand-primary group-hover:scale-110 transition-transform">
              <Plus size={24} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-200 mb-1 group-hover:text-brand-primary transition-colors">Create New Request</h3>
              <p className="text-[11px] text-slate-500 leading-normal">Start with a clean slate. Create a new HTTP, GraphQL or gRPC request.</p>
            </div>
          </button>

          <button
            onClick={handleOpenWorkspace}
            className="group flex items-start gap-5 p-6 bg-dark-900/40 hover:bg-dark-900/80 border border-dark-800/50 hover:border-brand-primary/40 rounded-2xl transition-all text-left shadow-sm"
          >
            <div className="p-3 rounded-xl bg-amber-500/10 text-amber-500 group-hover:scale-110 transition-transform">
              <FolderPlus size={24} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-200 mb-1 group-hover:text-amber-500 transition-colors">Open Workspace</h3>
              <p className="text-[11px] text-slate-500 leading-normal">Open a folder to sync your collections with the local filesystem.</p>
            </div>
          </button>
        </div>

        {/* Footer Links */}
        <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6 text-[10px] font-black uppercase tracking-widest text-slate-600 animate-in fade-in slide-in-from-bottom-12 duration-700 delay-300">
          <a href="#" className="flex items-center gap-2 hover:text-brand-primary transition-colors">
            <Book size={14} /> Documentation
          </a>
          <a href="#" className="flex items-center gap-2 hover:text-brand-primary transition-colors">
            <History size={14} /> Recent Workspaces
          </a>
          <a href="#" className="flex items-center gap-2 hover:text-brand-primary transition-colors">
            <GitPullRequest size={14} /> Github
          </a>
        </div>
      </div>
    </div>
  );
};
