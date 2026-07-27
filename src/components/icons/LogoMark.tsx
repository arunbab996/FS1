/**
 * Approximate placeholder mark — NOT a pixel-accurate extraction of the real
 * FirstSignal logo. The exact vector path couldn't be reliably read back from
 * a screenshot of devtools; swap this for the real SVG asset when available.
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="fs-logo-grad" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#60a5fa" />
          <stop offset="1" stopColor="#2563eb" />
        </linearGradient>
      </defs>
      <path
        fill="url(#fs-logo-grad)"
        d="M12 1.5 L14.6 9.4 L22.5 12 L14.6 14.6 L12 22.5 L9.4 14.6 L1.5 12 L9.4 9.4 Z"
      />
    </svg>
  );
}
