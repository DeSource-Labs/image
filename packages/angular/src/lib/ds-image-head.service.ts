import { DOCUMENT } from '@angular/common';
import { Injectable, inject } from '@angular/core';
import type { ImagePreloadLink } from '@desource/image';

@Injectable({ providedIn: 'root' })
export class DsImageHeadService {
  private readonly document = inject(DOCUMENT);
  private readonly entries = new Map<string, { link: HTMLLinkElement; references: number }>();

  add(attrs: ImagePreloadLink, options: { crossorigin?: string; nonce?: string } = {}): () => void {
    const key = preloadKey(attrs, options);
    let entry = this.entries.get(key);

    if (!entry) {
      const selector = `link[data-ds-image-preload-key="${escapeSelector(key)}"]`;
      const link = this.document.head?.querySelector<HTMLLinkElement>(selector) ?? this.document.createElement('link');
      link.dataset['dsImagePreload'] = attrs.href;
      link.dataset['dsImagePreloadKey'] = key;
      entry = { link, references: 0 };
      this.entries.set(key, entry);
    }

    entry.references += 1;
    const { link } = entry;

    setAttribute(link, 'rel', attrs.rel);
    setAttribute(link, 'as', attrs.as);
    setAttribute(link, 'href', attrs.href);
    setAttribute(link, 'imagesrcset', attrs.imagesrcset);
    setAttribute(link, 'imagesizes', attrs.imagesizes);
    setAttribute(link, 'fetchpriority', attrs.fetchpriority);
    setAttribute(link, 'crossorigin', options.crossorigin);
    setAttribute(link, 'nonce', options.nonce);
    if (!link.parentNode) this.document.head?.appendChild(link);

    return () => {
      const current = this.entries.get(key);
      if (!current) return;
      current.references -= 1;
      if (current.references > 0) return;
      current.link.remove();
      this.entries.delete(key);
    };
  }
}

function preloadKey(attrs: ImagePreloadLink, options: { crossorigin?: string; nonce?: string }): string {
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

function escapeSelector(value: string): string {
  return value.replace(/["\\]/g, String.raw`\$&`);
}
