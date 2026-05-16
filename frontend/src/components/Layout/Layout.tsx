import React from 'react';
import { Panel, Group as PanelGroup, Separator as PanelResizeHandle } from 'react-resizable-panels';
import { Sidebar } from '../Sidebar/Sidebar';
import { StatusBar } from '../Status/StatusBar';
import { TabBar } from '../Editor/TabBar';

interface LayoutProps {
  children: React.ReactNode;
  responseArea?: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children, responseArea }) => {
  return (
    <div className="fixed inset-0 overflow-hidden bg-dark-950 text-slate-200 flex flex-col">
      <div className="flex-1 relative w-full h-full">
        <PanelGroup
          id="main-layout"
          orientation="horizontal"
          className="h-full w-full"
        >
          {/* Sidebar Panel */}
          <Panel id="sidebar" defaultSize={40}>
            <Sidebar />
          </Panel>

          <PanelResizeHandle className="w-1 bg-dark-900 hover:bg-brand-primary/40 transition-colors cursor-col-resize z-50 relative group">
            <div className="absolute inset-y-0 -left-2 -right-2 cursor-col-resize" />
            <div className="absolute inset-y-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 w-[1px] h-4 bg-dark-700 group-hover:bg-brand-primary/60" />
          </PanelResizeHandle>

          {/* Main Workspace Panel */}
          <Panel id="workspace" defaultSize={80}>
            <div className="flex flex-col h-full w-full bg-dark-900/30">
              <TabBar />

              <div className="flex-1 relative overflow-hidden">
                <PanelGroup
                  id="content-layout"
                  orientation="vertical"
                  style={{ height: '100%', width: '100%' }}
                >
                  {/* Editor Area */}
                  <Panel id="editor" defaultSize={60} minSize={20}>
                    <main className="h-full w-full relative overflow-hidden">
                      {children}
                    </main>
                  </Panel>

                  <PanelResizeHandle className="h-1 bg-dark-900 hover:bg-brand-primary/40 transition-colors cursor-row-resize z-50 relative group">
                    <div className="absolute inset-x-0 -top-2 -bottom-2 cursor-row-resize" />
                    <div className="absolute inset-x-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 h-[1px] w-4 bg-dark-700 group-hover:bg-brand-primary/60" />
                  </PanelResizeHandle>

                  {/* Response Area */}
                  <Panel id="response" defaultSize={40} minSize={10}>
                    <section className="h-full w-full bg-dark-950 border-t border-dark-800 flex flex-col">
                      {responseArea || (
                        <div className="flex-1 flex items-center justify-center text-slate-600 italic text-sm">
                          Send a request to see the response...
                        </div>
                      )}
                    </section>
                  </Panel>
                </PanelGroup>
              </div>
            </div>
          </Panel>
        </PanelGroup>
      </div>

      <StatusBar />
    </div>
  );
};
