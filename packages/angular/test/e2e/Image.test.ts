import { testImageComponent } from '@common/test/e2e/Image';

testImageComponent({
  heading: 'Optimized images across four Angular surfaces.',
  imageSelector: '[data-testid="image-component"] img',
  widthControlTestId: 'width',
  widthValueTestId: 'width-value',
  initialSrc: /hero\.jpg\?w=\d+&h=\d+&q=82/,
  updatedSrc: /hero\.jpg\?w=\d+&h=\d+&q=82/,
  preloadCount: 1
});
