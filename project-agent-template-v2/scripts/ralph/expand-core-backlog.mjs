#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

function die(message) {
  console.error(`[expand-core-backlog] Error: ${message}`);
  process.exit(1);
}

function parsePositiveInt(value, flagName) {
  if (!/^\d+$/.test(value) || Number(value) <= 0) {
    die(`${flagName} must be a positive integer`);
  }
  return Number(value);
}

function parseArgs(argv) {
  const options = {
    forcePasses: false,
    forceNotes: false,
    reportJson: false,
    wave: null,
    upToWave: null,
    pack: "scripts/ralph/task-pack.template.json",
    help: false,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--force-passes") {
      options.forcePasses = true;
    } else if (arg === "--force-notes") {
      options.forceNotes = true;
    } else if (arg === "--report-json") {
      options.reportJson = true;
    } else if (arg === "--help" || arg === "-h") {
      options.help = true;
    } else if (arg === "--pack") {
      i += 1;
      if (i >= argv.length) die("--pack requires a value");
      options.pack = argv[i];
    } else if (arg.startsWith("--pack=")) {
      options.pack = arg.slice("--pack=".length);
    } else if (arg === "--wave") {
      i += 1;
      if (i >= argv.length) die("--wave requires a value");
      options.wave = parsePositiveInt(argv[i], "--wave");
    } else if (arg.startsWith("--wave=")) {
      options.wave = parsePositiveInt(arg.slice("--wave=".length), "--wave");
    } else if (arg === "--up-to-wave") {
      i += 1;
      if (i >= argv.length) die("--up-to-wave requires a value");
      options.upToWave = parsePositiveInt(argv[i], "--up-to-wave");
    } else if (arg.startsWith("--up-to-wave=")) {
      options.upToWave = parsePositiveInt(arg.slice("--up-to-wave=".length), "--up-to-wave");
    } else {
      die(`Unknown argument: ${arg}`);
    }
  }

  if (options.wave !== null && options.upToWave !== null) {
    die("--wave and --up-to-wave cannot be used together");
  }

  return options;
}

const options = parseArgs(process.argv.slice(2));

if (options.help) {
  console.log(`Usage: node scripts/ralph/expand-core-backlog.mjs [--pack FILE] [--force-passes] [--force-notes] [--wave N | --up-to-wave N] [--report-json]

Default behavior:
- Read current backlog: scripts/ralph/prd.json
- Merge stories from task pack (default: scripts/ralph/task-pack.template.json)
- Keep existing passes=true unless --force-passes
- Keep existing non-empty notes unless --force-notes

Outputs:
- Human summary by default
- JSON summary with --report-json
`);
  process.exit(0);
}

const prdPath = path.resolve(process.cwd(), "scripts/ralph/prd.json");
const packPath = path.resolve(process.cwd(), options.pack);

if (!fs.existsSync(prdPath)) {
  die(`PRD file not found: ${prdPath}`);
}
if (!fs.existsSync(packPath)) {
  die(`Task pack file not found: ${packPath}`);
}

const prd = JSON.parse(fs.readFileSync(prdPath, "utf8"));
const pack = JSON.parse(fs.readFileSync(packPath, "utf8"));

if (!Array.isArray(prd.userStories)) {
  die("scripts/ralph/prd.json must contain userStories array");
}
if (!Array.isArray(pack.userStories)) {
  die("task pack must contain userStories array");
}

const seenPackIds = new Set();
for (const story of pack.userStories) {
  if (!story || typeof story !== "object") {
    die("task pack userStories contains non-object item");
  }
  if (typeof story.id !== "string" || story.id.trim() === "") {
    die("task pack story is missing non-empty id");
  }
  if (seenPackIds.has(story.id)) {
    die(`task pack has duplicate story id: ${story.id}`);
  }
  seenPackIds.add(story.id);
}

function storyWave(story) {
  const waveValue = Number(story.rolloutWave ?? 1);
  if (!Number.isFinite(waveValue) || waveValue <= 0) {
    return 1;
  }
  return Math.floor(waveValue);
}

function inWaveScope(story) {
  const waveValue = storyWave(story);
  if (options.wave !== null) {
    return waveValue === options.wave;
  }
  if (options.upToWave !== null) {
    return waveValue <= options.upToWave;
  }
  return true;
}

const selectedStories = pack.userStories.filter(inWaveScope);

const existingById = new Map(
  prd.userStories
    .filter((story) => story && typeof story.id === "string" && story.id.trim() !== "")
    .map((story) => [story.id, story]),
);

const addedStoryIds = [];
const updatedStoryIds = [];

function mergedStory(existing, incoming) {
  const merged = existing ? { ...existing } : {};

  merged.id = incoming.id;
  merged.title = incoming.title ?? existing?.title ?? incoming.id;
  merged.description = incoming.description ?? existing?.description ?? "";
  merged.acceptanceCriteria = Array.isArray(incoming.acceptanceCriteria)
    ? incoming.acceptanceCriteria
    : (existing?.acceptanceCriteria ?? []);
  merged.priority = Number.isFinite(Number(incoming.priority))
    ? Number(incoming.priority)
    : Number.isFinite(Number(existing?.priority))
      ? Number(existing.priority)
      : 9999;
  merged.rolloutWave = storyWave(incoming);

  const incomingPasses = Boolean(incoming.passes);
  const existingPasses = Boolean(existing?.passes);
  merged.passes = options.forcePasses ? incomingPasses : (existingPasses || incomingPasses);

  const incomingNotes = typeof incoming.notes === "string" ? incoming.notes : "";
  const existingNotes = typeof existing?.notes === "string" ? existing.notes : "";
  merged.notes = options.forceNotes ? incomingNotes : (existingNotes.trim() !== "" ? existingNotes : incomingNotes);

  return merged;
}

for (const incoming of selectedStories) {
  const existing = existingById.get(incoming.id);
  const merged = mergedStory(existing, incoming);
  existingById.set(incoming.id, merged);

  if (!existing) {
    addedStoryIds.push(incoming.id);
  } else {
    updatedStoryIds.push(incoming.id);
  }
}

const mergedStories = Array.from(existingById.values());
mergedStories.sort((a, b) => {
  const pa = Number.isFinite(Number(a.priority)) ? Number(a.priority) : 9999;
  const pb = Number.isFinite(Number(b.priority)) ? Number(b.priority) : 9999;
  if (pa !== pb) return pa - pb;
  return String(a.id).localeCompare(String(b.id));
});

prd.userStories = mergedStories;
fs.writeFileSync(prdPath, `${JSON.stringify(prd, null, 2)}\n`, "utf8");

const addedPendingStoryIds = addedStoryIds.filter((id) => {
  const story = existingById.get(id);
  return story?.passes !== true;
});

const summary = {
  prdPath,
  packPath,
  selectedCount: selectedStories.length,
  addedCount: addedStoryIds.length,
  updatedCount: updatedStoryIds.length,
  addedStoryIds,
  updatedStoryIds,
  addedPendingCount: addedPendingStoryIds.length,
  addedPendingStoryIds,
  refreshAddedWork: addedPendingStoryIds.length > 0,
  wave: options.wave,
  upToWave: options.upToWave,
  forcePasses: options.forcePasses,
  forceNotes: options.forceNotes,
};

if (options.reportJson) {
  process.stdout.write(`${JSON.stringify(summary)}\n`);
} else {
  console.log(`[expand-core-backlog] merged ${selectedStories.length} stories from ${packPath}`);
  console.log(`[expand-core-backlog] added=${summary.addedCount}, updated=${summary.updatedCount}, addedPending=${summary.addedPendingCount}`);
  if (summary.addedStoryIds.length > 0) {
    console.log(`[expand-core-backlog] added stories: ${summary.addedStoryIds.join(", ")}`);
  }
}
