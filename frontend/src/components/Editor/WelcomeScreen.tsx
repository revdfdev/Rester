import React from 'react';
import { Plus, FolderPlus, Zap, History, Book, GitPullRequest, Folder, Calendar, ArrowRight } from 'lucide-react';
import { useStore } from '../../state/store';

export const WelcomeScreen: React.FC = () => {
  const addTab = useStore((state) => state.addTab);
  const recentWorkspaces = useStore((state) => state.recentWorkspaces);
  const openWorkspaceDirect = useStore((state) => state.openWorkspaceDirect);
  const openWorkspace = useStore((state) => state.openWorkspace);
  const setRecentWorkspacesOpen = useStore((state) => state.setRecentWorkspacesOpen);

  const handleOpenWorkspace = async () => {
    await openWorkspace();
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

  const formatRelativeTime = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays === 1) return 'Yesterday';
      return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    } catch {
      return 'Recently';
    }
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-150">
          <button
            onClick={handleNewRequest}
            className="group flex items-start gap-5 p-6 bg-dark-900/40 hover:bg-dark-900/80 border border-dark-800/50 hover:border-brand-primary/40 rounded-2xl transition-all text-left shadow-sm animate-in zoom-in-95 duration-300"
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
            className="group flex items-start gap-5 p-6 bg-dark-900/40 hover:bg-dark-900/80 border border-dark-800/50 hover:border-brand-primary/40 rounded-2xl transition-all text-left shadow-sm animate-in zoom-in-95 duration-300"
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

        {/* Recent Workspaces section */}
        {recentWorkspaces.length > 0 && (
          <div className="mb-16 animate-in fade-in slide-in-from-bottom-10 duration-700 delay-200">
            <div className="flex items-center justify-between mb-4 px-2">
              <h3 className="text-xs font-black tracking-widest text-slate-500 uppercase flex items-center gap-2">
                <Folder size={14} className="text-brand-primary/80" />
                Recent Workspaces
              </h3>
              <button 
                onClick={() => setRecentWorkspacesOpen(true)}
                className="text-[10px] font-black text-brand-primary hover:text-brand-primary-hover uppercase tracking-wider transition-colors"
              >
                View All
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {recentWorkspaces.slice(0, 4).map((ws) => (
                <div
                  key={ws.path}
                  onClick={() => openWorkspaceDirect(ws.path)}
                  className="group flex items-center justify-between p-4 bg-dark-900/25 hover:bg-dark-900/60 border border-dark-850 hover:border-brand-primary/30 rounded-xl transition-all cursor-pointer shadow-sm hover:translate-y-[-1px]"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-dark-900 flex items-center justify-center border border-dark-800 text-slate-400 group-hover:text-brand-primary group-hover:border-brand-primary/20 transition-all">
                      <Folder size={15} />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-slate-300 group-hover:text-brand-primary transition-colors truncate">
                        {ws.name}
                      </h4>
                      <p className="text-[9px] text-slate-500 font-mono truncate mt-0.5 max-w-[200px]">
                        {ws.path}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                    <span className="text-[8px] text-slate-600 font-medium whitespace-nowrap">
                      {formatRelativeTime(ws.last_opened)}
                    </span>
                    <ArrowRight size={12} className="text-slate-650 group-hover:text-brand-primary group-hover:translate-x-0.5 transition-all opacity-0 group-hover:opacity-100" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer Links */}
        <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6 text-[10px] font-black uppercase tracking-widest text-slate-600 animate-in fade-in slide-in-from-bottom-12 duration-700 delay-300 border-t border-dark-900/50 pt-8">
          <a href="#" className="flex items-center gap-2 hover:text-brand-primary transition-colors">
            <Book size={14} /> Documentation
          </a>
          <button 
            onClick={() => setRecentWorkspacesOpen(true)}
            className="flex items-center gap-2 hover:text-brand-primary transition-colors focus:outline-none"
          >
            <History size={14} /> Recent Workspaces
          </button>
          <a href="#" className="flex items-center gap-2 hover:text-brand-primary transition-colors">
            <GitPullRequest size={14} /> Github
          </a>
        </div>
      </div>
    </div>
  );
};
