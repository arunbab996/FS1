import { Calendar } from "lucide-react";

export function DateGroupHeader({ label }: { label: string }) {
  return (
    <div className="inline-flex w-fit items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-sm font-semibold text-gray-700 shadow-sm dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200">
      <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />
      {label}
    </div>
  );
}
