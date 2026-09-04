import { testPictureBinding } from '@common/test/e2e/Picture';

testPictureBinding({
  name: 'pictureAttachment',
  heading: 'One provider model for every Svelte surface.',
  pictureSelector: '[data-testid="picture-attachment"]',
  widthControlTestId: 'width',
  widthValueTestId: 'width-value',
  sourceType: 'image/avif',
  imageMarker: 'data-ds-image',
  fallbackSrc: /s_720x540/,
  updatedFallbackSrc: /s_880x540/
});
