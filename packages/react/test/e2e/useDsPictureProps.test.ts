import { testDsPictureBinding } from '@common/test/e2e/DsPicture';

testDsPictureBinding({
  name: 'useDsPictureProps',
  heading: 'Optimized images for React and Next.js.',
  pictureSelector: '[data-testid="picture-hook"]',
  widthControlTestId: 'width',
  widthValueTestId: 'width-value',
  sourceType: 'image/avif',
  imageMarker: 'data-ds-picture-img',
  fallbackSrc: /s_720x540/,
  updatedFallbackSrc: /s_880x540/
});
