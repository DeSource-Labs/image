import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

interface PackageManifest {
  name?: string;
  version?: string;
  dependencies?: Record<string, string>;
  publishConfig?: Record<string, unknown>;
}

const packageDirectory = fileURLToPath(new URL('../packages/angular/', import.meta.url));
const sourcePath = path.join(packageDirectory, 'package.json');
const outputPath = path.join(packageDirectory, 'dist/package.json');
const corePath = path.join(packageDirectory, '../core/package.json');
const source = await readManifest(sourcePath);
const output = await readManifest(outputPath);
const core = await readManifest(corePath);

if (source.name !== output.name || source.version !== output.version) {
  throw new Error(
    `Angular package metadata mismatch: source is ${source.name}@${source.version}, output is ${output.name}@${output.version}`
  );
}

if (output.publishConfig) {
  delete output.publishConfig.directory;
  if (Object.keys(output.publishConfig).length === 0) delete output.publishConfig;
}

if (output.dependencies?.['@desource/image']?.startsWith('workspace:')) {
  if (!core.version) throw new Error('Core package version is missing');
  output.dependencies['@desource/image'] = core.version;
}

await writeFile(outputPath, `${JSON.stringify(output, undefined, 2)}\n`);
console.log('Prepared Angular dist manifest for publishing.');

async function readManifest(filePath: string): Promise<PackageManifest> {
  return JSON.parse(await readFile(filePath, 'utf8')) as PackageManifest;
}
