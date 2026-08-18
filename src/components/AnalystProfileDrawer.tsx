import { Briefcase, Building2, Phone, Users, X } from "lucide-react";
import { useEffect } from "react";
import type { ActivityLead, AnalystActivityDetail, UserActivityRangeStats } from "../data/reportsData";
import { initials, sourcerColor } from "../utils/analystAvatar";
import { companyLogoUrl, personPhotoUrl } from "../utils/avatars";

function pct(numerator: number, denominator: number): number {
  if (denominator === 0) return 0;
  return Math.round((numerator / denominator) * 1000) / 10;
}

function LeadRow({ lead, avatar }: { lead: ActivityLead; avatar: "person" | "company" }) {
  return (
    <div className="flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-gray-50 dark:hover:bg-neutral-800/60">
      <img
        src={avatar === "person" ? personPhotoUrl(lead.person) : companyLogoUrl(lead.company)}
        alt={avatar === "person" ? lead.person : lead.company}
        className={`h-9 w-9 shrink-0 object-cover ${avatar === "person" ? "rounded-full" : "rounded-lg"}`}
      />
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-gray-900 dark:text-neutral-50">
          {avatar === "person" ? lead.person : lead.company}
        </p>
        <p className="truncate text-xs text-gray-500 dark:text-neutral-400">
          {avatar === "person" ? `${lead.role} · ${lead.company}` : `via ${lead.person}, ${lead.role}`}
        </p>
      </div>
    </div>
  );
}

function Section({
  icon: Icon,
  title,
  leads,
  avatar,
  emptyText,
}: {
  icon: typeof Users;
  title: string;
  leads: ActivityLead[];
  avatar: "person" | "company";
  emptyText: string;
}) {
  return (
    <div>
      <p className="flex items-center gap-1.5 text-xs font-semibold tracking-wide text-gray-400 uppercase dark:text-neutral-500">
        <Icon className="h-3.5 w-3.5" />
        {title}
      </p>
      <div className="mt-1.5 flex flex-col gap-0.5">
        {leads.length > 0 ? (
          leads.map((lead) => <LeadRow key={`${lead.person}-${lead.company}`} lead={lead} avatar={avatar} />)
        ) : (
          <p className="px-2 py-2 text-sm text-gray-400 dark:text-neutral-600">{emptyText}</p>
        )}
      </div>
    </div>
  );
}

export function AnalystProfileDrawer({
  user,
  stats,
  activity,
  open,
  onClose,
}: {
  user: string | null;
  stats: UserActivityRangeStats | null;
  activity: AnalystActivityDetail | null;
  open: boolean;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!open) return;
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-black/40 transition-opacity duration-300 ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={onClose}
      />
      <div
        className={`fixed top-0 right-0 z-50 h-full w-full bg-white transition-transform duration-300 ease-out sm:w-[420px] dark:bg-neutral-900 ${
          open ? "translate-x-0 shadow-2xl" : "translate-x-full"
        }`}
      >
        {user && stats && activity && (
          <div className="flex h-full flex-col">
            <div className="shrink-0 border-b border-gray-200 p-5 dark:border-neutral-700">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white ${sourcerColor(user)}`}
                  >
                    {initials(user)}
                  </span>
                  <p className="text-base font-semibold text-gray-900 dark:text-neutral-50">{user}</p>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="shrink-0 cursor-pointer text-gray-400 hover:text-gray-600 dark:text-neutral-500 dark:hover:text-neutral-300"
                  aria-label="Close"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                <div>
                  <p className="text-lg font-bold text-gray-900 dark:text-neutral-50">
                    {stats.reviewed.toLocaleString()}
                  </p>
                  <p className="text-[10px] font-medium tracking-wide text-gray-400 uppercase dark:text-neutral-500">
                    Reviewed
                  </p>
                </div>
                <div>
                  <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                    {stats.shortlisted.toLocaleString()}
                  </p>
                  <p className="text-[10px] font-medium tracking-wide text-gray-400 uppercase dark:text-neutral-500">
                    Shortlisted
                  </p>
                  <p className="text-[10px] text-gray-400 dark:text-neutral-600">
                    {pct(stats.shortlisted, stats.reviewed)}%
                  </p>
                </div>
                <div>
                  <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                    {stats.callsSetUp.toLocaleString()}
                  </p>
                  <p className="text-[10px] font-medium tracking-wide text-gray-400 uppercase dark:text-neutral-500">
                    Calls set up
                  </p>
                  <p className="text-[10px] text-gray-400 dark:text-neutral-600">
                    {pct(stats.callsSetUp, stats.shortlisted)}%
                  </p>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-5">
              <p className="mb-3 text-xs text-gray-400 dark:text-neutral-600">
                A recent sample — not the full {stats.reviewed.toLocaleString()}-signal list.
              </p>
              <div className="flex flex-col gap-6">
                <Section
                  icon={Users}
                  title="People reached out to"
                  leads={activity.reachedOut}
                  avatar="person"
                  emptyText="No outreach yet this period."
                />
                <Section
                  icon={Building2}
                  title="Companies shortlisted"
                  leads={activity.shortlisted}
                  avatar="company"
                  emptyText="Nothing shortlisted yet this period."
                />
                <Section
                  icon={Phone}
                  title="Calls set up"
                  leads={activity.callsSetUp}
                  avatar="person"
                  emptyText="No calls scheduled yet this period."
                />
              </div>
            </div>

            <div className="shrink-0 border-t border-gray-200 px-5 py-3 dark:border-neutral-700">
              <p className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-neutral-600">
                <Briefcase className="h-3.5 w-3.5" />
                Mock activity for illustration — not yet wired to real per-analyst tracking.
              </p>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
