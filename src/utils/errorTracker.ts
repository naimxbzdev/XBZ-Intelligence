// Central Error-Tracking Utility for Failed API Requests
// Persists error telemetry to localStorage so users and merchants
// can inspect, copy, and send technical diagnostics directly to technical support.

export interface ApiErrorLog {
  id: string;
  timestamp: string; // ISO string
  formattedTime: string; // Localized date/time
  endpoint: string; // e.g. '/api/check-phone'
  fullUrl: string; // Full resolved URL
  method: string; // GET, POST, PUT, DELETE
  statusCode: number; // 200 (if redirected to HTML), 400, 404, 500, or 0
  statusText: string;
  errorMessage: string; // User-facing description
  technicalDetails?: string; // Exact runtime exception (e.g. Unexpected token '<', "<!DOCTYPE ...)
  isHtmlResponse: boolean; // Flagged when a static host (Netlify) returns HTML for an API route
  requestPayload?: string; // Sanitized payload preview
  responseSnippet?: string; // First 300-500 characters of response body
  environment: {
    host: string;
    origin: string;
    userAgent: string;
    isNetlifyDetected: boolean;
    customApiConfigured: boolean;
  };
  context?: string; // 'phone_search' | 'batch_check' | 'courier_status' | 'auth' etc.
  suggestedFix?: string;
}

const STORAGE_KEY = 'xbz_api_error_logs';
const MAX_LOGS = 50;

type ErrorLogListener = (logs: ApiErrorLog[]) => void;
const listeners = new Set<ErrorLogListener>();

function notifyListeners() {
  const currentLogs = getApiErrorLogs();
  listeners.forEach((listener) => {
    try {
      listener(currentLogs);
    } catch (e) {
      console.error('Error notifying error log listener:', e);
    }
  });
}

/**
 * Retrieve all persisted API error logs from localStorage
 */
export function getApiErrorLogs(): ApiErrorLog[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error('Failed to parse API error logs from localStorage:', e);
    return [];
  }
}

/**
 * Save an API error log entry to localStorage
 */
export function logApiError(
  entry: Omit<ApiErrorLog, 'id' | 'timestamp' | 'formattedTime' | 'environment'> & {
    environment?: Partial<ApiErrorLog['environment']>;
  }
): ApiErrorLog {
  const id = `ERR-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
  const now = new Date();
  
  const host = typeof window !== 'undefined' ? window.location.hostname : 'unknown';
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const isNetlifyDetected = host.includes('netlify.app') || (entry.isHtmlResponse && entry.endpoint.startsWith('/api'));
  const customApiConfigured = typeof window !== 'undefined' && Boolean(localStorage.getItem('xbz_custom_api_url'));

  let suggestedFix = entry.suggestedFix;
  if (!suggestedFix) {
    if (entry.isHtmlResponse || isNetlifyDetected) {
      suggestedFix =
        'Netlify/স্ট্যাটিক হোস্টিং-এ ব্যাকএন্ড (Express server.ts) চালু নেই। Netlify Functions ডিপ্লয় করুন অথবা সেটিংস থেকে আপনার লাইভ ব্যাকএন্ড URL (Railway/Render) যুক্ত করুন।';
    } else if (entry.statusCode === 0) {
      suggestedFix =
        'নেটওয়ার্ক সংযোগ বা CORS সমস্যা। আপনার ইন্টারনেট সংযোগ পরীক্ষা করুন অথবা ব্যাকএন্ডের CORS সেটিংস যাচাই করুন।';
    } else if (entry.statusCode >= 500) {
      suggestedFix = 'সার্ভারে অভ্যন্তরীণ ত্রুটি হয়েছে। সার্ভার টার্মিনাল লগ বা কনসোল চেক করুন।';
    }
  }

  const completeLog: ApiErrorLog = {
    id,
    timestamp: now.toISOString(),
    formattedTime: now.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    }),
    endpoint: entry.endpoint,
    fullUrl: entry.fullUrl,
    method: entry.method || 'GET',
    statusCode: entry.statusCode,
    statusText: entry.statusText || '',
    errorMessage: entry.errorMessage,
    technicalDetails: entry.technicalDetails,
    isHtmlResponse: Boolean(entry.isHtmlResponse),
    requestPayload: entry.requestPayload,
    responseSnippet: entry.responseSnippet,
    context: entry.context,
    suggestedFix,
    environment: {
      host,
      origin,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
      isNetlifyDetected,
      customApiConfigured,
      ...(entry.environment || {}),
    },
  };

  try {
    const logs = getApiErrorLogs();
    logs.unshift(completeLog);
    // Retain only latest MAX_LOGS
    const trimmed = logs.slice(0, MAX_LOGS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
    notifyListeners();
  } catch (e) {
    console.error('Failed to persist API error log to localStorage:', e);
  }

  return completeLog;
}

/**
 * Clear all logged API errors
 */
export function clearApiErrorLogs(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
    notifyListeners();
  } catch (e) {
    console.error('Failed to clear API error logs:', e);
  }
}

/**
 * Remove a specific error log by ID
 */
export function removeApiErrorLog(id: string): void {
  try {
    const logs = getApiErrorLogs().filter((l) => l.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
    notifyListeners();
  } catch (e) {
    console.error('Failed to remove error log:', e);
  }
}

/**
 * Format a single error log as a clear, copy-pasteable Markdown report for technical support
 */
export function formatErrorLogForSupport(log: ApiErrorLog): string {
  const lines: string[] = [
    `🚨 [XBZ Intelligence - Technical Support Incident Report]`,
    `----------------------------------------------------`,
    `Incident ID: ${log.id}`,
    `Timestamp: ${log.formattedTime} (${log.timestamp})`,
    `Endpoint: ${log.method} ${log.endpoint}`,
    `Full URL: ${log.fullUrl}`,
    `Status Code: ${log.statusCode} ${log.statusText || ''}`,
    `Error Message: ${log.errorMessage}`,
  ];

  if (log.isHtmlResponse) {
    lines.push(
      `Root Cause: [STATIC HOSTING INTERCEPTION] Server returned HTML (<!DOCTYPE html>) instead of JSON API response.`,
      `Hosting Context: The application appears to be running on Netlify or a static SPA host without active Node.js server.ts.`
    );
  }

  if (log.technicalDetails) {
    lines.push(`Technical Error: ${log.technicalDetails}`);
  }

  if (log.suggestedFix) {
    lines.push(`Suggested Fix: ${log.suggestedFix}`);
  }

  if (log.requestPayload) {
    lines.push(`Request Payload: ${log.requestPayload}`);
  }

  if (log.responseSnippet) {
    lines.push(`Response Snippet:\n\`\`\`html\n${log.responseSnippet.slice(0, 400)}\n\`\`\``);
  }

  lines.push(
    `----------------------------------------------------`,
    `Environment Details:`,
    `- Hostname: ${log.environment.host}`,
    `- Origin: ${log.environment.origin}`,
    `- Netlify Detected: ${log.environment.isNetlifyDetected ? 'YES' : 'NO'}`,
    `- Custom Backend Configured: ${log.environment.customApiConfigured ? 'YES' : 'NO'}`,
    `- Browser User Agent: ${log.environment.userAgent}`,
    `----------------------------------------------------`,
    `Support Hotline: +8801703223141 (WhatsApp / Naim Xbz)`
  );

  return lines.join('\n');
}

/**
 * Format all error logs into a comprehensive diagnostic report
 */
export function formatAllLogsForSupport(): string {
  const logs = getApiErrorLogs();
  if (logs.length === 0) {
    return 'No error logs recorded. All API requests have succeeded.';
  }

  const header = [
    `📋 [XBZ Intelligence - Complete System Error Diagnostics]`,
    `Generated at: ${new Date().toLocaleString()}`,
    `Total Incidents Logged: ${logs.length}`,
    `Latest Incident: ${logs[0].id} (${logs[0].endpoint})`,
    `====================================================\n`,
  ].join('\n');

  const formattedLogs = logs.map((log, index) => {
    return `[Incident #${index + 1} of ${logs.length}]\n${formatErrorLogForSupport(log)}`;
  }).join('\n\n====================================================\n\n');

  return `${header}${formattedLogs}`;
}

/**
 * Copy text to clipboard with modern fallback
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
    // Fallback for older browsers or restricted iframe contexts
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-9999px';
    textArea.style.top = '0';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);
    return successful;
  } catch (err) {
    console.error('Failed to copy to clipboard:', err);
    return false;
  }
}

/**
 * Download logs as JSON file for technical support attachment
 */
export function downloadLogsAsJson(): void {
  const logs = getApiErrorLogs();
  const jsonStr = JSON.stringify(logs, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `xbz-error-logs-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Subscribe to error log changes
 */
export function subscribeToErrorLogs(listener: ErrorLogListener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
