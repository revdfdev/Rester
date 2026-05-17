import React, { useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';
import { useStore, useEditorSettings } from '../../state/store';
import { registerHttpLanguage } from './http-lang';
import { AlertCircle, Code2, Sparkles } from 'lucide-react';

interface SourceViewProps {
  content: string;
  onChange: (value: string) => void;
}

export const SourceView: React.FC<SourceViewProps> = ({ content, onChange }) => {
  const activeBlockIndex = useStore((state) => state.activeBlockIndex);
  const requestBlocks = useStore((state) => state.requestBlocks);
  const setActiveBlockIndex = useStore((state) => state.setActiveBlockIndex);
  const syncFromText = useStore((state) => state.syncFromText);
  const editorSettings = useEditorSettings();

  const editorRef = useRef<any>(null);
  const monacoRef = useRef<any>(null);
  const decorationsRef = useRef<string[]>([]);
  const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 1. Debounced text synchronization back into AST document state
  const handleEditorChange = (value: string | undefined) => {
    const text = value || '';
    onChange(text);

    if (syncTimeoutRef.current) {
      clearTimeout(syncTimeoutRef.current);
    }

    // Debounce state synchronization by 300ms to maintain 60fps typing speed
    syncTimeoutRef.current = setTimeout(() => {
      syncFromText(text);
    }, 300);
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }
    };
  }, []);

  // 2. Visual diagnostics & HTTP structure linting
  const runDiagnostics = (editor: any, monaco: any, text: string) => {
    const model = editor.getModel();
    if (!model) return;

    const lines = text.split('\n');
    const markers: any[] = [];
    let insideScript = false;
    let scriptStartLine = 0;

    lines.forEach((line, index) => {
      const lineNum = index + 1;
      const trimmed = line.trim();

      // Detect unclosed script tags
      if (trimmed.includes('<%')) {
        insideScript = true;
        scriptStartLine = lineNum;
      }
      if (trimmed.includes('%>')) {
        if (!insideScript) {
          markers.push({
            startLineNumber: lineNum,
            startColumn: line.indexOf('%>') + 1,
            endLineNumber: lineNum,
            endColumn: line.indexOf('%>') + 3,
            message: 'Unexpected script close tag "%>"',
            severity: monaco.MarkerSeverity.Error,
          });
        }
        insideScript = false;
      }

      // Check for spaces in header keys (HTTP standard syntax violation)
      if (!insideScript && trimmed && !trimmed.startsWith('#') && !trimmed.startsWith('//') && !trimmed.startsWith('###') && !trimmed.startsWith('@')) {
        if (trimmed.includes(':')) {
          const key = trimmed.split(':')[0];
          if (key.includes(' ')) {
            markers.push({
              startLineNumber: lineNum,
              startColumn: line.indexOf(key) + 1,
              endLineNumber: lineNum,
              endColumn: line.indexOf(':') + 1,
              message: 'HTTP Header key must not contain spaces',
              severity: monaco.MarkerSeverity.Warning,
            });
          }
        }
      }
    });

    if (insideScript) {
      markers.push({
        startLineNumber: scriptStartLine,
        startColumn: 1,
        endLineNumber: scriptStartLine,
        endColumn: model.getLineMaxColumn(scriptStartLine),
        message: 'Unclosed script block. Expected matching "%>"',
        severity: monaco.MarkerSeverity.Error,
      });
    }

    monaco.editor.setModelMarkers(model, 'rester-lint', markers);
  };

  // 3. Monaco mount setup
  const handleEditorDidMount = (editor: any, monaco: any) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    // Listen to cursor position to auto-select current Request block index
    editor.onDidChangeCursorPosition((e: any) => {
      const lineNumber = e.position.lineNumber;
      const matchedIndex = requestBlocks.findIndex((block) => {
        if (!block.lineRange) return false;
        return lineNumber >= block.lineRange[0] && lineNumber <= block.lineRange[1];
      });

      if (matchedIndex !== -1 && matchedIndex !== activeBlockIndex) {
        setActiveBlockIndex(matchedIndex);
      }
    });

    // Run initial diagnostics
    runDiagnostics(editor, monaco, editor.getValue());
  };

  // 4. Update decorations and diagnostics when active block or blocks change
  useEffect(() => {
    const editor = editorRef.current;
    const monaco = monacoRef.current;
    if (!editor || !monaco) return;

    const value = editor.getValue();
    runDiagnostics(editor, monaco, value);

    // Apply highly premium visual decorations to highlight the active request block range
    const activeBlock = requestBlocks[activeBlockIndex];
    if (activeBlock && activeBlock.lineRange) {
      const [start, end] = activeBlock.lineRange;
      
      decorationsRef.current = editor.deltaDecorations(decorationsRef.current, [
        {
          range: new monaco.Range(start, 1, end, 1),
          options: {
            isWholeLine: true,
            className: 'bg-brand-primary/5 border-l-2 border-brand-primary transition-all duration-300',
            marginClassName: 'border-l-2 border-brand-primary transition-all duration-300',
          },
        },
      ]);
    } else {
      decorationsRef.current = editor.deltaDecorations(decorationsRef.current, []);
    }
  }, [activeBlockIndex, requestBlocks]);

  return (
    <div className="h-full w-full flex flex-col relative bg-dark-950/20">
      {/* Informative Visual Banner to make source secondary/companion */}
      <div className="flex items-center justify-between px-6 py-2 bg-dark-950/40 border-b border-dark-800 text-[10px] text-slate-500 font-bold uppercase tracking-widest gap-4">
        <div className="flex items-center gap-2">
          <Code2 size={12} className="text-brand-primary" />
          <span>Raw HTTP Source Mode</span>
        </div>
        <div className="flex items-center gap-1.5 text-brand-primary/60 font-black animate-pulse">
          <Sparkles size={10} />
          <span>Auto-Sync Active</span>
        </div>
      </div>

      <div className="flex-1 min-h-0 relative">
        <Editor
          height="100%"
          defaultLanguage="http"
          theme="rester-theme"
          value={content}
          onChange={handleEditorChange}
          onMount={handleEditorDidMount}
          options={{
            minimap: { enabled: editorSettings.minimap },
            fontSize: editorSettings.fontSize,
            fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
            lineNumbers: editorSettings.lineNumbers,
            wordWrap: editorSettings.wordWrap,
            scrollBeyondLastLine: false,
            automaticLayout: true,
            padding: { top: 16, bottom: 16 },
            renderLineHighlight: 'all',
            cursorSmoothCaretAnimation: 'on',
            smoothScrolling: true,
            roundedSelection: true,
            cursorBlinking: 'smooth',
            cursorStyle: 'line',
            scrollbar: {
              vertical: 'visible',
              horizontal: 'visible',
              verticalScrollbarSize: 8,
              horizontalScrollbarSize: 8,
              useShadows: false,
            },
          }}
          beforeMount={(monaco) => {
            registerHttpLanguage(monaco);
          }}
        />
      </div>
    </div>
  );
};
