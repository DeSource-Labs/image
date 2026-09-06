import { testDsImageComponent } from '@common/test/e2e/DsImage';

testDsImageComponent({
  heading: 'Optimized images for React and Next.js.',
  imageSelector: 'img[data-testid="image-component"]',
  widthControlTestId: 'width',
  widthValueTestId: 'width-value',
  initialSrc: /_ipx\//,
  updatedSrc: /_ipx\//,
  preloadCount: 1,
  decodedStateTestId: 'component-state'
});
