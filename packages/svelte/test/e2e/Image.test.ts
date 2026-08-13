import { testImageComponent } from '@common/test/e2e/Image';

testImageComponent({
  heading: 'Components, actions, and attachments in one engine.',
  imageSelector: 'img[data-testid="image-component"]',
  widthControlTestId: 'width',
  widthValueTestId: 'width-value',
  initialSrc: /_ipx\//,
  updatedSrc: /_ipx\//,
  preloadCount: 1,
  decodedStateTestId: 'component-state'
});
