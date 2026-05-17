import React, { memo } from 'react';
import { Save, Code } from 'lucide-react';
import { ModeToggle } from './ModeToggle';
import { VisualBuilder } from '../VisualBuilder/VisualBuilder';
import { SourceView } from './SourceView';
import { EnvironmentSelector } from '../Header/EnvironmentSelector';
import { useStore, useEditorSettings } from '../../state/store';
import { IconButton } from '../common/IconButton';
import { SaveRequestModal } from './SaveRequestModal';

interface RequestEditorProps {
  content: string;
  onChange: (value: string) => void;
}

const RequestEditorComponent: React.FC<RequestEditorProps> = ({ content, onChange }) => {
  const mode = useStore((state) => state.editorMode);
  const activeTabId = useStore((state) => state.activeTabId);
  const activeTab = useStore((state) => state.tabs.find(t => t.id === activeTabId));
  const saveTab = useStore((state) => state.saveTab);
  const [isSaveModalOpen, setIsSaveModalOpen] = React.useState(false);
  const editorSettings = useEditorSettings();

  return (
    <div className="h-full flex flex-col bg-dark-900 overflow-hidden">
      {/* Editor Toolbar */}
      <div className="h-14 px-6 flex items-center justify-between border-b border-dark-800 bg-dark-950/50 backdrop-blur-xl sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3 text-[10px] font-black tracking-[0.2em] text-slate-500 uppercase">
            <div className="p-1.5 bg-brand-primary/10 rounded-lg text-brand-primary">
              <Code size={16} />
            </div>
            <span>Request Editor</span>
          </div>
          <div className="h-6 w-px bg-dark-800" />
          <ModeToggle />
        </div>

        <div className="flex items-center gap-4">
          <EnvironmentSelector />
          <div className="h-6 w-px bg-dark-800" />
          <IconButton 
            icon={<Save size={18} />} 
            size="sm" 
            variant="secondary"
            className="rounded-xl px-4 hover:text-brand-primary group transition-all"
            title="Save (Ctrl+S)"
            onClick={() => {
              if (activeTab && !activeTab.path) {
                setIsSaveModalOpen(true);
              } else if (activeTabId) {
                saveTab(activeTabId);
              }
            }}
          />
        </div>
      </div>

      <SaveRequestModal 
        isOpen={isSaveModalOpen} 
        onClose={() => setIsSaveModalOpen(false)} 
        initialName={activeTab?.name === 'New Request' ? '' : activeTab?.name}
      />

      {/* Editor Content */}
      <div className="flex-1 overflow-hidden relative">
        <div className={`h-full transition-all duration-500 ${mode === 'form' ? 'animate-in fade-in zoom-in-95' : 'animate-in fade-in slide-in-from-right-4'}`}>
          {mode === 'form' ? (
            <VisualBuilder />
          ) : (
            <SourceView content={content} onChange={onChange} />
          )}
        </div>
      </div>
    </div>
  );
};

export const RequestEditor = memo(RequestEditorComponent);
