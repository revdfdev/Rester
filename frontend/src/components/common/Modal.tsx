import React from 'react';
import { X } from 'lucide-react';
import { IconButton } from './IconButton';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '4xl';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  maxWidth = '2xl',
}) => {
  if (!isOpen) return null;

  const maxWidths = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '4xl': 'max-w-4xl',
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 p-4">
      <div 
        className={`w-full ${maxWidths[maxWidth]} bg-dark-950 border border-dark-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 max-h-full`}
        onClick={(e) => e.stopPropagation()}
      >
        <header className="p-6 flex items-center justify-between border-b border-dark-800 flex-shrink-0">
          <h3 className="text-lg font-black text-slate-100 uppercase tracking-tight">
            {title}
          </h3>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-dark-800 text-slate-500 hover:text-slate-200 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </header>

        <main className="flex-1 overflow-y-auto p-8 custom-scrollbar min-h-0">
          {children}
        </main>

        {footer && (
          <footer className="p-6 border-t border-dark-800 bg-dark-900/50 flex items-center justify-end gap-3 flex-shrink-0">
            {footer}
          </footer>
        )}
      </div>
    </div>
  );
};
