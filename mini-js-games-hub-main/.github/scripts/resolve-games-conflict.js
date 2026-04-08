/**
 * Auto-resolve merge conflicts in `script.js` limited to the `games` array.
 * This script merges all game objects from both conflict sides, removes duplicates,
 * and keeps valid JS syntax.
 */

import fs from "fs";

const filePath = "script.js";
let file = fs.readFileSync(filePath, "utf8");

if (!file.includes("<<<<<<<")) {
  console.log("✅ No conflict markers found — nothing to fix.");
  process.exit(0);
}

// Safety check — ensure conflict is inside `const games = [`
if (!file.includes("const games = [")) {
  console.error("❌ Conflict is not inside the games array. Exiting for safety.");
  process.exit(1);
}

/**
 * Extract all `{...}` game objects inside the conflict blocks.
 */
function extractGameObjects(text) {
  const objects = [];
  const regex = /\{[\s\S]*?\}/g;
  let match;
  while ((match = regex.exec(text))) {
    // Only add unique ones
    const obj = match[0].trim();
    if (!objects.includes(obj)) objects.push(obj);
  }
  return objects;
}

/**
 * Process each conflict block and merge entries.
 */
const conflictRegex = /<<<<<<<[\s\S]*?=======([\s\S]*?)>>>>>>>[\s\S]*?/g;
let resolved = file;

resolved = resolved.replace(conflictRegex, (block) => {
  console.log("⚙️ Resolving one conflict block in script.js");

  const parts = block.split(/=======/);
  const head = parts[0].split("\n").slice(1).join("\n");
  const incoming = parts[1].split("\n").slice(1, -1).join("\n");

  const allGames = [
    ...extractGameObjects(head),
    ...extractGameObjects(incoming),
  ];

  // Deduplicate by game name if possible
  const uniqueGames = [];
  const seen = new Set();

  for (const obj of allGames) {
    const nameMatch = obj.match(/name:\s*["'`](.*?)["'`]/);
    const name = nameMatch ? nameMatch[1].toLowerCase() : obj;
    if (!seen.has(name)) {
      seen.add(name);
      uniqueGames.push(obj);
    }
  }

  return uniqueGames.join(",\n");
});

fs.writeFileSync(filePath, resolved);
console.log("✅ script.js games array auto-merged successfully!");
