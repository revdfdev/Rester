import React, { useState } from 'react';
import { MethodUrlBar } from './MethodUrlBar';
import { KeyValueGrid } from './KeyValueGrid';
import { ScriptTabs } from './ScriptTabs';
import { BodyEditor } from './BodyEditor';
import { RequestNavigator } from '../../common/RequestNavigator';
import { useEditorStore } from '../../../state/editorStore';

type FormTab = 'params' | 'headers' | 'body' | 'scripts';

export const FormEditor: React.FC = () => {
  const { requestBlocks, activeBlockIndex, updateBlock } = useEditorStore();
  const [activeTab, setActiveTab] = useState<FormTab>('params');
  const activeBlock = requestBlocks[activeBlockIndex];

  if (!activeBlock) return (
    <div className="flex-1 flex items-center justify-center text-slate-500">
      No request selected
    </div>
  );

  return (
    <div className="flex-1 overflow-y-auto bg-[#0a0a0a] p-4 custom-scrollbar">
      <div className="flex flex-col gap-4 h-full">
        {/* Multi-request Navigator */}
        <RequestNavigator />

        {/* Method & URL Bar */}
        <MethodUrlBar />

        {/* Tabbed Interface (The "Middle" section) */}
        <div className="flex flex-col flex-1 min-h-0">
          <div className="flex items-center gap-6 border-b border-slate-800 mb-4">
            {(['params', 'headers', 'body', 'scripts'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-3 text-xs font-bold uppercase tracking-widest transition-all border-b-2 -mb-[2px] ${
                  activeTab === tab
                    ? 'border-blue-500 text-slate-200'
                    : 'border-transparent text-slate-500 hover:text-slate-300'
                }`}
              >
                {tab}
                {tab === 'params' && activeBlock.params.length > 0 && (
                  <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-slate-800 text-blue-400 text-[9px]">
                    {activeBlock.params.length}
                  </span>
                )}
                {tab === 'headers' && activeBlock.headers.length > 0 && (
                  <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-slate-800 text-blue-400 text-[9px]">
                    {activeBlock.headers.length}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="flex-1 animate-in fade-in slide-in-from-bottom-2 duration-300">
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
