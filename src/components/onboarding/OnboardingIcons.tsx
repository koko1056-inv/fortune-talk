// SVG icons for onboarding flow — no emoji dependencies

export const CrystalBallIcon = ({ className = "w-20 h-20" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="orbGlow" cx="40%" cy="35%" r="50%">
        <stop offset="0%" stopColor="hsl(280 70% 70%)" stopOpacity="0.6" />
        <stop offset="50%" stopColor="hsl(260 60% 50%)" stopOpacity="0.3" />
        <stop offset="100%" stopColor="hsl(260 30% 20%)" stopOpacity="0.1" />
      </radialGradient>
      <radialGradient id="orbShine" cx="30%" cy="25%" r="30%">
        <stop offset="0%" stopColor="white" stopOpacity="0.4" />
        <stop offset="100%" stopColor="white" stopOpacity="0" />
      </radialGradient>
    </defs>
    <circle cx="60" cy="52" r="38" fill="url(#orbGlow)" stroke="hsl(280 50% 60%)" strokeWidth="1.5" />
    <circle cx="60" cy="52" r="38" fill="url(#orbShine)" />
    <ellipse cx="60" cy="52" rx="26" ry="14" fill="none" stroke="hsl(280 40% 60%)" strokeWidth="0.5" opacity="0.3" />
    <path d="M38 90 C38 85, 82 85, 82 90 L85 100 C85 104, 35 104, 35 100 Z" fill="hsl(45 60% 45%)" opacity="0.8" />
    <path d="M40 90 C40 87, 80 87, 80 90" fill="none" stroke="hsl(45 80% 55%)" strokeWidth="1" opacity="0.6" />
    <circle cx="48" cy="42" r="3" fill="white" opacity="0.15" />
    <circle cx="70" cy="55" r="2" fill="white" opacity="0.1" />
  </svg>
);

export const SparkleIcon = ({ className = "w-12 h-12" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M24 4L27.5 18.5L42 24L27.5 29.5L24 44L20.5 29.5L6 24L20.5 18.5Z" fill="hsl(45 80% 55%)" opacity="0.9" />
    <path d="M24 10L26 20L36 24L26 28L24 38L22 28L12 24L22 20Z" fill="hsl(45 90% 70%)" opacity="0.6" />
  </svg>
);

export const CakeIcon = ({ className = "w-12 h-12" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="10" y="24" width="28" height="16" rx="3" fill="hsl(280 40% 40%)" opacity="0.6" />
    <rect x="10" y="24" width="28" height="6" rx="3" fill="hsl(280 50% 50%)" opacity="0.4" />
    <rect x="22" y="14" width="4" height="10" rx="1" fill="hsl(45 60% 50%)" opacity="0.7" />
    <ellipse cx="24" cy="12" rx="3" ry="4" fill="hsl(45 80% 55%)" opacity="0.8" />
    <circle cx="24" cy="10" r="1.5" fill="hsl(45 90% 70%)" opacity="0.9" />
    <line x1="10" y1="40" x2="38" y2="40" stroke="hsl(280 30% 35%)" strokeWidth="1" opacity="0.4" />
  </svg>
);

export const ClockIcon = ({ className = "w-12 h-12" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="24" cy="24" r="18" fill="hsl(260 25% 15%)" stroke="hsl(45 60% 50%)" strokeWidth="1.5" opacity="0.8" />
    <circle cx="24" cy="24" r="15" fill="none" stroke="hsl(280 40% 50%)" strokeWidth="0.5" opacity="0.3" />
    <line x1="24" y1="24" x2="24" y2="12" stroke="hsl(45 80% 55%)" strokeWidth="2" strokeLinecap="round" />
    <line x1="24" y1="24" x2="32" y2="24" stroke="hsl(45 60% 50%)" strokeWidth="1.5" strokeLinecap="round" />
    <circle cx="24" cy="24" r="2" fill="hsl(45 80% 55%)" />
    {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => (
      <circle
        key={deg}
        cx={24 + 16 * Math.cos((deg - 90) * Math.PI / 180)}
        cy={24 + 16 * Math.sin((deg - 90) * Math.PI / 180)}
        r={deg % 90 === 0 ? 1.5 : 0.8}
        fill="hsl(45 60% 50%)"
        opacity={deg % 90 === 0 ? 0.8 : 0.4}
      />
    ))}
  </svg>
);

export const MapPinIcon = ({ className = "w-12 h-12" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M24 44C24 44 38 28 38 20C38 12.268 31.732 6 24 6C16.268 6 10 12.268 10 20C10 28 24 44 24 44Z" fill="hsl(280 50% 40%)" opacity="0.6" stroke="hsl(45 60% 50%)" strokeWidth="1.5" />
    <circle cx="24" cy="20" r="6" fill="hsl(45 80% 55%)" opacity="0.8" />
    <circle cx="24" cy="20" r="3" fill="hsl(260 25% 15%)" opacity="0.6" />
  </svg>
);

export const CompassIcon = ({ className = "w-12 h-12" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="24" cy="24" r="18" fill="hsl(260 25% 12%)" stroke="hsl(45 60% 50%)" strokeWidth="1.5" opacity="0.8" />
    <polygon points="24,8 28,22 24,26 20,22" fill="hsl(45 80% 55%)" opacity="0.8" />
    <polygon points="24,40 20,26 24,22 28,26" fill="hsl(280 50% 50%)" opacity="0.6" />
    <circle cx="24" cy="24" r="2.5" fill="hsl(45 80% 55%)" />
  </svg>
);

export const StarIcon = ({ className = "w-12 h-12" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M24 4L29.5 17.5L44 20L33 30L36 44L24 37L12 44L15 30L4 20L18.5 17.5Z" fill="hsl(45 80% 55%)" opacity="0.85" />
    <path d="M24 10L27.5 19.5L38 21L30 28.5L32 38L24 33L16 38L18 28.5L10 21L20.5 19.5Z" fill="hsl(45 90% 70%)" opacity="0.4" />
  </svg>
);

export const MoonStarIcon = ({ className = "w-12 h-12" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M32 8C24.268 8 18 14.268 18 22C18 29.732 24.268 36 32 36C28 36 20 33 16 26C12 19 14 10 20 6C16 8 32 8 32 8Z" fill="hsl(45 80% 55%)" opacity="0.7" />
    <path d="M36 12L37.5 16L42 17L38.5 19.5L39 24L36 21L33 24L33.5 19.5L30 17L34.5 16Z" fill="hsl(45 80% 55%)" opacity="0.9" />
    <circle cx="40" cy="10" r="1" fill="hsl(45 80% 55%)" opacity="0.6" />
  </svg>
);

export const ConstellationIcon = ({ className = "w-12 h-12" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="2.5" fill="hsl(45 80% 55%)" opacity="0.9" />
    <circle cx="36" cy="10" r="2" fill="hsl(45 80% 55%)" opacity="0.7" />
    <circle cx="24" cy="24" r="3" fill="hsl(45 80% 55%)" opacity="0.9" />
    <circle cx="10" cy="36" r="2" fill="hsl(45 80% 55%)" opacity="0.7" />
    <circle cx="38" cy="38" r="2.5" fill="hsl(45 80% 55%)" opacity="0.8" />
    <line x1="12" y1="12" x2="24" y2="24" stroke="hsl(45 60% 50%)" strokeWidth="0.8" opacity="0.4" />
    <line x1="36" y1="10" x2="24" y2="24" stroke="hsl(45 60% 50%)" strokeWidth="0.8" opacity="0.4" />
    <line x1="24" y1="24" x2="10" y2="36" stroke="hsl(45 60% 50%)" strokeWidth="0.8" opacity="0.4" />
    <line x1="24" y1="24" x2="38" y2="38" stroke="hsl(45 60% 50%)" strokeWidth="0.8" opacity="0.4" />
  </svg>
);

export const SunburstIcon = ({ className = "w-16 h-16" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="32" cy="32" r="12" fill="hsl(45 80% 55%)" opacity="0.8" />
    <circle cx="32" cy="32" r="8" fill="hsl(45 90% 70%)" opacity="0.4" />
    {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
      <line
        key={deg}
        x1={32 + 15 * Math.cos(deg * Math.PI / 180)}
        y1={32 + 15 * Math.sin(deg * Math.PI / 180)}
        x2={32 + 26 * Math.cos(deg * Math.PI / 180)}
        y2={32 + 26 * Math.sin(deg * Math.PI / 180)}
        stroke="hsl(45 80% 55%)"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.6"
      />
    ))}
  </svg>
);
