import { describe, it, expect } from 'vitest';
import { parseHttpFile } from '../../src/utils/http-parser';
import { serializeHttpFile } from '../../src/utils/http-serializer';

describe('HTTP Parser & Serializer', () => {
  const sampleFile = `# List Users
GET https://api.example.com/users?page=1
Authorization: Bearer token
Content-Type: application/json

###

# Create User
POST https://api.example.com/users
Content-Type: application/json

<%
console.log("Pre-request");
%>

{
  "name": "John Doe"
}

<%
console.log("Tests");
%>
`;

  it('should parse a multi-request file correctly', () => {
    const blocks = parseHttpFile(sampleFile);
    expect(blocks).toHaveLength(2);

    expect(blocks[0].name).toBe('List Users');
    expect(blocks[0].method).toBe('GET');
    expect(blocks[0].headers).toContainEqual({ key: 'Authorization', value: 'Bearer token', enabled: true });
    expect(blocks[0].params).toContainEqual({ key: 'page', value: '1', enabled: true });

    expect(blocks[1].name).toBe('Create User');
    expect(blocks[1].method).toBe('POST');
    expect(blocks[1].preRequestScript).toBe('console.log("Pre-request");');
    expect(blocks[1].testScript).toBe('console.log("Tests");');
    expect(blocks[1].body.content).toBe('{\n  "name": "John Doe"\n}');
  });

  it('should serialize blocks back to .http format', () => {
    const blocks = parseHttpFile(sampleFile);
    const serialized = serializeHttpFile(blocks);

    expect(serialized).toContain('# List Users');
    expect(serialized).toContain('GET https://api.example.com/users?page=1');
    expect(serialized).toContain('###');
    expect(serialized).toContain('POST https://api.example.com/users');
    expect(serialized).toContain('<%\nconsole.log("Pre-request");\n%>');
  });

  it('should be idempotent for simple cases', () => {
    const blocks = parseHttpFile(sampleFile);
    const serialized = serializeHttpFile(blocks);
    const blocks2 = parseHttpFile(serialized);
    
    expect(blocks2[0].method).toBe(blocks[0].method);
    expect(blocks2[0].url).toBe(blocks[0].url);
    expect(blocks2[1].body.content).toBe(blocks[1].body.content);
  });
});
