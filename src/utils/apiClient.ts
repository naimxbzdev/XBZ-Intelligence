// Central Safe API Client with Netlify SPA Rewrite Detection,
// Centralized Error-Tracking Logging, and Custom Backend URL Support.

import { logApiError, type ApiErrorLog } from './errorTracker.ts';
import { performClientSideFallbackAnalysis } from './clientFallbackEngine.ts';

export class ApiError extends Error {
  public statusCode: number;
  public statusText: string;
  public endpoint: string;
  public fullUrl: string;
  public isHtmlResponse: boolean;
  public errorLogId?: string;
  public responseSnippet?: string;

  constructor(options: {
    message: string;
    statusCode: number;
    statusText: string;
    endpoint: string;
    fullUrl: string;
    isHtmlResponse: boolean;
    errorLogId?: string;
    responseSnippet?: string;
  }) {
    super(options.message);
    this.name = 'ApiError';
    this.statusCode = options.statusCode;
    this.statusText = options.statusText;
    this.endpoint = options.endpoint;
    this.fullUrl = options.fullUrl;
    this.isHtmlResponse = options.isHtmlResponse;
    this.errorLogId = options.errorLogId;
    this.responseSnippet = options.responseSnippet;
  }
}

/**
 * Resolves the target API base URL.
 * Checks localStorage for user-configured custom backend URL,
 * then checks VITE_API_BASE_URL env, and defaults to relative root ('').
 */
export function getApiBaseUrl(): string {
  if (typeof window !== 'undefined') {
    const custom = localStorage.getItem('xbz_custom_api_url');
    if (custom && custom.trim()) {
      return custom.trim().replace(/\/+$/, '');
    }
  }
  const envUrl = (import.meta as any).env?.VITE_API_BASE_URL;
  if (envUrl && typeof envUrl === 'string' && envUrl.trim()) {
    return envUrl.trim().replace(/\/+$/, '');
  }
  return '';
}

/**
 * Set custom backend URL in localStorage
 */
export function setCustomApiBaseUrl(url: string | null): void {
  if (typeof window === 'undefined') return;
  if (!url || !url.trim()) {
    localStorage.removeItem('xbz_custom_api_url');
  } else {
    localStorage.setItem('xbz_custom_api_url', url.trim().replace(/\/+$/, ''));
  }
}

export interface ApiRequestOptions extends RequestInit {
  context?: string; // e.g. 'phone_search', 'batch_check', 'reports', etc.
  allowFallback?: boolean; // When true and static HTML is returned, run client fallback
}

/**
 * Central API fetcher with:
 * 1. Pre-JSON verification (prevents "Unexpected token '<', <!DOCTYPE..." crash)
 * 2. Static host (Netlify) SPA rewrite detection
 * 3. Central Error-Tracking persistence to localStorage
 * 4. Automatic client-side fallback if enabled
 */
export async function safeApiFetch<T = any>(
  endpoint: string,
  options: ApiRequestOptions = {}
): Promise<T> {
  const baseUrl = getApiBaseUrl();
  const fullUrl = endpoint.startsWith('http://') || endpoint.startsWith('https://')
    ? endpoint
    : `${baseUrl}${endpoint}`;

  const method = (options.method || 'GET').toUpperCase();
  const context = options.context || endpoint;
  let requestPayloadPreview: string | undefined;

  if (options.body && typeof options.body === 'string') {
    try {
      const parsed = JSON.parse(options.body);
      // Mask password fields for privacy
      const sanitized = { ...parsed };
      if (sanitized.password) sanitized.password = '******';
      if (sanitized.adminPasskey) sanitized.adminPasskey = '******';
      requestPayloadPreview = JSON.stringify(sanitized);
    } catch {
      requestPayloadPreview = options.body.slice(0, 200);
    }
  }

  let res: Response;
  try {
    res = await fetch(fullUrl, {
      ...options,
      headers: {
        'Accept': 'application/json',
        ...(options.headers || {}),
      },
    });
  } catch (networkErr: any) {
    const errorMsg = networkErr.message || 'নেটওয়ার্ক সংযোগ বা সার্ভারে পৌঁছানো সম্ভব হয়নি।';
    
    // Check if phone search and client fallback is allowed
    if (options.allowFallback && endpoint === '/api/check-phone' && requestPayloadPreview) {
      try {
        const { phone } = JSON.parse(requestPayloadPreview);
        if (phone) {
          const fallbackData = performClientSideFallbackAnalysis(phone);
          return fallbackData as unknown as T;
        }
      } catch {}
    }

    const logEntry = logApiError({
      endpoint,
      fullUrl,
      method,
      statusCode: 0,
      statusText: 'Network / Connection Failure',
      errorMessage: errorMsg,
      technicalDetails: networkErr.stack || networkErr.toString(),
      isHtmlResponse: false,
      requestPayload: requestPayloadPreview,
      context,
    });

    throw new ApiError({
      message: `${errorMsg} (Error ID: ${logEntry.id})`,
      statusCode: 0,
      statusText: 'Network Error',
      endpoint,
      fullUrl,
      isHtmlResponse: false,
      errorLogId: logEntry.id,
    });
  }

  // Read response as text first to inspect content type and doctype before parsing JSON
  const rawText = await res.text();
  const contentType = res.headers.get('content-type') || '';
  const trimmedText = rawText.trim();

  // CRITICAL CHECK: Detect HTML response (<!DOCTYPE html> or <html>)
  const isHtml =
    contentType.includes('text/html') ||
    trimmedText.startsWith('<!DOCTYPE') ||
    trimmedText.startsWith('<!doctype') ||
    trimmedText.startsWith('<html');

  if (isHtml) {
    const isNetlify = typeof window !== 'undefined' && (
      window.location.hostname.includes('netlify.app') ||
      Boolean(res.headers.get('x-nf-request-id'))
    );

    const hostLabel = isNetlify ? 'Netlify' : 'Static Web Host';
    const responseSnippet = trimmedText.slice(0, 400);

    // If client fallback is allowed for phone search, provide offline analysis
    if (options.allowFallback && endpoint === '/api/check-phone' && requestPayloadPreview) {
      try {
        const { phone } = JSON.parse(requestPayloadPreview);
        if (phone) {
          // Log the incident for support diagnostics
          logApiError({
            endpoint,
            fullUrl,
            method,
            statusCode: res.status,
            statusText: res.statusText || 'OK (Rewritten to index.html)',
            errorMessage: `${hostLabel}-তে ব্যাকএন্ড (Express server.ts) সক্রিয় না থাকায় ক্লায়েন্ট-সাইড অফলাইন ইঞ্জিনে রেজাল্ট তৈরি করা হয়েছে।`,
            technicalDetails: `Unexpected token '<', "<!DOCTYPE "... is not valid JSON. Response starts with: ${responseSnippet.slice(0, 120)}`,
            isHtmlResponse: true,
            requestPayload: requestPayloadPreview,
            responseSnippet,
            context,
            suggestedFix: 'Netlify Functions ব্যবহার করুন অথবা Settings থেকে আপনার লাইভ ব্যাকএন্ড URL (Railway/Render) কনফিগার করুন।',
          });

          const fallbackResult = performClientSideFallbackAnalysis(phone);
          return fallbackResult as unknown as T;
        }
      } catch (fbErr) {
        console.error('Fallback execution error:', fbErr);
      }
    }

    const friendlyMessage = isNetlify
      ? 'Netlify স্ট্যাটিক হোস্টিং সনাক্ত হয়েছে: ব্যাকএন্ড এক্সপ্রেস সার্ভার (server.ts) চালু নেই, ফলে /api রিকোয়েস্টে index.html এসেছে। দয়া করে এরর ডিটেইলস কপি করে সাপোর্ট নিন অথবা কাস্টম ব্যাকএন্ড URL সেট করুন।'
      : `${hostLabel}-এ এপিআই রিকোয়েস্টে JSON এর বদলে HTML রেসপন্স এসেছে। সার্ভার সঠিক কনফিগারেশনে চালু আছে কি না পরীক্ষা করুন।`;

    const technicalDetails = `Unexpected token '<', "<!DOCTYPE "... is not valid JSON (HTTP ${res.status}). Server returned HTML instead of application/json.`;

    const logEntry = logApiError({
      endpoint,
      fullUrl,
      method,
      statusCode: res.status,
      statusText: `${res.statusText || 'OK'} (HTML Intercepted)`,
      errorMessage: friendlyMessage,
      technicalDetails,
      isHtmlResponse: true,
      requestPayload: requestPayloadPreview,
      responseSnippet,
      context,
      suggestedFix:
        'Netlify Functions ডিপ্লয় করুন অথবা Settings থেকে একটি ডেপ্লয়েড Express ব্যাকএন্ড সার্ভার (যেমন Render / Railway) এর URL যুক্ত করুন।',
    });

    throw new ApiError({
      message: `${friendlyMessage} [Incident ID: ${logEntry.id}]`,
      statusCode: res.status,
      statusText: res.statusText,
      endpoint,
      fullUrl,
      isHtmlResponse: true,
      errorLogId: logEntry.id,
      responseSnippet,
    });
  }

  // Parse JSON
  let parsedJson: any;
  try {
    parsedJson = trimmedText ? JSON.parse(trimmedText) : {};
  } catch (jsonErr: any) {
    const errorLog = logApiError({
      endpoint,
      fullUrl,
      method,
      statusCode: res.status,
      statusText: res.statusText,
      errorMessage: 'রেসপন্স থেকে সঠিক JSON ডেটা পার্স করা সম্ভব হয়নি।',
      technicalDetails: jsonErr.message,
      isHtmlResponse: false,
      requestPayload: requestPayloadPreview,
      responseSnippet: trimmedText.slice(0, 300),
      context,
    });

    throw new ApiError({
      message: `Invalid JSON response from server. [ID: ${errorLog.id}]`,
      statusCode: res.status,
      statusText: res.statusText,
      endpoint,
      fullUrl,
      isHtmlResponse: false,
      errorLogId: errorLog.id,
      responseSnippet: trimmedText.slice(0, 300),
    });
  }

  // If response is not OK (e.g. 400, 401, 404, 500)
  if (!res.ok) {
    const serverErrorMsg = parsedJson.error || parsedJson.message || `সার্ভার ত্রুটি (${res.status})`;

    const errorLog = logApiError({
      endpoint,
      fullUrl,
      method,
      statusCode: res.status,
      statusText: res.statusText,
      errorMessage: serverErrorMsg,
      technicalDetails: JSON.stringify(parsedJson),
      isHtmlResponse: false,
      requestPayload: requestPayloadPreview,
      responseSnippet: trimmedText.slice(0, 300),
      context,
    });

    throw new ApiError({
      message: serverErrorMsg,
      statusCode: res.status,
      statusText: res.statusText,
      endpoint,
      fullUrl,
      isHtmlResponse: false,
      errorLogId: errorLog.id,
      responseSnippet: trimmedText.slice(0, 300),
    });
  }

  return parsedJson as T;
}
