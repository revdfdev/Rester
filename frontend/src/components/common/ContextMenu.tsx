import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

export interface MenuItem {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  variant?: 'default' | 'danger';
}

interface ContextMenuProps {
  x: number;
  y: number;
  items: MenuItem[];
  onClose: () => void;
}

export const ContextMenu: React.FC<ContextMenuProps> = ({ x, y, items, onClose }) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  return createPortal(
    <div 
      ref={menuRef}
      className="fixed z-[1000] bg-dark-900 border border-dark-800 rounded-lg shadow-2xl py-1 min-w-[160px] animate-in fade-in zoom-in duration-100"
      style={{ left: x, top: y }}
    >
      {items.map((item, index) => (
        <button
          key={index}
          onClick={(e) => {
            e.stopPropagation();
            item.onClick();
            onClose();
          }}
          className={`
            w-full flex items-center gap-3 px-3 py-1.5 text-xs transition-colors text-left
            ${item.variant === 'danger' 
              ? 'text-rose-400 hover:bg-rose-500/10' 
              : 'text-slate-300 hover:bg-dark-800 hover:text-slate-100'}
          `}
        >
          {item.icon && <span className="opacity-60">{item.icon}</span>}
          <span className="flex-1">{item.label}</span>
        </button>
      ))}
    </div>,
    document.body
  );
};
