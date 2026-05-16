import React from 'react';
import { Copy, Download, FileJson, FileCode, Share2 } from 'lucide-react';
import { IconButton } from '../../common/IconButton';

interface ResponseActionsProps {
  onCopy: () => void;
  onExport: () => void;
  contentType?: string;
}

export const ResponseActions: React.FC<ResponseActionsProps> = ({ onCopy, onExport, contentType }) => {
  return (
    <div className="flex items-center gap-1">
      <IconButton 
        icon={<Copy size={16} />} 
        onClick={onCopy}
        size="sm"
        variant="ghost"
        className="text-slate-500 hover:text-brand-primary"
        title="Copy Body"
      />
      <IconButton 
        icon={<Download size={16} />} 
        onClick={onExport}
        size="sm"
        variant="ghost"
        className="text-slate-500 hover:text-brand-primary"
        title="Export to File"
      />
      <div className="h-4 w-px bg-dark-800 mx-1" />
      <IconButton 
        icon={<Share2 size={16} />} 
        onClick={() => {}} // Future: share to Rester Cloud or gist
        size="sm"
        variant="ghost"
        className="text-slate-500 hover:text-brand-primary"
        title="Share Response"
      />
    </div>
  );
};
