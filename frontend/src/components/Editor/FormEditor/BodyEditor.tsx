import React from 'react';
import Editor from '@monaco-editor/react';
import { KeyValueGrid } from './KeyValueGrid';
import { useEditorStore, KeyValue } from '../../../state/editorStore';
import { Trash2 } from 'lucide-react';

export const BodyEditor: React.FC = () => {
  const { requestBlocks, activeBlockIndex, updateBlock } = useEditorStore();
  const activeBlock = requestBlocks[activeBlockIndex];

  if (!activeBlock) return null;

  const handleBodyChange = (value: string | undefined) => {
    updateBlock(activeBlockIndex, {
      body: { ...activeBlock.body, content: value || '' }
    });
  };

  const prettifyJson = () => {
    try {
      const obj = JSON.parse(activeBlock.body.content);
      handleBodyChange(JSON.stringify(obj, null, 2));
    } catch (e) {
      console.warn('Invalid JSON, cannot prettify');
    }
  };

  const clearBody = () => {
    updateBlock(activeBlockIndex, {
      body: { ...activeBlock.body, content: '' },
      formBody: activeBlock.body.type === 'form-data' || activeBlock.body.type === 'x-www-form-urlencoded' 
        ? [{ id: crypto.randomUUID(), key: '', value: '', enabled: true, type: 'text' }]
        : undefined
    });
  };

  const handleTypeChange = (type: any) => {
    const newHeaders = [...activeBlock.headers];
    const contentTypeIdx = newHeaders.findIndex(h => h.key.toLowerCase() === 'content-type');
    
    let contentTypeValue = '';
    if (type === 'json') contentTypeValue = 'application/json';
    else if (type === 'x-www-form-urlencoded') contentTypeValue = 'application/x-www-form-urlencoded';
    else if (type === 'form-data') contentTypeValue = 'multipart/form-data';

    if (contentTypeValue) {
      if (contentTypeIdx !== -1) {
        newHeaders[contentTypeIdx] = { ...newHeaders[contentTypeIdx], value: contentTypeValue };
      } else {
        newHeaders.push({ id: crypto.randomUUID(), key: 'Content-Type', value: contentTypeValue, enabled: true });
      }
    } else if (type === 'none' && contentTypeIdx !== -1) {
      // Remove content-type if switching to none
      newHeaders.splice(contentTypeIdx, 1);
    }

    const updates: any = {
      body: { ...activeBlock.body, type },
      headers: newHeaders
    };

    if (type === 'none') {
      updates.body.content = '';
      updates.formBody = undefined;
    }

    if ((type === 'form-data' || type === 'x-www-form-urlencoded') && !activeBlock.formBody) {
      updates.formBody = [{ id: crypto.randomUUID(), key: '', value: '', enabled: true, type: 'text' }];
    }

    updateBlock(activeBlockIndex, updates);
  };

  const handleFormBodyChange = (data: KeyValue[]) => {
    const content = data
      .filter(kv => kv.enabled && (kv.key || kv.value))
      .map(kv => {
        const value = kv.type === 'file' ? `< ${kv.value}` : kv.value;
        return `${encodeURIComponent(kv.key)}=${encodeURIComponent(value)}`;
      })
      .join('&');
    
    updateBlock(activeBlockIndex, {
      formBody: data,
      body: { ...activeBlock.body, content }
    });
  };

  return (
    <div className="flex flex-col h-[450px] bg-[#0a0a0a] rounded-xl border border-slate-800 overflow-hidden shadow-2xl">
      {/* Body Type Selector */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-800/30">
        <div className="flex items-center gap-4">
          {['none', 'json', 'raw', 'form-data', 'x-www-form-urlencoded'].map((type) => (
            <label key={type} className="flex items-center gap-2 cursor-pointer group">
              <input
                type="radio"
                name="bodyType"
                checked={activeBlock.body.type === type}
                onChange={() => handleTypeChange(type)}
                className="hidden"
              />
              <div className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center transition-all ${
                activeBlock.body.type === type ? 'border-blue-500' : 'border-slate-700 group-hover:border-slate-500'
              }`}>
                {activeBlock.body.type === type && <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />}
              </div>
              <span className={`text-[10px] font-bold uppercase tracking-tight transition-colors ${
                activeBlock.body.type === type ? 'text-slate-200' : 'text-slate-500 group-hover:text-slate-300'
              }`}>
                {type.replace(/-/g, ' ')}
              </span>
            </label>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {activeBlock.body.type === 'json' && (
            <button 
              onClick={prettifyJson}
              className="text-[10px] font-bold text-blue-500 hover:text-blue-400 uppercase tracking-widest px-2 py-1 rounded hover:bg-blue-500/10 transition-all"
            >
              Prettify
            </button>
          )}
          {activeBlock.body.type !== 'none' && (
            <button 
              onClick={clearBody}
              className="p-1.5 hover:bg-red-500/10 rounded text-slate-500 hover:text-red-500 transition-all"
              title="Clear Body"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-hidden">
        {activeBlock.body.type === 'none' && (
          <div className="h-full flex items-center justify-center text-slate-600 italic text-sm bg-slate-900/10">
            This request does not have a body
          </div>
        )}

        {(activeBlock.body.type === 'json' || activeBlock.body.type === 'raw') && (
          <div className="h-full bg-[#0a0a0a]">
            <Editor
              height="100%"
              defaultLanguage={activeBlock.body.type === 'json' ? 'json' : 'text'}
              theme="rester-theme"
              value={activeBlock.body.content}
              onChange={handleBodyChange}
              options={{
                minimap: { enabled: false },
                fontSize: 13,
                lineNumbers: 'on',
                scrollBeyondLastLine: false,
                automaticLayout: true,
                padding: { top: 16, bottom: 16 },
                renderLineHighlight: 'none',
              }}
            />
          </div>
        )}

        {(activeBlock.body.type === 'x-www-form-urlencoded' || activeBlock.body.type === 'form-data') && (
          <div className="h-full overflow-y-auto p-4 custom-scrollbar">
             <KeyValueGrid
               title={activeBlock.body.type === 'form-data' ? "Form Data" : "Form Parameters"}
               data={activeBlock.formBody || []}
               onChange={handleFormBodyChange}
               showTypeSelector={true}
             />
             {activeBlock.body.type === 'form-data' && (
               <div className="mt-4 p-3 bg-blue-500/5 border border-blue-500/20 rounded-lg">
                 <p className="text-[10px] text-blue-400 font-medium italic">
                   Note: Binary files are referenced using the {'< path/to/file'} syntax.
                 </p>
               </div>
             )}
          </div>
        )}
      </div>
    </div>
  );
};
