import { TestBed } from '@angular/core/testing';
import { afterEach, describe, expect, it } from 'vitest';
import { imageComponentTestConfig } from '@common/test/unit/setup/image-test-provider';
import { provideDsImage } from '@lib';
import { DsImageHeadService } from '@src/ds-image-head.service';

const providers = () => [provideDsImage(imageComponentTestConfig)];

describe('DsImageHeadService', () => {
  afterEach(() => {
    TestBed.resetTestingModule();
    document.head.querySelectorAll('[data-ds-image-preload]').forEach((node) => node.remove());
  });

  it('reference-counts identical preload links and preserves distinct variants', () => {
    TestBed.configureTestingModule({ providers: providers() });
    const head = TestBed.inject(DsImageHeadService);
    const attrs = { rel: 'preload' as const, as: 'image' as const, href: '/photo.jpg' };
    const first = head.add(attrs, { crossorigin: 'anonymous' });
    const second = head.add(attrs, { crossorigin: 'anonymous' });
    const variant = head.add(attrs, { nonce: 'different' });

    expect(document.head.querySelectorAll('[data-ds-image-preload]')).toHaveLength(2);
    first();
    expect(document.head.querySelectorAll('[data-ds-image-preload]')).toHaveLength(2);
    second();
    expect(document.head.querySelectorAll('[data-ds-image-preload]')).toHaveLength(1);
    variant();
    expect(document.head.querySelectorAll('[data-ds-image-preload]')).toHaveLength(0);
  });
});
