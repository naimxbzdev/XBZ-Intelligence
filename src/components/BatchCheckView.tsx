import React, { useState } from 'react';
import { Layers, Download, Loader2, Play, CheckCircle2, AlertTriangle, AlertOctagon, UserPlus, RefreshCw } from 'lucide-react';
import type { Language } from '../utils/translations.ts';
import { translations } from '../utils/translations.ts';

interface BatchCheckViewProps {
  lang: Language;
}

export const BatchCheckView: React.FC<BatchCheckViewProps> = ({ lang }) => {
  const [inputNumbers, setInputNumbers] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const t = translations[lang];

  const sampleNumbers = `01711223344\n01811223344\n01911223344\n01611223344\n01511223344\n01799887766`;

  const handleLoadSample = () => {
    setInputNumbers(sampleNumbers);
  };

  const handleRunBatch = async () => {
    const rawList = inputNumbers
      .split(/[\n,]+/)
      .map((s) => s.trim())
      .filter(Boolean);

    if (rawList.length === 0) {
      setError(lang === 'bn' ? 'কমপক্ষে একটি মোবাইল নম্বর দিন।' : 'Please enter at least one phone number.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/batch-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phones: rawList }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Batch check failed');
      }

      setResults(data.results || []);
    } catch (err: any) {
      setError(err.message || 'Error running batch check');
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    if (results.length === 0) return;

    const headers = ['Phone', 'Operator', 'Total Orders', 'Delivered', 'Cancelled', 'Delivery Rate (%)', 'Risk Level'];
    const rows = results.map((r) => [
      r.phone || '',
      r.operator || '',
      r.totalOrders || 0,
      r.deliveredOrders || 0,
      r.cancelledOrders || 0,
      r.deliveryRate !== undefined ? `${r.deliveryRate}%` : '',
      r.riskLevel || '',
    ]);

    const csvContent = [headers.join(','), ...rows.map((row) => row.map((item) => `"${item}"`).join(','))].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `xbz_batch_check_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getRiskBadge = (level: string) => {
    switch (level) {
      case 'low':
        return <span className="px-2 py-0.5 rounded text-xs font-semibold bg-emerald-950/40 text-emerald-300 border border-emerald-500/30">Low Risk</span>;
      case 'medium':
        return <span className="px-2 py-0.5 rounded text-xs font-semibold bg-amber-950/40 text-amber-300 border border-amber-500/30">Medium</span>;
      case 'high':
        return <span className="px-2 py-0.5 rounded text-xs font-semibold bg-rose-950/40 text-rose-300 border border-rose-500/30">High Risk</span>;
      case 'blacklisted':
        return <span className="px-2 py-0.5 rounded text-xs font-semibold bg-red-950/60 text-red-200 border border-red-500/50">Blacklisted</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-700">New</span>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-cyan-400" />
            <span>{t.batch.title}</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            {t.batch.subtitle}
          </p>
        </div>

        <button
          onClick={handleLoadSample}
          className="self-start sm:self-auto px-3 py-1.5 text-xs font-medium text-cyan-300 bg-cyan-950/40 hover:bg-cyan-900/50 border border-cyan-500/30 rounded-lg transition-colors flex items-center gap-1.5"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>{t.batch.sampleLoad}</span>
        </button>
      </div>

      {/* Input Box Container */}
      <div className="p-5 rounded-2xl bg-[#0d1527]/80 border border-slate-800 space-y-4">
        <textarea
          rows={5}
          value={inputNumbers}
          onChange={(e) => setInputNumbers(e.target.value)}
          placeholder={t.batch.placeholder}
          className="w-full bg-slate-900/70 border border-slate-700/60 focus:border-cyan-400 text-white placeholder-slate-500 p-3.5 rounded-xl font-mono text-sm outline-none resize-none"
        />

        {error && (
          <p className="text-xs text-rose-400 bg-rose-950/40 border border-rose-500/30 p-2.5 rounded-lg">
            {error}
          </p>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <span className="text-xs text-slate-400">
            {lang === 'bn' ? 'একবারে সর্বোচ্চ ৩০টি ফোন নম্বর চেক করা যায়।' : 'Up to 30 numbers per batch query.'}
          </span>

          <div className="flex items-center gap-2">
            {results.length > 0 && (
              <button
                onClick={handleExportCSV}
                className="px-4 py-2.5 text-xs font-semibold text-slate-200 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition-colors flex items-center gap-2"
              >
                <Download className="w-4 h-4 text-cyan-400" />
                <span>{t.batch.exportCsv}</span>
              </button>
            )}

            <button
              onClick={handleRunBatch}
              disabled={loading}
              className="px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs sm:text-sm rounded-xl transition-all flex items-center gap-2 shadow-lg shadow-cyan-500/20 disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{lang === 'bn' ? 'যাচাই হচ্ছে...' : 'Processing...'}</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>{t.batch.checkBtn}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Results Table */}
      {results.length > 0 && (
        <div className="rounded-2xl bg-[#0d1527]/80 border border-slate-800 overflow-hidden">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              {lang === 'bn' ? `ফলাফল (${results.length}টি নম্বর)` : `Results (${results.length} numbers)`}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/80 text-slate-400 uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">{t.batch.colPhone}</th>
                  <th className="py-3 px-4">{t.batch.colOperator}</th>
                  <th className="py-3 px-4 text-right">{t.batch.colTotal}</th>
                  <th className="py-3 px-4 text-right">{t.batch.colDelivered}</th>
                  <th className="py-3 px-4 text-right">{t.batch.colRate}</th>
                  <th className="py-3 px-4 text-center">{t.batch.colRisk}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {results.map((res, i) => (
                  <tr key={i} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-4 text-white font-bold">{res.phone}</td>
                    <td className="py-3 px-4 text-slate-300 font-sans">{res.operator || '-'}</td>
                    <td className="py-3 px-4 text-right text-slate-200 tabular-nums">{res.totalOrders || 0}</td>
                    <td className="py-3 px-4 text-right text-emerald-400 tabular-nums">{res.deliveredOrders || 0}</td>
                    <td className="py-3 px-4 text-right text-cyan-300 tabular-nums font-bold">
                      {res.deliveryRate !== undefined ? `${res.deliveryRate}%` : '-'}
                    </td>
                    <td className="py-3 px-4 text-center font-sans">
                      {getRiskBadge(res.riskLevel)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
