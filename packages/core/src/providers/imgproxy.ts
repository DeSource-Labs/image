import { hmac } from '@noble/hashes/hmac.js';
import { sha256 } from '@noble/hashes/sha2.js';
import { joinURL } from 'ufo';
import { createOperationsGenerator } from '../utils.js';
import { configureProvider, defineProvider, type ProviderOptionsOf } from '../provider-utils.js';
import type { ImageFit, ImageModifiers, ModifierValue } from '../types.js';

export type ImgproxyResizingType = 'fit' | 'fill' | 'fill-down' | 'force' | 'auto';
export type ImgproxyGravityType = 'ce' | 'no' | 'so' | 'ea' | 'we' | 'noea' | 'nowe' | 'soea' | 'sowe';
export interface ImgproxyCrop extends Record<string, ModifierValue> {
  width: number;
  height: number;
  gravity?: ImgproxyGravityType;
}
export type ImgproxyFormat =
  | 'webp'
  | 'png'
  | 'jpg'
  | 'jpeg'
  | 'jxl'
  | 'avif'
  | 'gif'
  | 'ico'
  | 'svg'
  | 'heic'
  | 'bmp'
  | 'tiff'
  | 'pdf'
  | 'psd'
  | 'mp4';

interface ImgproxyModifiers extends Omit<ImageModifiers, 'fit' | 'format' | 'background' | 'width' | 'height'> {
  width?: number;
  height?: number;
  format?: ImgproxyFormat;
  fit?: Extract<ImageFit, 'cover' | 'contain' | 'fill' | 'inside' | 'outside'>;
  resizingType?: ImgproxyResizingType;
  resize?: string;
  size?: string;
  minWidth?: number;
  minHeight?: number;
  zoom?: string | number;
  dpr?: number;
  enlarge?: boolean | string | number;
  extend?: boolean | string | number;
  extendAspectRatio?: string;
  gravity?: ImgproxyGravityType | string;
  crop?: ImgproxyCrop;
  autoRotate?: boolean | string | number;
  rotate?: number;
  background?: string;
  sharpen?: number;
  pixelate?: number;
  stripMetadata?: boolean | string | number;
  keepCopyright?: boolean | string | number;
  stripColorProfile?: boolean | string | number;
  enforceThumbnail?: boolean | string | number;
  maxBytes?: number;
  raw?: boolean | string | number;
  cachebuster?: string;
  expires?: number;
  filename?: string;
  returnAttachment?: boolean | string | number;
  preset?: string;
  maxSrcResolution?: number;
  maxSrcFileSize?: number;
  maxAnimationFrames?: number;
  maxAnimationFrameResolution?: string;
  maxResultDimension?: string;
}

interface ImgproxyOptions {
  baseURL: string;
  key?: string;
  salt?: string;
  modifiers?: Partial<ImgproxyModifiers>;
}

type DefinedModifierValue = Exclude<ModifierValue, undefined | null>;

const booleanMap = (value: DefinedModifierValue): number => {
  if (typeof value === 'boolean') {
    return value ? 1 : 0;
  }
  switch (value) {
    case 't':
    case 1:
    case 'true':
      return 1;
    default:
      return 0;
  }
};

const operationsGenerator = createOperationsGenerator<string, DefinedModifierValue, string, ModifierValue>({
  keyMap: {
    resize: 'rs',
    size: 's',
    resizingType: 'rt',
    width: 'w',
    height: 'h',
    minWidth: 'mw',
    minHeight: 'mh',
    zoom: 'z',
    dpr: 'dpr',
    enlarge: 'el',
    extend: 'ex',
    extendAspectRatio: 'exar',
    gravity: 'g',
    crop: 'c',
    autoRotate: 'ar',
    rotate: 'rot',
    background: 'bg',
    blur: 'bl',
    sharpen: 'sh',
    pixelate: 'pix',
    stripMetadata: 'sm',
    keepCopyright: 'kcr',
    stripColorProfile: 'scp',
    enforceThumbnail: 'eth',
    quality: 'q',
    maxBytes: 'mb',
    format: 'f',
    raw: 'raw',
    cachebuster: 'cb',
    expires: 'exp',
    filename: 'fn',
    returnAttachment: 'att',
    preset: 'pr',
    maxSrcResolution: 'msr',
    maxSrcFileSize: 'msfs',
    maxAnimationFrames: 'maf',
    maxAnimationFrameResolution: 'mafr',
    maxResultDimension: 'mrd'
  },
  valueMap: {
    crop: (value) => {
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        const crop = value as unknown as ImgproxyCrop;
        return `${crop.width}:${crop.height}${crop.gravity ? `:${crop.gravity}` : ''}`;
      }
      return value;
    },
    enlarge: booleanMap,
    extend: booleanMap,
    autoRotate: booleanMap,
    stripMetadata: booleanMap,
    keepCopyright: booleanMap,
    stripColorProfile: booleanMap,
    enforceThumbnail: booleanMap,
    raw: booleanMap,
    returnAttachment: booleanMap,
    rotate: (value) => {
      if (typeof value !== 'number' || !Number.isFinite(value)) {
        return value;
      }
      const normalized = ((value % 360) + 360) % 360;
      return normalized - (normalized % 90);
    }
  },
  formatter: (key, value) => `${key}:${value}`,
  joinWith: '/'
});

function hexToBytes(hex: string, label = 'signing key/salt'): Uint8Array {
  if (hex.length === 0 || hex.length % 2 !== 0 || !/^[\da-f]+$/i.test(hex)) {
    throw new Error(`Invalid hex string for ${label}: must be non-empty, even-length hex`);
  }
  const bytes = new Uint8Array(hex.length / 2);
  for (let index = 0; index < hex.length; index += 2) {
    bytes[index / 2] = Number.parseInt(hex.slice(index, index + 2), 16);
  }
  return bytes;
}

function urlSafeBase64(input: string | Uint8Array): string {
  const bytes = typeof input === 'string' ? new TextEncoder().encode(input) : input;
  let binary = '';
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

function sign(salt: string | undefined, target: string, secret: string | undefined): string {
  if (!secret || !salt) {
    return 'unsafe';
  }
  const signature = hmac.create(sha256, hexToBytes(secret, 'signing key'));
  signature.update(hexToBytes(salt, 'signing salt'));
  signature.update(new TextEncoder().encode(target));
  return urlSafeBase64(signature.digest());
}

function resolveModifiers(modifiers: Partial<ImgproxyModifiers>): Partial<ImgproxyModifiers> {
  if (modifiers.fit) {
    const hasWidth = typeof modifiers.width === 'number' && modifiers.width > 0;
    const hasHeight = typeof modifiers.height === 'number' && modifiers.height > 0;
    const hasBoth = hasWidth && hasHeight;

    switch (modifiers.fit) {
      case 'cover':
        modifiers.resizingType = hasBoth ? 'fill' : 'fit';
        break;
      case 'contain':
        modifiers.resizingType = 'fit';
        if (hasBoth) {
          modifiers.extend = true;
        }
        break;
      case 'fill':
        modifiers.resizingType = hasBoth ? 'force' : 'fit';
        break;
      case 'inside':
        modifiers.resizingType = 'fit';
        break;
      case 'outside':
        modifiers.resizingType = hasBoth ? 'fill' : 'fit';
        break;
    }
    delete modifiers.fit;
  }
  return modifiers;
}

const providerSetup = defineProvider<ImgproxyOptions>({
  getImage: (src, { modifiers, baseURL, key, salt }) => {
    const resolvedModifiers = resolveModifiers({ ...modifiers });
    const encodedUrl = urlSafeBase64(src);
    const path = joinURL(
      '/',
      operationsGenerator(resolvedModifiers as Record<string, DefinedModifierValue>),
      encodedUrl
    );
    const signature = sign(salt, path, key);

    return {
      url: joinURL(baseURL, signature, path)
    };
  }
});

export type ImgproxyProviderOptions = Partial<ProviderOptionsOf<typeof providerSetup>>;

export function imgproxyProvider(options: ImgproxyProviderOptions = {}) {
  return configureProvider(providerSetup, options, 'imgproxy');
}

export default providerSetup;
