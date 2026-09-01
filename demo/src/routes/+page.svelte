<script lang="ts">
  import { Picture } from '@desource/image-svelte';
  import Playground from '$lib/Playground.svelte';
  import type { PageData } from './$types';

  let { data }: { data: PageData } = $props();

  let framework = $state<'angular' | 'react' | 'svelte'>('svelte');
  let installLabel = $state('Copy');

  const providers = [
    'IPX',
    'Cloudinary',
    'Imgix',
    'Vercel',
    'Netlify',
    'AWS Amplify',
    'ImageKit',
    'Cloudflare',
    'Contentful',
    'Directus',
    'Sanity',
    'Storyblok',
    'Shopify',
    'Supabase',
    'Uploadcare',
    'Unsplash'
  ];

  const examples = {
    svelte: [
      '<script lang="ts">',
      "  import { Picture } from '@desource/image-svelte';",
      // eslint-disable-next-line no-useless-escape
      '<\/script>',
      '',
      '<Picture',
      '  src="/hero.jpg"',
      '  alt="Desert landscape"',
      '  width={1600}',
      '  height={1000}',
      '  sizes="100vw md:760px"',
      '  format="avif,webp"',
      '  quality={76}',
      '/>'
    ].join('\n'),
    angular: [
      "import { Component } from '@angular/core';",
      "import { DsPictureComponent } from '@desource/image-angular';",
      '',
      '@Component({',
      "  selector: 'app-hero',",
      '  imports: [DsPictureComponent],',
      "  templateUrl: './hero.html'",
      '})',
      'export class Hero {}',
      '',
      '<ds-picture',
      '  src="/hero.jpg"',
      '  alt="Desert landscape"',
      '  width="1600"',
      '  height="1000"',
      '  sizes="100vw md:760px"',
      '  format="avif,webp"',
      '  quality="76"',
      '/>'
    ].join('\n'),
    react: [
      "import { Picture, useImageProps } from '@desource/image-react';",
      '',
      'export function Hero() {',
      '  const img = useImageProps({',
      '    src: "/hero.jpg",',
      '    alt: "Desert landscape",',
      '    width: 1600,',
      '    height: 1000,',
      '    sizes: "100vw md:760px",',
      '    format: "webp",',
      '    quality: 76',
      '  });',
      '',
      '  return (',
      '    <>',
      '      <img {...img} />',
      '      <Picture',
      '        src="/hero.jpg"',
      '        alt="Desert landscape"',
      '        width={1600}',
      '        height={1000}',
      '        formats={["avif", "webp"]}',
      '        fallbackFormat="jpg"',
      '      />',
      '    </>',
      '  );',
      '}'
    ].join('\n')
  };

  async function copyInstall() {
    await navigator.clipboard.writeText(`pnpm add @desource/image-${framework}`);
    installLabel = 'Copied';
    globalThis.setTimeout(() => (installLabel = 'Copy'), 1400);
  }
</script>

<svelte:head>
  <title>Desource Image - Optimized images for React, Angular, and Svelte</title>
  <meta
    name="description"
    content="High-quality image optimization with responsive, provider-first and SSR-friendly workflow for React/Next.js, Angular, and Svelte/SvelteKit."
  />
  <link rel="canonical" href={`${data.origin}/`} />
  <meta property="og:title" content="Desource Image - Optimized images for React, Angular, and Svelte" />
  <meta
    property="og:description"
    content="Change image quality, format, crop, or responsive sizes in code. Desource Image selects the image optimizer from the deployment environment."
  />
  <meta property="og:type" content="website" />
  <meta property="og:site_name" content="Desource Image" />
  <meta property="og:url" content={`${data.origin}/`} />
  <meta property="og:image" content={`${data.origin}/og.jpg`} />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:image:alt" content="Desource Image optimization for React, Angular, and Svelte" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="Desource Image - Optimized images for React, Angular, and Svelte" />
  <meta
    name="twitter:description"
    content="Responsive images, modern formats, deployment-aware provider selection, 46 providers, and local IPX."
  />
  <meta name="twitter:image" content={`${data.origin}/og.jpg`} />
  <meta name="twitter:image:alt" content="Desource Image optimization for React, Angular, and Svelte" />
</svelte:head>

<header class="site-header">
  <div class="shell nav">
    <a class="brand" href="#top" aria-label="Desource Image home"><span>DS</span> Desource Image</a>
    <nav aria-label="Primary navigation">
      <a href="#autodetect">Auto detect</a><a href="#frameworks">Frameworks</a><a href="#providers">Providers</a><a
        href="#compare">Compare</a
      >
    </nav>
    <a class="github-link" href="https://github.com/DeSource-Labs/image">GitHub <span>↗</span></a>
  </div>
</header>

<main id="top">
  <section class="hero shell">
    <div class="hero-copy">
      <p class="eyebrow">Optimized images for React, Angular, and Svelte</p>
      <h1>
        <span>Ship the right</span>
        <span>image.</span>
        <span class="hero-title-accent">Every time.</span>
      </h1>
      <p class="hero-lede">
        AI-assisted development moves ideas into working products quickly. Desource Image keeps image preparation inside
        that development loop. Add one suitable local or remote source, then control quality, format, crop, and
        responsive sizes with component props.
      </p>
      <div class="hero-actions">
        <a class="primary-action" href="#quickstart">Install the package <span>→</span></a><a
          class="secondary-action"
          href="#playground">Try the live controls</a
        >
      </div>
      <dl class="hero-stats">
        <div>
          <dt>Auto</dt>
          <dd>deployment provider</dd>
        </div>
        <div>
          <dt>46</dt>
          <dd>provider modules</dd>
        </div>
        <div>
          <dt>3</dt>
          <dd>native framework APIs</dd>
        </div>
      </dl>
    </div>
    <div class="hero-visual">
      <span class="crop-target crop-target--top-left" aria-hidden="true"></span>
      <span class="crop-target crop-target--top-right" aria-hidden="true"></span>
      <span class="crop-target crop-target--bottom-left" aria-hidden="true"></span>
      <span class="crop-target crop-target--bottom-right" aria-hidden="true"></span>
      <div class="image-frame">
        <div class="image-crop">
          <Picture
            src="/img/hero.jpg"
            alt="Joshua tree at sunset in the desert"
            width={768}
            height={512}
            sizes="100vw lg:520px"
            format="avif,webp"
            legacyFormat="jpeg"
            quality={30}
            preload
          />
        </div>
        <div class="image-meta"><code>quality={30}</code><span>responsive · provider: auto</span></div>
      </div>
    </div>
  </section>

  <section class="trust-strip" aria-label="Core capabilities">
    <div class="shell">
      <span>Angular 19-22</span><i></i><span>React 18-19</span><i></i><span>Svelte 5</span><i></i><span>Next.js</span><i
      ></i><span>Deterministic SSR</span>
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
      <span>01</span>
      <h3>Deployment-aware provider selection</h3>
      <p>Leave provider on auto. Desource Image detects Vercel, Netlify, or AWS Amplify and uses IPX elsewhere.</p>
    </article>
    <article>
      <span>02</span>
      <h3>46 provider modules</h3>
      <p>Use Cloudinary, Imgix, ImageKit, Sanity, Contentful, Shopify, or another built-in provider.</p>
    </article>
    <article>
      <span>03</span>
      <h3>Responsive images and modern formats</h3>
      <p>Generate width or density candidates, breakpoint-aware sizes, AVIF/WebP sources, and a fallback image.</p>
    </article>
    <article>
      <span>04</span>
      <h3>Native framework APIs</h3>
      <p>Use Angular components, React components and hooks, or Svelte components, actions, and attachments.</p>
    </article>
  </section>

  <section class="autodetect shell" id="autodetect">
    <div class="autodetect-copy">
      <p class="eyebrow">Provider: auto</p>
      <h2>With Desource Image, the optimizer follows the deployment.</h2>
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
      Netlify Large Media is selected when its environment is present. Explicit provider config always takes priority.
    </p>
  </section>

  <section class="playground-section" id="playground">
    <div class="shell section-intro">
      <div>
        <p class="eyebrow">Powered by Desource Image</p>
        <h2>Change image settings. Inspect every generated candidate.</h2>
      </div>
      <p class="section-copy">
        This page uses the published API. Each control updates the provider URL, dimensions, format, quality,
        <code>srcset</code>, and <code>sizes</code> through <code>@desource/image</code>.
      </p>
    </div>
    <div class="shell"><Playground /></div>
  </section>

  <section class="frameworks shell" id="frameworks">
    <div class="framework-copy">
      <p class="eyebrow">React, Angular, and Svelte</p>
      <h2>Share image rules across framework-native APIs.</h2>
      <p class="section-copy">
        Use Angular components and directives, React components and hooks, or Svelte components, actions, and
        attachments. Output remains native <code>&lt;img&gt;</code> and <code>&lt;picture&gt;</code> markup.
      </p>
      <ul>
        <li><span>✓</span> Angular components and directives</li>
        <li><span>✓</span> React components and hooks</li>
        <li><span>✓</span> Svelte components, actions, and attachments</li>
        <li><span>✓</span> Native image and picture markup</li>
      </ul>
    </div>
    <div class="code-card">
      <div class="code-tabs" role="tablist" aria-label="Framework example">
        <button class:active={framework === 'svelte'} onclick={() => (framework = 'svelte')} role="tab">Svelte</button>
        <button class:active={framework === 'react'} onclick={() => (framework = 'react')} role="tab">React</button>
        <button class:active={framework === 'angular'} onclick={() => (framework = 'angular')} role="tab"
          >Angular</button
        >
      </div>
      <pre><code>{examples[framework]}</code></pre>
    </div>
  </section>

  <section class="quickstart" id="quickstart">
    <div class="shell quickstart-grid">
      <div>
        <p class="eyebrow">Provider configuration is optional</p>
        <h2>Install the framework package. Render an image.</h2>
        <p class="section-copy">
          Leave provider unset. Local development uses IPX; supported deployments use their native image service. Add
          config only for shared presets, aliases, source rules, or an explicit provider.
        </p>
      </div>
      <div class="install-card">
        <div class="package-switch">
          <button class:active={framework === 'svelte'} onclick={() => (framework = 'svelte')}>Svelte</button><button
            class:active={framework === 'react'}
            onclick={() => (framework = 'react')}>React</button
          ><button class:active={framework === 'angular'} onclick={() => (framework = 'angular')}>Angular</button>
        </div>
        <div class="install-command">
          <code>pnpm add @desource/image-{framework}</code><button onclick={copyInstall}>{installLabel}</button>
        </div>
        <ol>
          <li><span>1</span> Add the framework package</li>
          <li><span>2</span> Render <code>Image</code>, <code>Picture</code>, or a native-element integration</li>
          <li><span>3</span> Set quality, format, crop, and responsive sizes in code</li>
          <li><span>4</span> Let <code>provider: 'auto'</code> follow the deployment</li>
        </ol>
      </div>
    </div>
  </section>

  <section class="providers shell" id="providers">
    <div class="provider-heading">
      <div>
        <p class="eyebrow">46 built-in provider modules</p>
        <h2>Use the CDN, CMS, or image service already in your stack.</h2>
      </div>
      <p class="section-copy">
        Desource Image handles provider selection, modifier translation, and URL generation. Provider subpath imports
        remain tree-shakable. Set a default provider or override it per image.
      </p>
    </div>
    <div class="provider-list">
      {#each providers as provider, index (provider)}<span><b>{String(index + 1).padStart(2, '0')}</b>{provider}</span
        >{/each}
      <span class="more"><b>+</b>and more</span>
    </div>
  </section>

  <section class="comparison" id="compare">
    <div class="shell">
      <div class="section-intro">
        <div>
          <p class="eyebrow">How it compares</p>
          <h2>Framework defaults solve images inside one framework.</h2>
        </div>
        <p class="section-copy">
          Desource Image handles image rules that must work across runtimes, providers, and deployment targets.
        </p>
      </div>
      <div class="comparison-table">
        <table aria-label="Image optimization tool comparison">
          <thead>
            <tr>
              <th>Option</th>
              <th>Best fit</th>
              <th>Provider choice</th>
              <th>Use Desource Image when</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <th>React <code>&lt;img&gt;</code></th>
              <td>Native browser images when the application owns its markup and URLs</td>
              <td
                >The browser requests <code>src</code> unchanged; deploying to Vercel, Netlify, or Amplify does not rewrite
                it</td
              >
              <td>
                You want responsive sizes, format, and quality controlled in component code, plus picture output,
                placeholders, preloads, and an optimizer that follows the deployment.
              </td>
            </tr>
            <tr>
              <th><a href="https://nextjs.org/docs/app/api-reference/components/image">next/image</a></th>
              <td>Next-only applications using the Next.js image pipeline</td>
              <td>
                Next.js optimizer by default. Vercel, Netlify, and AWS Amplify integrate <code>next/image</code> with their
                hosting pipelines. Other image services use a custom loader.
              </td>
              <td>
                You want broader built-in provider support without replacing the component, or provider policy, presets,
                aliases, and source rules must remain stable across frameworks and hosts.
              </td>
            </tr>
            <tr>
              <th><a href="https://angular.dev/guide/image-optimization">NgOptimizedImage</a></th>
              <td>Angular performance checks, loading hints, and responsive image output</td>
              <td>A generic, built-in, or custom <code>IMAGE_LOADER</code> selected in Angular configuration</td>
              <td>
                You want deployment auto-detection, local IPX, native picture output, per-image providers, or a broader
                provider catalog.
              </td>
            </tr>
            <tr>
              <th><a href="https://svelte.dev/docs/kit/images">enhanced:img</a></th>
              <td>Static local assets transformed during the Vite build</td>
              <td>Images are processed at build time; the deployment does not switch them to its image service</td>
              <td>
                You want local images transformed on demand, images from a CMS or API, or the deployment platform's
                optimizer in production.
              </td>
            </tr>
            <tr>
              <th><a href="https://unpic.pics/">Unpic</a></th>
              <td>Cross-framework responsive images already hosted on recognizable CDN or CMS URLs</td>
              <td>Detects the provider from each source URL; local or unknown sources need a fallback</td>
              <td>
                Vercel, Netlify, or AWS Amplify should choose the optimizer for every source, including relative paths,
                with presets, aliases, source rules, picture output, or server adapters.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </section>

  <section class="api shell" id="api">
    <div class="api-heading">
      <p class="eyebrow">Native framework APIs</p>
      <h2>Use components, native elements, or headless helpers.</h2>
    </div>
    <div class="api-list">
      <article>
        <code>Image / DsImage</code>
        <h3>Responsive image components</h3>
        <p>Generate provider URLs, responsive candidates, placeholders, preloads, native attributes, and events.</p>
      </article>
      <article>
        <code>Picture / DsPicture</code>
        <h3>Ordered modern formats</h3>
        <p>Render AVIF and WebP sources with a controlled, transparent-safe fallback image.</p>
      </article>
      <article>
        <code>useImage / DsImageService</code>
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

  <section class="cta shell">
    <h2>Make image quality a code change.</h2>
    <p>
      Install the framework package. Keep auto-detection, or select any built-in provider when the application needs
      control.
    </p>
    <div>
      <a class="primary-action" href="#quickstart">Start with Desource Image <span>→</span></a><a
        class="secondary-action"
        href="https://github.com/DeSource-Labs/image">Read the source</a
      >
    </div>
  </section>
</main>

<footer>
  <div class="shell">
    <a class="brand" href="#top"><span>DS</span> Desource Image</a>
    <p>High-quality image optimization for React, Angular, and Svelte. MIT licensed.</p>
    <div>
      <a href="https://github.com/DeSource-Labs/image">GitHub</a><a href="#api">Documentation</a><a
        href="mailto:hello@desource-labs.org">Contact</a
      >
    </div>
  </div>
</footer>

<style>
  .site-header {
    position: sticky;
    top: 0;
    z-index: 20;
    border-bottom: 1px solid rgba(185, 209, 239, 0.1);
    background: rgba(7, 17, 31, 0.76);
    backdrop-filter: blur(18px);
  }
  .nav {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 72px;
  }
  .brand {
    display: flex;
    align-items: center;
    gap: 9px;
    color: #f2f6fb;
    font-size: 0.95rem;
    font-weight: 750;
    text-decoration: none;
  }
  .brand span {
    display: grid;
    width: 31px;
    height: 31px;
    place-items: center;
    border: 1px solid rgba(191, 244, 139, 0.45);
    border-radius: 8px;
    color: var(--lime);
    font-size: 0.67rem;
    letter-spacing: 0.08em;
  }
  nav {
    display: flex;
    gap: 28px;
  }
  nav a,
  .github-link {
    color: #aab9cb;
    font-size: 0.8rem;
    font-weight: 600;
    text-decoration: none;
  }
  .github-link {
    display: flex;
    gap: 6px;
    align-items: center;
    color: #edf4fc;
  }
  .nav a:hover {
    color: #fff;
  }
  .hero {
    display: grid;
    grid-template-columns: minmax(0, 0.9fr) minmax(460px, 1.1fr);
    gap: 72px;
    align-items: center;
    min-height: calc(100vh - 72px);
    padding-block: 30px;
  }
  h1 {
    max-width: 620px;
    margin-bottom: 28px;
    font-size: clamp(3.5rem, 6.4vw, 5.25rem);
    font-style: normal;
    line-height: 0.95;
  }
  h1 span {
    display: block;
    font: inherit;
  }
  h1 .hero-title-accent {
    color: var(--lime);
  }
  .hero-lede {
    max-width: 620px;
    color: #aebed0;
    font-size: 1.08rem;
    line-height: 1.75;
  }
  .hero-actions,
  .cta > div {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    margin-top: 34px;
  }
  .primary-action,
  .secondary-action {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 18px;
    min-height: 48px;
    padding: 0 20px;
    border-radius: 10px;
    font-size: 0.82rem;
    font-weight: 800;
    text-decoration: none;
  }
  .primary-action {
    color: #07111f;
    background: var(--lime);
  }
  .secondary-action {
    border: 1px solid var(--line);
    color: #d9e4f0;
    background: rgba(255, 255, 255, 0.02);
  }
  .hero-stats {
    display: flex;
    gap: 34px;
    margin: 58px 0 0;
  }
  .hero-stats div {
    padding-left: 14px;
    border-left: 1px solid var(--line);
  }
  .hero-stats dt {
    color: #f4f8fd;
    font-size: 1.15rem;
    font-weight: 800;
  }
  .hero-stats dd {
    margin: 5px 0 0;
    color: #74879e;
    font-size: 0.69rem;
  }
  .hero-visual {
    --stage-padding: clamp(30px, 3.5vw, 44px);
    position: relative;
    padding: var(--stage-padding);
  }
  .hero-visual::before {
    position: absolute;
    inset: 0;
    z-index: 0;
    pointer-events: none;
    content: '';
    opacity: 0.9;
    /* deslop-ignore-next-line 06 -- this fading measurement grid explains image cropping and transformation. */
    background-image:
      linear-gradient(rgba(143, 184, 255, 0.14) 1px, transparent 1px),
      linear-gradient(90deg, rgba(143, 184, 255, 0.14) 1px, transparent 1px);
    background-position: 23px 23px;
    background-size: 46px 46px;
    /* deslop-ignore-next-line 06 -- edge fade makes the measurement grid read as unbounded space. */
    mask-image: radial-gradient(ellipse at center, black 48%, rgba(0, 0, 0, 0.72) 72%, transparent 100%);
  }
  .image-frame {
    --frame-radius: 28px;
    position: relative;
    z-index: 1;
    overflow: hidden;
    padding: 10px;
    border-radius: var(--frame-radius);
    clip-path: polygon(0 0, calc(100% - 56px) 0, 100% 56px, 100% 100%, 0 100%);
    background: var(--lime);
  }
  .image-frame::before {
    position: absolute;
    inset: 1px;
    content: '';
    border-radius: calc(var(--frame-radius) - 1px);
    clip-path: inherit;
    background: #07111f;
  }
  .image-crop {
    position: relative;
    z-index: 1;
    aspect-ratio: 1;
    overflow: hidden;
    border-radius: calc(var(--frame-radius) - 10px) 0 0 0;
    clip-path: polygon(0 0, calc(100% - 48px) 0, 100% 48px, 100% 100%, 0 100%);
    background: #07111f;
  }
  .image-crop :global(picture) {
    position: absolute;
    inset: 0;
    display: block;
    width: 100%;
    height: 100%;
  }
  .image-crop :global(img) {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: 68% center;
  }
  .image-meta {
    position: relative;
    z-index: 1;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    min-height: 38px;
    padding: 9px 2px 0;
    color: #7f93aa;
    font-size: 0.66rem;
  }
  .image-meta code {
    color: var(--lime);
  }
  .crop-target {
    --calibration-delay: 0s;
    position: absolute;
    z-index: 2;
    width: 22px;
    height: 22px;
    transform-origin: center;
    color: rgba(143, 184, 255, 0.68);
  }
  .crop-target::before,
  .crop-target::after {
    position: absolute;
    content: '';
    background: currentColor;
  }
  .crop-target::before {
    top: 50%;
    left: 0;
    width: 100%;
    height: 1px;
  }
  .crop-target::after {
    top: 0;
    left: 50%;
    width: 1px;
    height: 100%;
  }
  .crop-target--top-left {
    top: -11px;
    left: -11px;
  }
  .crop-target--top-right {
    --calibration-delay: 0.24s;
    top: -11px;
    right: -11px;
  }
  .crop-target--bottom-left {
    --calibration-delay: 0.72s;
    bottom: -11px;
    left: -11px;
  }
  .crop-target--bottom-right {
    --calibration-delay: 0.48s;
    right: -11px;
    bottom: -11px;
  }
  @keyframes hero-grid-drift {
    to {
      background-position: 69px 69px;
    }
  }
  @keyframes crop-target-calibrate {
    0%,
    12%,
    100% {
      opacity: 0.72;
      transform: scale(1);
    }
    3% {
      opacity: 1;
      transform: scale(1.18);
    }
    7% {
      opacity: 0.84;
      transform: scale(1);
    }
  }
  @media (prefers-reduced-motion: no-preference) {
    .hero-visual::before {
      animation: hero-grid-drift 18s linear infinite;
    }
    .crop-target {
      animation: crop-target-calibrate 8s cubic-bezier(0.22, 1, 0.36, 1) var(--calibration-delay) infinite both;
    }
  }
  .trust-strip {
    border-block: 1px solid var(--line);
    background: rgba(255, 255, 255, 0.018);
  }
  .trust-strip .shell {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 28px;
    min-height: 72px;
    color: #8496ab;
    font-size: 0.72rem;
    font-weight: 650;
    text-transform: uppercase;
  }
  .trust-strip i {
    width: 3px;
    height: 3px;
    border-radius: 50%;
    background: #42556b;
  }
  .problem {
    display: grid;
    grid-template-columns: 1.1fr 0.9fr;
    gap: 80px;
    align-items: end;
    padding-block: 150px;
  }
  .problem h2 {
    margin-bottom: 0;
  }
  .feature-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    border-block: 1px solid var(--line);
  }
  .feature-grid article {
    padding: 38px 26px;
    border-right: 1px solid var(--line);
  }
  .feature-grid article:last-child {
    border: 0;
  }
  .feature-grid span {
    color: var(--blue);
    font-size: 0.68rem;
    font-weight: 800;
  }
  .feature-grid h3 {
    margin: 50px 0 13px;
    font-size: 1.05rem;
  }
  .feature-grid p {
    margin: 0;
    color: var(--muted);
    font-size: 0.82rem;
    line-height: 1.65;
  }
  .autodetect {
    padding-block: 150px;
  }
  .autodetect-copy {
    display: grid;
    grid-template-columns: 1.1fr 0.9fr;
    gap: 80px;
    align-items: end;
    margin-bottom: 48px;
  }
  .autodetect-copy .eyebrow,
  .autodetect-copy h2 {
    grid-column: 1;
  }
  .autodetect-copy h2 {
    margin-bottom: 0;
  }
  .autodetect-copy .section-copy {
    grid-column: 2;
    grid-row: 1 / span 2;
    align-self: end;
  }
  .detect-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    border-top: 1px solid var(--line);
    border-left: 1px solid var(--line);
  }
  .detect-grid article {
    min-width: 0;
    padding: 28px 22px;
    border-right: 1px solid var(--line);
    border-bottom: 1px solid var(--line);
    background: rgba(255, 255, 255, 0.018);
  }
  .detect-grid span,
  .detect-grid strong,
  .detect-grid code {
    display: block;
  }
  .detect-grid span {
    color: #71859d;
    font-size: 0.68rem;
    font-weight: 700;
    text-transform: uppercase;
  }
  .detect-grid strong {
    margin: 40px 0 10px;
    color: #eef5fc;
    font-size: 1rem;
  }
  .detect-grid code {
    overflow: hidden;
    color: var(--lime);
    font-size: 0.68rem;
    text-overflow: ellipsis;
  }
  .detect-note {
    margin: 18px 0 0;
    color: #71859d;
    font-size: 0.72rem;
  }
  .playground-section {
    padding-block: 150px;
    background: linear-gradient(to bottom, transparent, rgba(143, 184, 255, 0.035), transparent);
  }
  .section-intro,
  .provider-heading {
    display: grid;
    grid-template-columns: 1.1fr 0.9fr;
    gap: 80px;
    align-items: end;
    margin-bottom: 48px;
  }
  .section-intro h2,
  .provider-heading h2 {
    margin-bottom: 0;
  }
  .section-intro code {
    color: var(--lime);
  }
  .frameworks {
    display: grid;
    grid-template-columns: 0.82fr 1.18fr;
    gap: 80px;
    align-items: center;
    padding-block: 120px;
  }
  .framework-copy ul {
    display: grid;
    gap: 13px;
    margin: 34px 0 0;
    padding: 0;
    list-style: none;
    color: #c7d2df;
    font-size: 0.85rem;
  }
  .framework-copy li {
    display: flex;
    gap: 10px;
  }
  .framework-copy li span {
    color: var(--lime);
  }
  .code-card {
    overflow: hidden;
    border: 1px solid var(--line);
    border-radius: 20px;
    background: #050d17;
    box-shadow: 0 28px 70px rgba(0, 0, 0, 0.3);
  }
  .code-tabs {
    display: flex;
    padding: 10px;
    border-bottom: 1px solid var(--line);
    background: #0b1828;
  }
  .code-tabs button,
  .package-switch button {
    padding: 8px 13px;
    border: 0;
    border-radius: 7px;
    color: #8092a8;
    background: transparent;
    font-size: 0.74rem;
    font-weight: 700;
    cursor: pointer;
  }
  .code-tabs button.active,
  .package-switch button.active {
    color: #07111f;
    background: var(--lime);
  }
  pre {
    min-height: 390px;
    margin: 0;
    padding: 28px;
    overflow: auto;
    color: #bfd4ed;
    font-size: 0.76rem;
    line-height: 1.7;
  }
  .quickstart {
    padding-block: 130px;
    border-block: 1px solid var(--line);
    background: var(--paper);
    color: #101b28;
  }
  .quickstart .eyebrow {
    color: #416318;
  }
  .quickstart .section-copy {
    color: #5b6876;
  }
  .quickstart-grid {
    display: grid;
    grid-template-columns: 0.9fr 1.1fr;
    gap: 90px;
    align-items: center;
  }
  .install-card {
    padding: 28px;
    border: 1px solid rgba(7, 17, 31, 0.13);
    border-radius: 20px;
    background: #fff;
    box-shadow: 0 28px 80px rgba(38, 33, 23, 0.1);
  }
  .package-switch {
    display: flex;
    gap: 5px;
    margin-bottom: 20px;
  }
  .package-switch button {
    background: #edf0ea;
  }
  .install-command {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 14px;
    border-radius: 10px;
    color: #d8e6f5;
    background: #07111f;
  }
  .install-command code {
    min-width: 0;
    flex: 1;
    overflow: hidden;
    font-size: 0.77rem;
    text-overflow: ellipsis;
  }
  .install-command button {
    border: 0;
    color: var(--lime);
    background: transparent;
    font-size: 0.72rem;
    font-weight: 800;
    cursor: pointer;
  }
  .install-card ol {
    display: grid;
    gap: 14px;
    margin: 25px 0 0;
    padding: 0;
    list-style: none;
    color: #455363;
    font-size: 0.82rem;
  }
  .install-card li {
    display: flex;
    align-items: center;
    gap: 11px;
  }
  .install-card li span {
    display: grid;
    width: 24px;
    height: 24px;
    place-items: center;
    border: 1px solid #ccd2ca;
    border-radius: 50%;
    font-size: 0.66rem;
    font-weight: 800;
  }
  .providers {
    padding-block: 150px;
  }
  .provider-list {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    border-top: 1px solid var(--line);
    border-left: 1px solid var(--line);
  }
  .provider-list span {
    display: flex;
    gap: 16px;
    align-items: center;
    min-height: 70px;
    padding: 16px;
    border-right: 1px solid var(--line);
    border-bottom: 1px solid var(--line);
    color: #cad6e4;
    font-size: 0.82rem;
  }
  .provider-list b {
    color: #5e728a;
    font-size: 0.65rem;
  }
  .provider-list .more {
    color: var(--lime);
  }
  .comparison {
    padding-block: 140px;
    border-block: 1px solid var(--line);
    background: rgba(255, 255, 255, 0.018);
  }
  .comparison-table {
    overflow-x: auto;
    border: 1px solid var(--line);
    border-radius: 18px;
  }
  .comparison table {
    width: 100%;
    min-width: 960px;
    border-collapse: collapse;
    color: #aebed0;
    font-size: 0.78rem;
    line-height: 1.55;
    text-align: left;
  }
  .comparison th,
  .comparison td {
    padding: 20px;
    border-right: 1px solid var(--line);
    border-bottom: 1px solid var(--line);
    vertical-align: top;
  }
  .comparison th:last-child,
  .comparison td:last-child {
    border-right: 0;
  }
  .comparison tbody tr:last-child th,
  .comparison tbody tr:last-child td {
    border-bottom: 0;
  }
  .comparison thead th {
    color: #72869e;
    background: #081421;
    font-size: 0.66rem;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }
  .comparison tbody th {
    width: 150px;
    color: #eef5fc;
    font-size: 0.82rem;
  }
  .comparison a {
    color: inherit;
  }
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
  }
  .api-list article {
    min-height: 230px;
    padding: 28px;
    border-right: 1px solid var(--line);
    border-bottom: 1px solid var(--line);
  }
  .api-list code {
    color: var(--blue);
    font-size: 0.69rem;
  }
  .api-list h3 {
    margin: 50px 0 12px;
    font-size: 1rem;
  }
  .api-list p {
    color: var(--muted);
    font-size: 0.8rem;
    line-height: 1.65;
  }
  .cta {
    margin-bottom: 120px;
    padding: 80px;
    border: 1px solid rgba(191, 244, 139, 0.2);
    border-radius: 30px;
    text-align: center;
    background: radial-gradient(circle at 50% 110%, rgba(191, 244, 139, 0.14), transparent 48%), #0c192a;
  }
  .cta h2 {
    margin-inline: auto;
  }
  .cta p {
    color: var(--muted);
  }
  .cta > div {
    justify-content: center;
  }
  footer {
    border-top: 1px solid var(--line);
  }
  footer .shell {
    display: flex;
    align-items: center;
    justify-content: space-between;
    min-height: 120px;
    color: #71849a;
    font-size: 0.72rem;
  }
  footer div div {
    display: flex;
    gap: 20px;
  }
  footer a {
    text-decoration: none;
  }
  @media (max-width: 980px) {
    .hero {
      grid-template-columns: 1fr;
      min-height: auto;
    }
    .hero-copy {
      padding-top: 30px;
    }
    .hero-visual {
      width: min(720px, 100%);
      margin-inline: auto;
    }
    .problem,
    .section-intro,
    .provider-heading,
    .autodetect-copy,
    .frameworks,
    .quickstart-grid {
      grid-template-columns: 1fr;
      gap: 40px;
    }
    .autodetect-copy .eyebrow,
    .autodetect-copy h2,
    .autodetect-copy .section-copy {
      grid-column: 1;
      grid-row: auto;
    }
    .feature-grid {
      grid-template-columns: 1fr 1fr;
    }
    .feature-grid article:nth-child(2) {
      border-right: 0;
    }
    .provider-list {
      grid-template-columns: repeat(3, 1fr);
    }
    .detect-grid {
      grid-template-columns: 1fr 1fr;
    }
    .api-list {
      grid-template-columns: 1fr 1fr;
    }
  }
  @media (max-width: 680px) {
    nav {
      display: none;
    }
    .hero {
      gap: 50px;
      padding-block: 54px;
    }
    .hero-stats {
      gap: 14px;
    }
    .trust-strip .shell {
      justify-content: flex-start;
      overflow: auto;
    }
    .trust-strip i {
      display: none;
    }
    .problem,
    .autodetect,
    .playground-section,
    .providers,
    .comparison {
      padding-block: 100px;
    }
    .feature-grid,
    .detect-grid,
    .provider-list,
    .api-list {
      grid-template-columns: 1fr;
    }
    .feature-grid article {
      border-right: 0;
    }
    .frameworks {
      padding-block: 90px;
    }
    .quickstart {
      padding-block: 90px;
    }
    .cta {
      padding: 55px 20px;
    }
    .cta .secondary-action {
      display: none;
    }
    footer .shell {
      align-items: flex-start;
      flex-direction: column;
      justify-content: center;
      gap: 18px;
    }
    footer p {
      margin: 0;
    }
  }
</style>
