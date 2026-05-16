import React from 'react';
import { useWorkspaceStore } from './state/workspaceStore';
import { Layout } from './components/Layout/Layout';
import { RequestEditor } from './components/Editor/RequestEditor';
import { ResponseViewer } from './components/Editor/ResponseViewer';

const App: React.FC = () => {
  const tabs = useWorkspaceStore((state) => state.tabs);
  const activeTabId = useWorkspaceStore((state) => state.activeTabId);
  const setActiveTab = useWorkspaceStore((state) => state.setActiveTab);
  const closeTab = useWorkspaceStore((state) => state.closeTab);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!e.ctrlKey) return;

      // Ctrl + W: Close Active Tab
      if (e.key === 'w' || e.key === 'W') {
        e.preventDefault();
        if (activeTabId) closeTab(activeTabId);
      }

      // Ctrl + Tab / Ctrl + Shift + Tab: Cycle Tabs
      if (e.key === 'Tab') {
        e.preventDefault();
        if (tabs.length <= 1) return;
        
        const currentIndex = tabs.findIndex(t => t.id === activeTabId);
        const direction = e.shiftKey ? -1 : 1;
        const nextIndex = (currentIndex + direction + tabs.length) % tabs.length;
        setActiveTab(tabs[nextIndex].id);
      }

      // Ctrl + 1-9: Switch to Tab by Index
      if (/^[1-9]$/.test(e.key)) {
        const index = parseInt(e.key) - 1;
        if (tabs[index]) {
          e.preventDefault();
          setActiveTab(tabs[index].id);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [tabs, activeTabId, setActiveTab, closeTab]);

  return (
    <Layout responseArea={<ResponseViewer />}>
      {activeTabId ? (
        <RequestEditor 
          content={`// Content for ${activeTabId}`} 
          onChange={(val) => console.log(val)} 
        />
      ) : (
        <div className="h-full flex flex-col items-center justify-center p-8 text-center bg-dark-900/50">
          <div className="w-16 h-16 bg-brand-primary/10 rounded-2xl flex items-center justify-center mb-6 border border-brand-primary/20">
             <div className="w-8 h-8 bg-brand-primary rounded-lg shadow-[0_0_20px_rgba(56,189,248,0.4)]"></div>
          </div>
          <h1 className="text-2xl font-bold text-slate-200 mb-2 tracking-tight">Ready to Request</h1>
          <p className="text-slate-500 max-w-sm text-sm leading-relaxed">
            Select a request from the sidebar or press <kbd className="bg-dark-800 px-1.5 py-0.5 rounded border border-dark-700 text-xs text-slate-400 font-sans mx-1">Ctrl+N</kbd> to create a new session.
          </p>
        </div>
      )}
    </Layout>
  );
};

export default App;
