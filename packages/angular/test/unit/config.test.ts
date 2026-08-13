import { IMAGE_LOADER } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { imageComponentTestConfig } from '../../../../common/test/unit/setup/image-test-provider';
import {
  DS_IMAGE_CONFIG,
  createAngularImageLoader,
  provideDsAwsAmplifyImage,
  provideDsImage,
  provideDsIpxImage,
  provideDsVercelImage
} from '../../src/public-api.js';

const providers = () => [provideDsImage(imageComponentTestConfig)];

describe('Angular image configuration', () => {
  beforeEach(() => TestBed.resetTestingModule());

  it('provides a safe default configuration without application setup', () => {
    TestBed.configureTestingModule({});
    expect(TestBed.inject(DS_IMAGE_CONFIG).provider).toBe('ipx');
  });

  it('creates an Angular loader directly and supports flattened loader modifiers', () => {
    TestBed.configureTestingModule({ providers: providers() });
    const loader = createAngularImageLoader(TestBed.inject(DS_IMAGE_CONFIG));
    const url = loader({ src: '/direct.jpg', width: 700, loaderParams: { quality: 77, sharpen: 2 } });
    expect(url).toContain('width=700');
    expect(url).toContain('quality=77');
    expect(url).toContain('sharpen=2');
  });

  it('provides Angular IMAGE_LOADER from configured image options', () => {
    TestBed.configureTestingModule({ providers: providers() });
    const loader = TestBed.inject(IMAGE_LOADER);

    expect(loader({ src: '/native.jpg', width: 480 })).toContain('width=480');
    expect(
      loader({
        src: '/native.jpg',
        width: 480,
        isPlaceholder: true,
        loaderParams: { modifiers: { grayscale: true } }
      })
    ).toContain('blur=3');
  });

  it('exposes provider-specific convenience providers', () => {
    expect(provideDsIpxImage()).toBeTruthy();
    expect(provideDsVercelImage()).toBeTruthy();
    expect(provideDsAwsAmplifyImage()).toBeTruthy();
  });
});
