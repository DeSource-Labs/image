import { testDsPictureComponent } from '@common/test/e2e/DsPicture';

testDsPictureComponent({
  heading: 'Optimized images for React and Next.js.',
  pictureSelector: 'picture[data-testid="picture-component"]',
  widthControlTestId: 'width',
  widthValueTestId: 'width-value',
  sourceCount: 2,
  sourceTypes: ['image/avif', 'image/webp'],
  fallbackSrc: /_ipx\/.*f_jpg/,
  updatedFallbackSrc: /_ipx\/.*f_jpg/
});
