import { describe, expect, it, vi } from 'vitest';
import { imageComponentTestConfig } from '@common/test/unit/setup/image-test-provider';
import {
  createDsImageBindings,
  getDsImageProps,
  getDsPictureProps,
  splitDsPictureAttributes,
  toDsImageInput
} from '@src/hooks';
import type { DsNativeImageAttrs } from '@src/types';

describe('React binding helpers', () => {
  it('creates generated image and picture props from one explicit config', () => {
    const bindings = createDsImageBindings(imageComponentTestConfig);
    const image = bindings.getDsImageProps({
      src: '/avatar.jpg',
      alt: 'Avatar',
      width: 96,
      format: 'webp',
      className: 'avatar',
      attrs: { className: 'rounded', src: '/ignored.jpg', title: 'Ada' } as unknown as DsNativeImageAttrs
    });
    const picture = bindings.getDsPictureProps({
      src: '/card.jpg',
      alt: 'Card',
      width: 320,
      formats: ['avif'],
      fallbackFormat: 'jpg',
      imgAttrs: { className: 'card-img' },
      pictureAttrs: { className: 'card-picture' }
    });

    expect(image.src).toContain('/avatar.jpg');
    expect(image.src).toContain('format=webp');
    expect(image.className).toBe('rounded avatar');
    expect(image.title).toBe('Ada');
    expect(picture.pictureProps.className).toBe('card-picture');
    expect(picture.sources).toHaveLength(1);
    expect(picture.imgProps.className).toBe('card-img');
    expect(String(picture.imgProps.src)).toContain('format=jpg');
  });

  it('keeps generated attrs authoritative over native attrs', () => {
    const image = getDsImageProps({
      src: '/authoritative.jpg',
      alt: 'Authoritative',
      width: 640,
      config: imageComponentTestConfig,
      attrs: {
        src: '/wrong.jpg',
        srcSet: '/wrong.jpg 1x',
        sizes: '1px',
        alt: 'Wrong',
        width: 1,
        height: 1,
        fetchPriority: 'low'
      } as unknown as DsNativeImageAttrs
    });

    expect(image.src).toContain('/authoritative.jpg');
    expect(image.alt).toBe('Authoritative');
    expect(image.width).toBe(640);
    expect(image.sizes).not.toBe('1px');
  });

  it('splits picture convenience attrs and normalizes input aliases', () => {
    const distributed = splitDsPictureAttributes({
      id: 'picture',
      referrerPolicy: 'no-referrer',
      useMap: '#map',
      role: 'group'
    });
    const input = toDsImageInput({
      src: '/image.jpg',
      alt: 'Image',
      width: '320',
      fetchPriority: 'high',
      onLoad: vi.fn()
    });

    expect(distributed.pictureAttrs).toEqual({ id: 'picture', role: 'group' });
    expect(distributed.imgAttrs).toEqual({ referrerPolicy: 'no-referrer', useMap: '#map' });
    expect(input.fetchpriority).toBe('high');
  });

  it('hides picture sources while a placeholder is rendered', () => {
    const picture = getDsPictureProps(
      {
        src: '/placeholder.jpg',
        alt: 'Placeholder',
        width: 640,
        formats: ['avif', 'webp'],
        placeholder: true,
        placeholderClass: 'blur',
        config: imageComponentTestConfig
      },
      false
    );

    expect(picture.sources).toHaveLength(0);
    expect(String(picture.imgProps.src)).toContain('width=10');
    expect(picture.imgProps.className).toBe('blur');
  });
});
