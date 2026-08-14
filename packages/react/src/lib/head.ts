import { useEffect } from 'react';
import * as ReactDOM from 'react-dom';
import type { ImagePreloadLink } from '@desource/image';

interface PreloadOptions {
  crossorigin?: string;
  nonce?: string;
}

const preloadEntries = new Map<string, { link: HTMLLinkElement; references: number }>();

export function addImagePreloadLink(attrs: ImagePreloadLink, options: PreloadOptions = {}): () => void {
  if (typeof document === 'undefined') return () => undefined;

  const key = preloadKey(attrs, options);
  let entry = preloadEntries.get(key);

  if (!entry) {
    const selector = `link[data-ds-image-preload-key="${escapeSelector(key)}"]`;
    const link =
      document.head.querySelector<HTMLLinkElement>(selector) ??
      findExistingPreload(attrs) ??
      document.createElement('link');
    link.dataset['dsImagePreload'] = attrs.href;
    link.dataset['dsImagePreloadKey'] = key;
    entry = { link, references: 0 };
    preloadEntries.set(key, entry);
  }

  entry.references += 1;
  setAttribute(entry.link, 'rel', attrs.rel);
  setAttribute(entry.link, 'as', attrs.as);
  setAttribute(entry.link, 'href', attrs.href);
  setAttribute(entry.link, 'imagesrcset', attrs.imagesrcset);
  setAttribute(entry.link, 'imagesizes', attrs.imagesizes);
  setAttribute(entry.link, 'fetchpriority', attrs.fetchpriority);
  setAttribute(entry.link, 'crossorigin', options.crossorigin);
  setAttribute(entry.link, 'nonce', options.nonce);
  if (!entry.link.parentNode) document.head.appendChild(entry.link);

  return () => {
    const current = preloadEntries.get(key);
    if (!current) return;
    current.references -= 1;
    if (current.references > 0) return;
    current.link.remove();
    preloadEntries.delete(key);
  };
}

export function useHeadPreload(
  attrs: ImagePreloadLink | undefined,
  options: PreloadOptions,
  enabled: boolean | undefined
): void {
  const key = attrs && enabled ? preloadKey(attrs, options) : '';
  const crossorigin = options.crossorigin;
  const nonce = options.nonce;
  if (attrs && enabled && typeof document === 'undefined') preloadImageResource(attrs, options);

  useEffect(() => {
    if (!attrs || !enabled) return undefined;
    return addImagePreloadLink(attrs, { crossorigin, nonce });
  }, [attrs, crossorigin, enabled, key, nonce]);
}

export function preloadImageResource(attrs: ImagePreloadLink, options: PreloadOptions = {}): void {
  const preload = (ReactDOM as unknown as { preload?: (href: string, options?: Record<string, unknown>) => void })
    .preload;
  preload?.(
    attrs.href,
    stripUndefined({
      as: attrs.as,
      imageSrcSet: attrs.imagesrcset,
      imageSizes: attrs.imagesizes,
      fetchPriority: attrs.fetchpriority,
      crossOrigin: options.crossorigin,
      nonce: options.nonce
    })
  );
}

function preloadKey(attrs: ImagePreloadLink, options: PreloadOptions): string {
  return encodeURIComponent(
    JSON.stringify([
      attrs.href,
      attrs.imagesrcset,
      attrs.imagesizes,
      attrs.fetchpriority,
      options.crossorigin,
      options.nonce
    ])
  );
}

function setAttribute(element: HTMLElement, name: string, value: string | undefined): void {
  if (value === undefined) element.removeAttribute(name);
  else element.setAttribute(name, value);
}

function findExistingPreload(attrs: ImagePreloadLink): HTMLLinkElement | undefined {
  for (const link of document.head.querySelectorAll<HTMLLinkElement>('link[rel="preload"][as="image"]')) {
    if (link.getAttribute('href') === attrs.href) {
      return link;
    }
  }
  return undefined;
}

function escapeSelector(value: string): string {
  return value.replace(/["\\]/g, '\\$&');
}

function stripUndefined<T extends Record<string, unknown>>(value: T): T {
  return Object.fromEntries(Object.entries(value).filter(([, entry]) => entry !== undefined)) as T;
}
