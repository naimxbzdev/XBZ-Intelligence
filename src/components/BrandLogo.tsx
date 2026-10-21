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
  const sizeMap = {
    sm: {
      imgHeight: 'h-7 sm:h-8',
      text: 'text-base font-black',
      tag: 'text-[9px] tracking-[0.2em]',
      gap: 'gap-2',
    },
    md: {
      imgHeight: 'h-8 sm:h-9',
      text: 'text-lg font-black',
      tag: 'text-[10px] tracking-[0.2em]',
      gap: 'gap-2.5',
    },
    lg: {
      imgHeight: 'h-10 sm:h-12',
      text: 'text-xl sm:text-2xl font-black',
      tag: 'text-[11px] tracking-[0.25em]',
      gap: 'gap-3',
    },
    xl: {
      imgHeight: 'h-14 sm:h-16',
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
        <img
          src="/assets/aistudio/Futuristic_Glossy_XI_Orbital_Emblem_bbf8c8e8.png"
          alt="XBZ Emblem"
          className={`${current.imgHeight} w-auto object-contain relative z-10 transition-transform duration-300 group-hover:scale-105 drop-shadow-[0_0_12px_rgba(34,211,238,0.4)]`}
          loading="eager"
        />
      </div>

      {/* Sleek, Compact Typography (No huge clunky text) */}
      <div className="flex flex-col justify-center leading-none">
        <div className="flex items-center gap-1.5">
          <span
            className={`${current.text} tracking-tight bg-gradient-to-r from-white via-cyan-100 to-cyan-400 bg-clip-text text-transparent font-display drop-shadow-[0_2px_8px_rgba(34,211,238,0.25)]`}
          >
            XBZ
          </span>
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee]" />
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
