import { testPictureComponent } from '@common/test/e2e/Picture';

testPictureComponent({
  heading: 'One provider model for every Svelte surface.',
  pictureSelector: 'picture[data-testid="picture-component"]',
  widthControlTestId: 'width',
  widthValueTestId: 'width-value',
  sourceCount: 2,
  sourceTypes: ['image/avif', 'image/webp'],
  fallbackSrc: /_ipx\/.*f_jpg/,
  updatedFallbackSrc: /_ipx\/.*f_jpg/
});
