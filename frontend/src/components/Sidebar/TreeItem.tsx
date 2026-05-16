import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface TreeItemProps {
  children: React.ReactNode;
  isActive?: boolean;
  onClick?: () => void;
  onContextMenu?: (e: React.MouseEvent) => void;
  className?: string;
  indent?: number;
}

const TreeItemBase: React.FC<TreeItemProps> = ({ 
  children, 
  isActive, 
  onClick, 
  onContextMenu,
  className,
  indent = 0
}) => {
  return (
    <div 
      onClick={onClick}
      onContextMenu={onContextMenu}
      className={cn(
        "group flex items-center gap-2 p-2 mx-1 rounded cursor-pointer select-none transition-all text-xs",
        isActive ? "bg-dark-800 text-brand-primary" : "text-slate-400 hover:bg-dark-900/50 hover:text-slate-200",
        className
      )}
      style={{ paddingLeft: `${(indent * 12) + 8}px` }}
    >
      {children}
    </div>
  );
};

export const TreeItem = React.memo(TreeItemBase);
