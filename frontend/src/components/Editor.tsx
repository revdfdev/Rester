import React from 'react';
import Editor from '@monaco-editor/react';

interface EditorProps {
  value: string;
  language?: string;
  onChange?: (value: string | undefined) => void;
}

const HttpEditor: React.FC<EditorProps> = ({ value, language = 'http', onChange }) => {
  return (
    <Editor
      height="100%"
      language={language}
      value={value}
      theme="vs-dark"
      options={{
        minimap: { enabled: false },
        fontSize: 14,
        lineNumbers: 'on',
        scrollBeyondLastLine: false,
        automaticLayout: true,
      }}
      onChange={onChange}
    />
  );
};

export default HttpEditor;
