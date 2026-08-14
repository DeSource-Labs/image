import { createElement, type CSSProperties, type ReactElement } from 'react';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { vi, type Mock } from 'vitest';
import { imageComponentTestConfig } from '@common/test/unit/setup/image-test-provider';
import { ImageProvider, type ImageComponentProps, type PictureComponentProps } from '@lib';
import type { ImageComponentSetupOptions } from '@common/test/unit/Image';
import type { PictureComponentSetupOptions } from '@common/test/unit/Picture';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

export function requireElement<T extends Element>(
  container: { querySelector<E extends Element = Element>(selectors: string): E | null },
  selector: string
): T {
  const element = container.querySelector<T>(selector);
  if (!element) throw new Error(`Expected ${selector} to exist.`);
  return element;
}

export async function flushReact(): Promise<void> {
  await act(async () => {
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
  await act(async () => {
    root.render(createElement(ImageProvider, { config: imageComponentTestConfig }, element));
  });
}

export function cleanupDocument(): void {
  document.body.replaceChildren();
  document.head.querySelectorAll('link[rel="preload"][as="image"]').forEach((node) => node.remove());
}

export function imagePropsFromOptions(options: ImageComponentSetupOptions): ImageComponentProps {
  const { nativeAttrs = {}, ...rest } = options;
  return {
    src: rest.src ?? '/image.jpg',
    alt: rest.alt ?? 'Image',
    width: rest.width,
    height: rest.height,
    sizes: rest.sizes,
    quality: rest.quality,
    format: rest.format,
    fit: rest.fit,
    position: rest.position,
    background: rest.background,
    modifiers: rest.modifiers,
    provider: rest.provider,
    preset: rest.preset,
    densities: rest.densities,
    loading: rest.loading,
    decoding: rest.decoding,
    fetchPriority: rest.fetchpriority,
    priority: rest.priority,
    preload: rest.preload,
    placeholder: rest.placeholder,
    placeholderClass: rest.placeholderClass,
    crossOrigin: rest.crossorigin,
    nonce: rest.nonce,
    className: rest.className,
    style: cssStyle(rest.style),
    id: rest.id,
    role: rest.role,
    'aria-label': rest.ariaLabel,
    'aria-describedby': rest.ariaDescribedby,
    referrerPolicy: rest.referrerpolicy as ImageComponentProps['referrerPolicy'],
    useMap: rest.usemap,
    'data-testid': rest.dataTestId,
    ...nativeAttrs
  } as ImageComponentProps;
}

export function picturePropsFromOptions(options: PictureComponentSetupOptions): PictureComponentProps {
  const { imgAttrs = {}, ...rest } = options;
  return {
    src: rest.src ?? '/picture.jpg',
    alt: rest.alt ?? 'Picture',
    width: rest.width,
    height: rest.height,
    sizes: rest.sizes,
    quality: rest.quality,
    format: rest.format,
    formats: rest.formats,
    fallbackFormat: rest.fallbackFormat,
    legacyFormat: rest.legacyFormat,
    fit: rest.fit,
    position: rest.position,
    background: rest.background,
    modifiers: rest.modifiers,
    provider: rest.provider,
    preset: rest.preset,
    densities: rest.densities,
    loading: rest.loading,
    decoding: rest.decoding,
    fetchPriority: rest.fetchpriority,
    priority: rest.priority,
    preload: rest.preload,
    placeholder: rest.placeholder,
    placeholderClass: rest.placeholderClass,
    crossOrigin: rest.crossorigin,
    nonce: rest.nonce,
    className: rest.className,
    style: cssStyle(rest.style),
    id: rest.id,
    role: rest.role,
    'aria-label': rest.ariaLabel,
    'data-testid': rest.dataTestId,
    imgClassName: rest.imgClassName,
    imgStyle: cssStyle(rest.imgStyle),
    referrerPolicy: rest.referrerpolicy as PictureComponentProps['referrerPolicy'],
    useMap: rest.usemap,
    imgAttrs: {
      ...imgAttrs
    }
  } as PictureComponentProps;
}

export function createEventMocks(): { onLoad: Mock; onError: Mock } {
  return {
    onLoad: vi.fn(),
    onError: vi.fn()
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
