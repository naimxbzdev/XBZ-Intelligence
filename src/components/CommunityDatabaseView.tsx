import React, { useState, useEffect } from 'react';
import { Database, Search, FileWarning, Plus, ShieldCheck, Filter, RefreshCw, Calendar, Store } from 'lucide-react';
import type { Language } from '../utils/translations.ts';
import { translations } from '../utils/translations.ts';
import type { FraudReport } from '../types/intelligence.ts';

interface CommunityDatabaseViewProps {
  lang: Language;
  onOpenReportModal: () => void;
}

export const CommunityDatabaseView: React.FC<CommunityDatabaseViewProps> = ({
  lang,
  onOpenReportModal,
}) => {
  const [reports, setReports] = useState<FraudReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const t = translations[lang];

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/reports');
      const data = await res.json();
      if (Array.isArray(data)) {
        setReports(data);
      }
    } catch (e) {
      // fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const filteredReports = reports.filter((r) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      r.phone.includes(q) ||
      (r.customerName && r.customerName.toLowerCase().includes(q)) ||
      r.reporterStore.toLowerCase().includes(q) ||
      r.reason.toLowerCase().includes(q)
    );
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
            <Database className="w-5 h-5 text-cyan-400" />
            <span>{t.community.title}</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
            {t.community.subtitle}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchReports}
            className="p-2 text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700 border border-slate-700 rounded-xl transition-colors"
            title="Refresh database"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-cyan-400' : ''}`} />
          </button>

          <button
            onClick={onOpenReportModal}
            className="px-4 py-2.5 text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 rounded-xl shadow-lg shadow-rose-900/30 transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>{t.community.reportBtn}</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-3.5 rounded-2xl bg-[#0d1527]/80 border border-slate-800 flex items-center gap-3">
        <Search className="w-4 h-4 text-slate-400 shrink-0 ml-1" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={t.community.searchPlaceholder}
          className="w-full bg-transparent text-white placeholder-slate-500 text-xs sm:text-sm outline-none"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="text-xs text-slate-400 hover:text-white px-2 py-1"
          >
            Clear
          </button>
        )}
      </div>

      {/* Database Listing */}
      <div className="space-y-3">
        {loading ? (
          <div className="p-8 text-center text-xs text-slate-400">
            {lang === 'bn' ? 'ডাটাবেস লোড হচ্ছে...' : 'Loading community database...'}
          </div>
        ) : filteredReports.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400 rounded-2xl bg-[#0d1527]/60 border border-slate-800">
            {lang === 'bn' ? 'কোনো অভিযোগ খুঁজে পাওয়া যায়নি।' : 'No reports matching search query.'}
          </div>
        ) : (
          filteredReports.map((report) => (
            <div
              key={report.id}
              className="p-4 sm:p-5 rounded-2xl bg-[#0d1527]/80 border border-slate-800 hover:border-slate-700 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="text-base font-bold font-mono text-cyan-300">
                    {report.phone}
                  </span>
                  {report.customerName && (
                    <span className="text-xs text-slate-300 font-medium px-2 py-0.5 rounded bg-slate-800 border border-slate-700">
                      {report.customerName}
                    </span>
                  )}
                  <span className="text-xs text-rose-300 px-2 py-0.5 rounded bg-rose-950/40 border border-rose-500/30 flex items-center gap-1">
                    <FileWarning className="w-3 h-3" />
                    <span>{lang === 'bn' ? 'যাচাইকৃত রিপোর্ট' : 'Verified Report'}</span>
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-medium">
                  {report.reason}
                </p>

                <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 pt-1">
                  <span className="flex items-center gap-1 text-slate-300">
                    <Store className="w-3 h-3 text-cyan-400" />
                    <span>{report.reporterStore}</span>
                  </span>

                  {report.courierConsignment && (
                    <>
                      <span>·</span>
                      <span className="font-mono text-slate-400">
                        Memo: {report.courierConsignment}
                      </span>
                    </>
                  )}

                  <span>·</span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>{new Date(report.reportedAt).toLocaleDateString()}</span>
                  </span>
                </div>
              </div>

              {report.lossAmountBDT && (
                <div className="shrink-0 md:text-right border-t md:border-t-0 border-slate-800 pt-2 md:pt-0">
                  <span className="text-[11px] text-slate-400 block">
                    {lang === 'bn' ? 'আনুমানিক ক্ষতি' : 'Estimated Loss'}
                  </span>
                  <span className="text-base font-bold font-mono text-rose-400">
                    ৳{report.lossAmountBDT} BDT
                  </span>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
