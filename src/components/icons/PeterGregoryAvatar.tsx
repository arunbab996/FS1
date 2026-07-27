/** Stylized "eccentric VC" caricature avatar — not a reproduction of any copyrighted artwork or likeness. */
export function PeterGregoryAvatar({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden="true">
      <rect width="100" height="100" fill="#dfe3e6" />
      <path fill="#7c8b74" d="M20,100 L20,84 Q50,70 80,84 L80,100 Z" />
      <path fill="#f4f4f4" d="M42,84 L50,95 L58,84 Z" />
      <rect x="44" y="72" width="12" height="16" fill="#e8c39e" />
      <ellipse cx="50" cy="52" rx="22" ry="24" fill="#e8c39e" />
      <path fill="#b3b3ad" d="M27,40 Q19,52 26,67 Q31,54 29,42 Z" />
      <path fill="#b3b3ad" d="M73,40 Q81,52 74,67 Q69,54 71,42 Z" />
      <circle cx="41" cy="50" r="8" fill="none" stroke="#1a1a1a" strokeWidth="3" />
      <circle cx="59" cy="50" r="8" fill="none" stroke="#1a1a1a" strokeWidth="3" />
      <line x1="49" y1="50" x2="51" y2="50" stroke="#1a1a1a" strokeWidth="3" />
      <path
        stroke="#7a4a1f"
        strokeWidth="2"
        strokeLinecap="round"
        d="M44,66 L56,66"
      />
    </svg>
  );
}
