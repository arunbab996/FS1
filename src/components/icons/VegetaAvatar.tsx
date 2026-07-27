/** Stylized "angry Saiyan" caricature avatar — not a reproduction of any copyrighted artwork. */
export function VegetaAvatar({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden="true">
      <rect width="100" height="100" fill="#1c2b57" />
      <ellipse cx="50" cy="60" rx="26" ry="28" fill="#f3b686" />
      <path
        fill="#0a0a0a"
        d="M18,48 L10,10 L26,36 L36,4 L44,32 L50,52 L56,32 L64,4 L74,36 L90,10 L82,48 L74,40 L66,46 L58,38 L50,44 L42,38 L34,46 L26,40 Z"
      />
      <path
        stroke="#0a0a0a"
        strokeWidth="3"
        strokeLinecap="round"
        d="M28,52 L40,58"
      />
      <path
        stroke="#0a0a0a"
        strokeWidth="3"
        strokeLinecap="round"
        d="M72,52 L60,58"
      />
      <ellipse cx="39" cy="62" rx="2.4" ry="2.8" fill="#111" />
      <ellipse cx="61" cy="62" rx="2.4" ry="2.8" fill="#111" />
      <path
        stroke="#7a4a1f"
        strokeWidth="2"
        strokeLinecap="round"
        d="M45,76 L55,76"
      />
    </svg>
  );
}
