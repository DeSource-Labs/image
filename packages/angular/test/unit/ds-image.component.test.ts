import { TestBed, type ComponentFixture } from '@angular/core/testing';
import { afterEach, vi } from 'vitest';
import { testImageComponent, type ImageComponentSetupOptions } from '../../../../common/test/unit/Image';
import { imageComponentTestConfig } from '../../../../common/test/unit/setup/image-test-provider';
import { DsImageComponent, provideDsImage } from '../../src/public-api.js';

const imageInputNames = {
  src: 'src',
  alt: 'alt',
  width: 'width',
  height: 'height',
  sizes: 'sizes',
  quality: 'quality',
  format: 'format',
  fit: 'fit',
  position: 'position',
  background: 'background',
  modifiers: 'modifiers',
  provider: 'provider',
  preset: 'preset',
  densities: 'densities',
  loading: 'loading',
  decoding: 'decoding',
  fetchpriority: 'fetchpriority',
  priority: 'priority',
  preload: 'preload',
  placeholder: 'placeholder',
  placeholderClass: 'placeholderClass',
  crossorigin: 'crossorigin',
  nonce: 'nonce',
  className: 'class',
  style: 'style',
  id: 'id',
  role: 'role',
  ariaLabel: 'aria-label',
  ariaDescribedby: 'aria-describedby',
  referrerpolicy: 'referrerpolicy',
  usemap: 'usemap',
  dataTestId: 'data-testid',
  nativeAttrs: 'nativeAttrs'
} satisfies Record<keyof ImageComponentSetupOptions, string>;

afterEach(() => {
  TestBed.resetTestingModule();
  document.head.querySelectorAll('[data-ds-image-preload]').forEach((node) => node.remove());
});

testImageComponent(async (options = {}) => {
  TestBed.configureTestingModule({
    imports: [DsImageComponent],
    providers: [provideDsImage(imageComponentTestConfig)]
  });

  const fixture = TestBed.createComponent(DsImageComponent);
  const onLoad = vi.fn();
  const onError = vi.fn();
  const loadSubscription = fixture.componentInstance.load.subscribe(onLoad);
  const errorSubscription = fixture.componentInstance.error.subscribe(onError);

  setInputs(fixture, { src: '/image.jpg', alt: 'Image', ...options });
  await settle(fixture);

  return {
    container: fixture.nativeElement as Element,
    image: () => requireElement<HTMLImageElement>(fixture.nativeElement, 'img'),
    preloadLinks: () => Array.from(document.head.querySelectorAll<HTMLLinkElement>('link[data-ds-image-preload]')),
    async update(nextOptions) {
      setInputs(fixture, nextOptions);
      await settle(fixture);
    },
    async flush() {
      await settle(fixture);
    },
    unmount() {
      loadSubscription.unsubscribe();
      errorSubscription.unsubscribe();
      fixture.destroy();
    },
    onLoad,
    onError
  };
});

function setInputs(fixture: ComponentFixture<DsImageComponent>, options: Partial<ImageComponentSetupOptions>): void {
  for (const key of Object.keys(options) as (keyof ImageComponentSetupOptions)[]) {
    fixture.componentRef.setInput(imageInputNames[key], options[key]);
  }
}

async function settle(fixture: ComponentFixture<DsImageComponent>): Promise<void> {
  await Promise.resolve();
  await Promise.resolve();
  await fixture.whenStable();
}

function requireElement<T extends Element>(container: ParentNode, selector: string): T {
  const element = container.querySelector<T>(selector);
  if (!element) {
    throw new Error(`Expected ${selector} to be rendered.`);
  }
  return element;
}
