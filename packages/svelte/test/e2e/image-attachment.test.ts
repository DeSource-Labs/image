import { testImageBinding } from '@common/test/e2e/Image';

testImageBinding({
  name: 'imageAttachment',
  heading: 'One provider model for every Svelte surface.',
  imageSelector: '[data-testid="image-attachment"]',
  widthControlTestId: 'width',
  widthValueTestId: 'width-value',
  initialSrc: /(?=.*720)(?=.*webp)/,
  updatedSrc: /(?=.*880)(?=.*webp)/
});
