import React, { useState } from 'react';
import { Copy, Globe, Clock, HardDrive, Share2 } from 'lucide-react';
import { useExecutionStore } from '../../state/executionStore';
import { useEditorStore } from '../../state/editorStore';
import { PrettyView } from './ResponseViewer/PrettyView';
import { RawView } from './ResponseViewer/RawView';
import { HeaderGrid } from './ResponseViewer/HeaderGrid';
import { CookieTable } from './ResponseViewer/CookieTable';
import { TimingChart } from './ResponseViewer/TimingChart';

type ViewMode = 'pretty' | 'raw' | 'headers' | 'cookies' | 'timing';

export const ResponseViewer: React.FC = () => {
  const { requestBlocks, activeBlockIndex } = useEditorStore();
  const { results, loading } = useExecutionStore();
  const [activeMode, setActiveMode] = useState<ViewMode>('pretty');

  const activeBlock = requestBlocks[activeBlockIndex];
  if (!activeBlock) return null;

  const result = results[activeBlock.id];
  const isLoading = loading[activeBlock.id];

  if (isLoading) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-[#0a0a0a] text-slate-500">
        <div className="flex flex-col items-center gap-4 animate-pulse">
          <div className="w-12 h-12 rounded-full border-4 border-blue-500/20 border-t-blue-500 animate-spin" />
          <span className="text-xs font-bold uppercase tracking-widest">Executing...</span>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-[#0a0a0a] text-slate-700">
        <Globe size={48} className="mb-4 opacity-20" />
        <span className="text-sm font-medium italic">Send a request to see the response</span>
      </div>
    );
  }

  const getStatusColor = (status: number) => {
    if (status >= 200 && status < 300) return 'text-emerald-500';
    if (status >= 400) return 'text-rose-500';
    return 'text-amber-500';
  };

  const copyFullResponse = () => {
    const full = `Status: ${result.status} ${result.statusText}\n\nHeaders:\n${Object.entries(result.headers).map(([k, v]) => `${k}: ${v}`).join('\n')}\n\nBody:\n${result.body}`;
    navigator.clipboard.writeText(full);
  };

  return (
    <div className="h-full flex flex-col bg-[#0a0a0a] border-t border-slate-800">
      {/* Response Header (Metadata) */}
      <div className="h-10 px-4 flex items-center justify-between border-b border-slate-800 bg-slate-900/40">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <span className={`text-xs font-bold ${getStatusColor(result.status)}`}>
              {result.status} {result.statusText}
            </span>
            <div className="h-3 w-px bg-slate-800" />
            <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-medium">
              <Clock size={12} className="text-slate-600" />
              <span>{result.timing.total}ms</span>
            </div>
            <div className="h-3 w-px bg-slate-800" />
            <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-medium">
              <HardDrive size={12} className="text-slate-600" />
              <span>{new Blob([result.body]).size} bytes</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button 
            onClick={copyFullResponse}
            className="flex items-center gap-2 px-3 py-1 hover:bg-slate-800 rounded text-slate-500 hover:text-slate-300 transition-colors text-[10px] font-bold uppercase tracking-tight"
            title="Copy Full Response"
          >
            <Share2 size={12} />
            Copy All
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <div className="flex border-b border-slate-800 bg-slate-900/20 px-2 overflow-x-auto no-scrollbar">
          {(['pretty', 'raw', 'headers', 'cookies', 'timing'] as ViewMode[]).map((mode) => (
            <button
              key={mode}
              onClick={() => setActiveMode(mode)}
              className={`px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider transition-all border-b-2 whitespace-nowrap ${
                activeMode === mode 
                ? 'text-blue-500 border-blue-500 bg-blue-500/5' 
                : 'text-slate-500 border-transparent hover:text-slate-300'
              }`}
            >
              {mode}
              {mode === 'cookies' && result.cookies.length > 0 && (
                <span className="ml-1.5 px-1 bg-blue-500/20 text-blue-400 rounded-sm text-[8px]">{result.cookies.length}</span>
              )}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-hidden relative">
          {activeMode === 'pretty' && (
            <PrettyView content={result.body} contentType={result.headers['Content-Type']} />
          )}
          
          {activeMode === 'raw' && (
            <RawView content={result.body} />
          )}

          {activeMode === 'headers' && (
            <HeaderGrid headers={result.headers} />
          )}

          {activeMode === 'cookies' && (
            <CookieTable cookies={result.cookies} />
          )}

          {activeMode === 'timing' && (
            <TimingChart timing={result.timing.detailed} total={result.timing.total} />
          )}
        </div>
      </div>
    </div>
  );
};
