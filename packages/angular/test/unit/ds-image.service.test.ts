import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { defineProvider } from '@desource/image';
import { DsImageService, provideDsImage } from '../../src/public-api.js';

describe('DsImageService', () => {
  beforeEach(() => TestBed.resetTestingModule());

  it('resolves provider setup once per injector and returns the shared image helper', () => {
    const setup = vi.fn(
      defineProvider({
        getImage(src, { modifiers }) {
          return { url: `${src}?width=${modifiers.width ?? ''}` };
        }
      })
    );

    TestBed.configureTestingModule({
      providers: [provideDsImage({ provider: 'setup', providers: { setup } })]
    });

    const service = TestBed.inject(DsImageService);
    expect(service.create()).toBe(service.create());
    expect(service.create()('/service.jpg', { width: 320 })).toContain('width=320');
    expect(setup).toHaveBeenCalledOnce();
  });
});
