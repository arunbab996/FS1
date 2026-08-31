import { useEffect, useState } from "react";
import { personPhotoUrl } from "./avatars";

/** The signed-in analyst using this app (mock single-user session). */
export const CURRENT_USER_NAME = "Arun Baburaj";
/** Mock email for the signed-in analyst — there's no real auth/backend in this demo. */
export const CURRENT_USER_EMAIL = "arun.baburaj@january.capital";
/** Seed for this user's default placeholder avatar photo, via personPhotoUrl. */
export const CURRENT_USER_AVATAR_SEED = "peter-gregory";

const AVATAR_STORAGE_KEY = "fs_current_user_avatar";
// No backend in this demo, so an uploaded avatar just lives in localStorage. Components that
// render it live (Sidebar, the Profile page) need to react when it changes; localStorage's own
// "storage" event only fires in *other* tabs, so this event target fans the change out in-tab.
const avatarEvents = new EventTarget();

/** The photo the user uploaded for themselves, if any — read synchronously, no re-render wiring. */
export function getCurrentUserAvatarOverride(): string | null {
  return localStorage.getItem(AVATAR_STORAGE_KEY);
}

export function setCurrentUserAvatarOverride(dataUrl: string | null): void {
  if (dataUrl) localStorage.setItem(AVATAR_STORAGE_KEY, dataUrl);
  else localStorage.removeItem(AVATAR_STORAGE_KEY);
  avatarEvents.dispatchEvent(new Event("change"));
}

/** Resolves any person's avatar, honoring the current user's uploaded override if it's them. */
export function avatarUrlFor(name: string): string {
  if (name === CURRENT_USER_NAME) {
    return getCurrentUserAvatarOverride() ?? personPhotoUrl(CURRENT_USER_AVATAR_SEED);
  }
  return personPhotoUrl(name);
}

/**
 * The current user's own avatar URL, live-updating wherever it's rendered — e.g. right after they
 * upload a new photo on the Profile page, the Sidebar picks it up without a refresh.
 */
export function useCurrentUserAvatarUrl(): [string, (dataUrl: string | null) => void] {
  const [override, setOverride] = useState(getCurrentUserAvatarOverride);

  useEffect(() => {
    function handleChange() {
      setOverride(getCurrentUserAvatarOverride());
    }
    avatarEvents.addEventListener("change", handleChange);
    return () => avatarEvents.removeEventListener("change", handleChange);
  }, []);

  return [override ?? personPhotoUrl(CURRENT_USER_AVATAR_SEED), setCurrentUserAvatarOverride];
}
