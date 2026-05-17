import React from 'react';
import { useStore, useTheme, useActiveTab } from './state/store';
import { Layout } from './components/Layout/Layout';
import { RequestEditor } from './components/Editor/RequestEditor';
import { ResponseViewer } from './components/Editor/ResponseViewer';
import { WelcomeScreen } from './components/Editor/WelcomeScreen';
import { initSettingsPersistence } from './utils/config-bridge';
import { initHistoryPersistence } from './utils/history-persistence';
import { SettingsModal } from './components/Settings/SettingsModal';
import { EnvironmentModal } from './components/Settings/EnvironmentModal';
import { RecentWorkspacesModal } from './components/Settings/RecentWorkspacesModal';

import { EventsOn } from './wailsjs/runtime/runtime';

const App: React.FC = () => {
  // Unified store selectors
  const tabs = useStore((state) => state.tabs);
  const activeTabId = useStore((state) => state.activeTabId);
  const setActiveTab = useStore((state) => state.setActiveTab);
  const closeTab = useStore((state) => state.closeTab);
  const saveTab = useStore((state) => state.saveTab);
  const isSettingsOpen = useStore((state) => state.isSettingsOpen);
  const isRecentWorkspacesOpen = useStore((state) => state.isRecentWorkspacesOpen);
  const setRecentWorkspacesOpen = useStore((state) => state.setRecentWorkspacesOpen);
  const activeTab = useActiveTab();
  const updateTabContent = useStore((state) => state.updateTabContent);
  const theme = useTheme();
  const activeDocument = useStore((state) => state.activeDocument);
  const storeExecuteRequest = useStore((state) => state.executeRequest);
  const storeCancelRequest = useStore((state) => state.cancelRequest);
  const executionLoading = useStore((state) => state.executionLoading);

  // Self-heal/lazy-initialize active document state if activeTabId is set but activeDocument is missing
  React.useEffect(() => {
    if (activeTabId && !activeDocument) {
      setActiveTab(activeTabId);
    }
  }, [activeTabId, activeDocument, setActiveTab]);

  const loadRecentWorkspaces = useStore((state) => state.loadRecentWorkspaces);
  const loadWindowState = useStore((state) => state.loadWindowState);
  const saveWindowState = useStore((state) => state.saveWindowState);

  React.useEffect(() => {
    initSettingsPersistence();
    initHistoryPersistence();
    loadRecentWorkspaces();
    loadWindowState();

    // Watch for external workspace directory updates dynamically
    const unsubscribeWatcher = EventsOn('workspace:changed', () => {
      useStore.getState().loadCollections();
    });

    let resizeTimeout: any;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        // Wails window size state:
        const width = window.innerWidth;
        const height = window.innerHeight;
        const isMaximized = window.outerWidth === window.screen.availWidth && window.outerHeight === window.screen.availHeight;
        saveWindowState(width, height, isMaximized);
      }, 500);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(resizeTimeout);
      unsubscribeWatcher();
    };
  }, [loadRecentWorkspaces, loadWindowState, saveWindowState]);

  // Theme synchronization
  React.useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      root.classList.add(systemTheme);
    } else {
      root.classList.add(theme);
    }
  }, [theme]);

  // Global Keyboard Shortcuts
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl + Enter: Execute Active Request
      if (e.ctrlKey && e.key === 'Enter') {
        e.preventDefault();
        const doc = useStore.getState().activeDocument;
        if (doc && !executionLoading[doc.id]) {
          storeExecuteRequest(doc.id);
        }
        return;
      }

      // Escape: Cancel Active Request
      if (e.key === 'Escape') {
        const doc = useStore.getState().activeDocument;
        if (doc && executionLoading[doc.id]) {
          e.preventDefault();
          storeCancelRequest(doc.id);
        }
        return;
      }

      if (!e.ctrlKey) return;

      // Ctrl + W: Close Active Tab
      if (e.key === 'w' || e.key === 'W') {
        e.preventDefault();
        if (activeTabId) closeTab(activeTabId);
      }

      // Ctrl + S: Save Active Tab
      if (e.key === 's' || e.key === 'S') {
        e.preventDefault();
        if (activeTabId) saveTab(activeTabId);
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
  }, [tabs, activeTabId, setActiveTab, closeTab, storeExecuteRequest, storeCancelRequest, executionLoading]);

  return (
    <>
      <Layout responseArea={<ResponseViewer />}>
      {activeTab ? (
        <RequestEditor 
          content={activeTab.content || ''} 
          onChange={(val) => updateTabContent(activeTab.id, val)} 
        />
      ) : (
        <WelcomeScreen />
      )}
      </Layout>
      <SettingsModal />
      <EnvironmentModal />
      <RecentWorkspacesModal 
        isOpen={isRecentWorkspacesOpen} 
        onClose={() => setRecentWorkspacesOpen(false)} 
      />
    </>
  );
};

export default App;
