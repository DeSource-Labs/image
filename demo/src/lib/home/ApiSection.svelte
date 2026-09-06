<section class="api shell" id="api">
  <div class="api-heading">
    <p class="eyebrow">Native framework APIs</p>
    <h2>Use components, native elements, or headless helpers.</h2>
  </div>
  <div class="api-list">
    <article>
      <code>DsImage</code>
      <h3>Responsive image components</h3>
      <p>Generate provider URLs, responsive candidates, placeholders, preloads, native attributes, and events.</p>
    </article>
    <article>
      <code>DsPicture</code>
      <h3>Ordered modern formats</h3>
      <p>Render AVIF and WebP sources with a controlled, transparent-safe fallback image.</p>
    </article>
    <article>
      <code>useDsImage / DsImageService</code>
      <h3>Callable URL helper</h3>
      <p>Generate provider URLs for CSS, canvas, metadata, headless UI, email, or custom rendering.</p>
    </article>
    <article>
      <code>hook / action / attachment / directive</code>
      <h3>Keep native markup</h3>
      <p>Apply the same provider and responsive behavior to image and picture elements owned by the application.</p>
    </article>
    <article>
      <code>@desource/image/providers/*</code>
      <h3>Tree-shakable providers</h3>
      <p>Import only the provider modules configured by the application.</p>
    </article>
    <article>
      <code>@desource/image/kit</code>
      <h3>Build an integration</h3>
      <p>Use typed parsers, operation generators, config guards, and provider primitives in custom framework glue.</p>
    </article>
  </div>
</section>

<style lang="scss">
  @use '../../styles/mixins' as mixins;

  .api {
    padding-block: 100px 150px;
  }

  .api-heading {
    margin-bottom: 48px;
  }

  .api-list {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    border-top: 1px solid var(--line);
    border-left: 1px solid var(--line);

    article {
      min-height: 230px;
      padding: 28px;
      border-right: 1px solid var(--line);
      border-bottom: 1px solid var(--line);
    }

    code {
      color: var(--blue);
      font-size: 0.69rem;
    }

    h3 {
      margin: 50px 0 12px;
      font-size: 1rem;
    }

    p {
      color: var(--muted);
      font-size: 0.8rem;
      line-height: 1.65;
    }
  }

  @include mixins.at-most(980px) {
    .api-list {
      grid-template-columns: 1fr 1fr;
    }
  }

  @include mixins.at-most(680px) {
    .api-list {
      grid-template-columns: 1fr;
    }
  }
</style>
