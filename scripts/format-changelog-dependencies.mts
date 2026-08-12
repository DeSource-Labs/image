import { readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const packageEntries = await readdir('packages', { withFileTypes: true });
let formattedCount = 0;

for (const entry of packageEntries) {
  if (!entry.isDirectory()) continue;

  const changelogPath = path.join('packages', entry.name, 'CHANGELOG.md');
  const original = await readOptionalFile(changelogPath);
  if (original === null) continue;

  const formatted = original.replace(/([^\n])\n(- Updated dependencies \[)/g, '$1\n\n$2');
  if (formatted === original) continue;

  await writeFile(changelogPath, formatted);
  formattedCount += 1;
}

console.log(`Formatted dependency changelog spacing in ${formattedCount} file(s).`);

async function readOptionalFile(filePath: string): Promise<string | null> {
  try {
    return await readFile(filePath, 'utf8');
  } catch (error) {
    if (error && typeof error === 'object' && 'code' in error && error.code === 'ENOENT') return null;
    throw error;
  }
}
