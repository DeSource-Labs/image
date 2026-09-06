import { TestBed, type ComponentFixture } from '@angular/core/testing';
import { afterEach, vi } from 'vitest';
import { testDsPictureComponent, type DsPictureComponentSetupOptions } from '@common/test/unit/DsPicture';
import { imageComponentTestConfig } from '@common/test/unit/setup/image-test-provider';
import { DsPictureComponent, provideDsImage } from '@lib';

const pictureInputNames = {
  src: 'src',
  alt: 'alt',
  width: 'width',
  height: 'height',
  sizes: 'sizes',
  quality: 'quality',
  format: 'format',
  formats: 'formats',
  fallbackFormat: 'fallbackFormat',
  legacyFormat: 'legacyFormat',
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
  dataTestId: 'data-testid',
  imgClassName: 'imgClass',
  imgStyle: 'imgStyle',
  referrerpolicy: 'referrerpolicy',
  usemap: 'usemap',
  imgAttrs: 'imgAttrs'
} satisfies Record<keyof DsPictureComponentSetupOptions, string>;

afterEach(() => {
  TestBed.resetTestingModule();
  document.head.querySelectorAll('[data-ds-image-preload]').forEach((node) => node.remove());
});

testDsPictureComponent(async (options = {}) => {
  TestBed.configureTestingModule({
    imports: [DsPictureComponent],
    providers: [provideDsImage(imageComponentTestConfig)]
  });

  const fixture = TestBed.createComponent(DsPictureComponent);
  const onLoad = vi.fn();
  const onError = vi.fn();
  const loadSubscription = fixture.componentInstance.load.subscribe(onLoad);
  const errorSubscription = fixture.componentInstance.error.subscribe(onError);

  setInputs(fixture, { src: '/picture.jpg', alt: 'Picture', ...options });
  await settle(fixture);

  return {
    container: fixture.nativeElement as Element,
    picture: () => requireElement<HTMLPictureElement>(fixture.nativeElement, 'picture'),
    image: () => requireElement<HTMLImageElement>(fixture.nativeElement, 'picture img'),
    sources: () =>
      Array.from((fixture.nativeElement as ParentNode).querySelectorAll<HTMLSourceElement>('picture source')),
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

function setInputs(
  fixture: ComponentFixture<DsPictureComponent>,
  options: Partial<DsPictureComponentSetupOptions>
): void {
  for (const key of Object.keys(options) as (keyof DsPictureComponentSetupOptions)[]) {
    fixture.componentRef.setInput(pictureInputNames[key], options[key]);
  }
}

async function settle(fixture: ComponentFixture<DsPictureComponent>): Promise<void> {
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
