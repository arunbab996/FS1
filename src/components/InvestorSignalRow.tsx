import { Flame } from "lucide-react";
import { companyLogoUrl } from "../utils/avatars";

export function InvestorInterestBox({ investor }: { investor: string }) {
  return (
    <div className="min-w-0 max-w-56 flex-1 rounded-lg border border-pink-200 bg-pink-50/50 px-1.5 py-1 dark:border-pink-500/20 dark:bg-pink-500/5">
      <p className="text-[11px] font-semibold tracking-wider text-pink-600 uppercase dark:text-pink-400">
        Investor interest
      </p>
      <div className="mt-0.5 flex items-center gap-1.5">
        <img
          src={companyLogoUrl(investor)}
          alt=""
          className="h-5 w-5 shrink-0 rounded bg-white object-cover"
        />
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13px] leading-snug font-medium text-gray-900 dark:text-neutral-50">
            {investor}
          </p>
          <p className="truncate text-xs leading-snug text-gray-500 dark:text-neutral-400">
            Showed interest
          </p>
        </div>
      </div>
    </div>
  );
}

export function FeaturedBox({
  count,
  windowDays = 15,
}: {
  count: number;
  windowDays?: number;
}) {
  return (
    <div className="min-w-0 max-w-56 flex-1 rounded-lg border border-amber-200 bg-amber-50/50 px-1.5 py-1 dark:border-amber-500/20 dark:bg-amber-500/5">
      <p className="text-[11px] font-semibold tracking-wider text-amber-600 uppercase dark:text-amber-400">
        Featured
      </p>
      <div className="mt-0.5 flex items-center gap-1.5">
        <div className="animate-featured-glow flex h-5 w-5 shrink-0 items-center justify-center rounded bg-amber-100 dark:bg-amber-500/20">
          <Flame className="h-3 w-3 text-amber-600 dark:text-amber-400" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13px] leading-snug font-medium text-gray-900 dark:text-neutral-50">
            Featured {count}x
          </p>
          <p className="truncate text-xs leading-snug text-gray-500 dark:text-neutral-400">
            last {windowDays} days
          </p>
        </div>
      </div>
    </div>
  );
}
