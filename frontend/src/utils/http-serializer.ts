import { RequestBlock } from '../state/editorStore';

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
    if (block.body.type !== 'none' && block.body.content) {
      output += '\n';
      output += block.body.content;
      output += '\n';
    }

    // Test script
    if (block.testScript) {
      if (block.body.type === 'none' || !block.body.content) {
        output += '\n';
      }
      output += `<%\n${block.testScript}\n%>\n`;
    }

    return output.trim();
  }).join('\n\n###\n\n');
};
