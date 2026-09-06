<section class="trust-strip" aria-label="Core capabilities">
  <div class="shell">
    <span>Angular 19-22</span>
    <span>React 18-19</span>
    <span>Svelte 5</span>
    <span>Next.js</span>
    <span>SSR support</span>
  </div>
</section>

<section class="problem shell">
  <div>
    <p class="eyebrow">Built for fast product iterations</p>
    <h2>Change image quality, format, crop, or responsive sizes in code.</h2>
  </div>
  <p class="section-copy">
    Keep <code>/img/hero.jpg</code> instead of exporting <code>hero-480.webp</code>, <code>hero-960.webp</code>, and
    <code>hero-1600.webp</code>. For MVPs and everyday product development, adjust the output in component code while
    the source file and filename stay unchanged.
  </p>
</section>

<section class="feature-grid shell" aria-label="Library benefits">
  <article>
    <h3>Deployment-aware provider selection</h3>
    <p>Leave provider on auto. DeSource Image detects Vercel, Netlify, or AWS Amplify and uses IPX elsewhere.</p>
  </article>
  <article>
    <h3>46 provider modules</h3>
    <p>Use Cloudinary, Imgix, ImageKit, Sanity, Contentful, Shopify, or another built-in provider.</p>
  </article>
  <article>
    <h3>Responsive images and modern formats</h3>
    <p>Generate width or density candidates, breakpoint-aware sizes, AVIF/WebP sources, and a fallback image.</p>
  </article>
  <article>
    <h3>Native framework APIs</h3>
    <p>Use Angular components, React components and hooks, or Svelte components, actions, and attachments.</p>
  </article>
</section>

<style lang="scss">
  @use '../../styles/mixins' as mixins;

  .trust-strip {
    border-block: 1px solid var(--line);
    background: rgba(255, 255, 255, 0.018);

    .shell {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0;
      min-height: 72px;
      color: #8496ab;
      font-size: 0.72rem;
      font-weight: 650;
      text-transform: uppercase;
    }

    span {
      white-space: nowrap;

      + span {
        margin-left: 24px;
        padding-left: 24px;
        border-left: 1px solid var(--line);
      }
    }
  }

  .problem {
    @include mixins.split-layout;
    padding-block: 150px;

    h2 {
      margin-bottom: 0;
    }
  }

  .feature-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    border-block: 1px solid var(--line);

    article {
      padding: 38px 26px;
      border-right: 1px solid var(--line);

      &:last-child {
        border: 0;
      }
    }

    h3 {
      margin: 0 0 13px;
      font-size: 1.05rem;
    }

    p {
      margin: 0;
      color: var(--muted);
      font-size: 0.82rem;
      line-height: 1.65;
    }
  }

  @include mixins.at-most(980px) {
    .problem {
      grid-template-columns: 1fr;
      gap: 40px;
    }

    .feature-grid {
      grid-template-columns: 1fr 1fr;

      article:nth-child(2) {
        border-right: 0;
      }
    }
  }

  @include mixins.at-most(680px) {
    .trust-strip {
      .shell {
        display: grid;
        grid-template-columns: repeat(6, minmax(0, 1fr));
        gap: 16px 8px;
        padding-block: 20px;
        text-align: center;
      }

      span,
      span + span {
        grid-column: span 2;
        margin: 0;
        padding: 0;
        border: 0;
      }

      span:nth-child(4) {
        grid-column: 2 / span 2;
      }

      span:nth-child(5) {
        grid-column: 4 / span 2;
      }
    }

    .problem {
      padding-block: 100px;
    }

    .feature-grid {
      grid-template-columns: 1fr;

      article {
        border-right: 0;
      }
    }
  }
</style>
