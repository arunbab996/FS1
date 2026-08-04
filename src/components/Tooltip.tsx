import { useState, type ReactNode } from "react";

export function Tooltip({ label, children }: { label: string; children: ReactNode }) {
  const [show, setShow] = useState(false);

  return (
    <span
      className="relative inline-flex"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      {children}
      {show && (
        <span className="pointer-events-none absolute bottom-full left-1/2 z-30 mb-1.5 w-max max-w-60 -translate-x-1/2 rounded-md bg-gray-900 px-2 py-1 text-xs font-medium text-white shadow-lg dark:bg-neutral-700">
          {label}
          <span className="absolute top-full left-1/2 h-0 w-0 -translate-x-1/2 border-4 border-transparent border-t-gray-900 dark:border-t-neutral-700" />
        </span>
      )}
    </span>
  );
}
