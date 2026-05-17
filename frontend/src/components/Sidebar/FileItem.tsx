import React, { useState, memo } from 'react';
import { FileText, Trash2, Edit2, Copy, Play, FolderOpen } from 'lucide-react';
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
  const showInFolder = useStore((state) => state.showInFolder);
  const renameItem = useStore((state) => state.renameItem);
  const deleteItem = useStore((state) => state.deleteItem);
  const createFile = useStore((state) => state.createFile);
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
    { 
      label: 'Run Request', 
      icon: <Play size={14} />, 
      onClick: async () => {
        setActiveId(node.id);
        await openFile(node.id, node.name);
        const storeState = useStore.getState();
        const doc = storeState.activeDocument;
        if (doc) {
          storeState.executeRequest(doc.id);
        }
      } 
    },
    { label: 'Open in Explorer', icon: <FolderOpen size={14} />, onClick: () => showInFolder(node.id) },
    { 
      label: 'Rename', 
      icon: <Edit2 size={14} />, 
      onClick: async () => {
        const newName = window.prompt('Enter new filename:', node.name.replace(/\.http$/, ''));
        if (newName && newName.trim() !== '') {
          const finalName = newName.trim().endsWith('.http') ? newName.trim() : newName.trim() + '.http';
          const parts = node.id.split('/');
          parts[parts.length - 1] = finalName;
          const newPath = parts.join('/');
          await renameItem(node.id, newPath);
        }
      } 
    },
    { 
      label: 'Duplicate', 
      icon: <Copy size={14} />, 
      onClick: async () => {
        try {
          const WorkspaceHandler = await import('../../wailsjs/go/handlers/WorkspaceHandler');
          const content = await WorkspaceHandler.ReadFile(node.id);
          const parts = node.id.split('/');
          const parentPath = parts.slice(0, -1).join('/');
          const oldName = parts[parts.length - 1].replace(/\.http$/, '');
          const newName = `${oldName}_Copy`;
          await createFile(parentPath, newName, content);
        } catch (e) {
          console.error("Failed to duplicate file", e);
        }
      } 
    },
    { 
      label: 'Delete', 
      icon: <Trash2 size={14} />, 
      onClick: async () => {
        if (window.confirm(`Are you sure you want to delete ${node.name}?`)) {
          await deleteItem(node.id);
        }
      }, 
      variant: 'danger' 
    },
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
