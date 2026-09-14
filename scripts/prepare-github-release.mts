import { appendFile, readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

interface PackageJson {
  name?: string;
  private?: boolean;
  version?: string;
}

interface PublicPackage {
  directory: string;
  packageJson: PackageJson;
}

const semverCorePattern = /^(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)$/;
const semverIdentifiersPattern = /^[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*$/;

const packagesDirectory = path.resolve('packages');
const corePackage = await readPackageJson(path.join(packagesDirectory, 'core/package.json'));
const version = corePackage.version;

if (!version || !isSemver(version)) throw new Error(`Core package has an invalid version: ${String(version)}`);

const entries = await readdir(packagesDirectory, { withFileTypes: true });
const publicPackages: PublicPackage[] = (
  await Promise.all(
    entries
      .filter((entry) => entry.isDirectory())
      .map(async (entry) => ({
        directory: path.join(packagesDirectory, entry.name),
        packageJson: await readPackageJson(path.join(packagesDirectory, entry.name, 'package.json'))
      }))
  )
).filter(({ packageJson }) => packageJson.private !== true);

const mismatches = publicPackages.filter(({ packageJson }) => packageJson.version !== version);
if (mismatches.length) {
  throw new Error(
    `All public packages must use ${version}. Mismatched packages: ${mismatches
      .map(({ packageJson }) => `${packageJson.name ?? '<unnamed>'}@${packageJson.version ?? '<missing>'}`)
      .join(', ')}`
  );
}

const changelog = await readFile(path.join(packagesDirectory, 'core/CHANGELOG.md'), 'utf8');
const releaseNotes = extractChangelogEntry(changelog, version);
const comparableReleaseNotes = normalizeChangelogEntry(releaseNotes);
const changelogMismatches = (
  await Promise.all(
    publicPackages.map(async ({ directory, packageJson }) => ({
      name: packageJson.name ?? '<unnamed>',
      releaseNotes: extractChangelogEntry(
        await readFile(path.join(directory, 'CHANGELOG.md'), 'utf8'),
        version,
        `${packageJson.name ?? '<unnamed>'} changelog`
      )
    }))
  )
).filter((entry) => normalizeChangelogEntry(entry.releaseNotes) !== comparableReleaseNotes);
if (changelogMismatches.length) {
  throw new Error(
    `All public package changelog entries for ${version} must match @desource/image after excluding generated dependency updates from Patch Changes. Mismatched packages: ${changelogMismatches
      .map((entry) => entry.name)
      .join(', ')}`
  );
}

const releaseNotesPath = process.env.RELEASE_NOTES_PATH;
if (!releaseNotesPath) throw new Error('RELEASE_NOTES_PATH must point to the release notes output file');

await writeFile(releaseNotesPath, `${releaseNotes}\n`);
if (process.env.GITHUB_OUTPUT) {
  await appendFile(process.env.GITHUB_OUTPUT, `version=${version}\n`);
  await appendFile(process.env.GITHUB_OUTPUT, `prerelease=${version.split('+', 1)[0]!.includes('-')}\n`);
}

console.log(`Prepared GitHub release ${version} for ${publicPackages.length} packages`);

async function readPackageJson(filePath: string): Promise<PackageJson> {
  return JSON.parse(await readFile(filePath, 'utf8')) as PackageJson;
}

function extractChangelogEntry(changelog: string, targetVersion: string, label = 'Core changelog'): string {
  const escapedVersion = targetVersion.replace(/[.*+?^${}()|[\]\\]/g, String.raw`\$&`);
  const match = new RegExp(String.raw`^##\s+${escapedVersion}\s*$`, 'm').exec(changelog);
  if (!match) throw new Error(`${label} does not contain a ${targetVersion} release entry`);

  const remainder = changelog.slice(match.index + match[0].length);
  const entry = remainder.slice(0, /^##\s+/m.exec(remainder)?.index).trim();
  if (!entry) throw new Error(`${label} entry for ${targetVersion} is empty`);
  return entry;
}

function normalizeChangelogEntry(entry: string): string {
  return entry
    .replaceAll('\r\n', '\n')
    .split(/(?=^### )/m)
    .map((section) => {
      const heading = '### Patch Changes\n';
      if (!section.startsWith(heading)) return section.trim();

      // Changesets adds package-specific dependency updates alongside shared release notes.
      const patchChanges = section
        .slice(heading.length)
        .split(/(?=^- )/m)
        .filter(
          (block) =>
            !/^- Updated dependencies \[[^\n]*\]:\n(?: {2}- (?:@[^/\s]+\/)?[^@\s]+@[^\s]+(?:\n|$))+$/.test(block.trim())
        )
        .join('')
        .trim();

      return patchChanges ? `${heading}\n${patchChanges}` : '';
    })
    .filter(Boolean)
    .join('\n\n');
}

function isSemver(value: string): boolean {
  const versionParts = value.split('+');
  const versionWithPrerelease = versionParts[0]!;
  const buildParts = versionParts.slice(1);
  const buildMetadata = buildParts[0];
  if (buildParts.length > 1 || (buildMetadata !== undefined && !semverIdentifiersPattern.test(buildMetadata))) {
    return false;
  }

  const prereleaseSeparator = versionWithPrerelease.indexOf('-');
  const coreVersion =
    prereleaseSeparator === -1 ? versionWithPrerelease : versionWithPrerelease.slice(0, prereleaseSeparator);
  const prerelease = prereleaseSeparator === -1 ? undefined : versionWithPrerelease.slice(prereleaseSeparator + 1);

  return semverCorePattern.test(coreVersion) && (prerelease === undefined || semverIdentifiersPattern.test(prerelease));
}
