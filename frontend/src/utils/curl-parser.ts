export interface ParsedCurl {
  method: string;
  url: string;
  headers: { [key: string]: string };
  body: string;
}

/**
 * Parses a standard cURL command and extracts the method, URL, headers, and body.
 */
export function parseCurlCommand(curlStr: string): ParsedCurl {
  const result: ParsedCurl = {
    method: 'GET',
    url: '',
    headers: {},
    body: ''
  };

  // Clean up line continuations and normalize spacing
  const cleanStr = curlStr
    .replace(/\\\r?\n/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  // Token parser respecting single/double quotes and escapes
  const tokens: string[] = [];
  let currentToken = '';
  let inDoubleQuote = false;
  let inSingleQuote = false;
  let escape = false;

  for (let i = 0; i < cleanStr.length; i++) {
    const char = cleanStr[i];

    if (escape) {
      currentToken += char;
      escape = false;
      continue;
    }

    if (char === '\\') {
      escape = true;
      continue;
    }

    if (char === '"' && !inSingleQuote) {
      inDoubleQuote = !inDoubleQuote;
      continue;
    }

    if (char === "'" && !inDoubleQuote) {
      inSingleQuote = !inSingleQuote;
      continue;
    }

    if (char === ' ' && !inDoubleQuote && !inSingleQuote) {
      if (currentToken) {
        tokens.push(currentToken);
        currentToken = '';
      }
    } else {
      currentToken += char;
    }
  }

  if (currentToken) {
    tokens.push(currentToken);
  }

  // Parse token slice
  let i = 0;
  if (tokens[0] && tokens[0].toLowerCase() === 'curl') {
    i = 1;
  }

  while (i < tokens.length) {
    const token = tokens[i];

    if (token === '-X' || token === '--request') {
      const next = tokens[i + 1];
      if (next) {
        result.method = next.toUpperCase();
        i += 2;
      } else {
        i++;
      }
    } else if (token === '-H' || token === '--header') {
      const next = tokens[i + 1];
      if (next) {
        const colonIdx = next.indexOf(':');
        if (colonIdx !== -1) {
          const key = next.substring(0, colonIdx).trim();
          const value = next.substring(colonIdx + 1).trim();
          result.headers[key] = value;
        }
        i += 2;
      } else {
        i++;
      }
    } else if (
      token === '-d' ||
      token === '--data' ||
      token === '--data-raw' ||
      token === '--data-binary' ||
      token === '--data-urlencode'
    ) {
      const next = tokens[i + 1];
      if (next) {
        result.body = result.body ? result.body + '\n' + next : next;
        if (result.method === 'GET') {
          result.method = 'POST'; // Default to POST if body is specified and method is default
        }
        i += 2;
      } else {
        i++;
      }
    } else if (token === '-u' || token === '--user') {
      const next = tokens[i + 1];
      if (next) {
        try {
          const base64 = btoa(next);
          result.headers['Authorization'] = `Basic ${base64}`;
        } catch (e) {
          // ignore base64 errors
        }
        i += 2;
      } else {
        i++;
      }
    } else if (token.startsWith('http://') || token.startsWith('https://')) {
      result.url = token;
      i++;
    } else if (!token.startsWith('-') && !result.url) {
      result.url = token;
      i++;
    } else {
      i++;
    }
  }

  return result;
}

/**
 * Converts a cURL command string directly into an AST-compatible .http document string.
 */
export function convertCurlToHttpFormat(curlStr: string): string {
  const parsed = parseCurlCommand(curlStr);
  const url = parsed.url || 'https://api.example.com';
  
  let sb = `${parsed.method} ${url}\n`;
  
  Object.entries(parsed.headers).forEach(([k, v]) => {
    sb += `${k}: ${v}\n`;
  });
  
  if (parsed.body) {
    sb += `\n${parsed.body}\n`;
  }
  
  return sb;
}
