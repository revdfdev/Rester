import React from 'react';
import { CollectionNode } from '../../types';
import { FolderItem } from './FolderItem';
import { FileItem } from './FileItem';
import { useCollectionStore } from '../../state/collectionStore';

interface TreeExplorerProps {
  nodes: CollectionNode[];
  indent?: number;
}

export const TreeExplorer: React.FC<TreeExplorerProps> = ({ nodes, indent = 0 }) => {
  const expandedIds = useCollectionStore((state) => state.expandedIds);

  return (
    <div className="flex flex-col py-1">
      {nodes.map((node) => {
        const isFolder = node.type === 'folder';
        const isExpanded = isFolder && expandedIds.has(node.id);

        return (
          <React.Fragment key={node.id}>
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
