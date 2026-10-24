import React, { useState, useEffect, useRef } from 'react';
import { 
  Bot, 
  Send, 
  X, 
  Sparkles, 
  MessageSquare, 
  RotateCcw, 
  Copy, 
  Check, 
  ExternalLink,
  ChevronDown,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import type { Language } from '../utils/translations.ts';

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string;
}

interface AiSupportChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
}

const QUICK_PROMPTS = {
  bn: [
    { label: '🔍 ডেলিভারি রেট কি?', query: 'কুরিয়ার ডেলিভারি সাকসেস রেট কিভাবে হিসাব হয় এবং কোন রেটটি নিরাপদ?' },
    { label: '📦 বাল্ক চেক কিভাবে করে?', query: 'বাল্ক চেকিং ফিচারের মাধ্যমে একসাথে একাধিক ফোন নম্বর কিভাবে ভেরিফাই করবো?' },
    { label: '💳 প্যাকেজ ও পেমেন্ট', query: 'মার্চেন্ট প্রো এবং এন্টারপ্রাইজ প্যাকেজের সুবিধা কি এবং কিভাবে বিকাশ/নগদে পেমেন্ট করবো?' },
    { label: '🔌 এপিআই ইন্টিগ্রেশন', query: 'WooCommerce বা কাস্টম ওয়েবসাইটে XBZ Fraud Check API কিভাবে ইন্টিগ্রেট করবো?' },
    { label: '🚨 প্রতারক রিপোর্ট', query: 'ফেইক অর্ডার বা ক্ষতিসাধনকারী কাস্টমারদের কমিউনিটি ডাটাবেজে কিভাবে রিপোর্ট করা যায়?' },
  ],
  en: [
    { label: '🔍 Delivery Rate Meaning', query: 'How is the courier delivery rate calculated and what score is safe for COD?' },
    { label: '📦 How to use Bulk Check', query: 'How does the batch check tool work for multiple phone numbers at once?' },
    { label: '💳 Plans & Pricing', query: 'What are the benefits of Merchant Pro and Enterprise plans and payment methods?' },
    { label: '🔌 REST API Integration', query: 'How do I integrate XBZ Fraud Screening REST API with WooCommerce or custom store?' },
    { label: '🚨 Report Fraud Buyer', query: 'How do I report a serial order canceller to the community fraud database?' },
  ],
};

export const AiSupportChatModal: React.FC<AiSupportChatModalProps> = ({
  isOpen,
  onClose,
  lang,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const initialGreeting = lang === 'bn'
      ? 'স্বাগতম! আমি XBZ AI সাপোর্ট অ্যাসিস্ট্যান্ট। কুরিয়ার ডেলিভারি রেকর্ড, পার্সেল রিটার্ন রিস্ক, বাল্ক চেকিং, এপিআই সংযোগ বা প্যাকেজ সম্পর্কে আপনার যেকোনো প্রশ্ন করতে পারেন।'
      : 'Hello! I am XBZ AI Support Assistant. Ask me anything about customer courier delivery rates, COD fraud risk, batch screening, REST API, or merchant packages.';

    return [
      {
        id: 'msg_welcome',
        role: 'model',
        text: initialGreeting,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ];
  });

  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto scroll to latest message
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading, isOpen]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  const handleSendMessage = async (textToSend?: string) => {
    const userPrompt = (textToSend || inputMessage).trim();
    if (!userPrompt || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user_${Date.now()}`,
      role: 'user',
      text: userPrompt,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Build conversation history for context (exclude welcome message)
      const historyPayload = messages
        .filter((m) => m.id !== 'msg_welcome')
        .map((m) => ({
          role: m.role,
          text: m.text,
        }));

      const res = await fetch('/api/support/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userPrompt,
          history: historyPayload,
        }),
      });

      if (!res.ok) {
        throw new Error(`Server returned ${res.status}`);
      }

      const data = await res.json();
      const botReply = data.reply || data.fallback || 'দুঃখিত, কোনো উত্তর পাওয়া যায়নি।';

      setMessages((prev) => [
        ...prev,
        {
          id: `bot_${Date.now()}`,
          role: 'model',
          text: botReply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } catch {
      // Fallback response with helpful information & WhatsApp escalation
      const errorMsg = lang === 'bn'
        ? 'আমাদের এআই সার্ভারের সাথে সংযোগে সাময়িক বিলম্ব হচ্ছে। আপনি কুরিয়ার চেক, বাল্ক ভেরিফিকেশন বা প্যাকেজ নিয়ে যেকোনো তথ্য জানতে পারেন অথবা সরাসরি প্রতিষ্ঠাতা Naim Xbz-এর WhatsApp (+8801703223141)-এ মেসেজ দিতে পারেন।'
        : 'Temporary connection delay with the AI service. You can ask about courier verification, batch check, or contact founder Naim Xbz on WhatsApp (+8801703223141).';

      setMessages((prev) => [
        ...prev,
        {
          id: `bot_${Date.now()}`,
          role: 'model',
          text: errorMsg,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetChat = () => {
    const greeting = lang === 'bn'
      ? 'কথোপকথন রিস্টার্ট করা হয়েছে। নতুন কোনো প্রশ্ন থাকলে বলুন!'
      : 'Conversation restarted. Feel free to ask any question!';

    setMessages([
      {
        id: `welcome_${Date.now()}`,
        role: 'model',
        text: greeting,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  const handleCopyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 sm:inset-auto sm:bottom-6 sm:right-6 z-50 flex flex-col items-end justify-end pointer-events-none">
      {/* Backdrop for mobile */}
      <div 
        onClick={onClose} 
        className="fixed inset-0 bg-black/60 backdrop-blur-xs sm:hidden pointer-events-auto"
        aria-hidden="true"
      />

      {/* Main Chat Window */}
      <div 
        className="pointer-events-auto w-full sm:w-[420px] md:w-[460px] h-full sm:h-[620px] max-h-[100dvh] sm:max-h-[85vh] bg-[#080d1a] border border-cyan-500/30 sm:rounded-2xl shadow-2xl shadow-cyan-950/80 flex flex-col overflow-hidden relative z-10 transition-all duration-300 animate-in fade-in zoom-in-95"
        role="dialog"
        aria-label="XBZ AI Live Support Chat"
      >
        {/* Top Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-slate-900 via-[#0a1224] to-slate-900 border-b border-cyan-500/20 shrink-0">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 via-indigo-600 to-teal-400 p-0.5 shadow-md shadow-cyan-500/20">
                <div className="w-full h-full bg-[#080d1a] rounded-[10px] flex items-center justify-center">
                  <Bot className="w-5 h-5 text-cyan-400" />
                </div>
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 border-2 border-[#080d1a]"></span>
              </span>
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-sm font-bold text-white tracking-tight">
                  {lang === 'bn' ? 'XBZ AI সাপোর্ট এজেন্ট' : 'XBZ AI Merchant Support'}
                </h3>
                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded text-[9px] font-medium bg-cyan-950/80 border border-cyan-500/40 text-cyan-300">
                  <Sparkles className="w-2.5 h-2.5 text-cyan-400" />
                  Gemini
                </span>
              </div>
              <p className="text-[11px] text-emerald-400 flex items-center gap-1">
                <span>●</span>
                <span>{lang === 'bn' ? 'অনলাইন ২৪/৭ • তাৎক্ষণিক উত্তর' : 'Online 24/7 • Instant replies'}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {/* Direct WhatsApp Human Fallback */}
            <a
              href="https://wa.me/8801703223141"
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded-lg text-emerald-400 hover:text-emerald-300 hover:bg-emerald-950/40 transition-colors"
              title={lang === 'bn' ? 'WhatsApp-এ Naim Xbz-এর সাথে যোগাযোগ' : 'Chat with Naim Xbz on WhatsApp'}
            >
              <MessageSquare className="w-4 h-4" />
            </a>

            {/* Reset Chat */}
            <button
              type="button"
              onClick={handleResetChat}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors cursor-pointer"
              title={lang === 'bn' ? 'চ্যাট রিস্টার্ট করুন' : 'Restart chat'}
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Close / Minimize */}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors cursor-pointer"
              aria-label="Close chat"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Human Escalation Banner */}
        <div className="bg-emerald-950/40 border-b border-emerald-500/20 px-3 py-1.5 flex items-center justify-between text-[11px] text-emerald-300">
          <div className="flex items-center gap-1.5 truncate">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="truncate">
              {lang === 'bn' ? 'জরুরি প্রয়োজনে সরাসরি প্রতিষ্ঠাতা Naim Xbz এর সহায়তা পাবেন' : 'Need direct support? Contact founder Naim Xbz'}
            </span>
          </div>
          <a
            href="https://wa.me/8801703223141"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-0.5 text-emerald-400 hover:text-emerald-200 font-semibold underline shrink-0 ml-2"
          >
            <span>WhatsApp</span>
            <ExternalLink className="w-2.5 h-2.5" />
          </a>
        </div>

        {/* Chat Messages Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5 custom-scrollbar">
          {messages.map((msg) => {
            const isUser = msg.role === 'user';
            return (
              <div 
                key={msg.id} 
                className={`flex gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-7 h-7 rounded-lg bg-cyan-950 border border-cyan-500/40 flex items-center justify-center shrink-0 mt-0.5 text-cyan-400">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div 
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs sm:text-[13px] leading-relaxed relative group ${
                    isUser
                      ? 'bg-gradient-to-r from-cyan-600 to-indigo-600 text-white rounded-tr-xs shadow-md shadow-cyan-950/40'
                      : 'bg-slate-900/90 border border-slate-800 text-slate-200 rounded-tl-xs shadow-sm'
                  }`}
                >
                  {/* Message content */}
                  <div className="whitespace-pre-wrap font-sans">
                    {msg.text}
                  </div>

                  {/* Message meta & action */}
                  <div className={`flex items-center gap-2 mt-1.5 ${isUser ? 'justify-end text-cyan-200/80' : 'justify-between text-slate-400'}`}>
                    <span className="text-[10px] opacity-75 font-mono">{msg.timestamp}</span>
                    
                    {!isUser && (
                      <button
                        type="button"
                        onClick={() => handleCopyText(msg.id, msg.text)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 hover:text-white"
                        title="কপি করুন"
                      >
                        {copiedId === msg.id ? (
                          <Check className="w-3 h-3 text-emerald-400" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Typing Indicator */}
          {isLoading && (
            <div className="flex gap-2.5 justify-start items-center">
              <div className="w-7 h-7 rounded-lg bg-cyan-950 border border-cyan-500/40 flex items-center justify-center shrink-0 text-cyan-400">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-2xl rounded-tl-xs px-3.5 py-2.5 flex items-center gap-2">
                <span className="text-xs text-cyan-400 font-medium">
                  {lang === 'bn' ? 'XBZ AI উত্তর তৈরি করছে...' : 'XBZ AI is thinking...'}
                </span>
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '0ms' }}></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '150ms' }}></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-bounce" style={{ animationDelay: '300ms' }}></span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Chips */}
        <div className="px-3 py-2 bg-[#060a14] border-t border-slate-800/80 shrink-0">
          <div className="text-[10px] text-slate-400 font-medium mb-1.5 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-cyan-400" />
            <span>{lang === 'bn' ? 'দ্রুত প্রশ্ন করার পরামর্শ:' : 'Suggested topics:'}</span>
          </div>
          <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {(QUICK_PROMPTS?.[lang] || QUICK_PROMPTS?.bn || QUICK_PROMPTS?.en || []).map((chip, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSendMessage(chip.query)}
                disabled={isLoading}
                className="text-[11px] px-2.5 py-1 rounded-full bg-slate-900 hover:bg-cyan-950/60 border border-slate-800 hover:border-cyan-500/40 text-slate-300 hover:text-cyan-300 whitespace-nowrap transition-colors cursor-pointer shrink-0 disabled:opacity-50"
              >
                {chip.label}
              </button>
            ))}
          </div>
        </div>

        {/* Input Bar */}
        <div className="p-3 bg-slate-950 border-t border-cyan-500/20 shrink-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              ref={inputRef}
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder={
                lang === 'bn'
                  ? 'আপনার প্রশ্ন লিখুন... (যেমন: বাল্ক চেক বা এপিআই)'
                  : 'Type your question... (e.g., API or batch check)'
              }
              disabled={isLoading}
              className="flex-1 bg-slate-900 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all disabled:opacity-60"
            />
            <button
              type="submit"
              disabled={!inputMessage.trim() || isLoading}
              className="p-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-semibold shadow-lg shadow-cyan-950/50 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer shrink-0 active:scale-95"
              aria-label="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

          <div className="flex items-center justify-between mt-2 px-1 text-[10px] text-slate-500">
            <span className="flex items-center gap-1">
              <span>Gemini 3.8 Flash দ্বারা চালিত</span>
            </span>
            <span className="font-mono">XBZ AI v2.4</span>
          </div>
        </div>
      </div>
    </div>
  );
};
