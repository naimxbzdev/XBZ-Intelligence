import React from 'react';
import { MessageCircle, Headphones, Sparkles } from 'lucide-react';
import type { Language } from '../utils/translations.ts';

interface LiveSupportButtonProps {
  lang: Language;
}

export const LiveSupportButton: React.FC<LiveSupportButtonProps> = ({ lang }) => {
  const whatsappUrl = 'https://wa.me/8801703223141';

  const handleOpenWhatsApp = () => {
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed bottom-20 right-4 lg:bottom-6 lg:right-6 z-40 select-none">
      <button
        type="button"
        onClick={handleOpenWhatsApp}
        className="group relative flex items-center gap-2.5 px-3.5 py-2.5 sm:px-4 sm:py-3 rounded-full bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 text-white font-semibold shadow-2xl shadow-emerald-950/80 hover:shadow-emerald-500/30 hover:scale-[1.03] active:scale-[0.98] transition-all cursor-pointer border border-emerald-400/40"
        title="24/7 Live WhatsApp Support with Naim Xbz"
        aria-label="Contact 24/7 Live Support on WhatsApp"
      >
        {/* Pulsing online status indicator */}
        <span className="relative flex h-3 w-3 shrink-0">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
        </span>

        {/* WhatsApp Chat Icon */}
        <div className="flex items-center justify-center">
          <MessageCircle className="w-5 h-5 fill-current text-white shrink-0 group-hover:rotate-6 transition-transform" />
        </div>

        {/* Label & Details */}
        <div className="text-left flex flex-col pr-1">
          <span className="text-xs sm:text-[13px] font-extrabold tracking-tight text-white leading-tight flex items-center gap-1 whitespace-nowrap">
            {lang === 'bn' ? '২৪/৭ লাইভ সাপোর্ট' : '24/7 Live Support'}
          </span>
          <span className="text-[10px] text-emerald-100 font-mono tracking-wide leading-none whitespace-nowrap hidden sm:inline">
            Naim Xbz · WhatsApp
          </span>
        </div>
      </button>
    </div>
  );
};
