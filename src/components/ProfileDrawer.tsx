import {
  Award,
  Briefcase,
  Calendar,
  ChevronDown,
  Code2,
  ExternalLink,
  Eye,
  EyeOff,
  FileText,
  Globe,
  GraduationCap,
  Handshake,
  Landmark,
  LogOut,
  MapPin,
  MessageSquare,
  Mic,
  Newspaper,
  Reply,
  Rocket,
  School,
  Search,
  Send,
  Sparkles,
  Star,
  ThumbsUp,
  TrendingUp,
  Trophy,
  User,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import type {
  BehavioralSignalItem,
  CareerSignalItem,
  LinkedInActivityItem,
  NetworkItem,
  PedigreeItem,
  ProfileActivityItem,
  ProfilePosition,
  RecognitionItem,
  Signal,
} from "../types";
import { companyLogoUrl, personPhotoUrl } from "../utils/avatars";
import {
  positionCategoryBarClasses,
  positionCategoryDotClasses,
} from "../utils/positionCategory";
import { extractPersonName, stripMarkdown } from "../utils/text";
import { formatTenureLabel } from "../utils/tenure";
import { tagColorClasses, tagIcon } from "../utils/tags";
import { GithubActivityGraph } from "./GithubActivityGraph";
import { GithubIcon } from "./icons/GithubIcon";
import { LinkedinIcon } from "./icons/LinkedinIcon";
import { TwitterIcon } from "./icons/TwitterIcon";
import { TagInfoCard } from "./TagInfoCard";

type Tab =
  | "overview"
  | "experience"
  | "insights"
  | "education"
  | "credentials"
  | "social"
  | "interactions";

type HighlightKind = "pedigree" | "career" | "network" | "recognition";

function highlightAccentClasses(kind: HighlightKind) {
  switch (kind) {
    case "pedigree":
      return {
        card: "bg-amber-50/60 hover:border-amber-300 dark:bg-amber-500/5 dark:hover:border-amber-700",
        iconBg: "bg-amber-100 dark:bg-amber-500/15",
        iconText: "text-amber-600 dark:text-amber-400",
        label: "text-amber-700 dark:text-amber-400",
      };
    case "career":
      return {
        card: "bg-blue-50/60 hover:border-blue-300 dark:bg-blue-500/5 dark:hover:border-blue-700",
        iconBg: "bg-blue-100 dark:bg-blue-500/15",
        iconText: "text-blue-600 dark:text-blue-400",
        label: "text-blue-700 dark:text-blue-400",
      };
    case "network":
      return {
        card: "bg-teal-50/60 hover:border-teal-300 dark:bg-teal-500/5 dark:hover:border-teal-700",
        iconBg: "bg-teal-100 dark:bg-teal-500/15",
        iconText: "text-teal-600 dark:text-teal-400",
        label: "text-teal-700 dark:text-teal-400",
      };
    case "recognition":
      return {
        card: "bg-violet-50/60 hover:border-violet-300 dark:bg-violet-500/5 dark:hover:border-violet-700",
        iconBg: "bg-violet-100 dark:bg-violet-500/15",
        iconText: "text-violet-600 dark:text-violet-400",
        label: "text-violet-700 dark:text-violet-400",
      };
  }
}

function HighlightCard({
  kind,
  categoryLabel,
  icon: Icon,
  label,
  onClick,
}: {
  kind: HighlightKind;
  categoryLabel: string;
  icon: typeof Star;
  label: string;
  onClick: () => void;
}) {
  const c = highlightAccentClasses(kind);
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-start gap-2 rounded-xl border border-gray-200 p-2.5 text-left transition-colors dark:border-neutral-700 ${c.card}`}
    >
      <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${c.iconBg}`}>
        <Icon className={`h-3.5 w-3.5 ${c.iconText}`} />
      </div>
      <div className="min-w-0">
        <p className={`text-[10px] font-semibold tracking-wide uppercase ${c.label}`}>
          {categoryLabel}
        </p>
        <p className="mt-0.5 line-clamp-2 text-xs font-medium text-gray-800 dark:text-neutral-200">
          {label}
        </p>
      </div>
    </button>
  );
}

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
      className={`shrink-0 cursor-pointer border-b-2 px-1 py-2.5 text-xs font-semibold tracking-wide uppercase whitespace-nowrap transition-colors ${
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

function linkedinActivityIcon(kind: LinkedInActivityItem["kind"]) {
  switch (kind) {
    case "post":
      return FileText;
    case "comment":
      return MessageSquare;
    case "reaction":
      return ThumbsUp;
  }
}

const linkedinActivityLabel: Record<LinkedInActivityItem["kind"], string> = {
  post: "Post",
  comment: "Comment",
  reaction: "Reaction",
};

const linkedinActivityTextClasses: Record<LinkedInActivityItem["kind"], string> = {
  post: "text-blue-600 dark:text-blue-400",
  comment: "text-cyan-600 dark:text-cyan-400",
  reaction: "text-pink-600 dark:text-pink-400",
};

function pedigreeIcon(category: PedigreeItem["category"]) {
  switch (category) {
    case "school":
      return School;
    case "honours":
      return Award;
    case "scholarship":
      return Landmark;
    case "olympiad":
      return Trophy;
    case "competitive-programming":
      return Code2;
    case "hackathon":
      return Rocket;
  }
}

function careerSignalIcon(kind: CareerSignalItem["kind"]) {
  switch (kind) {
    case "employer-tier":
      return Star;
    case "early-employee":
      return Rocket;
    case "promotion-velocity":
      return TrendingUp;
    case "departure-event":
      return LogOut;
  }
}

function networkIcon(kind: NetworkItem["kind"]) {
  switch (kind) {
    case "co-founder":
      return Handshake;
    case "accelerator":
      return Rocket;
    case "colleague-overlap":
      return Users;
  }
}

function recognitionIcon(kind: RecognitionItem["kind"]) {
  switch (kind) {
    case "press":
      return Newspaper;
    case "list":
      return Trophy;
    case "speaking":
      return Mic;
  }
}

function behavioralSignalIcon(kind: BehavioralSignalItem["kind"]) {
  switch (kind) {
    case "stealth-mode":
      return EyeOff;
    case "new-domain":
      return Globe;
    case "new-directorship":
      return Landmark;
    case "follow-burst":
      return UserPlus;
    case "topic-shift":
      return TrendingUp;
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
    // The main list keeps its own scroll container, so hiding body overflow
    // alone doesn't stop its native scrollbar from painting over the drawer.
    const mainScroll = document.getElementById("main-scroll");
    if (mainScroll) mainScroll.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
      if (mainScroll) mainScroll.style.overflow = "";
    };
  }, [open, onClose]);

  useEffect(() => {
    if (open) {
      setTab("overview");
      setShowEarlier(false);
    }
  }, [open]);

  const name = signal.personName ?? extractPersonName(signal.headline);
  const [location, yearsText] = signal.contextLine.split(" · ");
  const nexusTag = signal.tags.find((t) => t.category === "thesis");

  const tabs: { id: Tab; label: string }[] = [
    { id: "overview", label: "Overview" },
    { id: "experience", label: "Experience" },
    ...(profile ? ([{ id: "insights", label: "Insights" }] as const) : []),
    { id: "education", label: "Education" },
    ...(profile?.pedigree?.length ||
    profile?.careerSignals?.length ||
    profile?.network?.length ||
    profile?.recognition?.length
      ? ([{ id: "credentials", label: "Credentials" }] as const)
      : []),
    ...(profile?.linkedinActivity?.length
      ? ([{ id: "social", label: "Social Activity" }] as const)
      : []),
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
        className={`fixed top-0 right-0 z-50 h-full w-full bg-white transition-transform duration-300 ease-out sm:w-3/5 dark:bg-neutral-900 ${
          open ? "translate-x-0 shadow-2xl" : "translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="shrink-0 border-b border-gray-200 p-5 dark:border-neutral-700">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                {signal.useGenericAvatar ? (
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-gray-200 dark:bg-neutral-700">
                    <User className="h-8 w-8 text-gray-400 dark:text-neutral-400" />
                  </div>
                ) : (
                  <img
                    src={signal.photoUrl ?? personPhotoUrl(signal.id)}
                    alt={signal.avatarInitials}
                    className="h-16 w-16 shrink-0 rounded-full object-cover"
                  />
                )}
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
                        className="text-gray-600 hover:text-gray-900 dark:text-neutral-300 dark:hover:text-neutral-50"
                      >
                        <LinkedinIcon className="h-4 w-4" />
                      </a>
                    )}
                    {signal.githubUrl ? (
                      <a
                        href={signal.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="View GitHub"
                        className="text-gray-400 hover:text-gray-700 dark:text-neutral-500 dark:hover:text-neutral-200"
                      >
                        <GithubIcon className="h-4 w-4" />
                      </a>
                    ) : (
                      <GithubIcon className="h-4 w-4 text-gray-300 dark:text-neutral-700" />
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
                className="shrink-0 cursor-pointer rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <StatChip icon={Briefcase} label={yearsText ?? "Experience"} />
              {profile && <StatChip icon={Users} label={`${profile.connections} Connections`} />}
              {profile?.followers !== undefined && (
                <StatChip icon={Eye} label={`${profile.followers} Followers`} />
              )}
              <StatChip icon={MapPin} label={profile?.location ?? location} />
              {nexusTag && (
                <TagInfoCard tag={nexusTag}>
                  <span
                    className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${tagColorClasses(nexusTag.category)}`}
                  >
                    {(() => {
                      const Icon = tagIcon(nexusTag);
                      return Icon && <Icon className="h-3 w-3" />;
                    })()}
                    {nexusTag.label}
                  </span>
                </TagInfoCard>
              )}
            </div>
          </div>

          {/* Tabs */}
          <div className="flex shrink-0 gap-4 overflow-x-auto border-b border-gray-200 px-5 [scrollbar-width:none] dark:border-neutral-700 [&::-webkit-scrollbar]:hidden">
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

                {profile &&
                (profile.pedigree?.length ||
                  profile.careerSignals?.length ||
                  profile.network?.length ||
                  profile.recognition?.length) ? (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-neutral-50">
                      Signal Highlights
                    </h3>
                    <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
                      {profile.pedigree?.[0] && (
                        <HighlightCard
                          kind="pedigree"
                          categoryLabel="Pedigree"
                          icon={pedigreeIcon(profile.pedigree[0].category)}
                          label={profile.pedigree[0].label}
                          onClick={() => setTab("credentials")}
                        />
                      )}
                      {profile.careerSignals?.[0] && (
                        <HighlightCard
                          kind="career"
                          categoryLabel="Career Signal"
                          icon={careerSignalIcon(profile.careerSignals[0].kind)}
                          label={profile.careerSignals[0].label}
                          onClick={() => setTab("credentials")}
                        />
                      )}
                      {profile.network?.[0] && (
                        <HighlightCard
                          kind="network"
                          categoryLabel="Network"
                          icon={networkIcon(profile.network[0].kind)}
                          label={profile.network[0].label}
                          onClick={() => setTab("credentials")}
                        />
                      )}
                      {profile.recognition?.[0] && (
                        <HighlightCard
                          kind="recognition"
                          categoryLabel="Recognition"
                          icon={recognitionIcon(profile.recognition[0].kind)}
                          label={profile.recognition[0].label}
                          onClick={() => setTab("credentials")}
                        />
                      )}
                    </div>
                  </div>
                ) : null}

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
                    <StatTile label="Followers" value={profile.followers ?? "—"} />
                  </div>
                )}

                {profile &&
                (profile.lastAnalystConnection ||
                  profile.lastConnectedDate ||
                  profile.lastStatus) ? (
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
                          {profile.lastAnalystConnection ?? "—"}
                        </p>
                      </div>
                      <div className="rounded-xl border border-gray-200 bg-gray-50 p-3 dark:border-neutral-700 dark:bg-neutral-800">
                        <p className="text-[11px] font-semibold tracking-wide text-gray-400 uppercase dark:text-neutral-500">
                          Last connected
                        </p>
                        <p className="mt-1 text-sm font-medium text-gray-900 dark:text-neutral-50">
                          {profile.lastConnectedDate ?? "—"}
                        </p>
                      </div>
                      <div className="rounded-xl border border-gray-200 bg-gray-50 p-3 dark:border-neutral-700 dark:bg-neutral-800">
                        <p className="text-[11px] font-semibold tracking-wide text-gray-400 uppercase dark:text-neutral-500">
                          Last status
                        </p>
                        <p className="mt-1 text-sm font-medium text-gray-900 dark:text-neutral-50">
                          {profile.lastStatus ?? "—"}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  (signal.sourcedBy || signal.sourcedVia) && (
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-neutral-50">
                        Sourcing
                      </h3>
                      <p className="mt-1.5 text-sm text-gray-700 dark:text-neutral-300">
                        {signal.sourcedBy
                          ? `Sourced by ${signal.sourcedBy}`
                          : `Sourced via ${signal.sourcedVia}`}
                      </p>
                    </div>
                  )
                )}
              </div>
            )}

            {tab === "experience" && (
              <div className="flex flex-col gap-5">
                {profile
                  ? mainGroups.map((group, gi) => {
                      const totalMonths = group.positions.reduce((sum, p) => sum + p.months, 0);
                      // "$0" funding/valuation on a company card just means LinkedIn has nothing
                      // on file — showing it as a badge reads as "raised nothing", which is noise.
                      const visibleMeta = group.meta?.filter((m) => !m.trim().endsWith("$0"));

                      return (
                        <div
                          key={gi}
                          className="rounded-xl border border-gray-200 p-4 dark:border-neutral-700"
                        >
                          <div className="flex items-start gap-3">
                            <img
                              src={companyLogoUrl(group.company)}
                              alt=""
                              className="h-9 w-9 shrink-0 rounded-lg object-cover"
                            />
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center justify-between gap-2">
                                <h3 className="text-sm font-bold text-gray-900 dark:text-neutral-50">
                                  {group.company}
                                </h3>
                                {totalMonths > 0 && (
                                  <span className="shrink-0 text-xs font-medium text-gray-400 dark:text-neutral-500">
                                    {formatTenureLabel(totalMonths)}
                                  </span>
                                )}
                              </div>
                              {visibleMeta && visibleMeta.length > 0 && (
                                <div className="mt-1.5 flex flex-wrap gap-1.5">
                                  {visibleMeta.map((m) => (
                                    <span
                                      key={m}
                                      className="rounded-full border border-gray-200 px-2 py-0.5 text-[11px] text-gray-500 dark:border-neutral-700 dark:text-neutral-400"
                                    >
                                      {m}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="mt-3 flex flex-col gap-3 border-l-2 border-gray-100 pl-4 dark:border-neutral-800">
                            {group.positions.map((pos, pi) => (
                              <div key={pi} className="relative">
                                <span
                                  className={`absolute top-1.5 -left-[21px] h-2 w-2 rounded-full ${positionCategoryDotClasses(pos.category)}`}
                                />
                                <div className="flex items-start justify-between gap-3">
                                  <p className="text-sm font-semibold text-gray-900 dark:text-neutral-50">
                                    {pos.title}
                                  </p>
                                  <span className="shrink-0 text-xs whitespace-nowrap text-gray-400 dark:text-neutral-500">
                                    {pos.period}
                                  </span>
                                </div>
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
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })
                  : [...signal.current, ...signal.past].map((entry, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-3 rounded-xl border border-gray-200 p-3 dark:border-neutral-700"
                      >
                        <img
                          src={companyLogoUrl(entry.company)}
                          alt=""
                          className="h-9 w-9 shrink-0 rounded-lg object-cover"
                        />
                        <div className="min-w-0">
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
                  <div className="rounded-xl border border-gray-200 p-4 dark:border-neutral-700">
                    <button
                      type="button"
                      onClick={() => setShowEarlier((v) => !v)}
                      className="flex w-full cursor-pointer items-center justify-between gap-2 text-left"
                    >
                      <span className="text-sm font-bold text-gray-900 dark:text-neutral-50">
                        Earlier roles
                      </span>
                      <span className="flex shrink-0 items-center gap-1 text-xs font-medium text-blue-600 dark:text-blue-400">
                        {showEarlier ? "Show less" : `Show ${earlierGroup.positions.length}`}
                        <ChevronDown
                          className={`h-3.5 w-3.5 transition-transform ${showEarlier ? "rotate-180" : ""}`}
                        />
                      </span>
                    </button>
                    {showEarlier && (
                      <div className="mt-3 flex flex-col gap-3 border-l-2 border-gray-100 pl-4 dark:border-neutral-800">
                        {earlierGroup.positions.map((pos, pi) => (
                          <div key={pi} className="relative">
                            <span
                              className={`absolute top-1.5 -left-[21px] h-2 w-2 rounded-full ${positionCategoryDotClasses(pos.category)}`}
                            />
                            <div className="flex items-start justify-between gap-3">
                              <p className="text-sm font-medium text-gray-800 dark:text-neutral-200">
                                {pos.title}
                              </p>
                              <span className="shrink-0 text-xs whitespace-nowrap text-gray-400 dark:text-neutral-500">
                                {pos.period}
                              </span>
                            </div>
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
                {profile.behavioralSignals?.length ? (
                  <div>
                    <h3 className="mb-3 text-sm font-semibold text-gray-900 dark:text-neutral-50">
                      Signals to watch
                    </h3>
                    <div className="flex flex-col gap-3">
                      {profile.behavioralSignals.map((item, i) => {
                        const Icon = behavioralSignalIcon(item.kind);
                        return (
                          <div
                            key={i}
                            className="flex gap-3 rounded-xl border border-gray-200 bg-rose-50/60 p-3 dark:border-neutral-700 dark:bg-rose-500/5"
                          >
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-rose-100 dark:bg-rose-500/15">
                              <Icon className="h-4 w-4 text-rose-600 dark:text-rose-400" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-start justify-between gap-2">
                                <p className="text-sm font-semibold text-gray-900 dark:text-neutral-50">
                                  {item.label}
                                </p>
                                {item.date && (
                                  <span className="shrink-0 text-xs text-gray-400 dark:text-neutral-500">
                                    {item.date}
                                  </span>
                                )}
                              </div>
                              <p className="mt-0.5 text-sm text-gray-600 dark:text-neutral-300">
                                {item.detail}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : null}

                {profile.github && (
                  <div>
                    <h3 className="mb-3 text-sm font-semibold text-gray-900 dark:text-neutral-50">
                      GitHub activity
                    </h3>
                    <GithubActivityGraph github={profile.github} githubUrl={signal.githubUrl} />
                  </div>
                )}

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
                          {edu.period && (
                            <p className="mt-0.5 text-xs text-gray-400 dark:text-neutral-500">
                              {edu.period}
                            </p>
                          )}
                          {edu.detail && (
                            <p className="mt-1 text-xs text-gray-500 dark:text-neutral-400">
                              {edu.detail}
                            </p>
                          )}
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

            {tab === "credentials" && profile && (
              <div className="flex flex-col gap-6">
                {profile.pedigree?.length ? (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-neutral-50">
                      Pedigree
                    </h3>
                    <div className="mt-2 flex flex-col gap-3">
                      {profile.pedigree.map((item, i) => {
                        const Icon = pedigreeIcon(item.category);
                        return (
                          <div
                            key={i}
                            className="flex gap-3 rounded-xl border border-gray-200 p-3 dark:border-neutral-700"
                          >
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-50 dark:bg-amber-500/10">
                              <Icon className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-start justify-between gap-2">
                                <p className="text-sm font-semibold text-gray-900 dark:text-neutral-50">
                                  {item.label}
                                </p>
                                {item.year && (
                                  <span className="shrink-0 text-xs text-gray-400 dark:text-neutral-500">
                                    {item.year}
                                  </span>
                                )}
                              </div>
                              {item.detail && (
                                <p className="mt-0.5 text-sm text-gray-600 dark:text-neutral-300">
                                  {item.detail}
                                </p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : null}

                {profile.careerSignals?.length ? (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-neutral-50">
                      Career Signals
                    </h3>
                    <div className="mt-2 flex flex-col gap-3">
                      {profile.careerSignals.map((item, i) => {
                        const Icon = careerSignalIcon(item.kind);
                        return (
                          <div
                            key={i}
                            className="flex gap-3 rounded-xl border border-gray-200 p-3 dark:border-neutral-700"
                          >
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-50 dark:bg-blue-500/10">
                              <Icon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-semibold text-gray-900 dark:text-neutral-50">
                                {item.label}
                              </p>
                              <p className="mt-0.5 text-sm text-gray-600 dark:text-neutral-300">
                                {item.detail}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : null}

                {profile.network?.length ? (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-neutral-50">
                      Affiliations
                    </h3>
                    <div className="mt-2 flex flex-col gap-3">
                      {profile.network.map((item, i) => {
                        const Icon = networkIcon(item.kind);
                        return (
                          <div
                            key={i}
                            className="flex gap-3 rounded-xl border border-gray-200 p-3 dark:border-neutral-700"
                          >
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-teal-50 dark:bg-teal-500/10">
                              <Icon className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-semibold text-gray-900 dark:text-neutral-50">
                                {item.label}
                              </p>
                              {item.detail && (
                                <p className="mt-0.5 text-sm text-gray-600 dark:text-neutral-300">
                                  {item.detail}
                                </p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : null}

                {profile.recognition?.length ? (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-neutral-50">
                      Recognition & Media
                    </h3>
                    <div className="mt-2 flex flex-col gap-3">
                      {profile.recognition.map((item, i) => {
                        const Icon = recognitionIcon(item.kind);
                        return (
                          <div
                            key={i}
                            className="flex gap-3 rounded-xl border border-gray-200 p-3 dark:border-neutral-700"
                          >
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-violet-50 dark:bg-violet-500/10">
                              <Icon className="h-4 w-4 text-violet-600 dark:text-violet-400" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-start justify-between gap-2">
                                <p className="text-sm font-semibold text-gray-900 dark:text-neutral-50">
                                  {item.label}
                                </p>
                                {item.date && (
                                  <span className="shrink-0 text-xs text-gray-400 dark:text-neutral-500">
                                    {item.date}
                                  </span>
                                )}
                              </div>
                              {item.detail && (
                                <p className="mt-0.5 text-sm text-gray-600 dark:text-neutral-300">
                                  {item.detail}
                                </p>
                              )}
                              {item.url && (
                                <a
                                  href={item.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="mt-1.5 inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:underline dark:text-blue-400"
                                >
                                  View source
                                  <ExternalLink className="h-3 w-3" />
                                </a>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : null}
              </div>
            )}

            {tab === "social" && profile && (
              <div className="flex flex-col gap-3">
                {profile.linkedinActivity?.map((item, i) => {
                  const Icon = linkedinActivityIcon(item.kind);
                  return (
                    <div
                      key={i}
                      className="overflow-hidden rounded-xl border border-gray-200 dark:border-neutral-700"
                    >
                      <div className="flex items-center gap-2.5 p-3 pb-2">
                        {signal.useGenericAvatar ? (
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-200 dark:bg-neutral-700">
                            <User className="h-4.5 w-4.5 text-gray-400 dark:text-neutral-400" />
                          </div>
                        ) : (
                          <img
                            src={signal.photoUrl ?? personPhotoUrl(signal.id)}
                            alt={signal.avatarInitials}
                            className="h-9 w-9 shrink-0 rounded-full object-cover"
                          />
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-gray-900 dark:text-neutral-50">
                            {name}
                          </p>
                          <p
                            className={`flex items-center gap-1 text-xs font-medium ${linkedinActivityTextClasses[item.kind]}`}
                          >
                            <Icon className="h-3 w-3" />
                            {linkedinActivityLabel[item.kind]}
                            {item.reaction ? ` · ${item.reaction}` : ""}
                            <span className="text-gray-300 dark:text-neutral-600">·</span>
                            <span className="font-normal text-gray-400 dark:text-neutral-500">
                              {item.date}
                            </span>
                          </p>
                        </div>
                      </div>
                      <div className="px-3 pb-3">
                        <p className="text-sm leading-relaxed text-gray-700 dark:text-neutral-300">
                          {item.preview}
                        </p>
                      </div>
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-1.5 border-t border-gray-100 py-2 text-xs font-semibold text-blue-600 hover:bg-gray-50 dark:border-neutral-800 dark:text-blue-400 dark:hover:bg-neutral-800/60"
                      >
                        View on LinkedIn
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  );
                })}
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
