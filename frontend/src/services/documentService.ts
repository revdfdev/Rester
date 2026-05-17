import * as DocumentHandler from '../wailsjs/go/handlers/DocumentHandler';
import { core } from '../wailsjs/go/models';
import { RequestBlock, KeyValue } from '../types';
import { parseHttpFile } from '../utils/http-parser';
import { serializeHttpFile, serializeFormBody } from '../utils/http-serializer';

// Check if Wails runtime handlers are available
const isWailsAvailable = typeof window !== 'undefined' && 
                        (window as any).go && 
                        (window as any).go.handlers && 
                        (window as any).go.handlers.DocumentHandler;

export const syncToDocument = async (blocks: RequestBlock[]): Promise<string> => {
  if (!isWailsAvailable) {
    // Fallback to TypeScript local serializer in non-Wails environments (like unit tests)
    return serializeHttpFile(blocks);
  }

  try {
    const requests = blocks.map((block, index) => {
      // Map each KeyValue header to core.HeaderNode
      const headers = (block.headers || [])
        .filter(h => h.enabled && h.key)
        .map(h => ({
          key: h.key,
          value: h.value,
          line: 0
        }));

      // Determine correct body content
      let bodyContent = '';
      if (block.body?.type !== 'none') {
        bodyContent = block.body?.content || '';
        if (
          (block.body?.type === 'form-data' || block.body?.type === 'x-www-form-urlencoded') &&
          block.formBody
        ) {
          bodyContent = serializeFormBody(block.body.type, block.formBody);
        }
      }

      // Construct the RequestNode
      const reqNode = {
        id: block.id || `block-${index}`,
        name: block.name,
        method: block.method || 'GET',
        url: block.url || '',
        headers: headers,
        body: bodyContent,
        pre_request_script: block.preRequestScript ? { content: block.preRequestScript, line_range: [0, 0] } : undefined,
        test_script: block.testScript ? { content: block.testScript, line_range: [0, 0] } : undefined,
        line_range: [0, 0]
      };
      return reqNode;
    });

    const fileNode = {
      variables: [],
      requests
    };

    return await DocumentHandler.SerializeNode(fileNode as any);
  } catch (e) {
    console.error('Failed Go AST serialization, falling back:', e);
    return serializeHttpFile(blocks);
  }
};

export const syncFromDocument = async (content: string): Promise<RequestBlock[]> => {
  if (!isWailsAvailable) {
    // Fallback to TypeScript local parser in non-Wails environments (like unit tests)
    return parseHttpFile(content);
  }

  try {
    const fileNode = await DocumentHandler.ParseContent(content);
    
    if (!fileNode || !fileNode.requests || fileNode.requests.length === 0) {
      return [{
        id: 'block-0',
        name: 'GET https://api.example.com',
        method: 'GET',
        url: 'https://api.example.com',
        headers: [],
        params: [],
        body: { type: 'none', content: '' },
        preRequestScript: '',
        testScript: '',
        rawContent: 'GET https://api.example.com\n'
      }];
    }
    
    return fileNode.requests.map((req, index) => {
      const headers: KeyValue[] = (req.headers || []).map(h => ({
        id: Math.random().toString(36).substr(2, 9),
        key: h.key,
        value: h.value,
        enabled: true
      }));

      // Parse URL params
      const params: KeyValue[] = [];
      const url = req.url || '';
      if (url.includes('?')) {
        const queryStr = url.split('?')[1];
        const pairs = queryStr.split('&');
        pairs.forEach(p => {
          const [k, v] = p.split('=');
          if (k) {
            params.push({
              id: Math.random().toString(36).substr(2, 9),
              key: decodeURIComponent(k),
              value: decodeURIComponent(v || ''),
              enabled: true
            });
          }
        });
      }

      // Infer body type
      let bodyType: 'none' | 'raw' | 'json' | 'form-data' | 'x-www-form-urlencoded' = 'none';
      const contentType = headers.find(h => h.key.toLowerCase() === 'content-type')?.value.toLowerCase();
      if (contentType?.includes('json')) bodyType = 'json';
      else if (contentType?.includes('form-urlencoded')) bodyType = 'x-www-form-urlencoded';
      else if (contentType?.includes('form-data')) bodyType = 'form-data';
      else if (req.body) bodyType = 'raw';

      const formBody: KeyValue[] = [];
      if ((bodyType === 'x-www-form-urlencoded' || bodyType === 'form-data') && req.body) {
        req.body.split('&').filter(Boolean).forEach(pair => {
          const [key, rawValue] = pair.split('=');
          let value = decodeURIComponent(rawValue || '');
          let type: 'text' | 'file' = 'text';
          if (value.startsWith('< ')) {
            value = value.substring(2);
            type = 'file';
          }
          formBody.push({
            id: Math.random().toString(36).substr(2, 9),
            key: decodeURIComponent(key || ''),
            value,
            enabled: true,
            type
          });
        });
      }

      return {
        id: req.id || `block-${index}`,
        name: req.name || `${req.method || 'GET'} ${url.split('?')[0]}`,
        method: req.method || 'GET',
        url: url,
        headers: headers,
        params: params,
        body: {
          type: bodyType,
          content: req.body || ''
        },
        formBody: formBody.length > 0 ? formBody : undefined,
        preRequestScript: req.pre_request_script?.content || '',
        testScript: req.test_script?.content || '',
        lineRange: req.line_range ? [req.line_range[0], req.line_range[1]] : undefined
      };
    });
  } catch (e) {
    console.error('Failed Go AST parsing, falling back:', e);
    return parseHttpFile(content);
  }
};
