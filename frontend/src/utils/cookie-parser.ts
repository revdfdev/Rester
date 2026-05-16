import { Cookie } from '../types';

/**
 * Parses a Set-Cookie header string into a Cookie object.
 * Format: name=value; Domain=domain; Path=path; Expires=date; Secure; HttpOnly; SameSite=Lax
 */
export const parseSetCookie = (header: string): Cookie => {
  const parts = header.split(';').map(p => p.trim());
  if (parts.length === 0) return { name: '', value: '' };

  const [nameValue, ...attributes] = parts;
  const [name, value] = nameValue.split('=');

  const cookie: Cookie = {
    name: name || '',
    value: value || '',
  };

  attributes.forEach(attr => {
    const [key, val] = attr.split('=');
    const lowerKey = key.toLowerCase();

    switch (lowerKey) {
      case 'domain':
        cookie.domain = val;
        break;
      case 'path':
        cookie.path = val;
        break;
      case 'expires':
        cookie.expires = val;
        break;
      case 'secure':
        cookie.secure = true;
        break;
      case 'httponly':
        cookie.httpOnly = true;
        break;
      case 'samesite':
        cookie.sameSite = val;
        break;
    }
  });

  return cookie;
};

/**
 * Parses multiple Set-Cookie headers into an array of Cookie objects.
 */
export const parseCookies = (headers: Record<string, string>): Cookie[] => {
  const cookies: Cookie[] = [];
  
  // Wails might return multiple Set-Cookie headers joined by commas or as a single string
  // HTTP spec allows multiple Set-Cookie headers.
  Object.entries(headers).forEach(([key, value]) => {
    if (key.toLowerCase() === 'set-cookie') {
      // Very naive splitting, actual Set-Cookie can contain commas in dates
      // But for many APIs, they are separated by newlines or commas
      const individualCookies = value.split(/,(?=[^;]*=)/); 
      individualCookies.forEach(c => cookies.push(parseSetCookie(c)));
    }
  });

  return cookies;
};
