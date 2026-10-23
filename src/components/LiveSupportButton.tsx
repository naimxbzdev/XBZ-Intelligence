import React, { useState, useEffect } from 'react';
import { Bot, Sparkles, MessageSquare, Headphones } from 'lucide-react';
import { AiSupportChatModal } from './AiSupportChatModal.tsx';
import type { Language } from '../utils/translations.ts';

interface LiveSupportButtonProps {
  lang: Language;
}

export const LiveSupportButton: React.FC<LiveSupportButtonProps> = ({ lang }) => {
  const [isChatOpen, setIsChatOpen] = useState(false);

  // Listen for global custom event to trigger AI chat from any component (Navbar, Footer, etc.)
  useEffect(() => {
    const handleGlobalOpen = () => setIsChatOpen(true);
    window.addEventListener('open-xbz-ai-chat', handleGlobalOpen);
    return () => window.removeEventListener('open-xbz-ai-chat', handleGlobalOpen);
  }, []);

  return (
    <>
      <div className="fixed bottom-20 right-3.5 sm:bottom-6 sm:right-6 z-40 select-none">
        <button
          type="button"
          onClick={() => setIsChatOpen(true)}
          className="group relative flex items-center gap-2.5 px-3.5 py-2.5 sm:px-4 sm:py-3 rounded-full bg-gradient-to-r from-cyan-600 via-indigo-600 to-teal-500 text-white font-semibold shadow-2xl shadow-cyan-950/90 hover:shadow-cyan-500/40 hover:scale-[1.04] active:scale-[0.97] transition-all cursor-pointer border border-cyan-400/40"
          title={lang === 'bn' ? '২৪/৭ লাইভ এআই সাপোর্ট চ্যাট (Gemini Agent)' : '24/7 Live AI Support Chat (Gemini Agent)'}
          aria-label="Open 24/7 AI Support Chat"
        >
          {/* Pulsing online status indicator */}
          <span className="relative flex h-3 w-3 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-300 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-400"></span>
          </span>

          {/* AI Bot Icon */}
          <div className="flex items-center justify-center relative">
            <Bot className="w-5 h-5 text-white shrink-0 group-hover:rotate-6 transition-transform" />
            <Sparkles className="w-2.5 h-2.5 text-cyan-200 absolute -top-1 -right-1 animate-pulse" />
          </div>

          {/* Label & Details */}
          <div className="text-left flex flex-col pr-1">
            <span className="text-xs sm:text-[13px] font-extrabold tracking-tight text-white leading-tight flex items-center gap-1.5 whitespace-nowrap">
              <span>{lang === 'bn' ? 'এআই সাপোর্ট' : 'AI Support'}</span>
              <span className="text-[9px] bg-cyan-950/80 px-1 py-0.2 rounded border border-cyan-400/40 text-cyan-200 uppercase font-mono font-normal">
                Live
              </span>
            </span>
            <span className="text-[10px] text-cyan-100/90 font-mono tracking-wide leading-none whitespace-nowrap hidden sm:inline">
              Gemini Agent · ২৪/৭
            </span>
          </div>
        </button>
      </div>

      {/* AI Live Support Chat Modal */}
      <AiSupportChatModal
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        lang={lang}
      />
    </>
  );
};
