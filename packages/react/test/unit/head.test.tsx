// @vitest-environment jsdom

import { afterEach, describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { addDsImagePreloadLink, preloadImageResource, useHeadPreload } from '@src/head';

afterEach(() => {
  document.head.querySelectorAll('link[rel="preload"][as="image"]').forEach((node) => node.remove());
});

describe('React image head helpers', () => {
  it('reference-counts matching preload links', () => {
    const attrs = {
      rel: 'preload' as const,
      as: 'image' as const,
      href: '/hero.jpg',
      imagesrcset: '/hero.jpg 1x',
      imagesizes: '100vw',
      fetchpriority: 'high' as const
    };
    const first = addDsImagePreloadLink(attrs, { crossorigin: 'anonymous', nonce: 'nonce' });
    const second = addDsImagePreloadLink(attrs, { crossorigin: 'anonymous', nonce: 'nonce' });

    const links = document.head.querySelectorAll('link[rel="preload"][as="image"]');
    expect(links).toHaveLength(1);
    expect(links[0]!.getAttribute('imagesrcset')).toBe('/hero.jpg 1x');
    expect(links[0]!.getAttribute('nonce')).toBe('nonce');

    first();
    expect(document.head.querySelectorAll('link[rel="preload"][as="image"]')).toHaveLength(1);
    second();
    expect(document.head.querySelectorAll('link[rel="preload"][as="image"]')).toHaveLength(0);
  });

  it('reuses an equivalent preload link created by React DOM resource hints', () => {
    const existing = document.createElement('link');
    existing.setAttribute('rel', 'preload');
    existing.setAttribute('as', 'image');
    existing.setAttribute('href', '/existing.jpg');
    document.head.append(existing);

    const cleanup = addDsImagePreloadLink({ rel: 'preload', as: 'image', href: '/existing.jpg' });
    expect(document.head.querySelectorAll('link[rel="preload"][as="image"]')).toHaveLength(1);
    cleanup();
  });

  it('delegates to React DOM preload when the runtime supports resource hints', () => {
    expect(() => preloadImageResource({ rel: 'preload', as: 'image', href: '/resource.jpg' })).not.toThrow();
  });

  it('noops when no document exists', () => {
    const originalDocument = globalThis.document;
    Object.defineProperty(globalThis, 'document', { configurable: true, value: undefined });

    try {
      const cleanup = addDsImagePreloadLink({ rel: 'preload', as: 'image', href: '/server.jpg' });
      expect(() => cleanup()).not.toThrow();
    } finally {
      Object.defineProperty(globalThis, 'document', { configurable: true, value: originalDocument });
    }
  });

  it('uses React resource hints during server rendering', () => {
    const originalDocument = globalThis.document;
    Object.defineProperty(globalThis, 'document', { configurable: true, value: undefined });

    function Probe() {
      useHeadPreload({ rel: 'preload', as: 'image', href: '/ssr.jpg' }, {}, true);
      return null;
    }

    try {
      expect(renderToStaticMarkup(<Probe />)).toContain('rel="preload"');
    } finally {
      Object.defineProperty(globalThis, 'document', { configurable: true, value: originalDocument });
    }
  });

  it('allows cleanup after a preload entry was already removed', () => {
    const cleanup = addDsImagePreloadLink({ rel: 'preload', as: 'image', href: '/double-cleanup.jpg' });
    cleanup();
    expect(() => cleanup()).not.toThrow();
  });
});
