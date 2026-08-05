/** Bold, chunky broadcast arcs around a solid center dot. */
export function SignalWaveIcon({
  className,
  "aria-label": ariaLabel,
}: {
  className?: string;
  "aria-label"?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={3.2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-label={ariaLabel}
      aria-hidden={ariaLabel ? undefined : true}
    >
      <path d="M4.9 19.1C1 15.2 1 8.8 4.9 4.9" />
      <path d="M7.8 7.7a6.14 6.14 0 0 0-.8 7.5" />
      <circle cx="12" cy="12" r="2.3" fill="currentColor" stroke="none" />
      <path d="M16.2 7.8c2 2 2.26 5.11.8 7.47" />
      <path d="M19.1 4.9a9.96 9.96 0 0 1 0 14.1" />
    </svg>
  );
}
