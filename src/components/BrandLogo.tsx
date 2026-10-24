import React from 'react';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showTagline?: boolean;
  className?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 'md',
  showTagline = false,
  className = '',
}) => {
  const [imgError, setImgError] = React.useState(false);

  const sizeMap = {
    sm: {
      imgHeight: 'h-7 sm:h-8',
      svgSize: 'w-7 h-7 sm:w-8 sm:h-8',
      text: 'text-base font-black',
      tag: 'text-[9px] tracking-[0.2em]',
      gap: 'gap-2',
    },
    md: {
      imgHeight: 'h-8 sm:h-9',
      svgSize: 'w-8 h-8 sm:w-9 sm:h-9',
      text: 'text-lg font-black',
      tag: 'text-[10px] tracking-[0.2em]',
      gap: 'gap-2.5',
    },
    lg: {
      imgHeight: 'h-10 sm:h-12',
      svgSize: 'w-10 h-10 sm:w-12 sm:h-12',
      text: 'text-xl sm:text-2xl font-black',
      tag: 'text-[11px] tracking-[0.25em]',
      gap: 'gap-3',
    },
    xl: {
      imgHeight: 'h-14 sm:h-16',
      svgSize: 'w-14 h-14 sm:w-16 sm:h-16',
      text: 'text-2xl sm:text-3xl font-black',
      tag: 'text-xs tracking-[0.3em]',
      gap: 'gap-3.5',
    },
  };

  const current = sizeMap[size];

  return (
    <div className={`inline-flex items-center ${current.gap} select-none group ${className}`}>
      {/* Futuristic Glossy Emblem */}
      <div className="relative shrink-0 flex items-center justify-center">
        {/* Subtle ambient cyan glow behind emblem */}
        <div className="absolute inset-0 rounded-full bg-cyan-400/20 blur-md group-hover:bg-cyan-400/35 transition-all" />
        
        {!imgError ? (
          <img
            src="/logo_transparent.png"
            alt="XBZ Emblem"
            className={`${current.imgHeight} w-auto object-contain relative z-10 transition-transform duration-300 group-hover:scale-105 drop-shadow-[0_0_14px_rgba(34,211,238,0.5)]`}
            loading="eager"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className={`${current.svgSize} relative z-10 rounded-xl bg-gradient-to-br from-cyan-500/20 via-slate-900 to-cyan-950/80 border border-cyan-400/40 p-1.5 flex items-center justify-center shadow-[0_0_15px_rgba(34,211,238,0.3)] transition-transform duration-300 group-hover:scale-105`}>
            <svg
              viewBox="0 0 32 32"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-full h-full drop-shadow-[0_0_8px_#22d3ee]"
            >
              <defs>
                <linearGradient id="xbzGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#38bdf8" />
                  <stop offset="50%" stopColor="#22d3ee" />
                  <stop offset="100%" stopColor="#06b6d4" />
                </linearGradient>
              </defs>
              <path
                d="M6 7L13 16L6 25M26 7L19 16L26 25"
                stroke="url(#xbzGrad)"
                strokeWidth="3.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="16" cy="16" r="2.5" fill="#38bdf8" />
            </svg>
          </div>
        )}
      </div>

      {/* Sleek, Compact Typography (No huge clunky text) */}
      <div className="flex flex-col justify-center leading-none">
        <div className="flex items-center gap-1.5">
          <span
            className={`${current.text} tracking-tight text-slate-900 dark:text-transparent dark:bg-clip-text dark:bg-gradient-to-r dark:from-white dark:via-cyan-100 dark:to-cyan-400 font-display transition-colors`}
          >
            XBZ
          </span>
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-cyan-400 shadow-[0_0_8px_rgba(16,185,129,0.5)] dark:shadow-[0_0_8px_#22d3ee]" />
        </div>

        {showTagline && (
          <span
            className={`${current.tag} text-cyan-400/80 font-mono font-semibold uppercase mt-0.5`}
          >
            INTELLIGENCE
          </span>
        )}
      </div>
    </div>
  );
};
