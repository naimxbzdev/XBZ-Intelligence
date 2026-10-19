import React, { useState } from 'react';
import { X, FileWarning, Loader2, CheckCircle2, AlertOctagon } from 'lucide-react';
import type { Language } from '../utils/translations.ts';

interface ReportFraudModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultPhone?: string;
  lang: Language;
  onSuccess?: () => void;
}

export const ReportFraudModal: React.FC<ReportFraudModalProps> = ({
  isOpen,
  onClose,
  defaultPhone = '',
  lang,
  onSuccess,
}) => {
  const [phone, setPhone] = useState(defaultPhone);
  const [customerName, setCustomerName] = useState('');
  const [reporterStore, setReporterStore] = useState('');
  const [reason, setReason] = useState('অর্ডার কনফার্ম করার পর পার্সেল ডেলিভারিতে পাঠালে ফোন বন্ধ / রিসিভ না করা');
  const [consignment, setConsignment] = useState('');
  const [lossAmount, setLossAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Sync default phone if changed
  React.useEffect(() => {
    if (defaultPhone) setPhone(defaultPhone);
  }, [defaultPhone]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || !reporterStore || !reason) {
      setError(lang === 'bn' ? 'ফোন নম্বর, শপের নাম ও কারণ আবশ্যক।' : 'Phone, Store Name, and Reason are required.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone,
          customerName,
          reporterStore,
          reason,
          courierConsignment: consignment,
          lossAmountBDT: lossAmount ? Number(lossAmount) : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit report');
      }

      setSuccess(true);
      if (onSuccess) onSuccess();
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Error submitting report');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-lg p-6 rounded-2xl bg-[#0d1527] border border-rose-500/30 shadow-2xl shadow-rose-950/50">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5 mb-4">
          <div className="p-2 rounded-xl bg-rose-950/60 border border-rose-500/30 text-rose-400">
            <FileWarning className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">
              {lang === 'bn' ? 'প্রতারক বা রিটার্ন গ্রাহক রিপোর্ট করুন' : 'Report Fraudulent Customer'}
            </h3>
            <p className="text-xs text-slate-400">
              {lang === 'bn' ? 'অন্যান্য মার্চেন্টদের সতর্ক করতে সত্য ও সঠিক তথ্য দিন' : 'Help other merchants avoid cash on delivery losses'}
            </p>
          </div>
        </div>

        {success ? (
          <div className="p-6 text-center space-y-2">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
            <h4 className="text-base font-bold text-white">
              {lang === 'bn' ? 'রিপোর্ট সফলভাবে জমা হয়েছে!' : 'Report Successfully Submitted!'}
            </h4>
            <p className="text-xs text-slate-300">
              {lang === 'bn' ? 'কমিউনিটি ডাটাবেস আপডেট করা হয়েছে।' : 'Community registry updated. Thank you!'}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
            {error && (
              <p className="p-2.5 rounded-lg bg-rose-950/50 border border-rose-500/40 text-rose-300 flex items-center gap-2">
                <AlertOctagon className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </p>
            )}

            <div>
              <label className="text-slate-300 font-semibold block mb-1">
                {lang === 'bn' ? 'অভিযুক্ত ফোন নম্বর *' : 'Target Phone Number *'}
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="017XXXXXXXX"
                className="w-full bg-slate-900 border border-slate-700 focus:border-rose-400 text-white px-3.5 py-2.5 rounded-xl font-mono outline-none"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">
                  {lang === 'bn' ? 'আপনার শপের নাম *' : 'Your Store Name *'}
                </label>
                <input
                  type="text"
                  value={reporterStore}
                  onChange={(e) => setReporterStore(e.target.value)}
                  placeholder="Fashion Hub BD"
                  className="w-full bg-slate-900 border border-slate-700 focus:border-rose-400 text-white px-3.5 py-2.5 rounded-xl outline-none"
                  required
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">
                  {lang === 'bn' ? 'গ্রাহকের নাম (জানা থাকলে)' : 'Customer Name (Optional)'}
                </label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="নাম"
                  className="w-full bg-slate-900 border border-slate-700 focus:border-rose-400 text-white px-3.5 py-2.5 rounded-xl outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-slate-300 font-semibold block mb-1">
                {lang === 'bn' ? 'অভিযোগের ধরন / কারণ *' : 'Reason for Dispute *'}
              </label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 focus:border-rose-400 text-white px-3.5 py-2.5 rounded-xl outline-none"
              >
                <option value="অর্ডার কনফার্ম করার পর পার্সেল ডেলিভারিতে পাঠালে ফোন বন্ধ / রিসিভ না করা">
                  অর্ডার কনফার্ম করার পর ফোন বন্ধ / রিসিভ না করা
                </option>
                <option value="বক্স খুলে পণ্য দেখে ডেলিভারি চার্জ না দিয়ে সম্পূর্ণ ফেরত">
                  বক্স খুলে পণ্য দেখে ডেলিভারি চার্জ না দিয়ে ফেরত
                </option>
                <option value="পার্সেল ডেলিভারি ম্যানের সাথে দুর্ব্যবহার ও রিসিভ করতে অস্বীকৃতি">
                  ডেলিভারিম্যানের সাথে দুর্ব্যবহার ও রিসিভ করতে অস্বীকৃতি
                </option>
                <option value="ভুয়া ঠিকানা ও ফেক ইনফরমেশন ব্যবহার করে অর্ডার করা">
                  ভুয়া ঠিকানা ও ফেক নাম ব্যবহার করে অর্ডার করা
                </option>
                <option value="একাধিক পেজ থেকে একসাথে অর্ডার দিয়ে একটি রেখে বাকিগুলো ফেরত">
                  একাধিক পেজ থেকে অর্ডার দিয়ে একটি রেখে বাকিগুলো ফেরত
                </option>
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">
                  {lang === 'bn' ? 'কুরিয়ার মেমো / Consignment ID' : 'Consignment / Order ID'}
                </label>
                <input
                  type="text"
                  value={consignment}
                  onChange={(e) => setConsignment(e.target.value)}
                  placeholder="SF-123456"
                  className="w-full bg-slate-900 border border-slate-700 focus:border-rose-400 text-white px-3.5 py-2.5 rounded-xl font-mono outline-none"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">
                  {lang === 'bn' ? 'ক্ষতির পরিমাণ (টাকায়)' : 'Loss Amount (BDT)'}
                </label>
                <input
                  type="number"
                  value={lossAmount}
                  onChange={(e) => setLossAmount(e.target.value)}
                  placeholder="260"
                  className="w-full bg-slate-900 border border-slate-700 focus:border-rose-400 text-white px-3.5 py-2.5 rounded-xl font-mono outline-none"
                />
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl text-slate-300 hover:text-white bg-slate-800 transition-colors"
              >
                {lang === 'bn' ? 'বাতিল' : 'Cancel'}
              </button>

              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2.5 rounded-xl font-bold text-white bg-rose-600 hover:bg-rose-500 transition-all flex items-center gap-2 disabled:opacity-60"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                <span>{lang === 'bn' ? 'রিপোর্ট জমা দিন' : 'Submit Dispute'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
