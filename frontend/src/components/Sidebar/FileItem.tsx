import React, { useState } from 'react';
import { FileText, Trash2, Edit2, Copy, Play } from 'lucide-react';
import { CollectionNode } from '../../types';
import { TreeItem } from './TreeItem';
import { useCollectionStore } from '../../state/collectionStore';
import { useWorkspaceStore } from '../../state/workspaceStore';
import { ContextMenu, MenuItem } from '../common/ContextMenu';

interface FileItemProps {
  node: CollectionNode;
  indent: number;
}

const METHOD_COLORS: Record<string, string> = {
  GET: 'text-emerald-500',
  POST: 'text-amber-500',
  PUT: 'text-brand-primary',
  PATCH: 'text-indigo-400',
  DELETE: 'text-rose-500',
};

const FileItemBase: React.FC<FileItemProps> = ({ node, indent }) => {
  const activeId = useCollectionStore((state) => state.activeId);
  const setActiveId = useCollectionStore((state) => state.setActiveId);
  const addTab = useWorkspaceStore((state) => state.addTab);
  const [contextMenu, setContextMenu] = useState<{ x: number, y: number } | null>(null);
  
  const isActive = activeId === node.id;

  const handleClick = () => {
    setActiveId(node.id);
    addTab({
      id: node.id,
      name: node.name,
      path: node.id, // Assuming ID is path for now
      type: 'http',
      isDirty: !!node.isDirty
    });
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY });
  };

  const menuItems: MenuItem[] = [
    { label: 'Run Request', icon: <Play size={14} />, onClick: () => console.log('Run') },
    { label: 'Rename', icon: <Edit2 size={14} />, onClick: () => console.log('Rename') },
    { label: 'Duplicate', icon: <Copy size={14} />, onClick: () => console.log('Duplicate') },
    { label: 'Delete', icon: <Trash2 size={14} />, onClick: () => console.log('Delete'), variant: 'danger' },
  ];

  return (
    <>
      <TreeItem 
        isActive={isActive}
        indent={indent + 1}
        onClick={handleClick}
        onContextMenu={handleContextMenu}
      >
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {node.method ? (
            <span className={`text-[9px] font-black w-7 text-right ${METHOD_COLORS[node.method] || 'text-slate-500'}`}>
              {node.method}
            </span>
          ) : (
            <FileText size={14} className="text-slate-500" />
          )}
          <span className="truncate flex-1">{node.name}</span>
          {node.isDirty && (
            <div className="w-1.5 h-1.5 rounded-full bg-amber-500/50 flex-shrink-0" title="Unsaved changes"></div>
          )}
        </div>
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

export const FileItem = React.memo(FileItemBase);
