import { Monaco } from '@monaco-editor/react';

export const registerHttpLanguage = (monaco: Monaco) => {
  // Register a new language
  monaco.languages.register({ id: 'http' });

  // Register a tokens provider for the language
  monaco.languages.setMonarchTokensProvider('http', {
    ignoreCase: true,
    defaultToken: '',
    
    keywords: [
      'GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD', 'CONNECT', 'TRACE'
    ],

    tokenizer: {
      root: [
        // Comments
        [/^#.*$/, 'comment'],
        [/^\/\/.*$/, 'comment'],
        
        // Request separator
        [/^###.*$/, 'metatag'],

        // Variables: {{var}}
        [/\{\{/, { token: 'variable.delimiter', next: '@variable' }],

        // HTTP Methods
        [/^[A-Z]+/, {
          cases: {
            '@keywords': 'keyword',
            '@default': 'identifier'
          }
        }],

        // URLs
        [/https?:\/\/[^\s]+/, 'string.url'],

        // Headers: Key: Value
        [/^[a-zA-Z-]+(?=:)/, 'type'],
        [/:/, 'delimiter'],
        
        // Strings/Values
        [/".*?"/, 'string'],
        [/'.*?'/, 'string'],
      ],

      variable: [
        [/\}\}/, { token: 'variable.delimiter', next: '@pop' }],
        [/[a-zA-Z0-9_.-]+/, 'variable'],
      ],
    },
  });

  // Register a completion item provider for the language
  monaco.languages.registerCompletionItemProvider('http', {
    provideCompletionItems: (model: any, position: any) => {
      const word = model.getWordUntilPosition(position);
      const range = {
        startLineNumber: position.lineNumber,
        endLineNumber: position.lineNumber,
        startColumn: word.startColumn,
        endColumn: word.endColumn
      };

      const suggestions = [
        ...['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD'].map(m => ({
          label: m,
          kind: monaco.languages.CompletionItemKind.Keyword,
          insertText: m,
          range: range
        })),
        ...['Content-Type', 'Authorization', 'Accept', 'User-Agent', 'Cache-Control', 'Host'].map(h => ({
          label: h,
          kind: monaco.languages.CompletionItemKind.Field,
          insertText: `${h}: `,
          range: range
        })),
        {
          label: '###',
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: '###\n# ${1:Request Name}\nGET ${2:https://example.com}',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          range: range
        }
      ];

      return { suggestions: suggestions };
    }
  });

  // Define the theme with specific colors for our tokens
  monaco.editor.defineTheme('rester-theme', {
    base: 'vs-dark',
    inherit: true,
    rules: [
      { token: 'comment', foreground: '6a737d', fontStyle: 'italic' },
      { token: 'keyword', foreground: 'f97583', fontStyle: 'bold' },
      { token: 'variable', foreground: 'b392f0' },
      { token: 'variable.delimiter', foreground: 'b392f0', fontStyle: 'bold' },
      { token: 'string.url', foreground: '79b8ff', fontStyle: 'underline' },
      { token: 'type', foreground: '79b8ff' }, // Headers
      { token: 'metatag', foreground: 'ffab70', fontStyle: 'bold' }, // ###
      { token: 'string', foreground: '9ecbff' },
    ],
    colors: {
      'editor.background': '#0a0a0a',
      'editor.lineHighlightBackground': '#1a1a1a',
      'editorLineNumber.foreground': '#4a4a4a',
      'editorLineNumber.activeForeground': '#79b8ff',
      'editor.selectionBackground': '#264f78',
      'editor.inactiveSelectionBackground': '#3a3d41',
    }
  });
};
