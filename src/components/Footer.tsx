import React from 'react';
import { ExternalLink, Heart } from 'lucide-react';
import type { Language } from '../utils/translations.ts';
import { translations } from '../utils/translations.ts';
import { BrandLogo } from './BrandLogo.tsx';

interface FooterProps {
  lang: Language;
  onNavigate: (tab: string) => void;
  openTrustBadge?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ lang, onNavigate, openTrustBadge }) => {
  const t = (translations && translations[lang]) ? translations[lang] : (translations?.bn || translations?.en);

  return (
    <footer className="border-t border-slate-800/80 bg-[#050811] text-slate-400 text-xs mt-16 pb-20 lg:pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="space-y-3 md:col-span-2">
            <div className="flex items-center gap-3">
              <BrandLogo size="md" showTagline={true} />
              <span className="text-[10px] text-cyan-400/90 font-medium uppercase tracking-wider pl-1 border-l border-slate-700">
                {t.brandCredit}
              </span>
            </div>

            <p className="text-slate-400 text-xs leading-relaxed max-w-md">
              {t.footer.about}
            </p>

            <p className="text-slate-500 text-[11px] leading-relaxed max-w-md">
              {t.footer.disclaimer}
            </p>
          </div>

          {/* Quick Navigation */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              {lang === 'bn' ? 'নেভিগেশন' : 'Navigation'}
            </h4>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => onNavigate('search')}
                  className="hover:text-cyan-400 transition-colors"
                >
                  {t.nav.search}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('batch')}
                  className="hover:text-cyan-400 transition-colors"
                >
                  {t.nav.batch}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('community')}
                  className="hover:text-cyan-400 transition-colors"
                >
                  {t.nav.community}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('couriers')}
                  className="hover:text-cyan-400 transition-colors"
                >
                  {t.nav.couriers}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('pricing')}
                  className="hover:text-cyan-400 transition-colors"
                >
                  {t.nav.pricing}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('admin')}
                  className="hover:text-cyan-400 transition-colors flex items-center gap-1 text-slate-400"
                >
                  <span>🔒 {lang === 'bn' ? 'এডমিন কনসোল' : 'Admin Console'}</span>
                </button>
              </li>
              {openTrustBadge && (
                <li>
                  <button
                    onClick={openTrustBadge}
                    className="text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-1 font-semibold"
                  >
                    <span>🛡️ {lang === 'bn' ? 'মার্চেন্ট ট্রাস্ট ব্যাজ' : 'Trust Badge Generator'}</span>
                  </button>
                </li>
              )}
              <li>
                <button
                  type="button"
                  onClick={() => window.dispatchEvent(new CustomEvent('open-xbz-ai-chat'))}
                  className="text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-1 font-medium"
                >
                  <span>🤖 {lang === 'bn' ? '২৪/৭ এআই লাইভ সাপোর্ট' : '24/7 AI Live Support'}</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Supported Couriers */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              {lang === 'bn' ? 'সাপোর্টেড কুরিয়ার নেটওয়ার্ক' : 'Integrated Couriers'}
            </h4>
            <ul className="space-y-1.5 text-slate-400 text-xs font-mono">
              <li>Steadfast Courier</li>
              <li>Pathao Courier</li>
              <li>REDX Delivery</li>
              <li>Paperfly Wings</li>
              <li>eCourier Network</li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500">
          <p>{t.footer.copyright}</p>
          <p className="flex items-center gap-1">
            <span>Crafted with security & precision</span>
            <span>·</span>
            <span className="text-cyan-400 font-medium">{t.brandCredit}</span>
          </p>
        </div>
      </div>
    </footer>
  );
};
