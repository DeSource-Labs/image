<section class="comparison" id="compare">
  <div class="shell">
    <div class="section-intro">
      <div>
        <p class="eyebrow">How it compares</p>
        <h2>Framework defaults solve images inside one framework.</h2>
      </div>
      <p class="section-copy">
        DeSource Image handles image rules that must work across runtimes, providers, and deployment targets.
      </p>
    </div>
    <div class="comparison-table">
      <table aria-label="Image optimization tool comparison">
        <thead>
          <tr>
            <th>Option</th>
            <th>Best fit</th>
            <th>Provider choice</th>
            <th>Use DeSource Image when</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <th>React <code>&lt;img&gt;</code></th>
            <td data-label="Best fit">Native browser images when the application owns its markup and URLs</td>
            <td data-label="Provider choice">
              The browser requests <code>src</code> unchanged; deploying to Vercel, Netlify, or Amplify does not rewrite it
            </td>
            <td data-label="Use DeSource Image when">
              You want responsive sizes, format, and quality controlled in component code, plus picture output,
              placeholders, preloads, and an optimizer that follows the deployment.
            </td>
          </tr>
          <tr>
            <th><a href="https://nextjs.org/docs/app/api-reference/components/image">next/image</a></th>
            <td data-label="Best fit">Next-only applications using the Next.js image pipeline</td>
            <td data-label="Provider choice">
              Next.js optimizer by default. Vercel, Netlify, and AWS Amplify integrate <code>next/image</code> with their
              hosting pipelines. Other image services use a custom loader.
            </td>
            <td data-label="Use DeSource Image when">
              You want broader built-in provider support without replacing the component, or provider policy, presets,
              aliases, and source rules must remain stable across frameworks and hosts.
            </td>
          </tr>
          <tr>
            <th><a href="https://angular.dev/guide/image-optimization">NgOptimizedImage</a></th>
            <td data-label="Best fit">Angular performance checks, loading hints, and responsive image output</td>
            <td data-label="Provider choice">
              A generic, built-in, or custom <code>IMAGE_LOADER</code> selected in Angular configuration
            </td>
            <td data-label="Use DeSource Image when">
              You want deployment auto-detection, local IPX, native picture output, per-image providers, or a broader
              provider catalog.
            </td>
          </tr>
          <tr>
            <th><a href="https://svelte.dev/docs/kit/images">enhanced:img</a></th>
            <td data-label="Best fit">Static local assets transformed during the Vite build</td>
            <td data-label="Provider choice">
              Images are processed at build time; the deployment does not switch them to its image service
            </td>
            <td data-label="Use DeSource Image when">
              You want local images transformed on demand, images from a CMS or API, or the deployment platform's
              optimizer in production.
            </td>
          </tr>
          <tr>
            <th><a href="https://unpic.pics/">Unpic</a></th>
            <td data-label="Best fit"
              >Cross-framework responsive images already hosted on recognizable CDN or CMS URLs</td
            >
            <td data-label="Provider choice">
              Detects the provider from each source URL; local or unknown sources need a fallback
            </td>
            <td data-label="Use DeSource Image when">
              Vercel, Netlify, or AWS Amplify should choose the optimizer for every source, including relative paths,
              with presets, aliases, source rules, picture output, or server adapters.
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</section>

<style lang="scss">
  @use '../../styles/mixins' as mixins;

  .comparison {
    padding-block: 140px;
    border-block: 1px solid var(--line);
    background: rgba(255, 255, 255, 0.018);

    table {
      width: 100%;
      min-width: 960px;
      border-collapse: collapse;
      color: #aebed0;
      font-size: 0.78rem;
      line-height: 1.55;
      text-align: left;
    }

    th,
    td {
      padding: 20px;
      border-right: 1px solid var(--line);
      border-bottom: 1px solid var(--line);
      vertical-align: top;

      &:last-child {
        border-right: 0;
      }
    }

    tbody {
      tr:last-child {
        th,
        td {
          border-bottom: 0;
        }
      }

      th {
        width: 150px;
        color: #eef5fc;
        font-size: 0.82rem;
      }
    }

    thead th {
      color: #72869e;
      background: #081421;
      font-size: 0.66rem;
      letter-spacing: 0.04em;
      text-transform: uppercase;
    }

    a {
      color: inherit;
    }
  }

  .section-intro {
    @include mixins.section-heading;
  }

  .comparison-table {
    overflow-x: auto;
    border: 1px solid var(--line);
    border-radius: var(--radius);
  }

  @include mixins.at-most(1023px) {
    .comparison-table {
      overflow: visible;
      border: 0;
      border-radius: 0;
    }

    .comparison {
      table {
        display: block;
        min-width: 0;
      }

      thead {
        position: absolute;
        width: 1px;
        height: 1px;
        overflow: hidden;
        clip-path: inset(50%);
      }

      tbody {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 18px;

        th {
          display: block;
          width: auto;
          font-size: 1rem;
        }
      }

      tr {
        display: block;
        min-width: 0;
        overflow: hidden;
        border: 1px solid var(--line);
        border-radius: var(--radius);
        background: #081421;
      }

      td {
        display: block;

        &::before {
          display: block;
          margin-bottom: 8px;
          color: var(--blue);
          font-size: 0.7rem;
          font-weight: 750;
          content: attr(data-label);
        }
      }

      th,
      td {
        padding: 16px 20px;
        border: 0;
      }
    }
  }

  @include mixins.at-most(980px) {
    .section-intro {
      grid-template-columns: 1fr;
      gap: 40px;
    }
  }

  @include mixins.at-most(680px) {
    .comparison {
      padding-block: 100px;

      tbody {
        grid-template-columns: minmax(0, 1fr);
      }
    }
  }
</style>
