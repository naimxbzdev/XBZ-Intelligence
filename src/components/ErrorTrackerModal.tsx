import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  X,
  Copy,
  Check,
  Trash2,
  Download,
  Terminal,
  Globe,
  ExternalLink,
  ChevronDown,
  ChevronRight,
  MessageCircle,
  HelpCircle,
  RefreshCw,
  Server,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';
import {
  getApiErrorLogs,
  clearApiErrorLogs,
  removeApiErrorLog,
  formatErrorLogForSupport,
  formatAllLogsForSupport,
  copyToClipboard,
  downloadLogsAsJson,
  subscribeToErrorLogs,
  type ApiErrorLog,
} from '../utils/errorTracker.ts';
import { getApiBaseUrl, setCustomApiBaseUrl } from '../utils/apiClient.ts';
import type { Language } from '../utils/translations.ts';

interface ErrorTrackerModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  onSelectLogId?: string | null;
}

export const ErrorTrackerModal: React.FC<ErrorTrackerModalProps> = ({
  isOpen,
  onClose,
  lang,
  onSelectLogId,
}) => {
  const [logs, setLogs] = useState<ApiErrorLog[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(onSelectLogId || null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);
  const [customBackendUrl, setCustomBackendUrl] = useState('');
  const [backendUrlSaved, setBackendUrlSaved] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'netlify' | 'server'>('all');

  // Load logs on mount & subscribe to real-time updates
  useEffect(() => {
    setLogs(getApiErrorLogs());
    setCustomBackendUrl(getApiBaseUrl());

    const unsubscribe = subscribeToErrorLogs((updated) => {
      setLogs(updated);
    });

    return () => {
      unsubscribe();
    };
  }, [isOpen]);

  useEffect(() => {
    if (onSelectLogId) {
      setExpandedId(onSelectLogId);
    }
  }, [onSelectLogId]);

  if (!isOpen) return null;

  const handleCopySingle = async (log: ApiErrorLog) => {
    const text = formatErrorLogForSupport(log);
    const success = await copyToClipboard(text);
    if (success) {
      setCopiedId(log.id);
      setTimeout(() => setCopiedId(null), 2500);
    }
  };

  const handleCopyAll = async () => {
    const text = formatAllLogsForSupport();
    const success = await copyToClipboard(text);
    if (success) {
      setCopiedAll(true);
      setTimeout(() => setCopiedAll(false), 2500);
    }
  };

  const handleSendToWhatsApp = (log?: ApiErrorLog) => {
    const text = log ? formatErrorLogForSupport(log) : formatAllLogsForSupport();
    const encoded = encodeURIComponent(`হ্যালো XBZ সাপোর্ট টিম, আমার অ্যাপে নিচের এররটি দেখা দিচ্ছে:\n\n${text}`);
    window.open(`https://wa.me/8801703223141?text=${encoded}`, '_blank', 'noopener,noreferrer');
  };

  const handleSaveCustomBackend = (e: React.FormEvent) => {
    e.preventDefault();
    setCustomApiBaseUrl(customBackendUrl);
    setBackendUrlSaved(true);
    setTimeout(() => setBackendUrlSaved(false), 2500);
  };

  const handleClear = () => {
    if (window.confirm(lang === 'bn' ? 'আপনি কি নিশ্চিত সব এরর লগ মুছে ফেলতে চান?' : 'Clear all error logs?')) {
      clearApiErrorLogs();
      setLogs([]);
    }
  };

  const netlifyLogsCount = logs.filter((l) => l.isHtmlResponse).length;

  const filteredLogs = logs.filter((l) => {
    if (activeFilter === 'netlify') return l.isHtmlResponse;
    if (activeFilter === 'server') return !l.isHtmlResponse;
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col bg-[#0b101b] border border-cyan-500/30 rounded-2xl shadow-2xl shadow-cyan-950/60 overflow-hidden text-slate-100">
        
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 bg-slate-900/60 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-lg text-white">
                  {lang === 'bn' ? 'সেন্ট্রাল এপিআই এরর ট্র্যাকার ও সাপোর্ট ডায়াগনস্টিক' : 'Central API Error Tracker & Diagnostics'}
                </h3>
                <span className="px-2 py-0.5 rounded-full text-xs font-mono font-semibold bg-rose-950 text-rose-300 border border-rose-500/30">
                  {logs.length} {lang === 'bn' ? 'লগ' : 'Logs'}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {lang === 'bn'
                  ? 'ব্যর্থ এপিআই রিকোয়েস্টের পূর্ণাঙ্গ টেকনিক্যাল লগ ও সাপোর্ট টিমের জন্য তাৎক্ষণিক কপি সিস্টেম'
                  : 'Failed API calls logged to localStorage. Copy and share with technical support.'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          
          {/* NETLIFY DOCTYPE WARNING EXPLANATION CARD (If Netlify issue detected) */}
          {netlifyLogsCount > 0 && (
            <div className="p-4 rounded-xl bg-gradient-to-r from-amber-950/50 via-rose-950/40 to-slate-900 border border-amber-500/40 shadow-lg">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-6 h-6 text-amber-400 shrink-0 mt-0.5" />
                <div className="space-y-2 flex-1">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <h4 className="font-bold text-sm text-amber-300 flex items-center gap-2">
                      <span>Netlify স্ট্যাটিক হোস্টিং ইন্টারসেপশন সনাক্ত হয়েছে</span>
                      <span className="px-2 py-0.5 rounded text-[11px] bg-amber-500/20 text-amber-200 border border-amber-500/30 font-mono">
                        Unexpected token '&lt;'
                      </span>
                    </h4>
                  </div>
                  
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {lang === 'bn' ? (
                      <>
                        <strong>কেন এই সমস্যা হচ্ছে?</strong> Netlify হলো মূলত একটি স্ট্যাটিক ফাইল হোস্টার। যখন আপনি সাইটটি Netlify-তে হোস্ট করেন, তখন ব্যাকএন্ড এক্সপ্রেস সার্ভার (<code className="text-cyan-300 bg-slate-950 px-1 py-0.5 rounded">server.ts</code>) সেখানে ব্যাকগ্রাউন্ডে চালু থাকে না। ফলে ব্রাউজার যখন <code className="text-cyan-300 bg-slate-950 px-1 py-0.5 rounded">/api/check-phone</code> এ কল করে, Netlify এর SPA রিডাইরেক্ট রুল অনুযায়ী <code className="text-cyan-300 bg-slate-950 px-1 py-0.5 rounded">index.html</code> ফাইল রিটার্ন করে। তখন ব্রাউজার HTML-কে JSON হিসেবে পার্স করতে গিয়ে <code className="text-rose-300 font-mono">Unexpected token '&lt;', "&lt;!DOCTYPE "... is not valid JSON</code> এরর প্রদর্শন করে।
                      </>
                    ) : (
                      <>
                        <strong>Root Cause:</strong> Netlify is serving the static SPA build. When fetching <code className="text-cyan-300">/api/*</code>, Netlify's SPA fallback rewrites the request to <code className="text-cyan-300">/index.html</code> (HTML starting with <code className="text-rose-300">&lt;!DOCTYPE html&gt;</code>). The browser attempts to parse HTML as JSON, producing this exact syntax error.
                      </>
                    )}
                  </p>

                  <div className="pt-1 flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleSendToWhatsApp()}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md transition-colors"
                    >
                      <MessageCircle className="w-3.5 h-3.5 fill-current" />
                      <span>{lang === 'bn' ? 'হোয়াটসঅ্যাপ সাপোর্টে সমাধান নিন' : 'Contact WhatsApp Support'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleCopyAll}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1.5 border border-slate-700 transition-colors"
                    >
                      {copiedAll ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedAll ? (lang === 'bn' ? 'কপি হয়েছে!' : 'Copied!') : (lang === 'bn' ? 'সব ডায়াগনস্টিক রিপোর্ট কপি করুন' : 'Copy All Diagnostics')}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Quick Backend Configuration Card */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Server className="w-4 h-4 text-cyan-400" />
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  {lang === 'bn' ? 'কাস্টম ব্যাকএন্ড সার্ভার কনফিগারেশন (ঐচ্ছিক)' : 'Custom Backend API URL (Optional)'}
                </h4>
              </div>
              <span className="text-[11px] text-slate-400">
                {lang === 'bn' ? 'Netlify ফ্রন্টএন্ড থেকে বহিরাগত ব্যাকএন্ড সংযুক্ত করতে' : 'Connect Netlify frontend to deployed backend'}
              </span>
            </div>

            <form onSubmit={handleSaveCustomBackend} className="flex flex-col sm:flex-row gap-2">
              <input
                type="url"
                value={customBackendUrl}
                onChange={(e) => setCustomBackendUrl(e.target.value)}
                placeholder="https://xbz-backend.onrender.com বা https://api.my-domain.com"
                className="flex-1 bg-slate-950 border border-slate-700 focus:border-cyan-400 text-xs text-white px-3 py-2 rounded-lg outline-none font-mono"
              />
              <div className="flex items-center gap-2">
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition-colors shrink-0"
                >
                  {backendUrlSaved ? (lang === 'bn' ? 'সংরক্ষিত!' : 'Saved!') : (lang === 'bn' ? 'সেভ করুন' : 'Save URL')}
                </button>
                {customBackendUrl && (
                  <button
                    type="button"
                    onClick={() => {
                      setCustomBackendUrl('');
                      setCustomApiBaseUrl(null);
                    }}
                    className="px-2.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition-colors"
                    title="Reset to default relative API"
                  >
                    {lang === 'bn' ? 'রিসেট' : 'Reset'}
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Action Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-lg border border-slate-800 text-xs">
              <button
                type="button"
                onClick={() => setActiveFilter('all')}
                className={`px-2.5 py-1 rounded-md transition-all font-medium ${
                  activeFilter === 'all' ? 'bg-cyan-500/20 text-cyan-300 font-semibold' : 'text-slate-400 hover:text-white'
                }`}
              >
                {lang === 'bn' ? 'সব লগ' : 'All'} ({logs.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveFilter('netlify')}
                className={`px-2.5 py-1 rounded-md transition-all font-medium ${
                  activeFilter === 'netlify' ? 'bg-amber-500/20 text-amber-300 font-semibold' : 'text-slate-400 hover:text-white'
                }`}
              >
                Netlify / HTML ({netlifyLogsCount})
              </button>
              <button
                type="button"
                onClick={() => setActiveFilter('server')}
                className={`px-2.5 py-1 rounded-md transition-all font-medium ${
                  activeFilter === 'server' ? 'bg-rose-500/20 text-rose-300 font-semibold' : 'text-slate-400 hover:text-white'
                }`}
              >
                {lang === 'bn' ? 'অন্যান্য' : 'Others'} ({logs.length - netlifyLogsCount})
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopyAll}
                disabled={logs.length === 0}
                className="px-3 py-1.5 rounded-lg bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/30 text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-40"
              >
                {copiedAll ? <Check className="w-3.5 h-3.5 text-cyan-300" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedAll ? (lang === 'bn' ? 'কপি হয়েছে!' : 'Copied!') : (lang === 'bn' ? 'রিপোর্ট কপি' : 'Copy All')}</span>
              </button>

              <button
                type="button"
                onClick={downloadLogsAsJson}
                disabled={logs.length === 0}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium flex items-center gap-1.5 transition-colors disabled:opacity-40"
                title="Download JSON"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">JSON</span>
              </button>

              <button
                type="button"
                onClick={handleClear}
                disabled={logs.length === 0}
                className="px-3 py-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-800/40 text-xs font-medium flex items-center gap-1.5 transition-colors disabled:opacity-40"
                title="Clear Logs"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{lang === 'bn' ? 'মুছুন' : 'Clear'}</span>
              </button>
            </div>
          </div>

          {/* Logs List */}
          {filteredLogs.length === 0 ? (
            <div className="py-12 text-center rounded-xl border border-dashed border-slate-800 text-slate-400 space-y-2">
              <Check className="w-8 h-8 mx-auto text-emerald-400/80" />
              <p className="text-sm font-semibold text-slate-200">
                {lang === 'bn' ? 'কোনো ব্যর্থ এপিআই এরর লগ নেই' : 'No failed API error logs found'}
              </p>
              <p className="text-xs text-slate-500">
                {lang === 'bn'
                  ? 'আপনার সব এপিআই রিকোয়েস্ট সফলভাবে সম্পন্ন হয়েছে অথবা লগ মুছে ফেলা হয়েছে।'
                  : 'All API requests have completed successfully or the logs were cleared.'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredLogs.map((log) => {
                const isExpanded = expandedId === log.id;
                const isCopied = copiedId === log.id;

                return (
                  <div
                    key={log.id}
                    className={`rounded-xl border transition-all ${
                      log.isHtmlResponse
                        ? 'bg-amber-950/20 border-amber-500/30'
                        : log.statusCode >= 500
                        ? 'bg-rose-950/20 border-rose-500/30'
                        : 'bg-slate-900/50 border-slate-800'
                    }`}
                  >
                    {/* Collapsed Header */}
                    <div
                      className="p-3 sm:p-4 flex items-center justify-between gap-3 cursor-pointer select-none"
                      onClick={() => setExpandedId(isExpanded ? null : log.id)}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <button
                          type="button"
                          className="text-slate-400 hover:text-white shrink-0"
                        >
                          {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                        </button>

                        <span
                          className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold shrink-0 ${
                            log.method === 'POST'
                              ? 'bg-blue-950 text-blue-300 border border-blue-500/30'
                              : 'bg-emerald-950 text-emerald-300 border border-emerald-500/30'
                          }`}
                        >
                          {log.method}
                        </span>

                        <span
                          className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold shrink-0 ${
                            log.isHtmlResponse
                              ? 'bg-amber-900 text-amber-200 border border-amber-400/40'
                              : log.statusCode === 0
                              ? 'bg-slate-800 text-slate-300'
                              : log.statusCode >= 500
                              ? 'bg-rose-900 text-rose-200'
                              : 'bg-amber-950 text-amber-300'
                          }`}
                        >
                          {log.statusCode === 0 ? 'NET_ERR' : `HTTP ${log.statusCode}`}
                        </span>

                        <div className="min-w-0">
                          <p className="text-xs sm:text-sm font-semibold text-white truncate font-mono">
                            {log.endpoint}
                          </p>
                          <p className="text-[11px] text-slate-400 truncate">
                            {log.errorMessage}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[11px] text-slate-500 font-mono hidden md:inline">
                          {log.formattedTime}
                        </span>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopySingle(log);
                          }}
                          className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1 transition-colors"
                          title="Copy this error"
                        >
                          {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          <span className="hidden sm:inline">{isCopied ? 'কপি হয়েছে' : 'কপি'}</span>
                        </button>
                      </div>
                    </div>

                    {/* Expanded Detail Panel */}
                    {isExpanded && (
                      <div className="p-4 pt-1 border-t border-slate-800/80 bg-black/40 text-xs space-y-3 font-mono">
                        
                        {/* Root Cause Banner if HTML */}
                        {log.isHtmlResponse && (
                          <div className="p-2.5 rounded-lg bg-amber-950/40 border border-amber-500/30 text-amber-200 font-sans leading-relaxed">
                            <strong>⚠️ স্ট্যাটিক হোস্ট সমস্যা:</strong> এই এপিআই রিকোয়েস্টে ব্যাকএন্ড এক্সপ্রেস সার্ভার পাওয়া যায়নি। Netlify-এর ক্যাচ-অল SPA রিডাইরেক্ট (<code className="text-amber-100 font-mono">/* -&gt; /index.html 200</code>) রিকোয়েস্টটি ধরে ফেলে <code className="text-amber-100 font-mono">&lt;!DOCTYPE html&gt;</code> পেজ রিটার্ন করেছে।
                          </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px]">
                          <div>
                            <span className="text-slate-500">Incident ID:</span>{' '}
                            <span className="text-cyan-400 select-all">{log.id}</span>
                          </div>
                          <div>
                            <span className="text-slate-500">Timestamp:</span>{' '}
                            <span className="text-slate-300">{log.timestamp}</span>
                          </div>
                          <div className="md:col-span-2 truncate">
                            <span className="text-slate-500">Full URL:</span>{' '}
                            <span className="text-slate-300 select-all">{log.fullUrl}</span>
                          </div>
                          {log.environment && (
                            <div className="md:col-span-2 text-slate-400">
                              <span className="text-slate-500">Host:</span> {log.environment.host} |{' '}
                              <span className="text-slate-500">Netlify Detected:</span>{' '}
                              {log.environment.isNetlifyDetected ? 'YES' : 'NO'}
                            </div>
                          )}
                        </div>

                        {log.technicalDetails && (
                          <div>
                            <span className="text-slate-400 text-[11px] block mb-1 font-sans font-bold">
                              Technical Error Message:
                            </span>
                            <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-rose-300 overflow-x-auto text-[11px]">
                              {log.technicalDetails}
                            </div>
                          </div>
                        )}

                        {log.requestPayload && (
                          <div>
                            <span className="text-slate-400 text-[11px] block mb-1 font-sans font-bold">
                              Request Payload:
                            </span>
                            <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-cyan-300 overflow-x-auto text-[11px]">
                              {log.requestPayload}
                            </div>
                          </div>
                        )}

                        {log.responseSnippet && (
                          <div>
                            <span className="text-slate-400 text-[11px] block mb-1 font-sans font-bold">
                              Response Snippet (First 400 chars):
                            </span>
                            <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-400 overflow-x-auto text-[11px]">
                              {log.responseSnippet}
                            </div>
                          </div>
                        )}

                        {log.suggestedFix && (
                          <div>
                            <span className="text-emerald-400 text-[11px] block mb-1 font-sans font-bold">
                              💡 Suggested Fix / প্রস্তাবিত সমাধান:
                            </span>
                            <div className="p-2.5 rounded-lg bg-emerald-950/20 border border-emerald-500/20 text-emerald-200 font-sans text-xs">
                              {log.suggestedFix}
                            </div>
                          </div>
                        )}

                        {/* Quick action buttons for this log */}
                        <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-slate-800/60 font-sans">
                          <button
                            type="button"
                            onClick={() => handleSendToWhatsApp(log)}
                            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
                          >
                            <MessageCircle className="w-3.5 h-3.5 fill-current" />
                            <span>{lang === 'bn' ? 'হোয়াটসঅ্যাপে এরর পাঠান' : 'Send to WhatsApp'}</span>
                          </button>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleCopySingle(log)}
                              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                            >
                              {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                              <span>{isCopied ? (lang === 'bn' ? 'কপি হয়েছে' : 'Copied') : (lang === 'bn' ? 'রিপোর্ট কপি করুন' : 'Copy Incident Report')}</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => removeApiErrorLog(log.id)}
                              className="p-1.5 rounded-lg hover:bg-rose-950/60 text-slate-400 hover:text-rose-400 transition-colors"
                              title="Delete this log"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 border-t border-slate-800 bg-slate-900/80 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="text-slate-400 flex items-center gap-2">
            <span>২৪/৭ সাপোর্ট হটলাইন:</span>
            <a
              href="https://wa.me/8801703223141"
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-400 hover:underline font-mono font-semibold"
            >
              +8801703223141 (Naim Xbz)
            </a>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
            >
              {lang === 'bn' ? 'বন্ধ করুন' : 'Close'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
