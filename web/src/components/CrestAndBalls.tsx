/** Solid gold heraldic shield — Fantasy Balls */
export function FancyCrest({ className = "w-36 h-40" }: { className?: string }) {
  return (
    <svg viewBox="0 0 160 180" className={className} aria-label="Fantasy Balls crest">
      <defs>
        <linearGradient id="metal" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fff8d0" />
          <stop offset="22%" stopColor="#ffe566" />
          <stop offset="50%" stopColor="#ffd700" />
          <stop offset="78%" stopColor="#c9a227" />
          <stop offset="100%" stopColor="#6b5210" />
        </linearGradient>
        <linearGradient id="metalV" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#ffe566" />
          <stop offset="100%" stopColor="#8b6914" />
        </linearGradient>
      </defs>
      <path
        d="M30 22 L130 22 L130 98 Q130 138 80 168 Q30 138 30 98 Z"
        fill="url(#metal)"
        stroke="#5c4510"
        strokeWidth="2.5"
      />
      <path
        d="M40 32 L120 32 L120 95 Q120 128 80 152 Q40 128 40 95 Z"
        fill="none"
        stroke="#fff3a0"
        strokeWidth="1.4"
        opacity="0.65"
      />
      <path
        d="M52 24 L58 10 L68 20 L80 6 L92 20 L102 10 L108 24 Z"
        fill="url(#metal)"
        stroke="#5c4510"
        strokeWidth="1"
      />
      <rect x="52" y="22" width="56" height="7" rx="1" fill="url(#metalV)" />
      <path d="M28 58 Q10 52 14 36 Q24 44 26 54" fill="none" stroke="url(#metal)" strokeWidth="4" strokeLinecap="round" />
      <path d="M132 58 Q150 52 146 36 Q136 44 134 54" fill="none" stroke="url(#metal)" strokeWidth="4" strokeLinecap="round" />
      <rect x="55" y="58" width="50" height="42" rx="4" fill="url(#metalV)" stroke="#5c4510" strokeWidth="1.2" />
      <text x="80" y="87" textAnchor="middle" fill="#2a1f05" fontSize="24" fontWeight="900" fontFamily="Georgia, serif">
        FB
      </text>
      <path
        d="M22 148 L42 138 L80 144 L118 138 L138 148 L138 162 L80 174 L22 162 Z"
        fill="url(#metal)"
        stroke="#5c4510"
        strokeWidth="1.2"
      />
      <text x="80" y="160" textAnchor="middle" fill="#2a1f05" fontSize="8.5" fontWeight="800" fontFamily="system-ui" letterSpacing="0.8">
        FANTASY BALLS
      </text>
    </svg>
  );
}

/** Gold crown + sport label for champ pennants */
export function SportCrown({
  sport,
  className = "w-16 h-14",
}: {
  sport: "football" | "baseball";
  className?: string;
}) {
  const label = sport === "football" ? "FOOTBALL" : "BASEBALL";
  const gid = `sc-${sport}`;
  return (
    <svg viewBox="0 0 80 70" className={className} aria-label={`${label} champion crown`}>
      <defs>
        <linearGradient id={gid} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fff8d0" />
          <stop offset="40%" stopColor="#ffd700" />
          <stop offset="100%" stopColor="#8b6914" />
        </linearGradient>
      </defs>
      <path
        d="M12 32 L18 8 L28 26 L40 4 L52 26 L62 8 L68 32 Z"
        fill={`url(#${gid})`}
        stroke="#6b5210"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      <path
        d="M10 32 Q40 40 70 32 L70 40 Q40 48 10 40 Z"
        fill={`url(#${gid})`}
        stroke="#6b5210"
        strokeWidth="1"
      />
      <circle cx="18" cy="8" r="2.5" fill="#fff8d0" stroke="#8b6914" strokeWidth="0.5" />
      <circle cx="40" cy="4" r="3" fill="#fff8d0" stroke="#8b6914" strokeWidth="0.5" />
      <circle cx="62" cy="8" r="2.5" fill="#fff8d0" stroke="#8b6914" strokeWidth="0.5" />
      <circle cx="22" cy="36" r="1.8" fill="#ffe566" />
      <circle cx="32" cy="38" r="1.8" fill="#ffe566" />
      <circle cx="40" cy="39" r="2" fill="#fff8d0" />
      <circle cx="48" cy="38" r="1.8" fill="#ffe566" />
      <circle cx="58" cy="36" r="1.8" fill="#ffe566" />
      <text
        x="40"
        y="62"
        textAnchor="middle"
        fill="#ffd700"
        fontSize="9"
        fontWeight="800"
        fontFamily="system-ui, sans-serif"
        letterSpacing="1.5"
      >
        {label}
      </text>
    </svg>
  );
}

export function CrownedFootball({ className = "w-16 h-14" }: { className?: string }) {
  return <SportCrown sport="football" className={className} />;
}

export function CrownedBaseball({ className = "w-16 h-14" }: { className?: string }) {
  return <SportCrown sport="baseball" className={className} />;
}

export function GoldTrophy({ className = "w-20 h-28" }: { className?: string }) {
  return (
    <svg viewBox="0 0 80 110" className={className} aria-label="Gold championship trophy">
      <defs>
        <linearGradient id="tg2" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fff8d0" />
          <stop offset="30%" stopColor="#ffe566" />
          <stop offset="55%" stopColor="#ffd700" />
          <stop offset="100%" stopColor="#8b6914" />
        </linearGradient>
        <linearGradient id="tgD2" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#e8b923" />
          <stop offset="100%" stopColor="#5c4510" />
        </linearGradient>
      </defs>
      <path d="M18 28 L22 58 Q40 68 58 58 L62 28 Z" fill="url(#tg2)" stroke="#8b6914" strokeWidth="1.2" />
      <ellipse cx="40" cy="28" rx="22" ry="7" fill="url(#tg2)" stroke="#8b6914" strokeWidth="1" />
      <path d="M26 34 Q30 48 28 56" fill="none" stroke="#fff8d0" strokeWidth="2" opacity="0.5" />
      <path d="M18 32 Q6 36 8 48 Q10 56 20 54" fill="none" stroke="url(#tg2)" strokeWidth="3.5" strokeLinecap="round" />
      <path d="M62 32 Q74 36 72 48 Q70 56 60 54" fill="none" stroke="url(#tg2)" strokeWidth="3.5" strokeLinecap="round" />
      <rect x="34" y="62" width="12" height="14" rx="1" fill="url(#tgD2)" />
      <path d="M24 88 L28 76 L52 76 L56 88 Z" fill="url(#tg2)" stroke="#8b6914" strokeWidth="0.8" />
      <rect x="20" y="88" width="40" height="8" rx="2" fill="url(#tg2)" stroke="#8b6914" strokeWidth="0.8" />
      <rect x="16" y="96" width="48" height="6" rx="2" fill="url(#tgD2)" />
    </svg>
  );
}
