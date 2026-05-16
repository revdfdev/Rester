import React from 'react';
import { Virtuoso } from 'react-virtuoso';
import { useWorkspaceStore, Tab } from '../state/workspaceStore';

interface RequestItemProps {
  tab: Tab;
  isActive: boolean;
  onClick: () => void;
}

const RequestItem = React.memo(({ tab, isActive, onClick }: RequestItemProps) => {
  return (
    <div
      className={`request-item ${isActive ? 'active' : ''}`}
      onClick={onClick}
    >
      <span className={`method-badge ${tab.type}`}>{tab.type.toUpperCase()}</span>
      <span className="request-name">{tab.name}</span>
    </div>
  );
});

export const VirtualRequestList: React.FC = () => {
  const tabs = useWorkspaceStore((state) => state.tabs);
  const activeTabId = useWorkspaceStore((state) => state.activeTabId);
  const setActiveTab = useWorkspaceStore((state) => state.setActiveTab);

  return (
    <div style={{ height: '100%', width: '100%' }}>
      <Virtuoso
        style={{ height: '100%' }}
        data={tabs}
        itemContent={(index, tab) => (
          <RequestItem
            tab={tab}
            isActive={activeTabId === tab.id}
            onClick={() => setActiveTab(tab.id)}
          />
        )}
      />
    </div>
  );
};
