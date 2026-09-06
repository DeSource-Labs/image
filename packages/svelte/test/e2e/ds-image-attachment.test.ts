import { testDsImageBinding } from '@common/test/e2e/DsImage';

testDsImageBinding({
  name: 'dsImageAttachment',
  heading: 'One provider model for every Svelte surface.',
  imageSelector: '[data-testid="image-attachment"]',
  widthControlTestId: 'width',
  widthValueTestId: 'width-value',
  initialSrc: /(?=.*720)(?=.*webp)/,
  updatedSrc: /(?=.*880)(?=.*webp)/
});
