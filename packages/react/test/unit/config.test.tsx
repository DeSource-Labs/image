// @vitest-environment jsdom

import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { describe, expect, it } from 'vitest';
import { imageComponentTestConfig } from '@common/test/unit/setup/image-test-provider';
import {
  ImageProvider,
  createImageConfig,
  getDefaultImageConfig,
  imageForConfig,
  resolveCachedConfig,
  useImage,
  useImageConfig
} from '@lib';

describe('React image config', () => {
  it('caches resolved configs and callable helpers by object identity', () => {
    const input = { ...imageComponentTestConfig };
    const first = createImageConfig(input);
    const second = resolveCachedConfig(input);

    expect(first).toBe(second);
    expect(resolveCachedConfig(first)).toBe(first);
    expect(resolveCachedConfig(undefined)).toBe(getDefaultImageConfig());
    expect(imageForConfig(first)).toBe(imageForConfig(first));
    expect(getDefaultImageConfig().provider).toBe('ipx');
  });

  it('provides config and callable image helper through React context', async () => {
    const target = document.createElement('div');
    document.body.append(target);
    const root = createRoot(target);

    function Probe() {
      const config = useImageConfig();
      const image = useImage();
      return <span data-provider={config.provider}>{image('/probe.jpg', { width: 320 })}</span>;
    }

    await act(async () => {
      root.render(
        <ImageProvider config={imageComponentTestConfig}>
          <Probe />
        </ImageProvider>
      );
    });

    try {
      const span = target.querySelector('span');
      expect(span?.dataset['provider']).toBe('test');
      expect(span?.textContent).toContain('width=320');
    } finally {
      await act(async () => root.unmount());
      target.remove();
    }
  });

  it('allows hooks to use an explicit config without a provider', async () => {
    const target = document.createElement('div');
    document.body.append(target);
    const root = createRoot(target);

    function Probe() {
      const config = useImageConfig(imageComponentTestConfig);
      const image = useImage(config);
      return <span data-provider={config.provider}>{image('/explicit.jpg', { width: 123 })}</span>;
    }

    await act(async () => {
      root.render(<Probe />);
    });

    try {
      const span = target.querySelector('span');
      expect(span?.dataset['provider']).toBe('test');
      expect(span?.textContent).toContain('width=123');
    } finally {
      await act(async () => root.unmount());
      target.remove();
    }
  });
});
