import { Calendar } from "lucide-react";

export function DateGroupHeader({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2 px-1 py-1 text-sm font-medium text-gray-500 dark:text-neutral-400">
      <Calendar className="h-4 w-4" />
      {label}
    </div>
  );
}
