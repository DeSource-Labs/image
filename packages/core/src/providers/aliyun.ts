import { joinURL, encodePath } from 'ufo';
import { createOperationsGenerator } from '../utils.js';
import { configureProvider, defineProvider, type ProviderOptionsOf } from '../provider-utils.js';

const operationsGenerator = createOperationsGenerator({
  joinWith: '/',
  formatter: (key: string | number, value: string | number | ReturnType<typeof getResizeValue>) => {
    if (typeof value === 'object') {
      return `${key},${encodePath(
        Object.entries(value)
          .map(([k, v]) => `${k}_${v}`)
          .join(',')
      )}`;
    }
    return encodePath(`${key},${value}`);
  }
});

interface AliyunOptions {
  baseURL?: string;
  modifiers?: {
    resize?: { w: number } | { h: number } | { fw: number; fh: number };
    quality?: '';
  };
}

function getResizeValue(height?: number, width?: number) {
  if (width && height) {
    return { fw: width, fh: height };
  } else if (width) {
    return { w: width };
  } else if (height) {
    return { h: height };
  }
}

const providerSetup = defineProvider<AliyunOptions>({
  getImage: (src, { modifiers, baseURL }) => {
    if (!baseURL) {
      // also support runtime config
      baseURL = '/';
    }
    const _modifiers = { ...modifiers };
    const { resize, width, height, quality } = _modifiers;

    const resizeValue = getResizeValue(Number(height) || undefined, Number(width) || undefined);
    if (!resize && resizeValue) {
      _modifiers.resize = resizeValue;
    }
    delete _modifiers.width;
    delete _modifiers.height;

    if (quality) {
      _modifiers.quality = `Q_${quality}`;
    }

    const operations = operationsGenerator(_modifiers);
    return {
      url: joinURL(baseURL, src + (operations ? '?image_process=' + operations : ''))
    };
  }
});

export type AliyunProviderOptions = Partial<ProviderOptionsOf<typeof providerSetup>>;

export function aliyunProvider(options: AliyunProviderOptions = {}) {
  return configureProvider(providerSetup, options, 'aliyun');
}

export default providerSetup;
