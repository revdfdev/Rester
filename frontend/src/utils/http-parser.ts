import { RequestBlock, KeyValue, BodyType } from '../state/editorStore';

export const parseHttpFile = (content: string): RequestBlock[] => {
  const blocks: RequestBlock[] = [];
  const rawBlocks = content.split(/^###/m);

  rawBlocks.forEach((raw, index) => {
    const lines = raw.trim().split('\n');
    if (lines.length === 0 || (lines.length === 1 && lines[0] === '')) return;

    let name = '';
    let method = 'GET';
    let url = '';
    const headers: KeyValue[] = [];
    const params: KeyValue[] = [];
    let preRequestScript = '';
    let testScript = '';
    let bodyContent = '';
    let bodyType: BodyType = 'none';

    let section: 'start' | 'headers' | 'body' = 'start';
    let scriptBuffer = '';
    let inScript = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      // Extract Name from first comment
      if (i === 0 && (line.startsWith('#') || line.startsWith('//'))) {
        name = line.replace(/^[#\/ ]+/, '').trim();
        continue;
      }

      // Handle Script Blocks <% ... %>
      if (line.includes('<%')) {
        inScript = true;
        scriptBuffer = line.substring(line.indexOf('<%') + 2);
        if (line.includes('%>')) {
          scriptBuffer = scriptBuffer.substring(0, scriptBuffer.indexOf('%>'));
          inScript = false;
          if (section === 'start' || section === 'headers') preRequestScript = scriptBuffer.trim();
          else testScript = scriptBuffer.trim();
        }
        continue;
      }

      if (inScript) {
        if (line.includes('%>')) {
          scriptBuffer += '\n' + line.substring(0, line.indexOf('%>'));
          inScript = false;
          if (section === 'start' || section === 'headers') preRequestScript = scriptBuffer.trim();
          else testScript = scriptBuffer.trim();
        } else {
          scriptBuffer += '\n' + line;
        }
        continue;Section
      }

      // Skip comments
      if (line.startsWith('#') || line.startsWith('//')) continue;

      if (section === 'start') {
        const parts = line.split(' ');
        if (['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD'].includes(parts[0].toUpperCase())) {
          method = parts[0].toUpperCase();
          url = parts.slice(1).join(' ').trim();
          section = 'headers';
        } else if (line !== '') {
          // Assume line is URL if no method provided
          method = 'GET';
          url = line;
          section = 'headers';
        }
        continue;
      }

      if (section === 'headers') {
        if (line === '') {
          section = 'body';
          continue;
        }
        const colonIndex = line.indexOf(':');
        if (colonIndex !== -1) {
          headers.push({
            id: crypto.randomUUID(),
            key: line.substring(0, colonIndex).trim(),
            value: line.substring(colonIndex + 1).trim(),
            enabled: true
          });
        }
        continue;
      }

      if (section === 'body') {
        bodyContent += (bodyContent ? '\n' : '') + lines[i];
      }
    }

    // Infer params from URL
    if (url.includes('?')) {
      const queryStr = url.split('?')[1];
      const pairs = queryStr.split('&');
      pairs.forEach(p => {
        const [k, v] = p.split('=');
        if (k) params.push({ id: crypto.randomUUID(), key: decodeURIComponent(k || ''), value: decodeURIComponent(v || ''), enabled: true });
      });
    }

    // Infer body type
    const contentType = headers.find(h => h.key.toLowerCase() === 'content-type')?.value.toLowerCase();
    if (contentType?.includes('json')) bodyType = 'json';
    else if (contentType?.includes('form-urlencoded')) bodyType = 'x-www-form-urlencoded';
    else if (contentType?.includes('form-data')) bodyType = 'form-data';
    else if (bodyContent) bodyType = 'raw';

    const formBody: KeyValue[] = [];
    if ((bodyType === 'x-www-form-urlencoded' || bodyType === 'form-data') && bodyContent) {
      bodyContent.split('&').filter(Boolean).forEach(pair => {
        const [key, rawValue] = pair.split('=');
        let value = decodeURIComponent(rawValue || '');
        let type: 'text' | 'file' = 'text';
        if (value.startsWith('< ')) {
          value = value.substring(2);
          type = 'file';
        }
        formBody.push({
          id: crypto.randomUUID(),
          key: decodeURIComponent(key || ''),
          value,
          enabled: true,
          type
        });
      });
    }

    blocks.push({
      id: `block-${index}`,
      name: name || `${method} ${url.split('?')[0]}`,
      method,
      url,
      headers,
      params,
      body: { type: bodyType, content: bodyContent.trim() },
      formBody: formBody.length > 0 ? formBody : undefined,
      preRequestScript,
      testScript,
      rawContent: raw
    });
  });

  return blocks;
};
