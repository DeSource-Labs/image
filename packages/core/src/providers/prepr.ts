import { joinURL } from 'ufo';
import { createOperationsGenerator } from '../utils.js';
import { configureProvider, defineProvider, type ProviderOptionsOf } from '../provider-utils.js';

interface PreprImageOptions {
  projectName: string;
}

/**
 * Maps readable image modifiers to URL path parameters understood by Prepr's
 * image API.
 */
const keyMap = {
  crop: 'c',
  format: 'format',
  height: 'h',
  quality: 'q',
  width: 'w'
} as const;

/**
 * Maps modifier values to the equivalents understood by Prepr's image API.
 *
 * ```Examples
 * Prepr's `w` path param expects an arbitrary number, so, it does not need to be in `valueMap`
 *
 * Our custom param `width` maps to `w` in keyMap, so, it does not need to be in `valueMap`
 *
 * Prepr's `format` path param expects a string which can either be `jpg` or `png`,
 * To accept `format: 'jpeg'`, map `jpeg` to `jpg` because Prepr's API does not
 * recognize `jpeg`. Likewise, `fit=cover` maps to `fit=crop`.
 *```
 */
const valueMap = {
  format: {
    jpeg: 'jpg'
  },
  fit: {
    cover: 'crop' // Prepr.io accepts value `crop` defaulting to value `centre`
  }
} as const;

export function formatter(key: string, value: string) {
  return String(value) === 'true' ? key : `${key}_${value}`;
}

const operationsGenerator = createOperationsGenerator({
  formatter,
  joinWith: ',',
  keyMap,
  valueMap
});

const providerSetup = defineProvider<PreprImageOptions>({
  getImage: (src, options, _ctx) => {
    const { projectName } = options;

    if (typeof projectName !== 'string' || !projectName.trim()) {
      throw new TypeError('[desource/image] [prepr] No project name provided.');
    }

    const fileBucket = 'stream';
    const fileOperations = operationsGenerator(options.modifiers);
    const filePath = fileOperations ? joinURL(fileOperations, src) : src;

    const projectUrl = `https://${projectName.trim()}.${fileBucket}.prepr.io`;

    return {
      url: joinURL(projectUrl, filePath)
    };
  }
});

export type PreprProviderOptions = Partial<ProviderOptionsOf<typeof providerSetup>>;

export function preprProvider(options: PreprProviderOptions = {}) {
  return configureProvider(providerSetup, options, 'prepr');
}

export default providerSetup;
