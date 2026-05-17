import { RequestBlock, KeyValue } from '../types';

export const serializeFormBody = (type: 'form-data' | 'x-www-form-urlencoded', formBody?: KeyValue[]): string => {
  if (!formBody || formBody.length === 0) return '';
  const enabled = formBody.filter(f => f.enabled && f.key);
  if (enabled.length === 0) return '';

  if (type === 'x-www-form-urlencoded') {
    return enabled
      .map(f => `${encodeURIComponent(f.key)}=${encodeURIComponent(f.value)}`)
      .join('&');
  }

  // multipart/form-data
  const boundary = '----ResterBoundary';
  const parts = enabled.map(f => {
    if (f.type === 'file') {
      return `--${boundary}\r\nContent-Disposition: form-data; name="${f.key}"; filename="${f.value}"\r\nContent-Type: application/octet-stream\r\n\r\n< ${f.value}\r\n`;
    }
    return `--${boundary}\r\nContent-Disposition: form-data; name="${f.key}"\r\n\r\n${f.value}\r\n`;
  });
  return parts.join('') + `--${boundary}--\r\n`;
};

export const serializeHttpFile = (blocks: RequestBlock[]): string => {
  return blocks.map((block) => {
    let output = '';

    // Comment Name
    if (block.name && !block.name.startsWith(block.method)) {
      output += `# ${block.name}\n`;
    }

    // Pre-request script
    if (block.preRequestScript) {
      output += `<%\n${block.preRequestScript}\n%>\n`;
    }

    // Method and URL
    output += `${block.method} ${block.url}\n`;

    // Headers
    block.headers.forEach((h) => {
      if (h.enabled && h.key) {
        output += `${h.key}: ${h.value}\n`;
      }
    });

    // Body
    if (block.body.type !== 'none') {
      let bodyContent = block.body.content;
      if (
        (block.body.type === 'form-data' || block.body.type === 'x-www-form-urlencoded') &&
        block.formBody
      ) {
        bodyContent = serializeFormBody(block.body.type, block.formBody);
      }
      
      if (bodyContent) {
        output += '\n';
        output += bodyContent;
        output += '\n';
      }
    }

    // Test script
    if (block.testScript) {
      const hasBody = block.body.type !== 'none' && (
        block.body.content || 
        ((block.body.type === 'form-data' || block.body.type === 'x-www-form-urlencoded') && block.formBody && block.formBody.length > 0)
      );
      if (!hasBody) {
        output += '\n';
      }
      output += `<%\n${block.testScript}\n%>\n`;
    }

    return output.trim();
  }).join('\n\n###\n\n');
};
