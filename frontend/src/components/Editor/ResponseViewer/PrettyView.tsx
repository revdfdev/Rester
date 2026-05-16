import React from 'react';
import Editor from '@monaco-editor/react';

interface PrettyViewProps {
  content: string;
  contentType?: string;
}

export const PrettyView: React.FC<PrettyViewProps> = ({ content, contentType }) => {
  const getLanguage = () => {
    if (!contentType) return 'json';
    const ct = contentType.toLowerCase();
    if (ct.includes('json')) return 'json';
    if (ct.includes('xml')) return 'xml';
    if (ct.includes('html')) return 'html';
    return 'json';
  };

  const formatContent = (text: string, lang: string) => {
    if (lang === 'json') {
      try {
        return JSON.stringify(JSON.parse(text), null, 2);
      } catch (e) {
        return text;
      }
    }
    return text;
  };

  const language = getLanguage();
  const formattedContent = formatContent(content, language);

  return (
    <div className="h-full">
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
