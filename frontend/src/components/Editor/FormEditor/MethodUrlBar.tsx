import React from 'react';
import { useEditorStore } from '../../../state/editorStore';
import { useExecutionStore } from '../../../state/executionStore';
import { useEnvironmentStore } from '../../../state/environmentStore';
import { Execute } from '../../../wailsjs/go/main/App';
import { Loader2, Send } from 'lucide-react';
import { parseCookies } from '../../../utils/cookie-parser';

const METHODS = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD'];

export const MethodUrlBar: React.FC = () => {
  const { requestBlocks, activeBlockIndex, updateBlock } = useEditorStore();
  const { setLoading, setResult, loading } = useExecutionStore();
  const { activeEnv, environments } = useEnvironmentStore();
  
  const activeBlock = requestBlocks[activeBlockIndex];
  const isLoading = activeBlock ? loading[activeBlock.id] : false;

  if (!activeBlock) return null;

  const handleMethodChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateBlock(activeBlockIndex, { method: e.target.value });
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateBlock(activeBlockIndex, { url: e.target.value });
  };

  const handleSend = async () => {
    if (!activeBlock || isLoading) return;
    
    setLoading(activeBlock.id, true);
    try {
      const headersMap: Record<string, string> = {};
      activeBlock.headers.filter(h => h.enabled && h.key).forEach(h => {
        headersMap[h.key] = h.value;
      });

      // Map to core.Request structure
      const req = {
        id: activeBlock.id,
        name: activeBlock.name,
        method: activeBlock.method,
        url: activeBlock.url,
        headers: headersMap,
        body: activeBlock.body.content,
        pre_request_script: activeBlock.preRequestScript,
        test_script: activeBlock.testScript
      };

      // Map to core.Environment structure
      const env = {
        name: activeEnv,
        variables: environments[activeEnv] || {},
        is_active: activeEnv !== 'No Environment'
      };

      const resp = await Execute(req as any, env as any);
      
      setResult(activeBlock.id, {
        status: resp.status,
        statusText: resp.status_text,
        headers: resp.headers,
        cookies: parseCookies(resp.headers),
        body: resp.body,
        timing: { 
          total: resp.timing?.total || 0,
          detailed: resp.timing?.detailed
        }
      });
    } catch (err: any) {
      console.error('Execution failed:', err);
      // You might want to show a toast or error UI here
    } finally {
      setLoading(activeBlock.id, false);
    }
  };

  return (
    <div className="flex items-center gap-2 p-2 bg-slate-900/80 rounded-xl border border-slate-700/50 shadow-inner group">
      <div className="relative">
        <select
          value={activeBlock.method}
          onChange={handleMethodChange}
          disabled={isLoading}
          className="appearance-none bg-slate-800 text-blue-400 font-bold px-4 py-2 pr-8 rounded-lg border border-slate-700/50 hover:bg-slate-700 transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/30 text-sm disabled:opacity-50"
        >
          {METHODS.map((m) => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
          <svg width="10" height="6" viewBox="0 0 10 6" fill="none"><path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </div>
      </div>

      <input
        type="text"
        value={activeBlock.url}
        onChange={handleUrlChange}
        disabled={isLoading}
        placeholder="Enter request URL or paste text"
        className="flex-1 bg-transparent text-slate-100 px-3 py-2 text-sm focus:outline-none placeholder:text-slate-600 font-medium disabled:opacity-50"
      />
      
      <button 
        onClick={handleSend}
        disabled={isLoading}
        className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold rounded-lg transition-all shadow-lg shadow-blue-900/20 active:scale-95 disabled:bg-slate-700 disabled:shadow-none disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <Loader2 size={14} className="animate-spin" />
        ) : (
          <Send size={14} />
        )}
        {isLoading ? 'Sending...' : 'Send'}
      </button>
    </div>
  );
};
