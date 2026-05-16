import React from 'react';
import Editor from '@monaco-editor/react';
import { Download } from 'lucide-react';

interface RawViewProps {
  content: string;
}

export const RawView: React.FC<RawViewProps> = ({ content }) => {
  const downloadResponse = () => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `response_${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="h-full relative group">
      <div className="absolute right-6 top-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
        <button 
          onClick={downloadResponse}
          className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-bold rounded border border-slate-700 transition-all shadow-lg"
        >
          <Download size={12} />
          DOWNLOAD RAW
        </button>
      </div>
      
      <Editor
        height="100%"
        language="text"
        theme="rester-theme"
        value={content}
        options={{
          readOnly: true,
          minimap: { enabled: true },
          fontSize: 12,
          lineNumbers: 'on',
          scrollBeyondLastLine: false,
          automaticLayout: true,
          padding: { top: 12, bottom: 12 },
          wordWrap: 'on',
        }}
      />
    </div>
  );
};
