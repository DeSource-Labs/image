import { readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const packagesDirectory = path.resolve('packages');
const coreChangelog = await readFile(path.join(packagesDirectory, 'core/CHANGELOG.md'), 'utf8');
const sharedBody = coreChangelog.replace(/^#[^\n]*\n*/, '');
const entries = await readdir(packagesDirectory, { withFileTypes: true });
let count = 0;

for (const entry of entries) {
  if (!entry.isDirectory() || entry.name === 'core') continue;

  const packageDirectory = path.join(packagesDirectory, entry.name);
  const packageJson = JSON.parse(await readFile(path.join(packageDirectory, 'package.json'), 'utf8')) as {
    name?: string;
    private?: boolean;
  };
  if (packageJson.private === true || !packageJson.name) continue;

  await writeFile(path.join(packageDirectory, 'CHANGELOG.md'), `# ${packageJson.name}\n\n${sharedBody.trimStart()}`);
  count += 1;
}

console.log(`Synchronized ${count} framework changelog(s) with @desource/image.`);
