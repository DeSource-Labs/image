import { testPictureBinding } from '@common/test/e2e/Picture';

testPictureBinding({
  name: 'pictureAction',
  heading: 'One provider model for every Svelte surface.',
  pictureSelector: '[data-testid="picture-action"]',
  widthControlTestId: 'width',
  widthValueTestId: 'width-value',
  sourceType: 'image/webp',
  imageMarker: 'data-ds-image',
  fallbackSrc: /s_720x540/,
  updatedFallbackSrc: /s_880x540/
});
