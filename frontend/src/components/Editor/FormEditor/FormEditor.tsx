import React, { useState, memo } from 'react';
import { MethodUrlBar } from './MethodUrlBar';
import { KeyValueGrid } from './KeyValueGrid';
import { ScriptTabs } from './ScriptTabs';
import { BodyEditor } from './BodyEditor';
import { RequestNavigator } from '../../common/RequestNavigator';
import { useStore } from '../../../state/store';

type FormTab = 'params' | 'headers' | 'body' | 'scripts';

const FormEditorComponent: React.FC = () => {
  const requestBlocks = useStore((state) => state.requestBlocks);
  const activeBlockIndex = useStore((state) => state.activeBlockIndex);
  const updateBlock = useStore((state) => state.updateBlock);
  const [activeTab, setActiveTab] = useState<FormTab>('params');
  
  const activeBlock = requestBlocks[activeBlockIndex];

  if (!activeBlock) return (
    <div className="flex-1 flex items-center justify-center text-slate-500 font-bold uppercase tracking-widest text-[10px] animate-pulse">
      No request selected
    </div>
  );

  return (
    <div className="flex-1 overflow-y-auto bg-dark-950 p-6 custom-scrollbar">
      <div className="flex flex-col gap-8 h-full max-w-5xl mx-auto">
        {/* Multi-request Navigator */}
        <RequestNavigator />

        {/* Method & URL Bar */}
        <MethodUrlBar />

        {/* Tabbed Interface (The "Middle" section) */}
        <div className="flex flex-col flex-1 min-h-0">
          <div className="flex items-center gap-8 border-b border-dark-800 mb-6">
            {(['params', 'headers', 'body', 'scripts'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`relative pb-4 text-[10px] font-black uppercase tracking-[0.2em] transition-all group ${
                  activeTab === tab ? 'text-brand-primary' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                <span className="relative z-10 flex items-center gap-2">
                  {tab}
                  {tab === 'params' && activeBlock.params.length > 0 && (
                    <span className={`px-1.5 py-0.5 rounded-md text-[8px] font-black ${
                      activeTab === tab ? 'bg-brand-primary text-dark-950' : 'bg-dark-800 text-slate-500 group-hover:text-slate-300'
                    }`}>
                      {activeBlock.params.length}
                    </span>
                  )}
                  {tab === 'headers' && activeBlock.headers.length > 0 && (
                    <span className={`px-1.5 py-0.5 rounded-md text-[8px] font-black ${
                      activeTab === tab ? 'bg-brand-primary text-dark-950' : 'bg-dark-800 text-slate-500 group-hover:text-slate-300'
                    }`}>
                      {activeBlock.headers.length}
                    </span>
                  )}
                </span>
                {activeTab === tab && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-primary shadow-[0_0_8px_rgba(56,189,248,0.5)] animate-in fade-in slide-in-from-bottom-1 duration-300" />
                )}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="flex-1 animate-in fade-in slide-in-from-bottom-2 duration-500">
            {activeTab === 'params' && (
              <KeyValueGrid
                title="Query Parameters"
                data={activeBlock.params}
                onChange={(params) => updateBlock(activeBlockIndex, { params })}
              />
            )}

            {activeTab === 'headers' && (
              <KeyValueGrid
                title="Headers"
                data={activeBlock.headers}
                onChange={(headers) => updateBlock(activeBlockIndex, { headers })}
              />
            )}

            {activeTab === 'body' && (
              <BodyEditor />
            )}

            {activeTab === 'scripts' && (
              <ScriptTabs />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export const FormEditor = memo(FormEditorComponent);
