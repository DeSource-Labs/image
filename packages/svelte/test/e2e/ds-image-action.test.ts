import { testDsImageBinding } from '@common/test/e2e/DsImage';

testDsImageBinding({
  name: 'dsImageAction',
  heading: 'One provider model for every Svelte surface.',
  imageSelector: '[data-testid="image-action"]',
  widthControlTestId: 'width',
  widthValueTestId: 'width-value',
  initialSrc: /s_720x540/,
  updatedSrc: /s_880x540/
});
