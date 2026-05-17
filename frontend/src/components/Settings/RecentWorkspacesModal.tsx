import React, { useState } from 'react';
import { X, Folder, Calendar, Trash2, Search, ArrowRight, ExternalLink } from 'lucide-react';
import { useStore } from '../../state/store';

interface RecentWorkspacesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RecentWorkspacesModal: React.FC<RecentWorkspacesModalProps> = ({ isOpen, onClose }) => {
  const recentWorkspaces = useStore((state) => state.recentWorkspaces);
  const openWorkspaceDirect = useStore((state) => state.openWorkspaceDirect);
  const removeRecentWorkspace = useStore((state) => state.removeRecentWorkspace);
  
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  const filteredWorkspaces = recentWorkspaces.filter(ws => 
    ws.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ws.path.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOpenWorkspace = async (path: string) => {
    await openWorkspaceDirect(path);
    onClose();
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
      return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return 'Recently';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark-950/60 backdrop-blur-md animate-in fade-in duration-200">
      {/* Modal Card */}
      <div 
        className="w-full max-w-xl bg-dark-900/90 border border-dark-800/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-dark-800/50 bg-dark-900/40">
          <div>
            <h2 className="text-base font-black text-slate-100 flex items-center gap-2">
              <Folder size={18} className="text-brand-primary" />
              Recent Workspaces
            </h2>
            <p className="text-[10px] text-slate-500 font-medium mt-0.5">
              Instantly jump back into your recent directory collections
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-dark-800 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-dark-800/30 bg-dark-900/20">
          <div className="relative group">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-brand-primary transition-colors" />
            <input 
              type="text" 
              placeholder="Search recent workspaces by name or path..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-dark-950/50 border border-dark-850 rounded-xl py-2.5 pl-9 pr-3 text-xs focus:outline-none focus:border-brand-primary/40 focus:ring-1 focus:ring-brand-primary/10 transition-all placeholder:text-slate-600 font-medium"
            />
          </div>
        </div>

        {/* Workspace List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
          {filteredWorkspaces.length > 0 ? (
            filteredWorkspaces.map((ws) => (
              <div 
                key={ws.path}
                onClick={() => handleOpenWorkspace(ws.path)}
                className="group flex items-center justify-between p-3.5 bg-dark-950/20 hover:bg-brand-primary/5 border border-dark-850 hover:border-brand-primary/20 rounded-xl transition-all cursor-pointer shadow-sm"
              >
                <div className="flex items-center gap-4 min-w-0 flex-1">
                  <div className="w-10 h-10 rounded-xl bg-dark-900 flex items-center justify-center border border-dark-800 text-slate-400 group-hover:text-brand-primary group-hover:border-brand-primary/20 transition-all shadow-inner">
                    <Folder size={18} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-xs font-bold text-slate-200 group-hover:text-brand-primary transition-colors truncate">
                      {ws.name}
                    </h4>
                    <p className="text-[9px] text-slate-500 font-mono truncate mt-0.5 pr-4 select-all">
                      {ws.path}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 flex-shrink-0">
                  <div className="flex flex-col items-end text-[9px] text-slate-500 font-medium">
                    <span className="flex items-center gap-1">
                      <Calendar size={10} />
                      {formatRelativeTime(ws.last_opened)}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeRecentWorkspace(ws.path);
                      }}
                      title="Remove from recents"
                      className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-all"
                    >
                      <Trash2 size={13} />
                    </button>
                    <div className="p-1.5 rounded-lg text-brand-primary bg-brand-primary/10">
                      <ArrowRight size={13} />
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="h-48 flex flex-col items-center justify-center text-center p-6">
              <Folder className="text-slate-600 mb-3" size={32} />
              <h3 className="text-xs font-bold text-slate-400 mb-1">
                {searchQuery ? 'No matching workspaces' : 'No recent workspaces'}
              </h3>
              <p className="text-[10px] text-slate-500 max-w-xs leading-relaxed">
                {searchQuery 
                  ? 'Try checking the spelling or query another folder keyword' 
                  : 'Open a local directory workspace using Wails folder selection'
                }
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
