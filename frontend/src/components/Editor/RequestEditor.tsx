import React, { useEffect } from 'react';
import { Save, Code } from 'lucide-react';
import Editor from '@monaco-editor/react';
import { ModeToggle } from './ModeToggle';
import { FormEditor } from './FormEditor/FormEditor';
import { registerHttpLanguage } from './http-lang';
import { EnvironmentSelector } from '../Header/EnvironmentSelector';
import { useEditorStore } from '../../state/editorStore';

interface RequestEditorProps {
  content: string;
  onChange: (value: string) => void;
}

export const RequestEditor: React.FC<RequestEditorProps> = ({ content, onChange }) => {
  const { mode, requestBlocks, syncFromText, getSerializedContent } = useEditorStore();

  // Sync prop content to store on load/change
  useEffect(() => {
    syncFromText(content);
  }, [content, syncFromText]);

  // Debounced auto-save for Form mode
  useEffect(() => {
    if (mode === 'form' && requestBlocks.length > 0) {
      const timer = setTimeout(() => {
        onChange(getSerializedContent());
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [requestBlocks, mode, onChange, getSerializedContent]);

  return (
    <div className="h-full flex flex-col bg-dark-900">
      {/* Editor Toolbar */}
      <div className="h-12 px-4 flex items-center justify-between border-b border-dark-800 bg-dark-950/50 backdrop-blur-md sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-[11px] font-bold tracking-wider text-slate-500 uppercase">
            <Code size={14} className="text-blue-500" />
            <span>Request Editor</span>
          </div>
          <div className="h-4 w-px bg-slate-700/50" />
          <ModeToggle />
        </div>

        <div className="flex items-center gap-4">
          <EnvironmentSelector />
          <div className="h-4 w-px bg-slate-700/50" />
          <button className="flex items-center gap-2 px-3 py-1.5 bg-slate-800/50 hover:bg-slate-700/50 text-slate-300 rounded-md text-xs font-medium transition-all border border-slate-700/30">
            <Save size={14} />
            Save
          </button>
        </div>
      </div>

      {/* Editor Content */}
      <div className="flex-1 overflow-hidden relative">
        <div className={`h-full transition-all duration-300 ${mode === 'form' ? 'animate-in fade-in zoom-in-95' : 'animate-in fade-in slide-in-from-right-4'}`}>
          {mode === 'form' ? (
            <FormEditor />
          ) : (
            <Editor
              height="100%"
              defaultLanguage="http"
              theme="rester-theme"
              value={content}
              onChange={(val) => onChange(val || '')}
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                lineNumbers: 'on',
                scrollBeyondLastLine: false,
                automaticLayout: true,
                padding: { top: 20, bottom: 20 },
                renderLineHighlight: 'all',
                cursorSmoothCaretAnimation: 'on',
                smoothScrolling: true,
              }}
              beforeMount={(monaco) => {
                registerHttpLanguage(monaco);
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
};
