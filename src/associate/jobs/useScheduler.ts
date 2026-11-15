import { useEffect } from "react";
import { run_due_searches, type RunResult } from "../tools";

/**
 * The jobs layer's clock. The prototype has no server, so scheduled searches run from the browser:
 * once when the app opens (catching up on anything that came due while it was closed) and then
 * every minute while it stays open. A hosted version would run `run_due_searches` from a cron job.
 */
export function useScheduler(enabled: boolean, onRun?: (results: RunResult[]) => void) {
  useEffect(() => {
    if (!enabled) return;
    const tick = () => {
      const results = run_due_searches();
      if (results.length) onRun?.(results);
    };
    tick();
    const timer = setInterval(tick, 60_000);
    return () => clearInterval(timer);
  }, [enabled, onRun]);
}
