import { testImageBinding } from '@common/test/e2e/Image';

testImageBinding({
  name: 'DsImageDirective',
  heading: 'Optimized images across four Angular surfaces.',
  imageSelector: '[data-testid="image-directive"]',
  widthControlTestId: 'width',
  widthValueTestId: 'width-value',
  initialSrc: /hero\.jpg\?w=720&h=540/,
  updatedSrc: /hero\.jpg\?w=880&h=540/,
  srcset: /w=720/
});
