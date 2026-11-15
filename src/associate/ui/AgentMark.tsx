/** The agent's mark: a ring of ticks that turns slowly while the agent is working. */
export function AgentMark({ size = 20, active = false }: { size?: number; active?: boolean }) {
  const ticks = 28;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      aria-hidden
      className={active ? "animate-[spin_2.4s_linear_infinite]" : ""}
    >
      <defs>
        <linearGradient id="agent-mark-grad" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="40" y2="40">
          <stop offset="0%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#8b5cf6" />
        </linearGradient>
      </defs>
      {Array.from({ length: ticks }, (_, i) => {
        const angle = (i / ticks) * 360;
        const long = i % 2 === 0;
        return (
          <line
            key={i}
            x1="20"
            y1={long ? 3 : 5}
            x2="20"
            y2={long ? 11 : 10}
            stroke="url(#agent-mark-grad)"
            strokeWidth={long ? 2.2 : 1.6}
            strokeLinecap="round"
            opacity={0.35 + 0.65 * (i / ticks)}
            transform={`rotate(${angle} 20 20)`}
          />
        );
      })}
    </svg>
  );
}
