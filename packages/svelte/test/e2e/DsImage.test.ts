import { testDsImageComponent } from '@common/test/e2e/DsImage';

testDsImageComponent({
  heading: 'One provider model for every Svelte surface.',
  imageSelector: 'img[data-testid="image-component"]',
  widthControlTestId: 'width',
  widthValueTestId: 'width-value',
  initialSrc: /_ipx\//,
  updatedSrc: /_ipx\//,
  preloadCount: 1,
  decodedStateTestId: 'component-state'
});
