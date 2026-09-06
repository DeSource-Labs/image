import { createElement, createRef, type CSSProperties, type ReactElement, type Ref } from 'react';
import { act as reactAct } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { renderToStaticMarkup } from 'react-dom/server';
import { vi, type Mock } from 'vitest';
import { imageComponentTestConfig } from '@common/test/unit/setup/image-test-provider';
import type { TestTools } from '@common/test/unit/setup/tools';
import { pickImageInput } from '@desource/image/kit';
import { DsImageProvider, type DsImageComponentProps, type DsPictureComponentProps } from '@lib';
import type { DsImageComponentSetupOptions } from '@common/test/unit/DsImage';
import type { DsPictureComponentSetupOptions } from '@common/test/unit/DsPicture';

export const testTools: TestTools = {
  async act(callback) {
    await reactAct(callback);
  }
};

export function requireElement<T extends Element>(
  container: { querySelector<E extends Element = Element>(selectors: string): E | null },
  selector: string
): T {
  const element = container.querySelector<T>(selector);
  if (!element) throw new Error(`Expected ${selector} to exist.`);
  return element;
}

export async function flushReact(): Promise<void> {
  await reactAct(async () => {
    await Promise.resolve();
    await Promise.resolve();
    await Promise.resolve();
  });
}

export function createReactRoot() {
  const target = document.createElement('div');
  document.body.append(target);
  const root = createRoot(target);
  return { target, root };
}

export async function renderReact(root: Root, element: ReactElement): Promise<void> {
  await reactAct(async () => {
    root.render(createElement(DsImageProvider, { config: imageComponentTestConfig }, element));
  });
}

export function renderConfiguredMarkup(element: ReactElement): string {
  return renderToStaticMarkup(createElement(DsImageProvider, { config: imageComponentTestConfig }, element));
}

export async function createReactHarness<TOptions extends object>(
  initialOptions: TOptions,
  createComponent: (options: TOptions, events: ReturnType<typeof createEventMocks>) => ReactElement
) {
  const { target, root } = createReactRoot();
  const events = createEventMocks();
  let current = initialOptions;
  const paint = () => renderReact(root, createComponent(current, events));

  await paint();
  await flushReact();

  return {
    container: target,
    preloadLinks: () => Array.from(document.head.querySelectorAll<HTMLLinkElement>('link[rel="preload"][as="image"]')),
    async update(nextOptions: Partial<TOptions>) {
      current = { ...current, ...nextOptions };
      await paint();
      await flushReact();
    },
    flush: flushReact,
    async unmount() {
      await reactAct(async () => root.unmount());
      target.remove();
    },
    onLoad: events.onLoad,
    onError: events.onError
  };
}

export async function withRenderedRef<T extends Element>(
  selector: string,
  createComponent: (ref: Ref<T>) => ReactElement,
  inspect: (ref: T | null, element: T) => void | Promise<void>
): Promise<void> {
  const { target, root } = createReactRoot();
  const ref = createRef<T>();

  try {
    await renderReact(root, createComponent(ref));
    await inspect(ref.current, requireElement<T>(target, selector));
  } finally {
    await reactAct(async () => root.unmount());
    target.remove();
  }
}

export function cleanupDocument(): void {
  document.body.replaceChildren();
  document.head.querySelectorAll('link[rel="preload"][as="image"]').forEach((node) => node.remove());
}

export function dsImagePropsFromOptions(options: DsImageComponentSetupOptions): DsImageComponentProps {
  const { nativeAttrs = {}, ...rest } = options;
  return {
    ...sharedPropsFromOptions(rest, '/image.jpg', 'Image'),
    'aria-describedby': rest.ariaDescribedby,
    ...nativeAttrs
  } as DsImageComponentProps;
}

export function dsPicturePropsFromOptions(options: DsPictureComponentSetupOptions): DsPictureComponentProps {
  const { imgAttrs = {}, ...rest } = options;
  return {
    ...sharedPropsFromOptions(rest, '/picture.jpg', 'Picture'),
    formats: rest.formats,
    fallbackFormat: rest.fallbackFormat,
    legacyFormat: rest.legacyFormat,
    imgClassName: rest.imgClassName,
    imgStyle: cssStyle(rest.imgStyle),
    imgAttrs: {
      ...imgAttrs
    }
  } as DsPictureComponentProps;
}

export function createEventMocks(): { onLoad: Mock; onError: Mock } {
  return {
    onLoad: vi.fn(),
    onError: vi.fn()
  };
}

function sharedPropsFromOptions(
  options: DsImageComponentSetupOptions | DsPictureComponentSetupOptions,
  defaultSrc: string,
  defaultAlt: string
): Record<string, unknown> & { src: string; alt: string } {
  const imageInput = pickImageInput({
    ...options,
    src: options.src ?? defaultSrc,
    alt: options.alt ?? defaultAlt
  });

  return {
    ...imageInput,
    src: options.src ?? defaultSrc,
    alt: options.alt ?? defaultAlt,
    fetchPriority: imageInput.fetchpriority,
    crossOrigin: options.crossorigin,
    nonce: options.nonce,
    className: options.className,
    style: cssStyle(options.style),
    id: options.id,
    role: options.role,
    'aria-label': options.ariaLabel,
    referrerPolicy: options.referrerpolicy,
    useMap: options.usemap,
    'data-testid': options.dataTestId
  };
}

function cssStyle(value: string | undefined): CSSProperties | undefined {
  if (!value) return undefined;
  const style: Record<string, string> = {};
  for (const declaration of value.split(';')) {
    const [rawName, rawValue] = declaration.split(':');
    const name = rawName?.trim();
    const declarationValue = rawValue?.trim();
    if (!name || !declarationValue) continue;
    style[name.replace(/-([a-z])/g, (_, letter: string) => letter.toUpperCase())] = declarationValue;
  }
  return style;
}
