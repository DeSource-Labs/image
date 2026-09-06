<section class="autodetect shell" id="autodetect">
  <div class="autodetect-copy">
    <p class="eyebrow">Provider: auto</p>
    <h2>With DeSource Image, the optimizer follows the deployment.</h2>
    <p class="section-copy">
      The same source can use Vercel Image Optimization on Vercel, Netlify Image CDN on Netlify, AWS Amplify Image
      Optimization on Amplify, and IPX during local development or on other hosts. An explicit provider always wins.
    </p>
  </div>
  <div class="detect-grid" aria-label="Automatically detected image providers">
    <article>
      <span>Local or other</span>
      <strong>IPX</strong>
      <code>provider: 'ipx'</code>
    </article>
    <article>
      <span>Vercel</span>
      <strong>Vercel Images</strong>
      <code>provider: 'vercel'</code>
    </article>
    <article>
      <span>Netlify</span>
      <strong>Image CDN</strong>
      <code>provider: 'netlifyImageCdn'</code>
    </article>
    <article>
      <span>AWS Amplify</span>
      <strong>Amplify Image</strong>
      <code>provider: 'awsAmplify'</code>
    </article>
  </div>
  <p class="detect-note">
    Netlify Large Media is selected when its environment is present.
    <br />
    Explicit provider config always takes priority.
  </p>
</section>

<style lang="scss">
  @use '../../styles/mixins' as mixins;

  .autodetect {
    padding-block: 150px;
  }

  .autodetect-copy {
    @include mixins.split-layout;
    margin-bottom: 48px;

    .eyebrow,
    h2 {
      grid-column: 1;
    }

    h2 {
      margin-bottom: 0;
    }

    .section-copy {
      grid-column: 2;
      grid-row: 1 / span 2;
      align-self: end;
    }
  }

  .detect-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    border-top: 1px solid var(--line);
    border-left: 1px solid var(--line);

    article {
      min-width: 0;
      padding: 28px 22px;
      border-right: 1px solid var(--line);
      border-bottom: 1px solid var(--line);
      background: rgba(255, 255, 255, 0.018);
    }

    span,
    strong,
    code {
      display: block;
    }

    span {
      color: #71859d;
      font-size: 0.68rem;
      font-weight: 700;
      text-transform: uppercase;
    }

    strong {
      margin: 40px 0 10px;
      color: #eef5fc;
      font-size: 1rem;
    }

    code {
      overflow: hidden;
      color: var(--lime);
      font-size: 0.68rem;
      text-overflow: ellipsis;
    }
  }

  .detect-note {
    margin: 18px 0 0;
    color: #71859d;
    font-size: 0.72rem;
  }

  @include mixins.at-most(980px) {
    .autodetect-copy {
      grid-template-columns: 1fr;
      gap: 40px;

      .eyebrow,
      h2,
      .section-copy {
        grid-column: 1;
        grid-row: auto;
      }
    }

    .detect-grid {
      grid-template-columns: 1fr 1fr;
    }
  }

  @include mixins.at-most(680px) {
    .autodetect {
      padding-block: 100px;
    }

    .detect-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
