import { testDsPictureBinding } from '@common/test/e2e/DsPicture';

testDsPictureBinding({
  name: 'DsPictureDirective',
  heading: 'Optimized images across four Angular surfaces.',
  pictureSelector: '[data-testid="picture-directive"]',
  widthControlTestId: 'width',
  widthValueTestId: 'width-value',
  sourceType: 'image/webp',
  imageMarker: 'data-ds-picture-img',
  fallbackSrc: /hero\.jpg\?w=720&h=540&fm=jpeg/,
  updatedFallbackSrc: /hero\.jpg\?w=880&h=540&fm=jpeg/
});
