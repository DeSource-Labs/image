import { useState } from 'react';
import { ipxProvider } from '@desource/image';
import { Image, ImageProvider, Picture, useImageProps, usePictureProps } from '@desource/image-react';

const imageConfig = {
  provider: 'ipx',
  providers: { ipx: ipxProvider() },
  screens: { sm: 640, md: 768, lg: 1024 }
};

export default function App() {
  const [width, setWidth] = useState(720);
  const [componentLoaded, setComponentLoaded] = useState(false);

  return (
    <ImageProvider config={imageConfig}>
      <main>
        <header>
          <span className="eyebrow">Desource Image for React</span>
          <h1>Optimized images for React and Next.js.</h1>
          <p>
            Components and hooks generate the same provider URLs, responsive candidates, placeholders, and preloads.
          </p>
        </header>

        <label className="control">
          Render width: <strong data-testid="width-value">{width}px</strong>
          <input
            data-testid="width"
            type="range"
            min="320"
            max="960"
            step="80"
            value={width}
            onChange={(event) => setWidth(Number(event.currentTarget.value))}
          />
        </label>

        <section className="grid">
          <article>
            <span>Image component</span>
            <Image
              data-testid="image-component"
              src="/hero.jpg"
              alt="Aurora above a mountain lake"
              width={width}
              height={540}
              sizes="sm:100vw md:50vw 680px"
              quality={82}
              placeholder
              preload={{ fetchPriority: 'high' }}
              className="media"
              onLoad={() => setComponentLoaded(true)}
            />
            <small data-testid="component-state">{componentLoaded ? 'decoded' : 'loading'}</small>
          </article>

          <NativeImage width={width} />

          <article>
            <span>Picture component</span>
            <Picture
              data-testid="picture-component"
              src="/hero.jpg"
              alt="Responsive mountain landscape"
              width={width}
              height={540}
              formats={['avif', 'webp']}
              fallbackFormat="jpg"
              className="media-frame"
              imgAttrs={{ className: 'media' }}
            />
          </article>

          <NativePicture width={width} />
        </section>
      </main>
    </ImageProvider>
  );
}

function NativeImage({ width }: { width: number }) {
  const imgProps = useImageProps({
    src: '/hero.jpg',
    alt: 'Aurora reflected in a lake',
    width,
    height: 540,
    format: 'webp',
    placeholder: true,
    placeholderClass: 'is-placeholder',
    className: 'media'
  });

  return (
    <article>
      <span>useImageProps hook</span>
      <img {...imgProps} data-testid="image-hook" />
    </article>
  );
}

function NativePicture({ width }: { width: number }) {
  const picture = usePictureProps({
    src: '/hero.jpg',
    alt: 'Mountain landscape rendered by a hook',
    width,
    height: 540,
    formats: ['avif'],
    fallbackFormat: 'jpg',
    pictureAttrs: { className: 'media-frame' },
    imgAttrs: { className: 'media' }
  });

  return (
    <article>
      <span>usePictureProps hook</span>
      <picture {...picture.pictureProps} data-testid="picture-hook">
        {picture.sources.map(({ key, ...source }) => (
          <source key={key} {...source} />
        ))}
        <img {...picture.imgProps} />
      </picture>
    </article>
  );
}
