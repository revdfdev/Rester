import React, { useState } from 'react';
import { Monitor, Cpu, Code, Zap, Keyboard, Settings as SettingsIcon } from 'lucide-react';
import { Modal } from '../common/Modal';
import { useStore } from '../../state/store';
import { GeneralSettings } from './GeneralSettings';
import { EditorSettings } from './EditorSettings';
import { RequestSettings } from './RequestSettings';
import { ShortcutSection } from './ShortcutSection';
import { AdvancedSettings } from './AdvancedSettings';

type SettingCategory = 'general' | 'editor' | 'request' | 'shortcuts' | 'advanced';

export const SettingsModal: React.FC = () => {
  const isSettingsOpen = useStore((state) => state.isSettingsOpen);
  const setSettingsOpen = useStore((state) => state.setSettingsOpen);
  const [activeCategory, setActiveCategory] = useState<SettingCategory>('general');

  const categories = [
    { id: 'general', label: 'General', icon: Monitor },
    { id: 'editor', label: 'Editor', icon: Code },
    { id: 'request', label: 'Request', icon: Zap },
    { id: 'shortcuts', label: 'Shortcuts', icon: Keyboard },
    { id: 'advanced', label: 'Advanced', icon: Cpu },
  ] as const;

  const renderContent = () => {
    switch (activeCategory) {
      case 'general': return <GeneralSettings />;
      case 'editor': return <EditorSettings />;
      case 'request': return <RequestSettings />;
      case 'shortcuts': return <ShortcutSection />;
      case 'advanced': return <AdvancedSettings />;
      default: return null;
    }
  };

  return (
    <Modal
      isOpen={isSettingsOpen}
      onClose={() => setSettingsOpen(false)}
      title="Settings"
      maxWidth="4xl"
    >
      <div className="flex -m-8 h-[500px]">
        {/* Sidebar */}
        <div className="w-64 bg-dark-900/30 border-r border-dark-800 p-6 flex flex-col">
          <nav className="flex-1 space-y-1">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
                  activeCategory === cat.id 
                    ? 'bg-brand-primary text-dark-950 shadow-lg shadow-brand-primary/20' 
                    : 'text-slate-500 hover:bg-dark-800 hover:text-slate-300'
                }`}
              >
                <cat.icon size={18} />
                {cat.label}
              </button>
            ))}
          </nav>

          <div className="pt-6 border-t border-dark-800/50">
            <div className="flex items-center gap-2 px-4 py-2 bg-dark-950/40 rounded-lg border border-dark-800/50">
              <SettingsIcon size={14} className="text-slate-600" />
              <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest opacity-50">Rester v0.1.0</p>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <header className="mb-8">
            <h3 className="text-2xl font-black text-slate-100 uppercase tracking-tight flex items-center gap-3">
              {categories.find(c => c.id === activeCategory)?.label}
              <div className="h-1 flex-1 bg-gradient-to-r from-brand-primary/20 to-transparent rounded-full ml-4" />
            </h3>
          </header>
          {renderContent()}
        </div>
      </div>
    </Modal>
  );
};
