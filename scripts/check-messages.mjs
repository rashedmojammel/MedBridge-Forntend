/**
 * Compares the key trees of messages/en.json and messages/bn.json.
 *
 * A key present in en but missing in bn does not throw at runtime - next-intl
 * renders the key path itself, so a Bangla reader sees `patient.diary.title`
 * where a sentence should be. That fails silently in the browser and only shows
 * up when someone happens to visit the page in the right language, which is why
 * it is checked here instead.
 *
 *   node scripts/check-messages.mjs
 *
 * Exits 1 on any difference so it can gate a build.
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const load = (locale) =>
  JSON.parse(readFileSync(join(root, 'messages', `${locale}.json`), 'utf8'));

/** Flattens to dotted leaf paths, so a branch turned into a string is caught too. */
function paths(value, prefix = '', out = new Set()) {
  if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
    for (const [key, child] of Object.entries(value)) {
      paths(child, prefix ? `${prefix}.${key}` : key, out);
    }
  } else {
    out.add(prefix);
  }
  return out;
}

const en = paths(load('en'));
const bn = paths(load('bn'));

const missing = [...en].filter((k) => !bn.has(k)).sort();
const extra = [...bn].filter((k) => !en.has(k)).sort();

console.log(`en: ${en.size} keys   bn: ${bn.size} keys`);

if (missing.length) {
  console.error(`\nMissing in bn (${missing.length}):`);
  for (const k of missing) console.error(`  ${k}`);
}
if (extra.length) {
  console.error(`\nOnly in bn (${extra.length}):`);
  for (const k of extra) console.error(`  ${k}`);
}

if (missing.length || extra.length) process.exit(1);
console.log('Key trees match.');
