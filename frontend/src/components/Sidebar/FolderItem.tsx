import React, { useState, memo } from 'react';
import { ChevronRight, Folder, FolderOpen, Plus, FolderPlus, Trash2, Edit2 } from 'lucide-react';
import { CollectionNode } from '../../types';
import { TreeItem } from './TreeItem';
import { useStore } from '../../state/store';
import { ContextMenu, MenuItem } from '../common/ContextMenu';

interface FolderItemProps {
  node: CollectionNode;
  indent: number;
}

const FolderItemComponent: React.FC<FolderItemProps> = ({ node, indent }) => {
  const isExpanded = useStore((state) => state.expandedIds.has(node.id));
  const toggleExpand = useStore((state) => state.toggleExpand);
  const createFile = useStore((state) => state.createFile);
  const createFolder = useStore((state) => state.createFolder);
  const renameItem = useStore((state) => state.renameItem);
  const deleteItem = useStore((state) => state.deleteItem);
  const [contextMenu, setContextMenu] = useState<{ x: number, y: number } | null>(null);

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY });
  };

  const menuItems: MenuItem[] = [
    { 
      label: 'New Request', 
      icon: <Plus size={14} />, 
      onClick: async () => {
        const name = window.prompt('Enter request name:', 'Untitled Request');
        if (name && name.trim() !== '') {
          await createFile(node.id, name.trim());
        }
      } 
    },
    { 
      label: 'New Folder', 
      icon: <FolderPlus size={14} />, 
      onClick: async () => {
        const name = window.prompt('Enter folder name:', 'New Folder');
        if (name && name.trim() !== '') {
          await createFolder(node.id, name.trim());
        }
      } 
    },
    { 
      label: 'Rename', 
      icon: <Edit2 size={14} />, 
      onClick: async () => {
        const newName = window.prompt('Enter new folder name:', node.name);
        if (newName && newName.trim() !== '' && newName.trim() !== node.name) {
          const parts = node.id.split('/');
          parts[parts.length - 1] = newName.trim();
          const newPath = parts.join('/');
          await renameItem(node.id, newPath);
        }
      } 
    },
    { 
      label: 'Delete', 
      icon: <Trash2 size={14} />, 
      onClick: async () => {
        if (window.confirm(`Are you sure you want to delete ${node.name} and all its contents?`)) {
          await deleteItem(node.id);
        }
      }, 
      variant: 'danger' 
    },
  ];

  return (
    <>
      <TreeItem 
        indent={indent} 
        onClick={() => toggleExpand(node.id)}
        onContextMenu={handleContextMenu}
        className={`group font-bold tracking-tight text-[11px] ${isExpanded ? 'text-slate-200' : 'text-slate-500'}`}
      >
        <ChevronRight 
          size={14} 
          className={`transition-transform duration-300 ${isExpanded ? 'rotate-90 text-brand-primary' : 'text-slate-600 group-hover:text-slate-400'}`} 
        />
        <div className="relative">
          {isExpanded ? (
            <FolderOpen size={16} className="text-brand-primary animate-in zoom-in-95 duration-300" />
          ) : (
            <Folder size={16} className="text-slate-600 group-hover:text-brand-primary/60 transition-colors" />
          )}
          {isExpanded && <div className="absolute inset-0 bg-brand-primary/20 blur-md rounded-full -z-10 animate-pulse" />}
        </div>
        <span className="truncate uppercase tracking-wider">{node.name}</span>
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

export const FolderItem = memo(FolderItemComponent);
