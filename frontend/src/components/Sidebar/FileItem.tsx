import React, { useState, memo } from 'react';
import { FileText, Trash2, Edit2, Copy, Play, FolderOpen } from 'lucide-react';
import * as App from '../../wailsjs/go/main/App';
import { CollectionNode } from '../../types';
import { TreeItem } from './TreeItem';
import { useStore } from '../../state/store';
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

const FileItemComponent: React.FC<FileItemProps> = ({ node, indent }) => {
  const activeId = useStore((state) => state.activeId);
  const setActiveId = useStore((state) => state.setActiveId);
  const openFile = useStore((state) => state.openFile);
  const [contextMenu, setContextMenu] = useState<{ x: number, y: number } | null>(null);
  
  const isActive = activeId === node.id;

  const handleClick = () => {
    setActiveId(node.id);
    openFile(node.id, node.name);
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY });
  };

  const menuItems: MenuItem[] = [
    { label: 'Run Request', icon: <Play size={14} />, onClick: () => console.log('Run') },
    { label: 'Open in Explorer', icon: <FolderOpen size={14} />, onClick: () => (App as any).ShowInFolder(node.id) },
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
        className={`group font-medium tracking-tight text-[11px] ${isActive ? 'text-brand-primary' : 'text-slate-400'}`}
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {node.method ? (
            <span className={`text-[9px] font-black w-8 text-right tracking-tighter ${METHOD_COLORS[node.method] || 'text-slate-500'} ${isActive ? 'brightness-125' : ''}`}>
              {node.method}
            </span>
          ) : (
            <FileText size={14} className={`${isActive ? 'text-brand-primary' : 'text-slate-600 group-hover:text-slate-400'}`} />
          )}
          <span className={`truncate flex-1 transition-colors ${isActive ? 'font-bold' : 'group-hover:text-slate-200'}`}>
            {node.name}
          </span>
          {node.isDirty && (
            <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse flex-shrink-0" title="Unsaved changes"></div>
          )}
          {isActive && (
            <div className="w-1 h-4 bg-brand-primary rounded-full animate-in slide-in-from-right-1 duration-300" />
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

export const FileItem = memo(FileItemComponent);
