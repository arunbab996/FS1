import { Bell, Camera, Check, ChevronDown, Info, Mail, MessageSquare, Pencil, Sparkles, UserRound } from "lucide-react";
import { useEffect, useRef, useState, type ChangeEvent, type ReactNode } from "react";
import { initials, sourcerColor } from "../utils/analystAvatar";
import {
  CURRENT_USER_EMAIL,
  CURRENT_USER_NAME,
  getCurrentUserAvatarOverride,
  setCurrentUserAvatarOverride,
  useCurrentUserAvatarUrl,
} from "../utils/currentUser";
import { HoverPopup } from "./HoverPopup";

const MAX_AVATAR_DIMENSION = 256;
const AVATAR_JPEG_QUALITY = 0.86;
const SAVED_FLASH_MS = 2200;

/** Downscales/re-encodes an uploaded photo before it goes into localStorage, so a 12MP phone photo doesn't blow the quota. */
function toResizedDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error);
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("Could not read that image."));
      img.onload = () => {
        const scale = Math.min(1, MAX_AVATAR_DIMENSION / Math.max(img.width, img.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Could not process that image."));
          return;
        }
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", AVATAR_JPEG_QUALITY));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

/**
 * Until someone uploads a real photo, their avatar is their own initials on their own color,
 * the same deterministic sourcerColor() every analyst already gets in Reports, rather than a
 * stock photo of a stranger, which is what personPhotoUrl's placeholder actually is.
 */
function ProfileAvatar({ hasCustomPhoto, avatarUrl }: { hasCustomPhoto: boolean; avatarUrl: string }) {
  if (hasCustomPhoto) {
    return (
      <img
        src={avatarUrl}
        alt={CURRENT_USER_NAME}
        className="h-16 w-16 rounded-full object-cover ring-1 ring-black/5 dark:ring-white/10"
      />
    );
  }
  return (
    <div
      className={`flex h-16 w-16 items-center justify-center rounded-full text-lg font-semibold text-white ${sourcerColor(CURRENT_USER_NAME)}`}
    >
      {initials(CURRENT_USER_NAME)}
    </div>
  );
}

function AccountHeader() {
  const [avatarUrl, setAvatarOverride] = useCurrentUserAvatarUrl();
  const [hasCustomPhoto, setHasCustomPhoto] = useState(() => getCurrentUserAvatarOverride() !== null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [justSaved, setJustSaved] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const savedTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => () => clearTimeout(savedTimer.current), []);

  function flashSaved() {
    clearTimeout(savedTimer.current);
    setJustSaved(true);
    savedTimer.current = setTimeout(() => setJustSaved(false), SAVED_FLASH_MS);
  }

  async function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-selecting the same file later
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file (JPG or PNG).");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("That image is over 5MB. Try a smaller one.");
      return;
    }

    setBusy(true);
    setError(null);
    try {
      const dataUrl = await toResizedDataUrl(file);
      setAvatarOverride(dataUrl);
      setHasCustomPhoto(true);
      flashSaved();
    } catch {
      setError("Something went wrong reading that image. Try again.");
    } finally {
      setBusy(false);
    }
  }

  function handleRemove() {
    setCurrentUserAvatarOverride(null);
    setHasCustomPhoto(false);
    setError(null);
    flashSaved();
  }

  return (
    <div className="flex items-center gap-5">
      <div className="group relative shrink-0">
        <ProfileAvatar hasCustomPhoto={hasCustomPhoto} avatarUrl={avatarUrl} />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={busy}
          aria-label="Change profile photo"
          className="absolute right-0 bottom-0 flex h-6 w-6 cursor-pointer items-center justify-center rounded-full border-2 border-white bg-gray-900 text-white shadow-sm transition-all hover:scale-105 hover:bg-gray-700 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-wait dark:border-neutral-900 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-white"
        >
          <Camera className="h-3 w-3" />
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      <div>
        <h1 className="text-base font-semibold tracking-tight text-gray-900 dark:text-neutral-50">
          {CURRENT_USER_NAME}
        </h1>
        <p className="mt-0.5 flex items-center gap-1.5 text-sm text-gray-500 dark:text-neutral-400">
          <Mail className="h-3.5 w-3.5 shrink-0" />
          {CURRENT_USER_EMAIL}
        </p>
        <div className="mt-1.5 flex items-center gap-3">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={busy}
            className="cursor-pointer rounded-md text-sm font-medium text-blue-600 transition-colors hover:text-blue-700 focus-visible:ring-2 focus-visible:ring-blue-500/40 focus-visible:outline-none disabled:cursor-wait disabled:opacity-60 dark:text-blue-400 dark:hover:text-blue-300"
          >
            {busy ? "Uploading..." : hasCustomPhoto ? "Change photo" : "Upload photo"}
          </button>
          {hasCustomPhoto && (
            <button
              type="button"
              onClick={handleRemove}
              className="cursor-pointer rounded-md text-sm font-medium text-gray-400 transition-colors hover:text-gray-600 focus-visible:ring-2 focus-visible:ring-blue-500/40 focus-visible:outline-none dark:text-neutral-500 dark:hover:text-neutral-300"
            >
              Remove
            </button>
          )}
          <span
            className={`flex items-center gap-1 text-sm font-medium text-emerald-600 transition-opacity duration-300 dark:text-emerald-400 ${
              justSaved ? "opacity-100" : "opacity-0"
            }`}
          >
            <Check className="h-3.5 w-3.5" />
            Saved
          </span>
        </div>
        {error && <p className="mt-1 text-xs font-medium text-red-500">{error}</p>}
      </div>
    </div>
  );
}

function Section({
  icon: Icon,
  label,
  description,
  info,
  action,
  children,
}: {
  icon: typeof Bell;
  label: string;
  /** One-line summary, shown under the title next to the icon tile. */
  description?: string;
  /** Optional longer explainer, tucked behind an info icon instead of sitting in the card as body copy. */
  info?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
      <div className="flex items-start gap-3">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-500/10">
          <Icon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
        </span>
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <p className="text-sm font-semibold text-gray-900 dark:text-neutral-50">{label}</p>
            {info && (
              <HoverPopup
                width={220}
                trigger={
                  <Info className="h-3.5 w-3.5 cursor-pointer text-gray-400 hover:text-gray-600 dark:text-neutral-500 dark:hover:text-neutral-300" />
                }
                content={info}
              />
            )}
          </div>
          {description && (
            <p className="mt-0.5 text-xs text-gray-500 dark:text-neutral-400">{description}</p>
          )}
        </div>
      </div>
      {/* Its own row, not squeezed onto the header line, so a long title never gets crushed into
          three lines by a button competing for the same space. */}
      {action && <div className="mt-3 flex justify-end">{action}</div>}
      {children}
    </section>
  );
}

function NotificationRow({
  icon: Icon,
  label,
  description,
  checked,
  onChange,
}: {
  icon: typeof Mail;
  label: string;
  description: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <div className="-mx-2.5 flex items-center gap-3 rounded-lg px-2.5 py-2 transition-colors hover:bg-gray-50 dark:hover:bg-neutral-900/60">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gray-50 text-gray-400 dark:bg-neutral-800 dark:text-neutral-500">
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-gray-800 dark:text-neutral-100">{label}</p>
        <p className="text-xs text-gray-400 dark:text-neutral-500">{description}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={onChange}
        className={`flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full px-0.5 transition-colors focus-visible:ring-2 focus-visible:ring-blue-500/40 focus-visible:outline-none ${
          checked ? "bg-blue-600 dark:bg-blue-500" : "bg-gray-200 dark:bg-neutral-700"
        }`}
      >
        <span
          className={`h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${
            checked ? "translate-x-4" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );
}

const INVESTMENT_CATEGORIES = ["Fintech", "SaaS", "Healthtech", "Climate", "Consumer", "Deep Tech", "Web3"];
const FIELD_LABEL = "text-sm font-medium text-gray-800 dark:text-neutral-100";
const FIELD_INPUT =
  "w-full rounded-lg border border-gray-200 bg-white text-sm text-gray-800 placeholder:text-gray-400 transition-shadow focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10 focus:outline-none disabled:bg-gray-50 disabled:text-gray-500 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:disabled:bg-neutral-900/50 dark:disabled:text-neutral-400";

function SignalAutoAssignSection() {
  const [editing, setEditing] = useState(false);
  const [prompt, setPrompt] = useState(
    "I'm looking for signals from India and Singapore where the product is live, but no funding has been raised yet. Founders should be from the APAC region.",
  );
  const [categories, setCategories] = useState<string[]>(["SaaS", "Fintech"]);
  const [categoryMenuOpen, setCategoryMenuOpen] = useState(false);
  const [justSaved, setJustSaved] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const savedTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => () => clearTimeout(savedTimer.current), []);

  function toggleCategory(category: string) {
    setCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category],
    );
  }

  function handleActionClick() {
    if (!editing) {
      setEditing(true);
      setValidationError(null);
      return;
    }
    // Saving: this is what actually changes which signals get routed to the analyst going
    // forward, so it's worth a beat of validation and explicit confirmation, not a silent "Done".
    if (!prompt.trim()) {
      setValidationError("Add a prompt so we know what to send you.");
      return;
    }
    if (categories.length === 0) {
      setValidationError("Pick at least one investment category.");
      return;
    }
    setValidationError(null);
    setEditing(false);
    setCategoryMenuOpen(false);
    clearTimeout(savedTimer.current);
    setJustSaved(true);
    savedTimer.current = setTimeout(() => setJustSaved(false), SAVED_FLASH_MS);
  }

  return (
    <Section
      icon={Sparkles}
      label="Signal auto-assign preference"
      description="What signals get routed to you automatically."
      info="Tell us what you're looking for and hit save. New signals that match get routed to you automatically."
    >
      <div className="mt-3">
        <div className="flex items-center justify-between gap-3">
          <label className={FIELD_LABEL}>
            Type of signal you'd like to be assigned <span className="text-red-500">*</span>
          </label>
          <div className="flex shrink-0 items-center gap-2">
            <span
              className={`flex items-center gap-1 text-sm font-medium text-emerald-600 transition-opacity duration-300 dark:text-emerald-400 ${
                justSaved ? "opacity-100" : "opacity-0"
              }`}
            >
              <Check className="h-3.5 w-3.5" />
              Saved
            </span>
            <button
              type="button"
              onClick={handleActionClick}
              className="flex cursor-pointer items-center gap-1 rounded-md px-2 py-1 text-sm font-medium text-blue-600 transition-colors hover:bg-blue-50 hover:text-blue-700 focus-visible:ring-2 focus-visible:ring-blue-500/40 focus-visible:outline-none dark:text-blue-400 dark:hover:bg-blue-500/10 dark:hover:text-blue-300"
            >
              <Pencil className="h-3.5 w-3.5" />
              {editing ? "Save" : "Edit"}
            </button>
          </div>
        </div>
        <p className="mt-0.5 text-xs text-gray-400 dark:text-neutral-500">
          Write a prompt that closely matches your investment thesis.
        </p>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          disabled={!editing}
          rows={2}
          className={`mt-1.5 resize-none p-2.5 ${FIELD_INPUT}`}
        />
      </div>

      <div className="relative mt-3">
        <label className={FIELD_LABEL}>
          Investment categories <span className="text-red-500">*</span>
        </label>
        <button
          type="button"
          disabled={!editing}
          onClick={() => setCategoryMenuOpen((v) => !v)}
          className={`mt-1.5 flex cursor-pointer items-center justify-between px-3 py-2 text-left disabled:cursor-default ${FIELD_INPUT}`}
        >
          <span className="flex flex-wrap gap-1.5">
            {categories.length > 0 ? (
              categories.map((c) => (
                <span
                  key={c}
                  className="flex items-center gap-1 rounded-full bg-blue-50 py-0.5 pr-2 pl-1.5 text-xs font-medium text-blue-700 dark:bg-blue-500/15 dark:text-blue-400"
                >
                  <span className="h-1 w-1 rounded-full bg-blue-500 dark:bg-blue-400" />
                  {c}
                </span>
              ))
            ) : (
              <span className="text-gray-400 dark:text-neutral-500">Select investment categories...</span>
            )}
          </span>
          <ChevronDown className="h-4 w-4 shrink-0 text-gray-400" />
        </button>

        {editing && categoryMenuOpen && (
          <div className="absolute z-10 mt-1 w-full rounded-lg border border-gray-200 bg-white p-1.5 shadow-lg dark:border-neutral-700 dark:bg-neutral-800">
            {INVESTMENT_CATEGORIES.map((c) => (
              <label
                key={c}
                className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm text-gray-700 hover:bg-gray-50 dark:text-neutral-200 dark:hover:bg-neutral-700"
              >
                <input
                  type="checkbox"
                  checked={categories.includes(c)}
                  onChange={() => toggleCategory(c)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-neutral-600"
                />
                {c}
              </label>
            ))}
          </div>
        )}
      </div>

      {validationError && <p className="mt-3 text-xs font-medium text-red-500">{validationError}</p>}
    </Section>
  );
}

export function ProfileSettings() {
  const [emailNotif, setEmailNotif] = useState(true);
  const [slackNotif, setSlackNotif] = useState(true);

  return (
    <div className="flex-1 overflow-y-auto px-8 py-4">
      <div className="mx-auto flex max-w-xl flex-col gap-2.5">
        <div className="mb-2">
          <h1 className="text-lg font-semibold text-gray-900 dark:text-neutral-50">Profile &amp; settings</h1>
          <p className="mt-0.5 text-sm text-gray-500 dark:text-neutral-400">
            Manage your account and preferences.
          </p>
        </div>

        <Section icon={UserRound} label="Profile" description="Your name, email, and photo.">
          <div className="mt-3">
            <AccountHeader />
          </div>
        </Section>

        <Section icon={Bell} label="Notifications" description="Choose how you hear about new signals.">
          <div className="mt-1 flex flex-col divide-y divide-gray-100 dark:divide-neutral-800">
            <NotificationRow
              icon={Mail}
              label="Email notification"
              description="Digest of new signals and mentions, sent to your inbox."
              checked={emailNotif}
              onChange={() => setEmailNotif((v) => !v)}
            />
            <NotificationRow
              icon={MessageSquare}
              label="Slack notification"
              description="Real-time pings in your connected Slack workspace."
              checked={slackNotif}
              onChange={() => setSlackNotif((v) => !v)}
            />
          </div>
        </Section>

        <SignalAutoAssignSection />
      </div>
    </div>
  );
}
