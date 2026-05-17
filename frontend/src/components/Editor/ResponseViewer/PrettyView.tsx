import React, { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { AlertTriangle, Eye } from 'lucide-react';

interface PrettyViewProps {
  content: string;
  contentType?: string;
}

const LARGE_FILE_THRESHOLD = 1024 * 1024; // 1MB

export const PrettyView: React.FC<PrettyViewProps> = ({ content, contentType }) => {
  const [showLargeFile, setShowLargeFile] = useState(false);
  const [formattedContent, setFormattedContent] = useState('');
  const [isFormatting, setIsFormatting] = useState(false);

  const getLanguage = () => {
    if (!contentType) return 'json';
    const ct = contentType.toLowerCase();
    if (ct.includes('json')) return 'json';
    if (ct.includes('xml')) return 'xml';
    if (ct.includes('html')) return 'html';
    return 'json';
  };

  const language = getLanguage();
  const isLarge = content.length > LARGE_FILE_THRESHOLD;

  useEffect(() => {
    if (isLarge && !showLargeFile) return;

    if (language === 'json') {
      setIsFormatting(true);
      
      const timer = setTimeout(() => {
        try {
          const parsed = JSON.parse(content);
          setFormattedContent(JSON.stringify(parsed, null, 2));
        } catch (e) {
          setFormattedContent(content);
        } finally {
          setIsFormatting(false);
        }
      }, 50);
      
      return () => clearTimeout(timer);
    } else {
      setFormattedContent(content);
    }
  }, [content, language, showLargeFile, isLarge]);

  if (isLarge && !showLargeFile) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-dark-950 p-8 text-center">
        <div className="w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center mb-6 border border-amber-500/20">
          <AlertTriangle className="text-amber-500" size={32} />
        </div>
        <h3 className="text-sm font-bold text-slate-200 mb-2">Large Response Detected</h3>
        <p className="text-xs text-slate-500 max-w-xs mb-8 leading-relaxed">
          This response is {(content.length / 1024 / 1024).toFixed(1)} MB. 
          Rendering large text in the pretty editor may cause the UI to become unresponsive.
        </p>
        <button
          onClick={() => setShowLargeFile(true)}
          className="flex items-center gap-2 px-6 py-2.5 bg-brand-primary text-dark-950 text-[10px] font-black uppercase tracking-widest rounded-xl hover:scale-105 transition-all shadow-lg shadow-brand-primary/20"
        >
          <Eye size={14} /> Render Anyway
        </button>
      </div>
    );
  }

  return (
    <div className="h-full relative">
      {isFormatting && (
        <div className="absolute inset-0 z-10 bg-dark-950/50 backdrop-blur-sm flex items-center justify-center text-[10px] font-black uppercase tracking-widest text-slate-500">
          Formatting Large Payload...
        </div>
      )}
      <Editor
        height="100%"
        language={language}
        theme="rester-theme"
        value={formattedContent}
        options={{
          readOnly: true,
          minimap: { enabled: false },
          fontSize: 12,
          lineNumbers: 'on',
          scrollBeyondLastLine: false,
          automaticLayout: true,
          padding: { top: 12, bottom: 12 },
          renderLineHighlight: 'none',
          folding: true,
          formatOnPaste: true,
          formatOnType: true,
        }}
      />
    </div>
  );
};
