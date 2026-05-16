import React, { useState } from 'react';
import { ChevronRight, Folder, FolderOpen, Plus, FolderPlus, Trash2, Edit2 } from 'lucide-react';
import { CollectionNode } from '../../types';
import { TreeItem } from './TreeItem';
import { useCollectionStore } from '../../state/collectionStore';
import { ContextMenu, MenuItem } from '../common/ContextMenu';

interface FolderItemProps {
  node: CollectionNode;
  indent: number;
}

const FolderItemBase: React.FC<FolderItemProps> = ({ node, indent }) => {
  const isExpanded = useCollectionStore((state) => state.expandedIds.has(node.id));
  const toggleExpand = useCollectionStore((state) => state.toggleExpand);
  const [contextMenu, setContextMenu] = useState<{ x: number, y: number } | null>(null);

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY });
  };

  const menuItems: MenuItem[] = [
    { label: 'New Request', icon: <Plus size={14} />, onClick: () => console.log('New Request') },
    { label: 'New Folder', icon: <FolderPlus size={14} />, onClick: () => console.log('New Folder') },
    { label: 'Rename', icon: <Edit2 size={14} />, onClick: () => console.log('Rename') },
    { label: 'Delete', icon: <Trash2 size={14} />, onClick: () => console.log('Delete'), variant: 'danger' },
  ];

  return (
    <>
      <TreeItem 
        indent={indent} 
        onClick={() => toggleExpand(node.id)}
        onContextMenu={handleContextMenu}
        className="font-medium tracking-tight"
      >
        <ChevronRight 
          size={14} 
          className={`transition-transform duration-200 ${isExpanded ? 'rotate-90 text-slate-400' : 'text-slate-600'}`} 
        />
        {isExpanded ? (
          <FolderOpen size={16} className="text-brand-primary/60" />
        ) : (
          <Folder size={16} className="text-brand-primary/40" />
        )}
        <span className="truncate">{node.name}</span>
      </TreeItem>

      {contextMenu && (
        <ContextMenu 
          x={contextMenu.x} 
          y={contextMenu.y} 
          items={menuItems} 
          onClose={() => setContextMenu(null)} 
        />
      )}
    </>
  );
};

export const FolderItem = React.memo(FolderItemBase);
