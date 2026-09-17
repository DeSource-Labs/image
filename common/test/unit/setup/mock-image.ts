import { vi } from 'vitest';

export interface MockImageInstance {
  src: string;
  srcset: string;
  sizes: string;
  crossOrigin: string | null;
  complete: boolean;
  naturalWidth: number;
  onload: ((event: Event) => void) | null;
  onerror: ((event: Event | string) => void) | null;
  decode: (() => Promise<void>) | undefined;
}

export interface MockImageController {
  images: MockImageInstance[];
  flush(): Promise<void>;
  restore(): void;
}

export function installMockImage(
  options: { decode?: (() => Promise<void>) | false; complete?: boolean; naturalWidth?: number } = {}
): MockImageController {
  const originalImage = globalThis.Image;
  const images: MockImageInstance[] = [];
  const decodeImage = typeof options.decode === 'function' ? options.decode : async () => undefined;

  class MockImage {
    src = '';
    srcset = '';
    sizes = '';
    crossOrigin: string | null = null;
    complete = options.complete ?? false;
    naturalWidth = options.naturalWidth ?? 0;
    onload: ((event: Event) => void) | null = null;
    onerror: ((event: Event | string) => void) | null = null;
    decode = options.decode === false ? undefined : vi.fn(decodeImage);

    constructor() {
      images.push(this);
    }
  }

  globalThis.Image = MockImage as unknown as typeof Image;

  return {
    images,
    async flush() {
      await Promise.resolve();
      await Promise.resolve();
      await Promise.resolve();
    },
    restore() {
      globalThis.Image = originalImage;
    }
  };
}
