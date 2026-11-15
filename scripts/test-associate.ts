/**
 * Checks the AI Associate's tools layer end to end, without the UI:
 *   npm run test:associate
 */
import assert from "node:assert/strict";
import { understandQuery } from "../src/associate/agent/understand";
import { SUGGESTED_PROMPTS } from "../src/associate/agent/prompts";
import { getPeople, getPerson, resetDb } from "../src/associate/db/store";
import {
  create_saved_search,
  get_briefing,
  mark_triaged,
  pending_matches,
  release_new_signals,
  run_saved_search,
  search_people,
} from "../src/associate/tools";
import { passesFilters } from "../src/associate/search/search";

resetDb();
let failures = 0;
function check(name: string, fn: () => void) {
  try {
    fn();
    console.log(`  ✓ ${name}`);
  } catch (e) {
    failures++;
    console.log(`  ✗ ${name}\n    ${(e as Error).message}`);
  }
}

console.log(`Seed database: ${getPeople().length} people visible`);

console.log("\nPlain-English search returns relevant cards with reasons");
for (const prompt of SUGGESTED_PROMPTS) {
  check(prompt, () => {
    const { filters, freeText } = understandQuery(prompt);
    const result = search_people({ query: freeText || prompt, filters });
    assert.ok(result.total >= 3, `only ${result.total} results for filters ${JSON.stringify(filters)}`);
    for (const hit of result.hits) {
      const p = getPerson(hit.personId)!;
      assert.ok(passesFilters(p, filters), `${p.name} doesn't pass the filters`);
      assert.ok(hit.reasons.length > 0, `${p.name} has no match reasons`);
    }
    console.log(`      ${result.total} matches · top: ${getPerson(result.hits[0].personId)!.name} — ${result.hits[0].reasons[0]}`);
  });
}

console.log("\nSaved search as a weekly job, run twice");
const prompt = SUGGESTED_PROMPTS[0];
const { filters, freeText } = understandQuery(prompt);
const job = create_saved_search({ name: "Ex-Grab AI infra stealth", query: freeText || prompt, filters, schedule: { kind: "weekly", weekday: 1, hour: 8 } });
check("job is created with a next run", () => assert.ok(new Date(job.nextRunAt) > new Date()));
const first = run_saved_search({ search_id: job.id });
const second = run_saved_search({ search_id: job.id });
check("first run returns matches", () => assert.ok("new_ids" in first && first.new_ids.length > 0));
check("second run returns no repeats", () => assert.ok("new_ids" in second && second.new_ids.length === 0, JSON.stringify(second)));
release_new_signals();
const third = run_saved_search({ search_id: job.id });
check("after new signals arrive, only the new people show", () => {
  assert.ok("new_ids" in third && third.new_ids.length > 0, "no new matches after release");
  const firstIds = new Set("new_ids" in first ? first.new_ids : []);
  assert.ok(third.new_ids.every((id) => !firstIds.has(id)), "a repeat slipped through");
  console.log(`      run 1: ${"new_ids" in first ? first.new_ids.length : 0} new · run 2: 0 new · run 3: ${third.new_ids.length} new`);
});

console.log("\nTriage and the morning briefing");
const pendingBefore = pending_matches(job.id);
mark_triaged({ person_id: pendingBefore[0], status: "dismissed" });
check("a triaged person drops out of the queue", () => assert.equal(pending_matches(job.id).length, pendingBefore.length - 1));
const fourth = run_saved_search({ search_id: job.id });
check("a triaged person never comes back on later runs", () => assert.ok("new_ids" in fourth && !fourth.new_ids.includes(pendingBefore[0])));
const job2 = create_saved_search({ name: "India technical founders", query: SUGGESTED_PROMPTS[3], filters: understandQuery(SUGGESTED_PROMPTS[3]).filters, schedule: { kind: "daily", hour: 8 } });
run_saved_search({ search_id: job2.id });
check("briefing groups net-new matches across every saved search", () => {
  const briefing = get_briefing();
  assert.equal(briefing.length, 2);
  console.log(`      ${briefing.map((g) => `${g.search.name}: ${g.personIds.length}`).join(" · ")}`);
});

resetDb();
console.log(failures ? `\n${failures} check(s) failed` : "\nAll checks passed");
process.exit(failures ? 1 : 0);
