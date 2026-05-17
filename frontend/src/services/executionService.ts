/**
 * Execution Service — Bridge between frontend types and Wails Go backend.
 * 
 * Maps RequestBlock → core.Request, EnvironmentNode → core.Environment,
 * and core.Response → ExecutionResult.
 * 
 * Uses App.Execute() (not ExecutionHandler) because app.go wraps the
 * executor with timeout enforcement and automatic history saving.
 */

import { Execute, CancelRequest } from '../wailsjs/go/main/App';
import { parseCookies } from '../utils/cookie-parser';
import type { RequestBlock, EnvironmentNode, ExecutionResult, Cookie } from '../types';

// ─── Type Mapping: Frontend → Go Backend ────────────────────────────

interface CoreRequest {
  id: string;
  name: string;
  method: string;
  url: string;
  headers: Record<string, string>;
  body?: string;
  preRequestScript?: string;
  testScript?: string;
}

interface CoreEnvironment {
  name: string;
  variables: Record<string, string>;
  isActive: boolean;
}

interface CoreResponse {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  body: string;
  timing: {
    start: string;
    ttfb: number;
    total: number;
    detailed?: {
      dns: number;
      tcp: number;
      tls: number;
      ttfb: number;
      download: number;
    };
  };
  testResults?: Array<{ name: string; passed: boolean; message?: string }>;
  logs?: string[];
  error?: string;
}

// ─── Mappers ────────────────────────────────────────────────────────

/**
 * Builds the full URL with query parameters appended.
 * Handles cases where the URL already has query params.
 */
function buildUrlWithParams(block: RequestBlock): string {
  let url = block.url;

  const enabledParams = block.params.filter(p => p.enabled && p.key);
  if (enabledParams.length === 0) return url;

  try {
    const urlObj = new URL(url);
    enabledParams.forEach(p => urlObj.searchParams.append(p.key, p.value));
    return urlObj.toString();
  } catch {
    // If URL is not fully qualified (e.g. just a path), build params manually
    const separator = url.includes('?') ? '&' : '?';
    const paramString = enabledParams
      .map(p => `${encodeURIComponent(p.key)}=${encodeURIComponent(p.value)}`)
      .join('&');
    return `${url}${separator}${paramString}`;
  }
}

/**
 * Maps a frontend RequestBlock to a Go core.Request.
 */
function mapToRequest(block: RequestBlock): CoreRequest {
  const headers: Record<string, string> = {};
  block.headers.filter(h => h.enabled && h.key).forEach(h => {
    headers[h.key] = h.value;
  });

  // Auto-set Content-Type for JSON body if not already set
  if (block.body.type === 'json' && block.body.content && !headers['Content-Type'] && !headers['content-type']) {
    headers['Content-Type'] = 'application/json';
  }
  if (block.body.type === 'x-www-form-urlencoded' && !headers['Content-Type'] && !headers['content-type']) {
    headers['Content-Type'] = 'application/x-www-form-urlencoded';
  }

  let bodyContent = '';
  if (block.body.type === 'x-www-form-urlencoded' && block.formBody) {
    bodyContent = block.formBody
      .filter(f => f.enabled && f.key)
      .map(f => `${encodeURIComponent(f.key)}=${encodeURIComponent(f.value)}`)
      .join('&');
  } else if (block.body.type === 'form-data' && block.formBody) {
    // Build multipart/form-data body with a unique boundary
    const boundary = `----ResterBoundary${Date.now().toString(36)}`;
    const parts = block.formBody
      .filter(f => f.enabled && f.key)
      .map(f => {
        if (f.type === 'file') {
          // File references use < syntax — Go executor would need to read them
          return `--${boundary}\r\nContent-Disposition: form-data; name="${f.key}"; filename="${f.value}"\r\nContent-Type: application/octet-stream\r\n\r\n< ${f.value}\r\n`;
        }
        return `--${boundary}\r\nContent-Disposition: form-data; name="${f.key}"\r\n\r\n${f.value}\r\n`;
      });
    bodyContent = parts.join('') + `--${boundary}--\r\n`;
    headers['Content-Type'] = `multipart/form-data; boundary=${boundary}`;
  } else if (block.body.type !== 'none') {
    bodyContent = block.body.content;
  }

  return {
    id: block.id,
    name: block.name,
    method: block.method,
    url: buildUrlWithParams(block),
    headers,
    body: bodyContent || undefined,
    preRequestScript: block.preRequestScript || undefined,
    testScript: block.testScript || undefined,
  };
}

/**
 * Maps a frontend EnvironmentNode (or null) to a Go core.Environment.
 */
function mapToEnvironment(env: EnvironmentNode | null): CoreEnvironment {
  if (!env) {
    return { name: 'No Environment', variables: {}, isActive: false };
  }
  return {
    name: env.name,
    variables: env.variables || {},
    isActive: true,
  };
}

/**
 * Maps a Go core.Response to a frontend ExecutionResult.
 * Parses cookies from Set-Cookie headers.
 */
function mapToExecutionResult(resp: CoreResponse): ExecutionResult {
  const cookies: Cookie[] = parseCookies(resp.headers || {});

  return {
    status: resp.status,
    statusText: resp.statusText || `${resp.status}`,
    headers: resp.headers || {},
    cookies,
    body: resp.body || '',
    timing: {
      total: resp.timing?.total || 0,
      detailed: resp.timing?.detailed ? {
        dns: resp.timing.detailed.dns,
        tcp: resp.timing.detailed.tcp,
        tls: resp.timing.detailed.tls,
        ttfb: resp.timing.detailed.ttfb,
        download: resp.timing.detailed.download,
      } : undefined,
    },
    logs: resp.logs || [],
  };
}

// ─── Public API ─────────────────────────────────────────────────────

export interface ExecutionError {
  message: string;
  isTimeout: boolean;
  isCancelled: boolean;
}

/**
 * Executes an HTTP request through the Wails Go backend.
 * Returns the structured ExecutionResult or throws an ExecutionError.
 */
export async function executeRequest(
  block: RequestBlock,
  env: EnvironmentNode | null,
  timeoutMs: number = 30000,
): Promise<ExecutionResult> {
  const coreReq = mapToRequest(block);
  const coreEnv = mapToEnvironment(env);

  try {
    const opts = {
      timeout_ms: timeoutMs,
      request_id: block.id,
    };
    const resp = await Execute(coreReq as any, coreEnv as any, opts as any) as unknown as CoreResponse;

    // Go executor returns errors in the response.error field (not as rejections)
    if (resp.error) {
      const isTimeout = resp.error.includes('deadline exceeded') || resp.error.includes('timeout');
      const isCancelled = resp.error.includes('context canceled');
      throw {
        message: resp.error,
        isTimeout,
        isCancelled,
      } as ExecutionError;
    }

    return mapToExecutionResult(resp);
  } catch (err: any) {
    // Already an ExecutionError from above
    if (err.isTimeout !== undefined) throw err;

    // Wails promise rejection (network-level or IPC failure)
    throw {
      message: err?.message || String(err) || 'Unknown execution error',
      isTimeout: false,
      isCancelled: false,
    } as ExecutionError;
  }
}

/**
 * Cancels an in-flight request by ID.
 */
export async function cancelRequest(requestId: string): Promise<void> {
  try {
    await CancelRequest(requestId);
  } catch {
    // Silently ignore cancel failures (request may already be complete)
  }
}
