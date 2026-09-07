<script lang="ts">
  import { resolve } from '$app/paths';
  import { DsImage } from '@desource/image-svelte';
  import { providers } from '$lib/providers';
  import type { PageData } from './$types';

  type Framework = 'core' | 'svelte' | 'react' | 'angular';

  let { data }: { data: PageData } = $props();
  let framework = $state<Framework>('core');

  const frameworkNames: Record<Framework, string> = {
    core: 'Core',
    svelte: 'Svelte',
    react: 'React',
    angular: 'Angular'
  };
  const installCommands: Record<Framework, string> = {
    core: 'npm install @desource/image',
    svelte: 'npm install @desource/image @desource/image-svelte',
    react: 'npm install @desource/image @desource/image-react',
    angular: 'npm install @desource/image @desource/image-angular'
  };
</script>

<svelte:head>
  <title>Custom image provider guide · DeSource Image</title>
  <meta
    name="description"
    content="Create, register, use, and test a typed custom image provider for DeSource Image."
  />
  <link rel="canonical" href={`${data.origin}/providers/custom`} />
  <meta property="og:title" content="Custom image provider guide · DeSource Image" />
  <meta
    property="og:description"
    content="Create, register, use, and test a typed custom image provider for DeSource Image."
  />
  <meta property="og:url" content={`${data.origin}/providers/custom`} />
  <meta property="og:type" content="article" />
</svelte:head>

<header class="docs-header">
  <div class="shell">
    <a class="brand" href={resolve('/')}>
      <DsImage src="/logo.png" format="avif" width="31" height="31" alt="" />
      DeSource Image
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
          <li><a href={resolve('/providers/custom')} aria-current="page">Custom provider</a></li>
          {#each providers as provider (provider.id)}
            <li>
              <a href={resolve('/providers/[provider]', { provider: provider.slug })}>{provider.name}</a>
            </li>
          {/each}
        </ul>
      </details>
    </nav>
    <nav class="contents" aria-label="On this page">
      <p>On this page</p>
      <a href="#contract">Provider contract</a>
      <a href="#implementation">Implementation</a>
      <a href="#registration">Registration</a>
      <a href="#usage">Framework usage</a>
      <a href="#source-rules">Source rules</a>
      <a href="#testing">Testing</a>
      <a href="#utilities">Authoring utilities</a>
    </nav>
  </aside>

  <article>
    <div class="doc-title">
      <div class="provider-mark" aria-hidden="true">&lbrace; &rbrace;</div>
      <div>
        <p class="eyebrow">Provider authoring</p>
        <h1>Custom providers</h1>
      </div>
    </div>
    <p class="description">
      A provider translates a normalized image source and modifiers into a URL. Define the mapping once, register it
      under a name, then use it through the core API or any framework package.
    </p>
    <div class="doc-links">
      <a href="https://github.com/DeSource-Labs/image/blob/main/packages/core/src/types.ts">Provider types ↗</a>
      <a href="https://github.com/DeSource-Labs/image/blob/main/packages/core/src/provider-utils.ts">
        Authoring utilities ↗
      </a>
    </div>

    <section id="contract">
      <h2>Provider contract</h2>
      <p>
        Register an object or a setup function with a <code>getImage()</code> method. The runtime resolves aliases, validates
        the source, merges options, and calls the provider for each requested image candidate.
      </p>
      <dl class="options">
        <div>
          <dt><code>src</code></dt>
          <dd>The normalized local path, remote URL, or allowed opaque identifier.</dd>
        </div>
        <div>
          <dt><code>options</code></dt>
          <dd>Provider defaults, config-level overrides, and merged image modifiers.</dd>
        </div>
        <div>
          <dt><code>context.options</code></dt>
          <dd>The resolved image configuration, including presets, aliases, screens, and source rules.</dd>
        </div>
        <div>
          <dt><code>context.$img</code></dt>
          <dd>A memoized image helper for delegation to another provider or preset.</dd>
        </div>
        <div>
          <dt>Return value</dt>
          <dd>
            Return <code>url</code>. Add <code>format</code>, <code>getMeta</code>, or <code>isOptimized</code> when the provider
            knows them.
          </dd>
        </div>
      </dl>
    </section>

    <section id="implementation">
      <h2>Implement the provider</h2>
      <p>
        This example maps shared width, height, quality, format, and fit values to a query-string API. It also accepts
        one service-specific modifier, <code>sharpen</code>.
      </p>
      <pre><code>{data.provider}</code></pre>
      <p>
        <code>defineProvider()</code> memoizes setup. <code>configureProvider()</code> creates a named provider with factory
        defaults, so each application can point the same implementation at a different endpoint.
      </p>
    </section>

    <section id="registration">
      <h2>Register it</h2>
      <p>
        Save the implementation as <code>acme-provider.ts</code>, then register its factory in shared image
        configuration:
      </p>
      <pre><code>{data.configuration}</code></pre>
      <p>Top-level provider options are merged in this order, with later values taking priority:</p>
      <ol class="merge-order">
        <li>Defaults declared by the provider setup.</li>
        <li>Defaults passed to the provider factory.</li>
        <li>Overrides from <code>providerOptions.acme</code>.</li>
      </ol>
      <p>
        The runtime merges <code>modifiers</code> separately: provider defaults, config-level provider modifiers,
        resolved preset and per-image modifiers, then per-image <code>width</code>, <code>height</code>,
        <code>quality</code>, and <code>format</code> props.
      </p>
    </section>

    <section id="usage">
      <h2>Use it</h2>
      <div class="framework-switch" role="group" aria-label="Example framework">
        {#each Object.keys(frameworkNames) as name (name)}
          <button type="button" aria-pressed={framework === name} onclick={() => (framework = name as Framework)}>
            {frameworkNames[name as Framework]}
          </button>
        {/each}
      </div>
      <pre><code>{installCommands[framework]}</code></pre>
      <p>
        Use the same <code>imageConfig</code> with the {frameworkNames[framework]} API. Standard props and custom modifiers
        reach <code>getImage()</code> through its merged <code>modifiers</code> object.
      </p>
      <pre><code>{data.examples[framework]}</code></pre>
    </section>

    <section id="source-rules">
      <h2>Choose source rules deliberately</h2>
      <ul class="notes">
        <li>
          Set <code>validateDomains: true</code> when the provider fetches remote sources. Applications must then allow
          each source through <code>domains</code> or <code>remotePatterns</code>.
        </li>
        <li>
          Set <code>acceptsOpaqueSource: true</code> through the fourth <code>configureProvider()</code> argument only
          when values such as <code>asset_123</code> are valid service identifiers.
        </li>
        <li>
          Leave <code>supportsAlias</code> unset unless the provider needs to interpret alias prefixes itself. The
          runtime otherwise resolves aliases before calling <code>getImage()</code>.
        </li>
        <li>
          When delegating through <code>context.$img</code>, select another provider or a preset backed by another
          provider. Calling the active provider again would recurse.
        </li>
      </ul>
      <div class="callout">
        <h3>Keep signing secrets on the server</h3>
        <p>
          Framework components can execute provider code in the browser. Generate signed URLs in server-only code, pass
          the finished URL to the client, and render it with <code>provider="none"</code>.
        </p>
      </div>
    </section>

    <section id="testing">
      <h2>Test the URL contract</h2>
      <p>
        A black-box test through <code>createImage()</code> covers provider registration, option merging, source validation,
        and URL generation together.
      </p>
      <pre><code>{data.test}</code></pre>
      <p>Also cover requests with no modifiers, local and remote sources, mapped enum values, and invalid inputs.</p>
    </section>

    <section id="utilities">
      <h2>Authoring utilities</h2>
      <div class="utility-grid">
        <div>
          <h3>Query parameters</h3>
          <p><code>appendQuery</code>, <code>mappedModifiers</code>, and <code>createMappedQueryProvider</code>.</p>
        </div>
        <div>
          <h3>Path operations</h3>
          <p><code>createOperationsGenerator</code>, <code>pathOperations</code>, and <code>joinURLParts</code>.</p>
        </div>
        <div>
          <h3>Source handling</h3>
          <p><code>providerBaseURL</code>, <code>sourceWithBase</code>, and <code>sourcePath</code>.</p>
        </div>
      </div>
    </section>

    <a class="back-button" href={resolve('/#providers')}>← Back to all providers</a>
  </article>
</main>

<style lang="scss">
  .docs-header {
    position: sticky;
    top: 0;
    z-index: 20;
    border-bottom: 1px solid var(--line);
    background: rgba(7, 17, 31, 0.96);

    .shell {
      min-height: 72px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 16px;
    }
  }

  .brand {
    display: flex;
    align-items: center;
    gap: 9px;
    font-size: 0.95rem;
    font-weight: 750;
    text-decoration: none;
    transition: color 160ms ease;
  }

  a {
    color: var(--blue);
    text-underline-offset: 4px;
  }

  .brand:hover,
  .back-link:hover {
    color: var(--lime);
  }

  .back-link {
    font-size: 0.8rem;
    font-weight: 700;
    text-decoration: none;
    white-space: nowrap;
    transition: color 160ms ease;
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
    width: fit-content;
    padding: 10px 2px;
    color: var(--lime);
    font-weight: 750;
    cursor: pointer;
    transition: color 160ms ease;
  }

  summary:hover {
    color: #dbffba;
  }

  nav ul {
    max-height: 40vh;
    display: grid;
    gap: 4px;
    overflow: auto;
    padding: 0;
    list-style: none;
  }

  nav a {
    display: block;
    padding: 8px 10px;
    border-left: 2px solid transparent;
    border-radius: 0 7px 7px 0;
    text-decoration: none;
    transition:
      border-color 160ms ease,
      color 160ms ease,
      background 160ms ease;
  }

  nav a:hover {
    color: #e8f1fb;
    background: rgba(143, 184, 255, 0.055);
  }

  nav a[aria-current] {
    border-left-color: var(--lime);
    color: var(--lime);
    background: linear-gradient(90deg, rgba(191, 244, 139, 0.11), transparent);
    font-weight: 750;
  }

  .contents {
    margin-top: 24px;

    p {
      margin: 0 0 8px;
      color: var(--muted);
      font-size: 0.72rem;
      font-weight: 750;
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }
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

  .provider-mark {
    width: 96px;
    height: 96px;
    display: grid;
    flex-shrink: 0;
    place-items: center;
    border: 1px solid rgba(191, 244, 139, 0.24);
    border-radius: 18px;
    color: var(--lime);
    background: linear-gradient(145deg, rgba(191, 244, 139, 0.11), rgba(143, 184, 255, 0.06));
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    font-size: 1.25rem;
    font-weight: 750;
  }

  .eyebrow {
    margin-bottom: 10px;
  }

  h1 {
    margin: 0;
    overflow-wrap: anywhere;
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
    gap: 10px;
    padding-bottom: 30px;
    border-bottom: 1px solid var(--line);
    font-size: 0.85rem;

    a {
      min-height: 38px;
      display: inline-flex;
      align-items: center;
      padding: 0 12px;
      border: 1px solid var(--line);
      border-radius: 8px;
      color: #bdd2ea;
      background: rgba(143, 184, 255, 0.025);
      text-decoration: none;
      transition:
        border-color 160ms ease,
        color 160ms ease,
        background 160ms ease,
        transform 160ms ease;
    }

    a:hover {
      border-color: rgba(143, 184, 255, 0.36);
      color: #fff;
      background: rgba(143, 184, 255, 0.07);
      transform: translateY(-1px);
    }
  }

  section {
    margin-top: 44px;
    scroll-margin-top: 100px;
  }

  h2 {
    font-size: 1.8rem;
    letter-spacing: -0.025em;
  }

  h3 {
    margin-bottom: 8px;
    color: #e8f1fb;
    font-size: 0.95rem;
  }

  p,
  dd,
  .notes,
  .merge-order {
    overflow-wrap: anywhere;
    color: var(--muted);
    line-height: 1.8;
  }

  p code,
  dt code,
  li code {
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
    color: #bfd4ed;
    background: #050d17;
    font-size: 0.8rem;
    line-height: 1.7;
    tab-size: 2;
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

  .merge-order,
  .notes {
    padding-left: 22px;
  }

  .merge-order li + li,
  .notes li + li {
    margin-top: 12px;
  }

  .framework-switch {
    width: fit-content;
    display: flex;
    gap: 5px;
    margin-bottom: 16px;
    padding: 5px;
    border: 1px solid var(--line);
    border-radius: 11px;
    background: linear-gradient(180deg, #0d1c2e, #091624);
    box-shadow: inset 0 1px rgba(255, 255, 255, 0.025);

    button {
      min-height: 38px;
      padding: 8px 15px;
      border: 1px solid transparent;
      border-radius: 8px;
      color: #8296ad;
      background: transparent;
      font-size: 0.8rem;
      font-weight: 700;
      cursor: pointer;
      transition:
        border-color 160ms ease,
        color 160ms ease,
        background 160ms ease,
        box-shadow 160ms ease;
    }

    button:hover:not([aria-pressed='true']) {
      border-color: rgba(143, 184, 255, 0.15);
      color: #e2edf8;
      background: rgba(143, 184, 255, 0.055);
    }

    button[aria-pressed='true'] {
      color: #07111f;
      background: linear-gradient(135deg, #d8ffb4, var(--lime));
      box-shadow:
        inset 0 1px rgba(255, 255, 255, 0.72),
        0 8px 20px rgba(191, 244, 139, 0.12);
    }
  }

  .callout {
    margin-top: 28px;
    padding: 20px 22px;
    border: 1px solid rgba(143, 184, 255, 0.22);
    border-radius: 12px;
    background: rgba(143, 184, 255, 0.055);

    p {
      margin: 0;
    }
  }

  .utility-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 12px;

    > div {
      padding: 18px;
      border: 1px solid var(--line);
      border-radius: 10px;
      background: rgba(143, 184, 255, 0.025);
    }

    p {
      margin: 0;
      font-size: 0.88rem;
    }
  }

  .back-button {
    display: inline-flex;
    margin-top: 44px;
    padding: 14px 20px;
    border: 1px solid var(--line);
    border-radius: 8px;
    color: var(--lime);
    background: rgba(191, 244, 139, 0.025);
    font-weight: 750;
    text-decoration: none;
    transition:
      border-color 160ms ease,
      color 160ms ease,
      background 160ms ease,
      transform 160ms ease;

    &:hover {
      border-color: rgba(191, 244, 139, 0.36);
      color: #ddffbd;
      background: rgba(191, 244, 139, 0.075);
      transform: translateY(-1px);
    }
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

  @media (max-width: 680px) {
    .framework-switch {
      width: 100%;
      overflow-x: auto;
    }

    .utility-grid {
      grid-template-columns: 1fr;
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

    .provider-mark {
      width: 64px;
      height: 64px;
      border-radius: 12px;
      font-size: 0.9rem;
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
