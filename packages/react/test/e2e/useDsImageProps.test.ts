import { testDsImageBinding } from '@common/test/e2e/DsImage';

testDsImageBinding({
  name: 'useDsImageProps',
  heading: 'Optimized images for React and Next.js.',
  imageSelector: '[data-testid="image-hook"]',
  widthControlTestId: 'width',
  widthValueTestId: 'width-value',
  initialSrc: /(?=.*720)(?=.*webp)/,
  updatedSrc: /(?=.*880)(?=.*webp)/
});
