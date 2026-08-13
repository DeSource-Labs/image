<script lang="ts">
  import { Picture } from '@desource/image-svelte';
  import Playground from '$lib/Playground.svelte';
  import type { PageData } from './$types';

  let { data }: { data: PageData } = $props();

  let framework = $state<'angular' | 'svelte'>('svelte');
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
      '<\\/script>',
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
    ].join('\n')
  };

  async function copyInstall() {
    await navigator.clipboard.writeText(
      framework === 'svelte' ? 'pnpm add @desource/image-svelte' : 'pnpm add @desource/image-angular'
    );
    installLabel = 'Copied';
    globalThis.setTimeout(() => (installLabel = 'Copy'), 1400);
  }
</script>

<svelte:head>
  <title>Desource Image — Image optimization for Angular and Svelte</title>
  <meta
    name="description"
    content="A provider-powered, responsive image toolkit with native Angular and Svelte APIs, deterministic SSR, and Nuxt Image-inspired ergonomics."
  />
  <meta property="og:title" content="Desource Image" />
  <meta property="og:description" content="One image API for Angular and Svelte." />
  <meta property="og:type" content="website" />
  <meta property="og:image" content={`${data.origin}/og.png`} />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:image" content={`${data.origin}/og.png`} />
</svelte:head>

<header class="site-header">
  <div class="shell nav">
    <a class="brand" href="#top" aria-label="Desource Image home"><span>DS</span> image</a>
    <nav aria-label="Primary navigation">
      <a href="#playground">Playground</a><a href="#frameworks">Frameworks</a><a href="#providers">Providers</a><a
        href="#api">Docs</a
      >
    </nav>
    <a class="github-link" href="https://github.com/DeSource-Labs/image">GitHub <span>↗</span></a>
  </div>
</header>

<main id="top">
  <section class="hero shell">
    <div class="hero-copy">
      <p class="eyebrow">The missing image layer</p>
      <h1>Ship the right image. <em>Every time.</em></h1>
      <p class="hero-lede">
        Nuxt Image’s beloved developer experience, rebuilt as a framework-native toolkit for Angular and Svelte.
        Responsive sources, provider URLs, placeholders, and SSR—without the glue code.
      </p>
      <div class="hero-actions">
        <a class="primary-action" href="#quickstart">Start building <span>→</span></a><a
          class="secondary-action"
          href="#playground">Try the playground</a
        >
      </div>
      <dl class="hero-stats">
        <div>
          <dt>40+</dt>
          <dd>image providers</dd>
        </div>
        <div>
          <dt>3</dt>
          <dd>tree-shakable packages</dd>
        </div>
        <div>
          <dt>SSR</dt>
          <dd>deterministic output</dd>
        </div>
      </dl>
    </div>
    <div class="hero-visual">
      <div class="image-frame">
        <Picture
          src="/img/hero.jpg"
          alt="Joshua trees under a dramatic desert sky"
          width={1920}
          height={1200}
          sizes="100vw lg:620px"
          format="avif,webp"
          legacyFormat="jpeg"
          quality={78}
          preload
        />
        <span class="image-label">responsive / provider-ready</span>
      </div>
      <div class="floating-code">
        <span>generated at render</span><code>/_ipx/w_1240&amp;f_avif&amp;q_78/img/hero.jpg</code>
      </div>
    </div>
  </section>

  <section class="trust-strip" aria-label="Core capabilities">
    <div class="shell">
      <span>Angular 19—21</span><i></i><span>Svelte 5</span><i></i><span>SvelteKit SSR</span><i></i><span
        >TypeScript-first</span
      ><i></i><span>Custom providers</span>
    </div>
  </section>

  <section class="problem shell">
    <div>
      <p class="eyebrow">Stop hand-wiring images</p>
      <h2>Your framework should know how to serve an image.</h2>
    </div>
    <p class="section-copy">
      A CMS URL, breakpoint list, CDN syntax, preload link, and fallback format should not become five utilities in
      every app. Desource Image turns one declarative input into production-ready markup and keeps the same model across
      frameworks.
    </p>
  </section>

  <section class="feature-grid shell" aria-label="Library benefits">
    <article>
      <span>01</span>
      <h3>One stable API</h3>
      <p>Components, directives, actions, attachments, and a callable URL helper all resolve through the same core.</p>
    </article>
    <article>
      <span>02</span>
      <h3>Provider intelligence</h3>
      <p>Use IPX locally, let deployments auto-detect their platform, or bring a typed custom provider.</p>
    </article>
    <article>
      <span>03</span>
      <h3>Responsive by default</h3>
      <p>Generate density or width candidates, sizes media queries, modern picture formats, and aspect-safe heights.</p>
    </article>
    <article>
      <span>04</span>
      <h3>Server rendering intact</h3>
      <p>Pure URL generation keeps Angular SSR and SvelteKit output deterministic through hydration.</p>
    </article>
  </section>

  <section class="playground-section" id="playground">
    <div class="shell section-intro">
      <div>
        <p class="eyebrow">Real output, not a mockup</p>
        <h2>Turn the dials. Watch the URL change.</h2>
      </div>
      <p class="section-copy">
        This page uses the package itself. Each control regenerates the source, dimensions, format, quality, and
        responsive candidates through <code>@desource/image</code>.
      </p>
    </div>
    <div class="shell"><Playground /></div>
  </section>

  <section class="frameworks shell" id="frameworks">
    <div class="framework-copy">
      <p class="eyebrow">Native where it matters</p>
      <h2>Learn one mental model. Keep your framework’s strengths.</h2>
      <p class="section-copy">
        Signal inputs and standalone directives in Angular. Snippets, actions, and Svelte 5 attachments in Svelte.
        Rendering stays native while provider and responsive logic stays shared.
      </p>
      <ul>
        <li><span>✓</span> No wrapper element in Svelte output</li>
        <li><span>✓</span> Standalone, OnPush Angular APIs</li>
        <li><span>✓</span> Native attributes and events forwarded</li>
      </ul>
    </div>
    <div class="code-card">
      <div class="code-tabs" role="tablist" aria-label="Framework example">
        <button class:active={framework === 'svelte'} onclick={() => (framework = 'svelte')} role="tab">Svelte</button>
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
        <p class="eyebrow">Two-minute setup</p>
        <h2>Install. Import. Ship.</h2>
        <p class="section-copy">
          The local IPX integration handles development. Deployment providers can be selected explicitly or resolved by
          the build environment.
        </p>
      </div>
      <div class="install-card">
        <div class="package-switch">
          <button class:active={framework === 'svelte'} onclick={() => (framework = 'svelte')}>Svelte</button><button
            class:active={framework === 'angular'}
            onclick={() => (framework = 'angular')}>Angular</button
          >
        </div>
        <div class="install-command">
          <code>pnpm add @desource/image-{framework}</code><button onclick={copyInstall}>{installLabel}</button>
        </div>
        <ol>
          <li><span>1</span> Add the framework package</li>
          <li><span>2</span> Configure only when defaults are not enough</li>
          <li><span>3</span> Replace the image element you already have</li>
        </ol>
      </div>
    </div>
  </section>

  <section class="providers shell" id="providers">
    <div class="provider-heading">
      <div>
        <p class="eyebrow">Bring your image stack</p>
        <h2>A provider for where your pixels already live.</h2>
      </div>
      <p class="section-copy">
        Import one provider for the smallest bundle, opt into the full registry, or define your own with the same
        provider-authoring utilities.
      </p>
    </div>
    <div class="provider-list">
      {#each providers as provider, index (provider)}<span><b>{String(index + 1).padStart(2, '0')}</b>{provider}</span
        >{/each}
      <span class="more"><b>+</b>and more</span>
    </div>
  </section>

  <section class="api shell" id="api">
    <div class="api-heading">
      <p class="eyebrow">Small surface, deep capability</p>
      <h2>Use the level of abstraction your screen needs.</h2>
    </div>
    <div class="api-list">
      <article>
        <code>Image / DsImage</code>
        <h3>Optimized image components</h3>
        <p>Drop-in responsive rendering with placeholders, presets, native attributes, and events.</p>
      </article>
      <article>
        <code>Picture / DsPicture</code>
        <h3>Modern format negotiation</h3>
        <p>Ordered AVIF and WebP sources with an automatic transparent-safe legacy fallback.</p>
      </article>
      <article>
        <code>useImage / DsImageService</code>
        <h3>Callable URL generation</h3>
        <p>Use optimized images in CSS, canvas, metadata, headless UI, or custom rendering.</p>
      </article>
      <article>
        <code>action / attachment / directive</code>
        <h3>Enhance native markup</h3>
        <p>Keep regular image and picture elements while applying the same behavior.</p>
      </article>
      <article>
        <code>@desource/image/providers/*</code>
        <h3>Tree-shakable providers</h3>
        <p>Ship the integrations you configure instead of the complete provider catalog.</p>
      </article>
      <article>
        <code>@desource/image/kit</code>
        <h3>Build an integration</h3>
        <p>Typed parsers, operations generators, config guards, and provider primitives.</p>
      </article>
    </div>
  </section>

  <section class="cta shell">
    <p class="eyebrow">Your images can be simpler</p>
    <h2>Spend less time translating CDN URLs.</h2>
    <p>Give every Angular and Svelte screen one reliable image language.</p>
    <div>
      <a class="primary-action" href="#quickstart">Get started <span>→</span></a><a
        class="secondary-action"
        href="https://github.com/DeSource-Labs/image">Read the source</a
      >
    </div>
  </section>
</main>

<footer>
  <div class="shell">
    <a class="brand" href="#top"><span>DS</span> image</a>
    <p>Image optimization for Angular and Svelte. MIT licensed.</p>
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
    padding-block: 80px;
  }
  h1 {
    max-width: 650px;
    margin-bottom: 28px;
    font-size: clamp(3.7rem, 7.2vw, 7.4rem);
    line-height: 0.87;
  }
  h1 em {
    display: block;
    color: var(--lime);
    font-weight: 500;
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
    position: relative;
  }
  .image-frame {
    position: relative;
    overflow: hidden;
    border: 1px solid rgba(255, 255, 255, 0.13);
    border-radius: 240px 240px 28px 28px;
    box-shadow: 0 40px 100px rgba(0, 0, 0, 0.42);
  }
  .image-frame :global(picture),
  .image-frame :global(img) {
    display: block;
    width: 100%;
  }
  .image-frame :global(img) {
    height: min(68vh, 720px);
    object-fit: cover;
  }
  .image-frame::after {
    position: absolute;
    inset: 0;
    content: '';
    background: linear-gradient(to top, rgba(5, 12, 20, 0.65), transparent 38%);
  }
  .image-label {
    position: absolute;
    z-index: 2;
    right: 22px;
    bottom: 22px;
    padding: 8px 11px;
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 999px;
    background: rgba(5, 12, 20, 0.68);
    font-size: 0.67rem;
    font-weight: 700;
  }
  .floating-code {
    position: absolute;
    bottom: 90px;
    left: -50px;
    z-index: 3;
    width: min(360px, 78%);
    padding: 16px;
    border: 1px solid rgba(143, 184, 255, 0.24);
    border-radius: 12px;
    background: rgba(7, 17, 31, 0.88);
    box-shadow: 0 20px 50px rgba(0, 0, 0, 0.35);
    backdrop-filter: blur(16px);
  }
  .floating-code span {
    display: block;
    margin-bottom: 8px;
    color: #70849c;
    font-size: 0.64rem;
    text-transform: uppercase;
  }
  .floating-code code {
    display: block;
    overflow: hidden;
    color: #c8dcf4;
    font-size: 0.69rem;
    text-overflow: ellipsis;
    white-space: nowrap;
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
  .cta .eyebrow {
    justify-content: center;
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
    .frameworks,
    .quickstart-grid {
      grid-template-columns: 1fr;
      gap: 40px;
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
    .floating-code {
      bottom: 55px;
      left: 12px;
    }
    .trust-strip .shell {
      justify-content: flex-start;
      overflow: auto;
    }
    .trust-strip i {
      display: none;
    }
    .problem,
    .playground-section,
    .providers {
      padding-block: 100px;
    }
    .feature-grid,
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
