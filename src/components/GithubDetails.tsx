import { GitFork, Star } from "lucide-react";
import type { ReactNode } from "react";
import type { GithubBasics, GithubRepoQuality, GithubStats } from "../types";
import { formatCompact, formatRelative, languageColor, safeHref } from "../utils/github";

function Section({ title, note, children }: { title: string; note?: string; children: ReactNode }) {
  return (
    <div>
      <div className="flex flex-wrap items-baseline justify-between gap-x-3">
        <p className="text-[11px] font-semibold tracking-wide text-gray-400 uppercase dark:text-neutral-500">
          {title}
        </p>
        {note && <p className="text-[11px] text-gray-400 dark:text-neutral-500">{note}</p>}
      </div>
      <div className="mt-1.5">{children}</div>
    </div>
  );
}

function Chip({ children }: { children: ReactNode }) {
  return (
    <span className="rounded-full border border-gray-200 bg-white px-2 py-0.5 text-[11px] text-gray-600 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300">
      {children}
    </span>
  );
}

/** Only what's there: nothing is shown for a marker we couldn't see. */
function QualityChips({ quality }: { quality: GithubRepoQuality }) {
  const chips: string[] = [];
  if (quality.tests) chips.push("Tests");
  if (quality.ci) chips.push("CI");
  if (quality.license) chips.push(quality.license);
  if (quality.readme) chips.push("README");
  if (quality.releases > 0) chips.push(`${quality.releases} release${quality.releases === 1 ? "" : "s"}`);
  if (chips.length === 0) return null;
  return (
    <div className="mt-1.5 flex flex-wrap gap-1.5">
      {chips.map((chip) => (
        <Chip key={chip}>{chip}</Chip>
      ))}
    </div>
  );
}

const PROVIDER_NAMES: Record<string, string> = {
  LINKEDIN: "LinkedIn",
  TWITTER: "X",
  MASTODON: "Mastodon",
  YOUTUBE: "YouTube",
  GENERIC: "Link",
  FACEBOOK: "Facebook",
  INSTAGRAM: "Instagram",
  TWITCH: "Twitch",
  REDDIT: "Reddit",
  HOMETOWN: "Hometown",
  NPM: "npm",
  BLUESKY: "Bluesky",
};

function providerName(provider: string): string {
  return PROVIDER_NAMES[provider] ?? provider.charAt(0) + provider.slice(1).toLowerCase();
}

function ExternalText({ href, children }: { href: string | undefined; children: ReactNode }) {
  const safe = safeHref(href);
  return safe ? (
    <a href={safe} target="_blank" rel="noreferrer noopener" className="text-blue-600 hover:underline dark:text-blue-400">
      {children}
    </a>
  ) : (
    <span>{children}</span>
  );
}

function ProfileRows({ basics }: { basics: GithubBasics }) {
  const rows: { label: string; value: ReactNode }[] = [];
  if (basics.bio) rows.push({ label: "Bio", value: basics.bio });
  if (basics.company) rows.push({ label: "Company", value: basics.company });
  if (basics.location) rows.push({ label: "Location", value: basics.location });
  if (basics.websiteUrl) {
    rows.push({ label: "Website", value: <ExternalText href={basics.websiteUrl}>{basics.websiteUrl}</ExternalText> });
  }
  const socials = [
    ...(basics.twitterUsername
      ? [{ provider: "TWITTER", url: `https://x.com/${encodeURIComponent(basics.twitterUsername)}` }]
      : []),
    ...basics.socialAccounts.filter((s) => s.provider !== "TWITTER" || !basics.twitterUsername),
  ];
  if (socials.length) {
    rows.push({
      label: "Social",
      value: (
        <span className="flex flex-wrap gap-x-3">
          {socials.map((s) => (
            <ExternalText key={`${s.provider}${s.url}`} href={s.url}>
              {providerName(s.provider)}
            </ExternalText>
          ))}
        </span>
      ),
    });
  }
  rows.push({
    label: "Account",
    value: `Joined ${new Date(basics.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric", timeZone: "UTC" })} · following ${basics.following.toLocaleString()}`,
  });
  if (basics.orgs.length) {
    rows.push({ label: "Orgs", value: basics.orgs.map((o) => o.name ?? o.login).join(", ") });
  }
  if (basics.pinned.length) {
    rows.push({ label: "Pinned", value: basics.pinned.map((p) => p.name.split("/").pop()).join(", ") });
  }

  return (
    <dl className="grid grid-cols-[4.5rem_1fr] gap-x-3 gap-y-1 text-xs">
      {rows.map((row) => (
        <div key={row.label} className="contents">
          <dt className="text-gray-400 dark:text-neutral-500">{row.label}</dt>
          <dd className="min-w-0 break-words text-gray-700 dark:text-neutral-300">{row.value}</dd>
        </div>
      ))}
    </dl>
  );
}

/** The long tail: everything the default view leaves out. Each block hides when it has no data. */
export function GithubDetails({ github }: { github: GithubStats }) {
  const { mergedExternal, topRepos, stack, themes, basics } = github;

  const mergedNote = mergedExternal
    ? [
        `${mergedExternal.total.toLocaleString()} merged across ${mergedExternal.distinctRepos}${mergedExternal.sampled ? "+" : ""} repos`,
        mergedExternal.fromMemberOrgs > 0 ? `${mergedExternal.fromMemberOrgs} into orgs they belong to` : "",
      ]
        .filter(Boolean)
        .join(" · ")
    : undefined;

  return (
    <div className="mt-3 flex flex-col gap-4">
      {mergedExternal && mergedExternal.top.length > 0 && (
        <Section title="Merged into others' repos" {...(mergedNote ? { note: mergedNote } : {})}>
          <div className="flex flex-col gap-1">
            {mergedExternal.top.slice(0, 8).map((pr) => (
              <div key={`${pr.repo}${pr.url}${pr.title}`} className="flex items-baseline gap-2 text-xs">
                <span className="shrink-0 font-medium text-gray-800 dark:text-neutral-200">{pr.repo}</span>
                <span className="shrink-0 text-gray-400 dark:text-neutral-500">★ {formatCompact(pr.repoStars)}</span>
                <span className="min-w-0 flex-1 truncate text-gray-500 dark:text-neutral-400" title={pr.title}>
                  {pr.title}
                </span>
                {pr.viaMemberOrg && <Chip>their org</Chip>}
                <span className="shrink-0 text-gray-400 dark:text-neutral-500">{formatRelative(pr.mergedAt)}</span>
              </div>
            ))}
          </div>
        </Section>
      )}

      {topRepos.length > 0 && (
        <Section title="Top original repos">
          <div className="flex flex-col gap-2">
            {topRepos.map((repo) => (
              <div key={repo.name} className="rounded-lg bg-gray-50 p-2.5 dark:bg-neutral-800/60">
                <div className="flex items-center justify-between gap-3">
                  <a
                    href={safeHref(repo.url)}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="min-w-0 truncate text-sm font-medium text-blue-600 hover:underline dark:text-blue-400"
                  >
                    {repo.name}
                  </a>
                  <span className="flex shrink-0 items-center gap-3 text-xs text-gray-500 dark:text-neutral-400">
                    {repo.language && (
                      <span className="flex items-center gap-1">
                        <span
                          className="h-2 w-2 rounded-full"
                          style={{ backgroundColor: languageColor(repo.language) }}
                        />
                        {repo.language}
                      </span>
                    )}
                    <span className="flex items-center gap-0.5">
                      <Star className="h-3 w-3" />
                      {formatCompact(repo.stars)}
                    </span>
                    <span className="flex items-center gap-0.5">
                      <GitFork className="h-3 w-3" />
                      {formatCompact(repo.forks)}
                    </span>
                    {repo.pushedAt && (
                      <span className="text-gray-400 dark:text-neutral-500">pushed {formatRelative(repo.pushedAt)}</span>
                    )}
                  </span>
                </div>
                {repo.description && (
                  <p className="mt-0.5 truncate text-xs text-gray-400 dark:text-neutral-500">{repo.description}</p>
                )}
                {repo.quality && <QualityChips quality={repo.quality} />}
              </div>
            ))}
          </div>
        </Section>
      )}

      {(stack.length > 0 || themes.length > 0) && (
        <Section title="Stack and topics">
          <div className="flex flex-wrap gap-1.5">
            {stack.map((item) => (
              <Chip key={`stack-${item}`}>{item}</Chip>
            ))}
            {themes.map((theme) => (
              <span
                key={`theme-${theme}`}
                className="rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-medium text-blue-700 dark:bg-blue-500/15 dark:text-blue-400"
              >
                {theme}
              </span>
            ))}
          </div>
        </Section>
      )}

      <Section title="Profile">
        <ProfileRows basics={basics} />
      </Section>
    </div>
  );
}
