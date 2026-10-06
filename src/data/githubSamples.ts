import type { GithubActivity, GithubStats } from "../types";
import { generateContributions } from "../utils/github";
import { buildSummary, countActiveWeeks } from "../utils/githubSummary";

/* Mock GitHub profiles. Every field matches what GitHub's API returns (see GithubStats in types.ts). */

const SAMPLE_FETCHED_AT = "2026-07-27T00:00:00.000Z";

const TS = "#3178c6";
const PY = "#3572a5";
const RUST = "#dea584";
const HASKELL = "#5e5086";
const JAVA = "#b07219";
const SQL = "#e38c00";
const CPP = "#f34b7d";
const CUDA = "#3a4e3a";
const NOTEBOOK = "#da5b0b";

function activity(
  seed: string,
  split: Pick<GithubActivity, "commits" | "pullRequests" | "reviews" | "issues" | "privateContributions">,
): GithubActivity {
  const calendar = generateContributions(seed, 371, new Date(2026, 6, 27));
  return {
    totalContributions: calendar.reduce((sum, day) => sum + day.count, 0),
    activeWeeks: countActiveWeeks(calendar),
    ...split,
    calendar,
  };
}

function sample(input: Omit<GithubStats, "summary" | "fetchedAt" | "noPublicActivity">): GithubStats {
  const base = { ...input, noPublicActivity: false };
  return { ...base, summary: buildSummary(base), fetchedAt: SAMPLE_FETCHED_AT };
}

export const darshanGithub = sample({
  username: "darshanp-dev",
  basics: {
    name: "Darshan Patel",
    bio: "building FinishKit",
    company: "@finishkit",
    location: "Sydney, Australia",
    websiteUrl: "https://darshan.dev",
    twitterUsername: "darshanp_dev",
    socialAccounts: [{ provider: "LINKEDIN", url: "https://www.linkedin.com/in/darshan-patel-au/" }],
    createdAt: "2019-04-12T00:00:00Z",
    followers: 58,
    following: 41,
    publicRepos: 31,
    originalRepos: 19,
    totalStars: 94,
    orgs: [{ login: "finishkit", name: "FinishKit" }],
    pinned: [
      { name: "darshanp-dev/tokenwise", description: "Fast tokenizer bindings", stars: 31, language: "Rust" },
      { name: "darshanp-dev/agent-trace", description: "Tracing and replay for agent tool calls", stars: 17, language: "TypeScript" },
    ],
  },
  activity: activity("darshanp-dev", { commits: 960, pullRequests: 142, reviews: 68, issues: 20, privateContributions: 140 }),
  mergedExternal: {
    total: 27,
    distinctRepos: 11,
    sampled: false,
    fromMemberOrgs: 4,
    top: [
      { repo: "tokio-rs/tokio", repoStars: 28_100, title: "Fix cancel-safety note in time docs", mergedAt: "2026-06-18T00:00:00Z", url: "https://github.com/tokio-rs/tokio", viaMemberOrg: false },
      { repo: "langchain-ai/langgraph", repoStars: 12_400, title: "Add retry policy to tool node", mergedAt: "2026-07-02T00:00:00Z", url: "https://github.com/langchain-ai/langgraph", viaMemberOrg: false },
      { repo: "huggingface/tokenizers", repoStars: 9_800, title: "Speed up byte-level pre-tokenizer", mergedAt: "2026-05-09T00:00:00Z", url: "https://github.com/huggingface/tokenizers", viaMemberOrg: false },
      { repo: "serde-rs/serde", repoStars: 9_200, title: "Docs: clarify flatten with deny_unknown_fields", mergedAt: "2026-03-21T00:00:00Z", url: "https://github.com/serde-rs/serde", viaMemberOrg: false },
      { repo: "finishkit/relay", repoStars: 38, title: "Add streaming resume", mergedAt: "2026-07-11T00:00:00Z", url: "https://github.com/finishkit/relay", viaMemberOrg: true },
    ],
  },
  topRepos: [
    { name: "tokenwise", description: "Fast tokenizer bindings", url: "https://github.com/darshanp-dev/tokenwise", stars: 31, forks: 6, language: "Rust", pushedAt: "2026-07-20T00:00:00Z", topics: ["tokenizer", "nlp", "rust"], quality: { tests: true, ci: true, license: "MIT", readme: true, releases: 4 } },
    { name: "agent-trace", description: "Tracing and replay for agent tool calls", url: "https://github.com/darshanp-dev/agent-trace", stars: 17, forks: 2, language: "TypeScript", pushedAt: "2026-07-12T00:00:00Z", topics: ["llm", "observability", "agents"], quality: { tests: true, ci: true, license: "Apache-2.0", readme: true, releases: 2 } },
    { name: "rust-mq", description: "Tiny in-process message queue", url: "https://github.com/darshanp-dev/rust-mq", stars: 12, forks: 1, language: "Rust", pushedAt: "2026-05-02T00:00:00Z", topics: ["rust", "messaging"], quality: { tests: true, ci: false, license: "MIT", readme: true, releases: 0 } },
    { name: "prompt-lint", description: "Lint prompts for common failure modes", url: "https://github.com/darshanp-dev/prompt-lint", stars: 9, forks: 0, language: "Python", pushedAt: "2026-06-21T00:00:00Z", topics: ["llm", "linter"], quality: { tests: true, ci: true, license: "MIT", readme: true, releases: 1 } },
    { name: "next-saas-kit", description: "Starter for B2B SaaS on Next.js", url: "https://github.com/darshanp-dev/next-saas-kit", stars: 6, forks: 1, language: "TypeScript", pushedAt: "2026-02-10T00:00:00Z", topics: ["nextjs", "saas"] },
  ],
  languages: [
    { name: "TypeScript", percent: 52, color: TS },
    { name: "Python", percent: 28, color: PY },
    { name: "Rust", percent: 20, color: RUST },
  ],
  commitShare: [
    { repo: "darshanp-dev/tokenwise", percent: 88, rank: 1, contributors: 3 },
    { repo: "darshanp-dev/agent-trace", percent: 61, rank: 1, contributors: 2 },
    { repo: "darshanp-dev/rust-mq", percent: 34, rank: 2, contributors: 4 },
  ],
  stack: ["Tokio", "serde", "React", "FastAPI", "OpenAI SDK"],
  themes: ["AI/ML", "Dev tools"],
});

export const loongGithub = sample({
  username: "bzlwang",
  basics: {
    name: "Loong Wang",
    bio: "Distributed systems, SQL, Haskell.",
    location: "Singapore",
    socialAccounts: [],
    createdAt: "2015-02-10T00:00:00Z",
    followers: 173,
    following: 64,
    publicRepos: 27,
    originalRepos: 21,
    totalStars: 512,
    orgs: [{ login: "anu-comp", name: "ANU Computing" }],
    pinned: [{ name: "bzlwang/hs-sqlgen", description: "Type-safe SQL generation for Haskell", stars: 212, language: "Haskell" }],
  },
  activity: activity("bzlwang", { commits: 1170, pullRequests: 170, reviews: 120, issues: 36, privateContributions: 0 }),
  mergedExternal: {
    total: 14,
    distinctRepos: 6,
    sampled: false,
    fromMemberOrgs: 0,
    top: [
      { repo: "PostgREST/postgrest", repoStars: 24_000, title: "Docs: clarify RPC argument handling", mergedAt: "2026-04-03T00:00:00Z", url: "https://github.com/PostgREST/postgrest", viaMemberOrg: false },
      { repo: "haskell/cabal", repoStars: 1_700, title: "Improve solver backtracking message", mergedAt: "2025-12-14T00:00:00Z", url: "https://github.com/haskell/cabal", viaMemberOrg: false },
    ],
  },
  topRepos: [
    { name: "hs-sqlgen", description: "Type-safe SQL generation for Haskell", url: "https://github.com/bzlwang/hs-sqlgen", stars: 212, forks: 18, language: "Haskell", pushedAt: "2026-06-14T00:00:00Z", topics: ["haskell", "sql", "database"], quality: { tests: true, ci: true, license: "BSD-3-Clause", readme: true, releases: 7 } },
    { name: "lease-keeper", description: "Distributed lease manager on the JVM", url: "https://github.com/bzlwang/lease-keeper", stars: 148, forks: 9, language: "Java", pushedAt: "2025-11-03T00:00:00Z", topics: ["distributed-systems", "jvm"], quality: { tests: true, ci: true, license: "Apache-2.0", readme: true, releases: 5 } },
    { name: "tinyquery", description: "Embeddable SQL engine for CSVs", url: "https://github.com/bzlwang/tinyquery", stars: 96, forks: 6, language: "Haskell", pushedAt: "2026-02-28T00:00:00Z", topics: ["sql", "haskell"], quality: { tests: true, ci: false, license: "MIT", readme: true, releases: 0 } },
  ],
  languages: [
    { name: "Haskell", percent: 44, color: HASKELL },
    { name: "Java", percent: 31, color: JAVA },
    { name: "SQL", percent: 25, color: SQL },
  ],
  commitShare: [
    { repo: "bzlwang/hs-sqlgen", percent: 71, rank: 1, contributors: 5 },
    { repo: "bzlwang/lease-keeper", percent: 58, rank: 1, contributors: 3 },
  ],
  stack: [],
  themes: ["Data", "Infra"],
});

export const anshuGithub = sample({
  username: "anshu-bansal-ai",
  basics: {
    name: "Anshu Bansal",
    bio: "LLM inference and edge AI",
    location: "San Francisco, CA",
    socialAccounts: [],
    createdAt: "2016-08-22T00:00:00Z",
    followers: 211,
    following: 87,
    publicRepos: 18,
    originalRepos: 14,
    totalStars: 340,
    orgs: [],
    pinned: [{ name: "anshu-bansal-ai/edge-infer", description: "Quantized inference runtime for edge LLM deployment", stars: 164, language: "CUDA" }],
  },
  activity: activity("anshu-bansal-ai", { commits: 1180, pullRequests: 110, reviews: 60, issues: 31, privateContributions: 70 }),
  mergedExternal: {
    total: 9,
    distinctRepos: 5,
    sampled: false,
    fromMemberOrgs: 0,
    top: [
      { repo: "pytorch/pytorch", repoStars: 90_000, title: "Docs: quantized kernel selection notes", mergedAt: "2026-02-11T00:00:00Z", url: "https://github.com/pytorch/pytorch", viaMemberOrg: false },
      { repo: "vllm-project/vllm", repoStars: 38_000, title: "Fix KV-cache block eviction edge case", mergedAt: "2026-05-19T00:00:00Z", url: "https://github.com/vllm-project/vllm", viaMemberOrg: false },
    ],
  },
  topRepos: [
    { name: "edge-infer", description: "Quantized inference runtime for edge LLM deployment", url: "https://github.com/anshu-bansal-ai/edge-infer", stars: 164, forks: 21, language: "CUDA", pushedAt: "2026-07-08T00:00:00Z", topics: ["llm", "inference", "cuda"], quality: { tests: true, ci: true, license: "Apache-2.0", readme: true, releases: 3 } },
    { name: "kv-cache-bench", description: "Benchmark suite for KV-cache strategies", url: "https://github.com/anshu-bansal-ai/kv-cache-bench", stars: 71, forks: 8, language: "Python", pushedAt: "2026-04-17T00:00:00Z", topics: ["llm", "benchmark"], quality: { tests: true, ci: true, license: "MIT", readme: true, releases: 1 } },
    { name: "cuda-kernels-lab", description: "Hand-written CUDA kernels with notes", url: "https://github.com/anshu-bansal-ai/cuda-kernels-lab", stars: 52, forks: 5, language: "CUDA", pushedAt: "2026-01-30T00:00:00Z", topics: ["cuda", "gpu"] },
  ],
  languages: [
    { name: "Python", percent: 48, color: PY },
    { name: "C++", percent: 33, color: CPP },
    { name: "CUDA", percent: 19, color: CUDA },
  ],
  commitShare: [{ repo: "anshu-bansal-ai/edge-infer", percent: 74, rank: 1, contributors: 4 }],
  stack: ["PyTorch", "FastAPI", "Triton"],
  themes: ["AI/ML", "Systems"],
});

/** Deliberately thin: no outside PRs, no team repos, no stack. The card hides what it doesn't have. */
export const zhipengGithub = sample({
  username: "zhipeng-he",
  basics: {
    name: "Zhipeng He",
    bio: "PhD candidate, tabular ML",
    company: "@QUT",
    location: "Brisbane, Australia",
    socialAccounts: [],
    createdAt: "2018-05-01T00:00:00Z",
    followers: 42,
    following: 30,
    publicRepos: 23,
    originalRepos: 16,
    totalStars: 118,
    orgs: [],
    pinned: [],
  },
  activity: activity("zhipeng-he", { commits: 1150, pullRequests: 75, reviews: 12, issues: 40, privateContributions: 0 }),
  topRepos: [
    { name: "tabular-bench", description: "Benchmarks for tabular deep learning", url: "https://github.com/zhipeng-he/tabular-bench", stars: 64, forks: 7, language: "Python", pushedAt: "2026-07-01T00:00:00Z", topics: ["machine-learning", "benchmark"], quality: { tests: true, ci: false, license: "MIT", readme: true, releases: 0 } },
    { name: "gh-insights-cli", description: "CLI that summarises a repo's activity", url: "https://github.com/zhipeng-he/gh-insights-cli", stars: 31, forks: 2, language: "TypeScript", pushedAt: "2026-06-10T00:00:00Z", topics: ["cli"] },
    { name: "notebooks", url: "https://github.com/zhipeng-he/notebooks", stars: 17, forks: 3, language: "Jupyter Notebook", pushedAt: "2026-03-22T00:00:00Z", topics: [] },
  ],
  languages: [
    { name: "Python", percent: 71, color: PY },
    { name: "TypeScript", percent: 18, color: TS },
    { name: "Jupyter Notebook", percent: 11, color: NOTEBOOK },
  ],
  commitShare: [],
  stack: [],
  themes: ["AI/ML"],
});
