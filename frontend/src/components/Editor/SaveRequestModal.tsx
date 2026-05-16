import React, { useState } from 'react';
import { X, Folder, Search } from 'lucide-react';
import { Modal } from '../common/Modal';
import { useStore } from '../../state/store';
import { CollectionNode } from '../../types';

interface SaveRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialName?: string;
}

export const SaveRequestModal: React.FC<SaveRequestModalProps> = ({ isOpen, onClose, initialName = '' }) => {
  const [name, setName] = useState(initialName);
  const [search, setSearch] = useState('');
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const collections = useStore((state) => state.collections);
  const createFile = useStore((state) => state.createFile);
  const activeTabId = useStore((state) => state.activeTabId);
  const closeTab = useStore((state) => state.closeTab);

  // Recursively find folders
  const getAllFolders = (nodes: CollectionNode[]): { id: string, name: string }[] => {
    let folders: { id: string, name: string }[] = [];
    nodes.forEach(node => {
      if (node.type === 'folder' || node.type === 'collection') {
        folders.push({ id: node.id, name: node.name });
        if (node.children) {
          folders = [...folders, ...getAllFolders(node.children)];
        }
      }
    });
    return folders;
  };

  const folders = getAllFolders(collections).filter(f => f.name.toLowerCase().includes(search.toLowerCase()));

  const handleSave = async () => {
    if (!selectedFolder || !name) return;
    
    // Create the file
    await createFile(selectedFolder, name);
    
    // Close the old "New Request" tab if it matches
    if (activeTabId && activeTabId.startsWith('new-')) {
      closeTab(activeTabId);
    }
    
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Save Request">
      <div className="flex flex-col gap-6">
        <div>
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 block">
            Request Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-dark-800 border border-dark-700 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-brand-primary transition-colors"
            placeholder="e.g. Get User Profile"
            autoFocus
          />
        </div>

        <div className="flex flex-col gap-3">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block">
            Select Collection / Folder
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-dark-900 border border-dark-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-400 focus:outline-none focus:border-brand-primary/50 transition-colors"
              placeholder="Search folders..."
            />
          </div>
          
          <div className="max-h-60 overflow-y-auto bg-dark-950/50 rounded-xl border border-dark-800 flex flex-col p-1">
            {folders.map((folder) => (
              <button
                key={folder.id}
                onClick={() => setSelectedFolder(folder.id)}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-left text-xs transition-all ${
                  selectedFolder === folder.id 
                    ? 'bg-brand-primary/10 text-brand-primary shadow-sm border border-brand-primary/20' 
                    : 'text-slate-400 hover:bg-dark-800 hover:text-slate-200 border border-transparent'
                }`}
              >
                <Folder size={14} className={selectedFolder === folder.id ? 'text-brand-primary' : 'text-slate-500'} />
                <span className="truncate">{folder.name}</span>
              </button>
            ))}
            {folders.length === 0 && (
              <div className="p-4 text-center text-xs text-slate-600">
                No folders found. Please open a workspace first.
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:text-slate-200 hover:bg-dark-800 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!selectedFolder || !name}
            className="px-8 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest bg-brand-primary text-white shadow-lg shadow-brand-primary/20 hover:brightness-110 active:scale-95 disabled:opacity-50 disabled:pointer-events-none transition-all"
          >
            Save to Collection
          </button>
        </div>
      </div>
    </Modal>
  );
};
