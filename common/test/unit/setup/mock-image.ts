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
  decode: () => Promise<void>;
}

export interface MockImageController {
  images: MockImageInstance[];
  flush(): Promise<void>;
  restore(): void;
}

export function installMockImage(): MockImageController {
  const originalImage = globalThis.Image;
  const images: MockImageInstance[] = [];

  class MockImage {
    src = '';
    srcset = '';
    sizes = '';
    crossOrigin: string | null = null;
    complete = false;
    naturalWidth = 0;
    onload: ((event: Event) => void) | null = null;
    onerror: ((event: Event | string) => void) | null = null;
    decode = vi.fn(async () => undefined);

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
