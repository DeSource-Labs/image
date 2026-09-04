<script lang="ts">
  /* eslint-disable svelte/no-navigation-without-resolve -- Service documentation links are external URLs supplied by the server catalog. Internal links use resolve(). */
  import { resolve } from '$app/paths';
  import { Image } from '@desource/image-svelte';
  import { providers } from '$lib/providers';
  import type { PageData } from './$types';

  let { data }: { data: PageData } = $props();
  let framework = $state<'svelte' | 'react' | 'angular'>('svelte');
</script>

<svelte:head>
  <title>{data.provider.name} provider · Desource Image</title>
  <meta name="description" content={data.doc.description} />
  <link rel="canonical" href={`${data.origin}/providers/${data.provider.slug}`} />
  <meta property="og:title" content={`${data.provider.name} provider · Desource Image`} />
  <meta property="og:description" content={data.doc.description} />
  <meta property="og:url" content={`${data.origin}/providers/${data.provider.slug}`} />
  <meta property="og:type" content="article" />
</svelte:head>

<header class="docs-header">
  <div class="shell">
    <a class="brand" href={resolve('/')}>
      <Image src="/logo.png" format="avif" width="31" height="31" alt="DeSource Labs" />
      Desource Image
    </a>
    <a class="back-link" href={resolve('/#providers')}>← All providers</a>
  </div>
</header>

<main class="shell docs-shell">
  <aside>
    <nav aria-label="Provider documentation">
      <details class="animated-details">
        <summary>Choose a provider</summary>
        <ul>
          {#each providers as provider (provider.id)}
            <li>
              <a
                href={resolve('/providers/[provider]', { provider: provider.slug })}
                aria-current={provider.id === data.provider.id ? 'page' : undefined}
                >{provider.name}
              </a>
            </li>
          {/each}
        </ul>
      </details>
    </nav>
    <nav class="contents" aria-label="On this page">
      <p>On this page</p>
      <a href="#setup">Setup</a>
      <a href="#source">Image source</a>
      <a href="#usage">Usage</a>
      <a href="#options">Options</a>
      <a href="#modifiers">Modifiers</a>
      <a href="#notes">Provider notes</a>
    </nav>
  </aside>

  <article>
    <div class="doc-title">
      <div class="provider-icon">
        <Image src={data.provider.icon} alt={data.provider.name} width={60} height={60} quality={100} />
      </div>
      <div>
        <p class="eyebrow">Provider documentation</p>
        <h1>{data.provider.name}</h1>
      </div>
    </div>
    <p class="description">{data.doc.description}</p>
    <div class="doc-links">
      <a href={`https://github.com/DeSource-Labs/image/blob/main/packages/core/src/providers/${data.provider.id}.ts`}>
        Provider source ↗
      </a>
      <!-- These are external service documentation URLs, stored in the provider catalog. -->
      <a href={data.doc.reference}>Service documentation ↗</a>
    </div>

    <section id="setup">
      <h2>Setup</h2>
      <p>Install the framework package and the core package for the provider import:</p>
      <div class="framework-switch" role="group" aria-label="Example framework">
        {#each ['svelte', 'react', 'angular'] as name (name)}
          <button
            type="button"
            aria-pressed={framework === name}
            onclick={() => (framework = name as typeof framework)}
          >
            {name === 'svelte' ? 'Svelte' : name === 'react' ? 'React' : 'Angular'}
          </button>
        {/each}
      </div>
      <pre><code>npm install @desource/image @desource/image-{framework}</code></pre>
      <p>
        Save this as <code>image.config.ts</code> beside your example component. Replace sample domains and identifiers with
        your own.
      </p>
      <pre><code>{data.configuration}</code></pre>
      <p>
        Registering this provider makes it the default for the configured components. To mix services, register each
        provider and set <code>provider="{data.provider.id}"</code> on the image that should use this one.
      </p>
    </section>

    <section id="source">
      <h2>Image source</h2>
      <p>{data.doc.source}</p>
      <pre><code>{data.doc.src}</code></pre>
    </section>
    <section id="usage">
      <h2>Usage</h2>
      <p>
        The example uses the shared configuration above and the {framework === 'svelte'
          ? 'Svelte'
          : framework === 'react'
            ? 'React'
            : 'Angular'} image component.
      </p>
      <pre><code>{data.examples[framework]}</code></pre>
    </section>
    <section id="options">
      <h2>Provider options</h2>
      {#if data.doc.options.length}
        <dl class="options">
          {#each data.doc.options as option (option.name)}
            <div>
              <dt><code>{option.name}</code></dt>
              <dd>{option.description}</dd>
            </div>
          {/each}
        </dl>
      {:else}<p>
          This provider needs no service-specific factory options. Register the factory with no arguments.
        </p>{/if}
      <p>
        Pass shared defaults such as <code>screens</code>, <code>domains</code>, <code>aliases</code> and
        <code>presets</code>
        to the image configuration. Pass provider-specific defaults as <code>modifiers</code> in the provider factory.
      </p>
    </section>
    <section id="modifiers">
      <h2>Modifiers</h2>
      <p>{data.doc.modifiers}</p>
      <p>
        Set dimensions on the component and pass service-specific operations through <code>modifiers</code>, as shown
        above. See the provider source for exact mappings and the service documentation for accepted values.
      </p>
    </section>
    <section id="notes">
      <h2>Provider notes</h2>
      <ul class="notes">
        {#each data.doc.notes as note (note)}<li>{note}</li>{/each}
      </ul>
    </section>
    {#each data.doc.extra as example (example.title)}<section>
        <h2>{example.title}</h2>
        <pre><code>{example.code}</code></pre>
      </section>{/each}
    {#if data.provider.id === 'netlify'}<p>
        <a href={resolve('/providers/[provider]', { provider: 'netlify-image-cdn' })}>
          Netlify Image CDN configuration and examples →
        </a>
      </p>{/if}
    <a class="back-button" href={resolve('/#providers')}>← Back to all providers</a>
  </article>
</main>

<style>
  .docs-header {
    position: sticky;
    top: 0;
    z-index: 20;
    border-bottom: 1px solid var(--line);
    background: rgba(7, 17, 31, 0.96);
  }
  .docs-header .shell {
    min-height: 72px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 16px;
  }
  .brand {
    display: flex;
    align-items: center;
    gap: 9px;
    font-size: 0.95rem;
    font-weight: 750;
    text-decoration: none;
  }
  a {
    color: var(--blue);
    text-underline-offset: 4px;
  }
  .back-link {
    font-size: 0.8rem;
    white-space: nowrap;
  }
  .docs-shell {
    display: grid;
    grid-template-columns: 200px minmax(0, 1fr);
    gap: 72px;
    padding-block: 56px 100px;
    align-items: start;
  }
  aside {
    position: sticky;
    top: 104px;
    font-size: 0.85rem;
  }
  summary {
    cursor: pointer;
    color: var(--lime);
    padding-block: 12px;
  }
  nav ul {
    max-height: 40vh;
    overflow: auto;
    list-style: none;
    padding: 0;
    display: grid;
    gap: 4px;
  }
  nav a {
    display: block;
    padding: 8px 0;
    text-decoration: none;
  }
  nav a[aria-current] {
    color: var(--lime);
    font-weight: 750;
  }
  .contents {
    margin-top: 24px;
  }
  .contents p {
    color: var(--muted);
  }
  article {
    min-width: 0;
    max-width: 820px;
  }
  .doc-title {
    display: flex;
    align-items: center;
    gap: 24px;
  }
  .provider-icon {
    width: 96px;
    height: 96px;
    flex-shrink: 0;
    padding: 4px;
    background: #f6f7f4;
    border-radius: 18px;
  }
  .provider-icon :global(img) {
    width: 100%;
    height: 100%;
    object-fit: contain;
    border-radius: 18px;
    background: #f6f7f4;
    filter: saturate(0.75);
  }
  .eyebrow {
    margin-bottom: 10px;
  }
  h1 {
    overflow-wrap: anywhere;
    margin: 0;
    font-size: clamp(2.2rem, 5vw, 4rem);
  }
  .description {
    margin-top: 28px;
    color: #c7d5e6;
    font-size: 1.15rem;
  }
  .doc-links {
    display: flex;
    flex-wrap: wrap;
    gap: 12px 24px;
    font-size: 0.85rem;
    padding-bottom: 30px;
    border-bottom: 1px solid var(--line);
  }
  section {
    margin-top: 44px;
    scroll-margin-top: 100px;
  }
  h2 {
    font-size: 1.8rem;
    letter-spacing: -0.025em;
  }
  p,
  dd,
  .notes {
    overflow-wrap: anywhere;
    color: var(--muted);
    line-height: 1.8;
  }
  p code,
  dt code {
    color: #cce7b2;
    overflow-wrap: anywhere;
  }
  pre {
    min-width: 0;
    max-width: 100%;
    overflow: auto;
    padding: 22px;
    border: 1px solid var(--line);
    border-radius: 12px;
    background: #050d17;
    color: #bfd4ed;
    font-size: 0.8rem;
    line-height: 1.7;
    tab-size: 2;
  }
  .framework-switch {
    display: flex;
    gap: 6px;
  }
  .framework-switch button {
    border: 1px solid var(--line);
    border-radius: 6px;
    padding: 10px 16px;
    color: #cad6e4;
    background: transparent;
    cursor: pointer;
  }
  .framework-switch button[aria-pressed='true'] {
    color: #07111f;
    background: var(--lime);
  }
  .options > div {
    padding: 16px 0;
    border-bottom: 1px solid var(--line);
  }
  dt {
    margin-bottom: 8px;
  }
  dd {
    margin: 0;
  }
  .notes {
    padding-left: 22px;
  }
  .notes li + li {
    margin-top: 14px;
  }
  .back-button {
    display: inline-flex;
    margin-top: 44px;
    padding: 14px 20px;
    border: 1px solid var(--line);
    border-radius: 8px;
    text-decoration: none;
    color: var(--lime);
  }
  @media (max-width: 900px) {
    .docs-shell {
      grid-template-columns: minmax(0, 1fr);
      gap: 28px;
      padding-top: 24px;
    }
    aside {
      position: static;
    }
    .contents {
      display: none;
    }
    nav ul {
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    }
  }
  @media (max-width: 480px) {
    .docs-header .shell {
      gap: 8px;
    }
    .brand {
      font-size: 0.8rem;
    }
    .back-link {
      font-size: 0.72rem;
    }
    .doc-title {
      gap: 16px;
    }
    .provider-icon {
      width: 64px;
      height: 64px;
      padding: 10px;
      border-radius: 12px;
    }
    .eyebrow {
      font-size: 0.65rem;
    }
    pre {
      padding: 16px;
      font-size: 0.72rem;
    }
    .back-button {
      width: 100%;
      justify-content: center;
    }
  }
</style>
