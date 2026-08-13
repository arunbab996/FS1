import { useState, type FormEvent, type ReactNode } from "react";

const SITE_PASSWORD = "SCOUT996";
const STORAGE_KEY = "fs_unlocked";

export function PasswordGate({ children }: { children: ReactNode }) {
  const [unlocked, setUnlocked] = useState(() => localStorage.getItem(STORAGE_KEY) === "true");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);

  if (unlocked) return <>{children}</>;

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (password === SITE_PASSWORD) {
      localStorage.setItem(STORAGE_KEY, "true");
      setUnlocked(true);
    } else {
      setError(true);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-sm rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
        <img src="/firstsignal-logo.png" alt="FirstSignal" className="h-7" />
        <h1 className="mt-6 text-lg font-semibold text-gray-900">This site is password protected</h1>
        <p className="mt-1 text-sm text-gray-500">Enter the password to continue.</p>
        <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-3">
          <input
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError(false);
            }}
            autoFocus
            placeholder="Password"
            className={`w-full rounded-lg border px-3 py-2 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-1 focus:outline-none ${
              error
                ? "border-red-300 focus:border-red-400 focus:ring-red-400"
                : "border-gray-200 focus:border-blue-400 focus:ring-blue-400"
            }`}
          />
          {error && <p className="text-sm text-red-500">Incorrect password. Try again.</p>}
          <button
            type="submit"
            className="cursor-pointer rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
          >
            Continue
          </button>
        </form>
      </div>
    </div>
  );
}
