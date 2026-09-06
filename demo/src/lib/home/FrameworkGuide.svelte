<script lang="ts">
  type Framework = 'angular' | 'react' | 'svelte';
  type PackageManager = 'npm' | 'yarn' | 'pnpm' | 'bun';

  let framework = $state<Framework>('svelte');
  let installLabel = $state('Copy');
  let packageManager = $state<PackageManager>('npm');

  const frameworkOrder = ['svelte', 'react', 'angular'] as const;
  const installCommand = $derived(
    `${packageManager} ${packageManager === 'npm' ? 'install' : 'add'} @desource/image-${framework}`
  );
  const examples: Record<Framework, string> = {
    svelte: [
      '<script lang="ts">',
      "  import { DsPicture } from '@desource/image-svelte';",
      // eslint-disable-next-line no-useless-escape
      '<\/script>',
      '',
      '<DsPicture',
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
      "import { DsPicture, useDsImageProps } from '@desource/image-react';",
      '',
      'export function Hero() {',
      '  const img = useDsImageProps({',
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
      '      <DsPicture',
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
    try {
      await navigator.clipboard.writeText(installCommand);
      installLabel = 'Copied';
      globalThis.setTimeout(() => (installLabel = 'Copy'), 1400);
    } catch (error) {
      console.warn('Failed to copy install command:', error);
    }
  }

  function handleTabKeydown(event: KeyboardEvent) {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;

    event.preventDefault();
    const tabs = Array.from(
      event.currentTarget instanceof HTMLElement ? (event.currentTarget.parentElement?.children ?? []) : []
    ).filter((element): element is HTMLButtonElement => element instanceof HTMLButtonElement);
    const currentIndex = tabs.indexOf(event.currentTarget as HTMLButtonElement);
    const nextIndex =
      event.key === 'Home'
        ? 0
        : event.key === 'End'
          ? tabs.length - 1
          : (currentIndex + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;

    framework = frameworkOrder[nextIndex];
    tabs[nextIndex]?.focus();
  }

  const frameworkLabel = (name: Framework) => (name === 'svelte' ? 'Svelte' : name === 'react' ? 'React' : 'Angular');
</script>

<section class="frameworks shell" id="frameworks">
  <div class="framework-copy">
    <p class="eyebrow">React, Angular, and Svelte</p>
    <h2>Share image rules across framework-native APIs.</h2>
    <p class="section-copy">
      Use Angular components and directives, React components and hooks, or Svelte components, actions, and attachments.
      Output remains native <code>&lt;img&gt;</code> and <code>&lt;picture&gt;</code> markup.
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
      {#each frameworkOrder as name (name)}
        <button
          id={`framework-tab-${name}`}
          type="button"
          class:active={framework === name}
          role="tab"
          aria-selected={framework === name}
          aria-controls="framework-code-panel"
          tabindex={framework === name ? 0 : -1}
          onclick={() => (framework = name)}
          onkeydown={handleTabKeydown}>{frameworkLabel(name)}</button
        >
      {/each}
    </div>
    <div
      class="code-panel"
      id="framework-code-panel"
      role="tabpanel"
      aria-labelledby={`framework-tab-${framework}`}
      tabindex="-1"
    >
      <pre tabindex="-1"><code>{examples[framework]}</code></pre>
    </div>
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
      <div class="install-selectors">
        <div class="package-switch" role="group" aria-label="Framework package">
          {#each frameworkOrder as name (name)}
            <button
              type="button"
              class:active={framework === name}
              aria-pressed={framework === name}
              onclick={() => (framework = name)}>{frameworkLabel(name)}</button
            >
          {/each}
        </div>
        <select class="package-manager-switch" aria-label="Package manager" bind:value={packageManager}>
          <option value="npm">npm</option>
          <option value="yarn">yarn</option>
          <option value="pnpm">pnpm</option>
          <option value="bun">bun</option>
        </select>
      </div>
      <div class="install-command">
        <code>{installCommand}</code><button onclick={copyInstall}>{installLabel}</button>
      </div>
      <ol>
        <li>
          <span class="step-number" aria-hidden="true">1</span>
          <div>Add the framework package</div>
        </li>
        <li>
          <span class="step-number" aria-hidden="true">2</span>
          <div>Render <code>DsImage</code>, <code>DsPicture</code>, or a native-element integration</div>
        </li>
        <li>
          <span class="step-number" aria-hidden="true">3</span>
          <div>Set quality, format, crop, and responsive sizes in code</div>
        </li>
        <li>
          <span class="step-number" aria-hidden="true">4</span>
          <div>Let <code>provider: 'auto'</code> follow the deployment</div>
        </li>
      </ol>
    </div>
  </div>
</section>

<style lang="scss">
  @use '../../styles/mixins' as mixins;

  %framework-button {
    position: relative;
    min-height: 38px;
    padding: 8px 14px;
    border: 1px solid transparent;
    border-radius: 8px;
    color: #8092a8;
    background: transparent;
    font-size: 0.8rem;
    font-weight: 700;
    cursor: pointer;
    transition:
      border-color 160ms ease,
      color 160ms ease,
      background 160ms ease,
      box-shadow 160ms ease,
      transform 160ms ease;
  }

  .frameworks {
    display: grid;
    grid-template-columns: 0.82fr 1.18fr;
    gap: 80px;
    align-items: center;
    padding-block: 120px;
  }

  .framework-copy {
    ul {
      display: grid;
      gap: 13px;
      margin: 34px 0 0;
      padding: 0;
      list-style: none;
      color: #c7d2df;
      font-size: 0.85rem;
    }

    li {
      display: flex;
      gap: 10px;

      span {
        color: var(--lime);
      }
    }
  }

  .code-card {
    min-width: 0;
    overflow: hidden;
    border: 1px solid var(--line);
    border-radius: var(--radius);
    background: #050d17;
    box-shadow: 0 28px 70px rgba(0, 0, 0, 0.3);
  }

  .code-tabs {
    display: flex;
    gap: 5px;
    padding: 9px;
    border-bottom: 1px solid var(--line);
    background: linear-gradient(180deg, #0d1c2e, #091624);
    box-shadow: inset 0 1px rgba(255, 255, 255, 0.025);

    button {
      @extend %framework-button;

      &:hover:not(.active) {
        border-color: rgba(143, 184, 255, 0.16);
        color: #dbe8f6;
        background: rgba(143, 184, 255, 0.055);
      }

      &.active::after {
        position: absolute;
        right: 12px;
        bottom: -10px;
        left: 12px;
        height: 1px;
        content: '';
        background: var(--lime);
        box-shadow: 0 0 8px var(--lime);
      }
    }
  }

  .code-tabs button.active,
  .package-switch button.active {
    color: #07111f;
    background: linear-gradient(135deg, #d8ffb4, var(--lime));
    box-shadow:
      inset 0 1px rgba(255, 255, 255, 0.72),
      0 8px 20px rgba(191, 244, 139, 0.12);
  }

  pre {
    min-height: 620px;
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
    color: #101b28;
    background: var(--paper);

    .eyebrow {
      color: #416318;
    }

    .section-copy {
      color: #5b6876;
    }
  }

  .quickstart-grid {
    @include mixins.split-layout(0.9fr 1.1fr, 90px);
    align-items: center;
  }

  .install-card {
    min-width: 0;
    padding: 28px;
    border: 1px solid rgba(7, 17, 31, 0.13);
    border-radius: var(--radius);
    background: #fff;
    box-shadow: 0 28px 80px rgba(38, 33, 23, 0.1);

    ol {
      display: grid;
      gap: 14px;
      margin: 25px 0 0;
      padding: 0;
      list-style: none;
      color: #455363;
      font-size: 0.82rem;
    }

    li {
      display: grid;
      grid-template-columns: 24px minmax(0, 1fr);
      gap: 11px;
      align-items: start;
      line-height: 1.7;
    }

    .step-number {
      display: grid;
      width: 24px;
      height: 24px;
      place-items: center;
      border: 1px solid #ccd2ca;
      border-radius: 6px;
      font-size: 0.66rem;
      font-weight: 800;
    }
  }

  .install-selectors {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 20px;
  }

  .package-switch {
    display: flex;
    gap: 5px;
    padding: 4px;
    border: 1px solid rgba(7, 17, 31, 0.09);
    border-radius: 10px;
    background: #edf0ea;
    box-shadow: inset 0 1px 2px rgba(7, 17, 31, 0.05);

    button {
      @extend %framework-button;
      min-height: 36px;
      color: #607080;

      &:hover:not(.active) {
        border-color: rgba(7, 17, 31, 0.08);
        color: #172636;
        background: rgba(255, 255, 255, 0.7);
      }
    }
  }

  .package-manager-switch {
    min-width: 70px;
    padding: 8px;
    border: 1px solid rgba(65, 99, 24, 0.18);
    border-radius: 6px;
    color: #07111f;
    background: linear-gradient(135deg, #d9ffb6, var(--lime));
    box-shadow: inset 0 1px rgba(255, 255, 255, 0.62);
    font-size: 0.74rem;
    font-weight: 700;
    cursor: pointer;
  }

  .install-command {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 14px;
    border-radius: var(--radius-small);
    color: #d8e6f5;
    background: #07111f;

    code {
      min-width: 0;
      flex: 1;
      overflow-wrap: anywhere;
      font-size: 0.77rem;
      line-height: 1.6;
    }

    button {
      border: 0;
      color: var(--lime);
      background: transparent;
      font-size: 0.72rem;
      font-weight: 800;
      cursor: pointer;
      transition:
        color 160ms ease,
        background 160ms ease;

      &:hover {
        color: #deffbe;
        background: rgba(191, 244, 139, 0.08);
      }
    }
  }

  @include mixins.at-most(980px) {
    .frameworks,
    .quickstart-grid {
      grid-template-columns: 1fr;
      gap: 40px;
    }
  }

  @include mixins.at-most(680px) {
    .frameworks,
    .quickstart {
      padding-block: 90px;
    }
  }

  @include mixins.at-most(480px) {
    .install-card {
      padding: 18px 14px;

      ol {
        gap: 18px;
      }
    }

    .install-selectors {
      gap: 8px;
    }

    .package-switch {
      gap: 3px;

      button {
        padding: 8px;
        font-size: 0.7rem;
      }
    }

    .install-command {
      gap: 8px;
      padding: 12px;

      button {
        flex-shrink: 0;
      }
    }
  }
</style>
