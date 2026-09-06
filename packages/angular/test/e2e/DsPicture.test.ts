import { testDsPictureComponent } from '@common/test/e2e/DsPicture';

testDsPictureComponent({
  heading: 'Optimized images across four Angular surfaces.',
  pictureSelector: '[data-testid="picture-component"] picture',
  widthControlTestId: 'width',
  widthValueTestId: 'width-value',
  sourceCount: 2,
  sourceTypes: ['image/avif', 'image/webp'],
  fallbackSrc: /hero\.jpg\?w=\d+&h=\d+&fm=jpg/,
  updatedFallbackSrc: /hero\.jpg\?w=\d+&h=\d+&fm=jpg/
});
