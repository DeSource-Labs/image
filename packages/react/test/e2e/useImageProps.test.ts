import { testImageBinding } from '@common/test/e2e/Image';

testImageBinding({
  name: 'useImageProps',
  heading: 'Optimized images for React and Next.js.',
  imageSelector: '[data-testid="image-hook"]',
  widthControlTestId: 'width',
  widthValueTestId: 'width-value',
  initialSrc: /(?=.*720)(?=.*webp)/,
  updatedSrc: /(?=.*880)(?=.*webp)/
});
