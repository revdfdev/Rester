import React, { useState, memo, useMemo } from 'react';
import { Globe, Clock, HardDrive, Share2, Loader2, Copy, Check, XCircle, Database } from 'lucide-react';
import { useStore } from '../../state/store';
import { PrettyView } from './ResponseViewer/PrettyView';
import { RawView } from './ResponseViewer/RawView';
import { JsonTreeView } from './ResponseViewer/JsonTreeView';
import { HeaderGrid } from './ResponseViewer/HeaderGrid';
import { CookieTable } from './ResponseViewer/CookieTable';
import { TimingChart } from './ResponseViewer/TimingChart';
import { ResponseActions } from './ResponseViewer/ResponseActions';
import { Badge } from '../common/Badge';
import { IconButton } from '../common/IconButton';

type ViewMode = 'tree' | 'pretty' | 'raw' | 'headers' | 'cookies' | 'timing' | 'logs';

const ResponseViewerComponent: React.FC = () => {
  const requestBlocks = useStore((state) => state.requestBlocks);
  const activeBlockIndex = useStore((state) => state.activeBlockIndex);
  const executionResults = useStore((state) => state.executionResults);
  const executionLoading = useStore((state) => state.executionLoading);
  const executionErrors = useStore((state) => state.executionErrors);
  
  const [activeMode, setActiveMode] = useState<ViewMode>('tree');
  const [copied, setCopied] = useState(false);

  const activeBlock = requestBlocks[activeBlockIndex];
  const result = activeBlock ? executionResults[activeBlock.id] : null;
  const isLoading = activeBlock ? executionLoading[activeBlock.id] : false;
  const error = activeBlock ? executionErrors[activeBlock.id] : null;

  // Memoize body parsing for Tree view - must be above early return
  const parsedBody = useMemo(() => {
    if (!result?.body) return null;
    try {
      return JSON.parse(result.body);
    } catch (e) {
      return null;
    }
  }, [result?.body]);

  const bodySize = useMemo(() => {
    if (!result?.body) return '0 B';
    const bytes = new Blob([result.body]).size;
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }, [result?.body]);

  if (!activeBlock) return null;

  const getStatusColor = (status: number) => {
    if (status >= 200 && status < 300) return 'text-emerald-500';
    if (status >= 400 && status < 500) return 'text-amber-500';
    if (status >= 500) return 'text-rose-500';
    return 'text-slate-400';
  };

  const handleCopyBody = () => {
    if (!result) return;
    navigator.clipboard.writeText(result.body);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExport = async () => {
    if (!result) return;
    // @ts-ignore
    const path = await window.go.main.App.SaveFileDialog('response.json');
    if (path) {
      // @ts-ignore
      await window.go.main.App.SaveFile(path, result.body);
    }
  };

  if (isLoading) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-dark-950 text-slate-500">
        <div className="flex flex-col items-center gap-6 animate-in fade-in duration-500">
          <div className="relative">
            <Loader2 className="w-16 h-16 text-brand-primary animate-spin" />
            <div className="absolute inset-0 bg-brand-primary/20 blur-2xl rounded-full -z-10 animate-pulse" />
          </div>
          <div className="flex flex-col items-center gap-1">
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-primary">Executing</span>
            <span className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">Awaiting Remote Response</span>
          </div>
          <button 
            onClick={() => {
              // @ts-ignore
              window.go.main.App.CancelRequest(activeBlock.id);
            }}
            className="px-6 py-2 bg-dark-900 hover:bg-rose-950/30 text-rose-500 text-[10px] font-black uppercase tracking-widest rounded-xl border border-rose-500/20 transition-all duration-300"
          >
            Cancel Request
          </button>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-rose-950/20 text-rose-500 border-t border-dark-800">
        <div className="flex flex-col items-center gap-6 animate-in fade-in zoom-in-95 duration-500">
          <div className="w-16 h-16 bg-rose-900/30 rounded-full flex items-center justify-center border border-rose-500/30">
            <XCircle size={32} className="text-rose-500" />
          </div>
          <div className="flex flex-col items-center gap-2 max-w-md text-center">
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-rose-500">Execution Failed</span>
            <span className="text-sm font-medium text-rose-400/80">{error}</span>
          </div>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-dark-950/50 text-slate-700">
        <div className="w-24 h-24 bg-dark-900 rounded-full flex items-center justify-center mb-8 border border-dark-800 shadow-inner group">
          <Globe size={48} className="opacity-10 group-hover:opacity-30 group-hover:scale-110 transition-all duration-700" />
        </div>
        <div className="text-center space-y-2">
          <span className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-600">Response Engine Idle</span>
          <span className="block text-xs font-medium italic text-slate-700">Send a request to see the live output</span>
        </div>
      </div>
    );
  }

  const modes: { id: ViewMode; label: string; count?: number; disabled?: boolean }[] = [
    { id: 'tree', label: 'Tree', disabled: !parsedBody },
    { id: 'pretty', label: 'Pretty' },
    { id: 'raw', label: 'Raw' },
    { id: 'headers', label: 'Headers', count: Object.keys(result.headers).length },
    { id: 'cookies', label: 'Cookies', count: result.cookies?.length },
    { id: 'timing', label: 'Timing' },
    { id: 'logs', label: 'Logs', count: result.logs?.length },
  ];

  return (
    <div className="h-full flex flex-col bg-dark-950 border-t border-dark-800 animate-in slide-in-from-bottom-4 duration-500 overflow-hidden">
      {/* Response Metadata Bar */}
      <div className="h-14 px-6 flex items-center justify-between border-b border-dark-800 bg-dark-950/50 backdrop-blur-xl shrink-0">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <Badge variant="slate" className={`px-4 py-1.5 text-xs font-black rounded-xl border-dark-700 ${getStatusColor(result.status)}`}>
              {result.status} {result.statusText}
            </Badge>
            <div className="h-4 w-px bg-dark-800" />
            <div className="flex items-center gap-2 text-[10px] text-slate-500 font-bold uppercase tracking-widest">
              <Clock size={14} className="text-brand-primary/50" />
              <span>{result.timing.total}ms</span>
            </div>
            <div className="h-4 w-px bg-dark-800" />
            <div className="flex items-center gap-2 text-[10px] text-slate-500 font-bold uppercase tracking-widest">
              <HardDrive size={14} className="text-brand-primary/50" />
              <span>{bodySize}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <ResponseActions 
            onCopy={handleCopyBody} 
            onExport={handleExport} 
            contentType={result.headers['Content-Type'] || result.headers['content-type']} 
          />
          {copied && (
            <span className="text-[10px] font-black uppercase text-emerald-500 animate-in fade-in slide-in-from-right-2 duration-300">
              Copied!
            </span>
          )}
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex border-b border-dark-800 bg-dark-950/20 px-4 shrink-0 overflow-x-auto no-scrollbar">
          {modes.map((m) => (
            <button
              key={m.id}
              onClick={() => !m.disabled && setActiveMode(m.id)}
              disabled={m.disabled}
              className={`relative px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] transition-all whitespace-nowrap group ${
                m.disabled ? 'opacity-30 cursor-not-allowed' :
                activeMode === m.id ? 'text-brand-primary' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <span className="relative z-10 flex items-center gap-2">
                {m.label}
                {m.count !== undefined && m.count > 0 && (
                  <span className={`px-1.5 py-0.5 rounded-md text-[8px] font-black ${
                    activeMode === m.id ? 'bg-brand-primary text-dark-950' : 'bg-dark-800 text-slate-500 group-hover:text-slate-300'
                  }`}>
                    {m.count}
                  </span>
                )}
              </span>
              {activeMode === m.id && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-primary shadow-[0_0_8px_rgba(56,189,248,0.5)] animate-in fade-in slide-in-from-bottom-1 duration-300" />
              )}
            </button>
          ))}
        </div>

        {/* Viewport */}
        <div className="flex-1 overflow-hidden relative bg-dark-950">
          <div className="absolute inset-0 overflow-auto custom-scrollbar">
            <div className="animate-in fade-in duration-500 h-full">
              {activeMode === 'tree' && parsedBody && (
                <JsonTreeView data={parsedBody} />
              )}
              {activeMode === 'pretty' && (
                <PrettyView content={result.body} contentType={result.headers['Content-Type'] || result.headers['content-type']} />
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
              {activeMode === 'logs' && (
                <div className="p-6 font-mono text-[11px] leading-relaxed text-slate-400">
                  {result.logs?.map((log, i) => (
                    <div key={i} className="flex gap-4 mb-1 animate-in fade-in slide-in-from-left-1 duration-300" style={{ animationDelay: `${i * 50}ms` }}>
                      <span className="text-slate-600 shrink-0 select-none">[{i+1}]</span>
                      <span>{log}</span>
                    </div>
                  ))}
                  {(!result.logs || result.logs.length === 0) && (
                    <div className="text-slate-600 italic">No execution logs available</div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const ResponseViewer = memo(ResponseViewerComponent);
