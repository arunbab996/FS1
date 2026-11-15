import type { Person } from "../types";

/**
 * A small local vector store. Each profile and query becomes a sparse TF-IDF vector over words
 * plus "concept" terms, so related wording lands near each other (e.g. "inference" and "GPU"
 * both add the ai-infra concept). Ranking is cosine similarity.
 *
 * It stands in for neural embeddings in this no-API prototype; the interface (embed, then rank by
 * similarity) is what a hosted embedding model would plug into later.
 */

const STOPWORDS = new Set(
  "a an and are as at be by for from has have in into is it of on or that the their them they this to was were who with what which building build builds working work works people person someone founders founder ex last past months month weeks week days day recently new show find me look looking anyone".split(
    " ",
  ),
);

/** Phrases that share a concept, so a query and profile can match without identical words. */
const CONCEPTS: Record<string, string[]> = {
  ai_infra: ["ai infra", "inference", "llm", "llms", "gpu", "gpus", "model serving", "mlops", "fine-tuned", "open-weight", "training jobs", "evaluation"],
  devtools: ["developer tools", "devtools", "dev tools", "testing platform", "code review", "developer portal", "developer portals", "integration tests"],
  fintech: ["fintech", "payments", "payouts", "lending", "treasury", "neobank", "qr-first"],
  commerce: ["commerce", "ecommerce", "e-commerce", "marketplace", "marketplaces", "sellers", "stores", "live-commerce"],
  logistics: ["logistics", "last-mile", "freight", "fleet", "fleets", "trucking", "route planning", "delivery"],
  health: ["healthtech", "health", "clinic", "clinics", "patients", "chronic-disease", "medtech"],
  climate: ["climate", "carbon", "ev", "energy", "sustainability"],
  data: ["data infra", "data pipeline", "feature stores", "analytics", "data engineers"],
  stealth: ["stealth"],
  founder: ["founder", "co-founder", "founded", "incorporated"],
};

function normalise(text: string): string {
  return text.toLowerCase().replace(/[“”"()·,.:;!?]/g, " ");
}

export function tokenize(text: string): string[] {
  const lower = normalise(text);
  const words = lower
    .split(/\s+/)
    .map((w) => w.replace(/^-+|-+$/g, ""))
    .filter((w) => w.length > 1 && !STOPWORDS.has(w));
  const concepts: string[] = [];
  for (const [concept, phrases] of Object.entries(CONCEPTS)) {
    if (phrases.some((phrase) => new RegExp(`(^|\\s)${phrase.replace(/[-]/g, "\\-")}(\\s|$)`).test(` ${lower} `))) {
      // Concepts count double: they carry meaning shared across different wordings.
      concepts.push(`#${concept}`, `#${concept}`);
    }
  }
  return [...words, ...concepts];
}

export function profileText(p: Person): string {
  return [
    p.name,
    p.headline,
    p.background,
    p.building,
    p.sectors.join(" "),
    p.roles.map((r) => `${r.title} ${r.company}`).join(" "),
    p.city,
    p.country,
    p.education,
    p.signal.type,
    p.signal.detail,
    p.repeatFounder ? "repeat founder" : "",
  ].join(" ");
}

type Vector = Map<string, number>;

export interface VectorIndex {
  ids: string[];
  vectors: Vector[];
  idf: Map<string, number>;
}

function termFrequencies(tokens: string[]): Map<string, number> {
  const tf = new Map<string, number>();
  for (const t of tokens) tf.set(t, (tf.get(t) ?? 0) + 1);
  return tf;
}

function weigh(tf: Map<string, number>, idf: Map<string, number>): Vector {
  const v: Vector = new Map();
  let norm = 0;
  for (const [term, count] of tf) {
    const w = (1 + Math.log(count)) * (idf.get(term) ?? 0);
    if (w > 0) {
      v.set(term, w);
      norm += w * w;
    }
  }
  norm = Math.sqrt(norm) || 1;
  for (const [term, w] of v) v.set(term, w / norm);
  return v;
}

export function buildIndex(people: Person[]): VectorIndex {
  const docs = people.map((p) => termFrequencies(tokenize(profileText(p))));
  const df = new Map<string, number>();
  for (const doc of docs) for (const term of doc.keys()) df.set(term, (df.get(term) ?? 0) + 1);
  const idf = new Map<string, number>();
  for (const [term, count] of df) idf.set(term, Math.log((people.length + 1) / (count + 0.5)));
  return { ids: people.map((p) => p.id), vectors: docs.map((doc) => weigh(doc, idf)), idf };
}

export function embedQuery(index: VectorIndex, text: string): Vector {
  return weigh(termFrequencies(tokenize(text)), index.idf);
}

export function cosine(a: Vector, b: Vector): number {
  let sum = 0;
  const [small, large] = a.size < b.size ? [a, b] : [b, a];
  for (const [term, w] of small) {
    const other = large.get(term);
    if (other) sum += w * other;
  }
  return sum;
}

/** The query words (not concepts) a profile actually contains, for an honest "mentions" reason. */
export function sharedTerms(queryText: string, p: Person): string[] {
  const profile = new Set(tokenize(profileText(p)).filter((t) => !t.startsWith("#")));
  return [...new Set(tokenize(queryText).filter((t) => !t.startsWith("#") && profile.has(t)))];
}
