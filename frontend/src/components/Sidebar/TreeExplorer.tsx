import React, { memo } from 'react';
import { CollectionNode } from '../../types';
import { FolderItem } from './FolderItem';
import { FileItem } from './FileItem';
import { useStore } from '../../state/store';

interface TreeExplorerProps {
  nodes: CollectionNode[];
  indent?: number;
}

const TreeExplorerComponent: React.FC<TreeExplorerProps> = ({ nodes, indent = 0 }) => {
  const expandedIds = useStore((state) => state.expandedIds);

  return (
    <div className="flex flex-col py-1 animate-in fade-in duration-300">
      {nodes.map((node) => {
        const isFolder = node.type === 'folder' || node.type === 'collection';
        const isExpanded = isFolder && expandedIds.has(node.id);

        return (
          <React.Fragment key={`${node.type}-${node.id}-${node.name}`}>
            {isFolder ? (
              <FolderItem node={node} indent={indent} />
            ) : (
              <FileItem node={node} indent={indent} />
            )}
            
            {isFolder && isExpanded && node.children && (
              <TreeExplorer nodes={node.children} indent={indent + 1} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

export const TreeExplorer = memo(TreeExplorerComponent);
