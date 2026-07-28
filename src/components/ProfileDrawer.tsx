import {
  Briefcase,
  Calendar,
  ChevronDown,
  Eye,
  GraduationCap,
  Handshake,
  MapPin,
  Reply,
  Search,
  Send,
  Sparkles,
  Users,
  X,
} from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import type { ProfileActivityItem, ProfilePosition, Signal } from "../types";
import { companyLogoUrl, personPhotoUrl } from "../utils/avatars";
import {
  positionCategoryBarClasses,
  positionCategoryDotClasses,
} from "../utils/positionCategory";
import { extractPersonName, stripMarkdown } from "../utils/text";
import { LinkedinIcon } from "./icons/LinkedinIcon";
import { TwitterIcon } from "./icons/TwitterIcon";

type Tab = "overview" | "experience" | "insights" | "education" | "skills" | "interactions";

function StatChip({ icon: Icon, label }: { icon: typeof Briefcase; label: string }) {
  return (
    <span className="flex items-center gap-1.5 rounded-full border border-gray-200 px-2.5 py-1 text-xs text-gray-600 dark:border-neutral-700 dark:text-neutral-300">
      <Icon className="h-3.5 w-3.5 text-gray-400 dark:text-neutral-500" />
      {label}
    </span>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`shrink-0 border-b-2 px-1 py-2.5 text-xs font-semibold tracking-wide uppercase whitespace-nowrap transition-colors ${
        active
          ? "border-blue-600 text-blue-600 dark:border-blue-500 dark:text-blue-400"
          : "border-transparent text-gray-500 hover:text-gray-800 dark:text-neutral-400 dark:hover:text-neutral-100"
      }`}
    >
      {children}
    </button>
  );
}

function StatTile({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="rounded-xl border border-gray-200 p-3 dark:border-neutral-700">
      <p className="text-[11px] font-semibold tracking-wide text-gray-400 uppercase dark:text-neutral-500">
        {label}
      </p>
      <p className="mt-1 text-xl font-bold text-gray-900 dark:text-neutral-50">{value}</p>
    </div>
  );
}

function groupPositions(positions: ProfilePosition[]) {
  const groups: { company: string; meta?: string[]; positions: ProfilePosition[] }[] = [];
  for (const pos of positions) {
    const last = groups[groups.length - 1];
    if (last && last.company === pos.company) {
      last.positions.push(pos);
    } else {
      groups.push({ company: pos.company, meta: pos.companyMeta, positions: [pos] });
    }
  }
  return groups;
}

function activityIcon(kind: ProfileActivityItem["kind"]) {
  switch (kind) {
    case "sourced":
      return Search;
    case "connected":
      return Handshake;
    case "linkedin-sent":
      return Send;
    case "linkedin-replied":
      return Reply;
    case "linkedin-opened":
      return Eye;
    case "meeting":
      return Calendar;
    case "status":
      return Sparkles;
  }
}

export function ProfileDrawer({
  signal,
  open,
  onClose,
}: {
  signal: Signal;
  open: boolean;
  onClose: () => void;
}) {
  const [tab, setTab] = useState<Tab>("overview");
  const [showEarlier, setShowEarlier] = useState(false);
  const profile = signal.profile;
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (contentRef.current) contentRef.current.scrollTop = 0;
  }, [tab]);

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

  useEffect(() => {
    if (open) {
      setTab("overview");
      setShowEarlier(false);
    }
  }, [open]);

  const name = extractPersonName(signal.headline);
  const [location, yearsText] = signal.contextLine.split(" · ");

  const tabs: { id: Tab; label: string }[] = [
    { id: "overview", label: "Overview" },
    { id: "experience", label: "Experience" },
    ...(profile ? ([{ id: "insights", label: "Insights" }] as const) : []),
    { id: "education", label: "Education" },
    ...(profile?.skills.length ? ([{ id: "skills", label: "Skills" }] as const) : []),
    ...(profile?.activity.length
      ? ([{ id: "interactions", label: "Interactions" }] as const)
      : []),
  ];

  const groupedPositions = profile ? groupPositions(profile.positions) : [];
  const mainGroups = groupedPositions.filter((g) => g.company !== "Earlier roles");
  const earlierGroup = groupedPositions.find((g) => g.company === "Earlier roles");

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-black/40 transition-opacity duration-300 ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={onClose}
      />
      <div
        className={`fixed top-0 right-0 z-50 h-full w-full bg-white shadow-2xl transition-transform duration-300 ease-out sm:w-[55%] lg:max-w-2xl dark:bg-neutral-900 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="shrink-0 border-b border-gray-200 p-5 dark:border-neutral-700">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <img
                  src={personPhotoUrl(signal.id)}
                  alt={signal.avatarInitials}
                  className="h-16 w-16 shrink-0 rounded-full object-cover"
                />
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-neutral-50">
                      {name}
                    </h2>
                    {signal.linkedinUrl && (
                      <a
                        href={signal.linkedinUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="View LinkedIn"
                        className="text-gray-400 hover:text-gray-700 dark:text-neutral-500 dark:hover:text-neutral-200"
                      >
                        <LinkedinIcon className="h-4 w-4" />
                      </a>
                    )}
                    <TwitterIcon className="h-4 w-4 text-gray-400 dark:text-neutral-500" />
                  </div>
                  <p className="mt-0.5 text-sm text-gray-500 dark:text-neutral-400">
                    {profile?.titleLine ?? stripMarkdown(signal.headline)}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="shrink-0 rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <StatChip icon={Briefcase} label={yearsText ?? "Experience"} />
              {profile && <StatChip icon={Users} label={`${profile.connections} Connections`} />}
              {profile && <StatChip icon={Eye} label={`${profile.followers} Followers`} />}
              <StatChip icon={MapPin} label={profile?.location ?? location} />
            </div>
          </div>

          {/* Tabs */}
          <div className="flex shrink-0 gap-5 overflow-x-auto border-b border-gray-200 px-5 dark:border-neutral-700">
            {tabs.map((t) => (
              <TabButton key={t.id} active={tab === t.id} onClick={() => setTab(t.id)}>
                {t.label}
              </TabButton>
            ))}
          </div>

          {/* Content */}
          <div ref={contentRef} className="flex-1 overflow-y-auto p-5">
            {tab === "overview" && (
              <div className="flex flex-col gap-5">
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-neutral-700 dark:bg-neutral-800">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 dark:text-neutral-400">
                    <Sparkles className="h-3.5 w-3.5 text-violet-500" />
                    AI Summary
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-gray-800 dark:text-neutral-200">
                    {signal.aiSummary}
                  </p>
                  {profile && (
                    <p className="mt-2 text-xs text-gray-400 dark:text-neutral-500">
                      Generated {profile.aiSummaryGenerated}
                    </p>
                  )}
                </div>

                {profile && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-neutral-50">
                      Overview
                    </h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-gray-700 dark:text-neutral-300">
                      {profile.overview}
                    </p>
                  </div>
                )}

                {profile && (
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    <StatTile label="Years experience" value={yearsText?.replace(" yrs experience", "") ?? "—"} />
                    <StatTile label="Roles held" value={profile.rolesHeld} />
                    <StatTile label="Avg tenure" value={`${profile.avgTenureMonths}mo`} />
                    <StatTile label="Followers" value={profile.followers} />
                  </div>
                )}

                {profile ? (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-neutral-50">
                      Sourcing
                    </h3>
                    <div className="mt-2 grid grid-cols-3 gap-3">
                      <div className="rounded-xl border border-gray-200 bg-gray-50 p-3 dark:border-neutral-700 dark:bg-neutral-800">
                        <p className="text-[11px] font-semibold tracking-wide text-gray-400 uppercase dark:text-neutral-500">
                          Last analyst
                        </p>
                        <p className="mt-1 text-sm font-medium text-gray-900 dark:text-neutral-50">
                          {profile.lastAnalystConnection}
                        </p>
                      </div>
                      <div className="rounded-xl border border-gray-200 bg-gray-50 p-3 dark:border-neutral-700 dark:bg-neutral-800">
                        <p className="text-[11px] font-semibold tracking-wide text-gray-400 uppercase dark:text-neutral-500">
                          Last connected
                        </p>
                        <p className="mt-1 text-sm font-medium text-gray-900 dark:text-neutral-50">
                          {profile.lastConnectedDate}
                        </p>
                      </div>
                      <div className="rounded-xl border border-gray-200 bg-gray-50 p-3 dark:border-neutral-700 dark:bg-neutral-800">
                        <p className="text-[11px] font-semibold tracking-wide text-gray-400 uppercase dark:text-neutral-500">
                          Last status
                        </p>
                        <p className="mt-1 text-sm font-medium text-gray-900 dark:text-neutral-50">
                          {profile.lastStatus}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  signal.sourcedBy && (
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-neutral-50">
                        Sourcing
                      </h3>
                      <p className="mt-1.5 text-sm text-gray-700 dark:text-neutral-300">
                        Sourced by {signal.sourcedBy}
                      </p>
                    </div>
                  )
                )}
              </div>
            )}

            {tab === "experience" && (
              <div className="flex flex-col gap-5">
                {profile
                  ? mainGroups.map((group, gi) => (
                      <div key={gi}>
                        <div className="flex items-center gap-2">
                          <img
                            src={companyLogoUrl(group.company)}
                            alt=""
                            className="h-7 w-7 rounded bg-white object-cover"
                          />
                          <h3 className="text-sm font-bold text-gray-900 dark:text-neutral-50">
                            {group.company}
                          </h3>
                        </div>
                        {group.meta && (
                          <div className="mt-1.5 flex flex-wrap gap-1.5">
                            {group.meta.map((m) => (
                              <span
                                key={m}
                                className="rounded-full border border-gray-200 px-2 py-0.5 text-[11px] text-gray-500 dark:border-neutral-700 dark:text-neutral-400"
                              >
                                {m}
                              </span>
                            ))}
                          </div>
                        )}
                        <div className="mt-3 flex flex-col gap-3 border-l-2 border-gray-100 pl-4 dark:border-neutral-800">
                          {group.positions.map((pos, pi) => (
                            <div key={pi} className="relative">
                              <span
                                className={`absolute top-1.5 -left-[21px] h-2 w-2 rounded-full ${positionCategoryDotClasses(pos.category)}`}
                              />
                              <p className="text-sm font-semibold text-gray-900 dark:text-neutral-50">
                                {pos.title}
                              </p>
                              {pos.tag && (
                                <span className="mt-1 inline-block rounded-full border border-gray-200 px-2 py-0.5 text-[11px] text-gray-500 dark:border-neutral-700 dark:text-neutral-400">
                                  {pos.tag}
                                </span>
                              )}
                              {pos.description && (
                                <p className="mt-1 text-sm text-gray-600 dark:text-neutral-300">
                                  {pos.description}
                                </p>
                              )}
                              <p className="mt-0.5 text-xs text-gray-400 dark:text-neutral-500">
                                {pos.period}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))
                  : [...signal.current, ...signal.past].map((entry, i) => (
                      <div key={i} className="flex items-center gap-2.5">
                        <img
                          src={companyLogoUrl(entry.company)}
                          alt=""
                          className="h-7 w-7 rounded bg-white object-cover"
                        />
                        <div>
                          <p className="text-sm font-semibold text-gray-900 dark:text-neutral-50">
                            {entry.company}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-neutral-400">
                            {entry.role}
                          </p>
                        </div>
                      </div>
                    ))}

                {earlierGroup && (
                  <div>
                    <button
                      type="button"
                      onClick={() => setShowEarlier((v) => !v)}
                      className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      {showEarlier ? "Show less" : `Show more (${earlierGroup.positions.length})`}
                      <ChevronDown
                        className={`h-3.5 w-3.5 transition-transform ${showEarlier ? "rotate-180" : ""}`}
                      />
                    </button>
                    {showEarlier && (
                      <div className="mt-3 flex flex-col gap-2 border-l-2 border-gray-100 pl-4 dark:border-neutral-800">
                        {earlierGroup.positions.map((pos, pi) => (
                          <div key={pi} className="relative">
                            <span
                              className={`absolute top-1.5 -left-[21px] h-2 w-2 rounded-full ${positionCategoryDotClasses(pos.category)}`}
                            />
                            <p className="text-sm font-medium text-gray-800 dark:text-neutral-200">
                              {pos.title}
                            </p>
                            <p className="text-xs text-gray-400 dark:text-neutral-500">
                              {pos.period} · {pos.months} mos
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {tab === "insights" && profile && (
              <div className="flex flex-col gap-5">
                <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
                  <StatTile label="Total" value={`${profile.insights.totalMonths}mo`} />
                  <StatTile label="Average" value={`${profile.insights.avgMonths}mo`} />
                  <StatTile label="Longest" value={`${profile.insights.longestMonths}mo`} />
                  <StatTile label="Shortest" value={`${profile.insights.shortestMonths}mo`} />
                  <StatTile label="Roles" value={profile.insights.roles} />
                  <StatTile label="Companies" value={profile.insights.companies} />
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-neutral-50">
                    Tenure per role
                  </h3>
                  <div className="mt-3 flex flex-col gap-2.5">
                    {[...profile.positions]
                      .sort((a, b) => b.months - a.months)
                      .map((pos, i) => (
                        <div key={i} className="flex items-center gap-3">
                          <p className="w-40 shrink-0 truncate text-xs text-gray-600 dark:text-neutral-300">
                            {pos.title}
                          </p>
                          <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-100 dark:bg-neutral-800">
                            <div
                              className={`h-full rounded-full ${positionCategoryBarClasses(pos.category)}`}
                              style={{
                                width: `${(pos.months / profile.insights.longestMonths) * 100}%`,
                              }}
                            />
                          </div>
                          <span className="w-10 shrink-0 text-right text-xs text-gray-400 dark:text-neutral-500">
                            {pos.months}mo
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            )}

            {tab === "education" && (
              <div className="flex flex-col gap-3">
                {profile
                  ? profile.education.map((edu, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-3 rounded-xl border border-gray-200 p-3 dark:border-neutral-700"
                      >
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-500/10">
                          <GraduationCap className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-bold text-gray-900 dark:text-neutral-50">
                              {edu.school}
                            </p>
                            {edu.badge && (
                              <span className="rounded-full bg-violet-50 px-2 py-0.5 text-[11px] font-medium text-violet-700 dark:bg-violet-500/15 dark:text-violet-400">
                                {edu.badge}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 dark:text-neutral-300">
                            {edu.degree}
                          </p>
                          <p className="mt-0.5 text-xs text-gray-400 dark:text-neutral-500">
                            {edu.period}
                          </p>
                        </div>
                      </div>
                    ))
                  : signal.education.map((entry, i) => (
                      <div key={i} className="flex items-center gap-2.5">
                        <img
                          src={companyLogoUrl(entry.company)}
                          alt=""
                          className="h-7 w-7 rounded bg-white object-cover"
                        />
                        <div>
                          <p className="text-sm font-semibold text-gray-900 dark:text-neutral-50">
                            {entry.company}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-neutral-400">
                            {entry.role}
                          </p>
                        </div>
                      </div>
                    ))}
              </div>
            )}

            {tab === "skills" && profile && (
              <div className="flex flex-wrap gap-2">
                {profile.skills.map((skill) => (
                  <span
                    key={skill}
                    className="rounded-full border border-gray-200 px-3 py-1 text-xs text-gray-700 dark:border-neutral-700 dark:text-neutral-300"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            )}

            {tab === "interactions" && profile && (
              <div className="flex flex-col gap-3">
                {profile.activity.map((item, i) => {
                  const Icon = activityIcon(item.kind);
                  return (
                    <div
                      key={i}
                      className="flex gap-3 rounded-xl border border-gray-200 p-3 dark:border-neutral-700"
                    >
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gray-100 dark:bg-neutral-800">
                        <Icon className="h-3.5 w-3.5 text-gray-500 dark:text-neutral-400" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm text-gray-700 dark:text-neutral-300">{item.text}</p>
                        {item.tags && (
                          <div className="mt-1.5 flex flex-wrap gap-1.5">
                            {item.tags.map((t) => (
                              <span
                                key={t}
                                className="rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-medium text-blue-700 dark:bg-blue-500/15 dark:text-blue-400"
                              >
                                {t}
                              </span>
                            ))}
                          </div>
                        )}
                        <div className="mt-1.5 flex items-center gap-2 text-xs text-gray-400 dark:text-neutral-500">
                          <span>{item.date}</span>
                          {item.direction && (
                            <span className="rounded-full bg-gray-100 px-1.5 py-0.5 text-[10px] font-medium text-gray-500 dark:bg-neutral-800 dark:text-neutral-400">
                              {item.direction}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
