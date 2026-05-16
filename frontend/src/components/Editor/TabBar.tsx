import React, { useState } from 'react';
import { Play, MoreHorizontal, XCircle, Ban } from 'lucide-react';
import { useWorkspaceStore } from '../../state/workspaceStore';
import { TabItem } from './TabItem';
import { ContextMenu, MenuItem } from '../common/ContextMenu';

export const TabBar: React.FC = () => {
  const tabs = useWorkspaceStore((state) => state.tabs);
  const activeTabId = useWorkspaceStore((state) => state.activeTabId);
  const setActiveTab = useWorkspaceStore((state) => state.setActiveTab);
  const closeTab = useWorkspaceStore((state) => state.closeTab);
  const closeAllTabs = useWorkspaceStore((state) => state.closeAllTabs);
  const closeOtherTabs = useWorkspaceStore((state) => state.closeOtherTabs);

  const [contextMenu, setContextMenu] = useState<{ x: number, y: number, tabId: string | null } | null>(null);

  const handleContextMenu = (e: React.MouseEvent, tabId: string | null) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, tabId });
  };

  const menuItems: MenuItem[] = [
    { 
      label: 'Close Tab', 
      icon: <XCircle size={14} />, 
      onClick: () => contextMenu?.tabId && closeTab(contextMenu.tabId),
      variant: 'default'
    },
    { 
      label: 'Close Others', 
      icon: <Ban size={14} />, 
      onClick: () => contextMenu?.tabId && closeOtherTabs(contextMenu.tabId) 
    },
    { 
      label: 'Close All', 
      icon: <XCircle size={14} className="text-rose-400" />, 
      onClick: closeAllTabs,
      variant: 'danger'
    },
  ];

  return (
    <div className="h-10 bg-dark-950 border-b border-dark-900 flex items-center pr-2 select-none">
      <div 
        className="flex-1 flex items-end overflow-x-auto no-scrollbar h-full"
        onContextMenu={(e) => handleContextMenu(e, null)}
      >
        {tabs.map((tab) => (
          <TabItem 
            key={tab.id}
            tab={tab}
            isActive={tab.id === activeTabId}
            onSelect={setActiveTab}
            onClose={closeTab}
          />
        ))}
      </div>

      <div className="flex items-center gap-1 border-l border-dark-800 ml-1 pl-1">
        <button 
          onClick={(e) => handleContextMenu(e, activeTabId)}
          className="p-1.5 hover:bg-dark-800 rounded text-slate-500 hover:text-slate-300 transition-colors"
          title="Tab actions"
        >
          <MoreHorizontal size={14} />
        </button>

        <button 
          className="flex items-center gap-2 bg-emerald-600/90 hover:bg-emerald-500 text-white px-3 py-1 rounded text-[11px] font-bold shadow-lg shadow-emerald-900/20 transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
          disabled={!activeTabId}
        >
          <Play size={10} fill="currentColor" />
          <span>RUN</span>
        </button>
      </div>

      {contextMenu && (
        <ContextMenu 
          x={contextMenu.x} 
          y={contextMenu.y} 
          items={menuItems} 
          onClose={() => setContextMenu(null)} 
        />
      )}
    </div>
  );
};
