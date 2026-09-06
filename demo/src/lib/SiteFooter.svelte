<script lang="ts">
  import { resolve } from '$app/paths';
  import { DsImage } from '@desource/image-svelte';

  const year = new Date().getUTCFullYear();
</script>

<footer class="footer">
  <div class="shell footer-shell">
    <div class="footer-grid">
      <div class="footer-intro">
        <a class="footer-brand" href={resolve('/')} aria-label="DeSource Image home">
          <span class="footer-logo">
            <DsImage src="/logo.png" format="avif" width="36" height="36" alt="" />
          </span>
          <span>
            <strong>DeSource Image</strong>
            <small>Open image tooling</small>
          </span>
        </a>
        <p>One image API for React, Angular, and Svelte, backed by 46 provider modules.</p>
        <span class="license"><i aria-hidden="true"></i> MIT licensed</span>
      </div>

      <nav class="footer-nav" aria-label="Footer navigation">
        <div>
          <p>Explore</p>
          <a href={resolve('/#playground')}>Playground</a>
          <a href={resolve('/#providers')}>Providers</a>
          <a href={resolve('/#compare')}>Comparison</a>
          <a href={resolve('/#api')}>API overview</a>
        </div>
        <div>
          <p>Project</p>
          <a href="https://github.com/DeSource-Labs/image">GitHub</a>
          <a href="https://github.com/DeSource-Labs/image/releases">Releases</a>
          <a href="https://github.com/DeSource-Labs/image/blob/main/SECURITY.md">Security</a>
          <a href="https://desourcelabs.com">DeSource Labs</a>
        </div>
      </nav>
    </div>

    <div class="footer-base">
      <span>© {year} DeSource Labs</span>
      <span>React <i></i> Angular <i></i> Svelte</span>
    </div>
  </div>
</footer>

<style lang="scss">
  .footer {
    position: relative;
    overflow: hidden;
    border-top: 1px solid rgba(143, 184, 255, 0.16);
    background:
      linear-gradient(90deg, rgba(191, 244, 139, 0.035) 1px, transparent 1px),
      linear-gradient(rgba(143, 184, 255, 0.03) 1px, transparent 1px), linear-gradient(180deg, #07111f 0%, #040b13 100%);
    background-size:
      64px 64px,
      64px 64px,
      auto;

    &-shell {
      position: relative;
      z-index: 1;
      padding-block: 76px 28px;
    }

    &-grid {
      display: grid;
      grid-template-columns: minmax(0, 1.15fr) minmax(320px, 0.85fr);
      gap: clamp(64px, 10vw, 150px);
      align-items: start;
    }
  }

  .footer-intro {
    max-width: 440px;

    > p {
      max-width: 390px;
      margin: 24px 0 22px;
      color: #91a4ba;
      font-size: 0.95rem;
      line-height: 1.7;
    }
  }

  .footer-brand {
    display: inline-flex;
    align-items: center;
    gap: 12px;
    color: #f3f7fc;
    text-decoration: none;

    > span:last-child {
      display: grid;
      gap: 3px;
    }

    strong {
      font-size: 1rem;
      letter-spacing: -0.015em;
    }

    small {
      color: #71869f;
      font-size: 0.75rem;
      font-weight: 650;
    }
  }

  .footer-logo {
    display: grid;
    width: 46px;
    height: 46px;
    place-items: center;
    border: 1px solid rgba(191, 244, 139, 0.2);
    border-radius: 13px;
    background: linear-gradient(145deg, rgba(191, 244, 139, 0.11), rgba(143, 184, 255, 0.05));
    box-shadow: inset 0 1px rgba(255, 255, 255, 0.08);

    :global(img) {
      display: block;
    }
  }

  .license {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    color: #71869f;
    font-size: 0.78rem;
    font-weight: 700;

    > i {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: var(--lime);
      box-shadow: 0 0 12px rgba(191, 244, 139, 0.72);
    }
  }

  .footer-nav {
    display: grid;
    grid-template-columns: repeat(2, minmax(120px, 1fr));
    gap: clamp(36px, 6vw, 80px);

    > div {
      display: grid;
      align-content: start;
      gap: 5px;
    }

    p {
      margin: 0 0 12px;
      color: #e9f1fa;
      font-size: 0.78rem;
      font-weight: 800;
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }

    a {
      display: flex;
      align-items: center;
      min-height: 36px;
      color: #8498af;
      font-size: 0.875rem;
      text-decoration: none;
      transition:
        color 160ms ease,
        transform 160ms ease;

      &:hover {
        color: var(--lime);
        transform: translateX(3px);
      }
    }
  }

  .footer-base {
    display: flex;
    justify-content: space-between;
    gap: 24px;
    margin-top: 66px;
    padding-top: 24px;
    border-top: 1px solid rgba(185, 209, 239, 0.1);
    color: #5f738b;
    font-size: 0.75rem;

    span:last-child {
      display: flex;
      align-items: center;
      gap: 9px;
    }

    i {
      width: 3px;
      height: 3px;
      border-radius: 50%;
      background: #4c6078;
    }
  }

  @media (max-width: 720px) {
    .footer-shell {
      padding-block: 58px 24px;
    }
    .footer-grid {
      grid-template-columns: 1fr;
      gap: 48px;
    }
    .footer-nav {
      width: min(420px, 100%);
    }
    .footer-base {
      align-items: flex-start;
      flex-direction: column;
      margin-top: 48px;
    }
  }

  @media (max-width: 420px) {
    .footer-nav {
      gap: 32px;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .footer-nav a {
      transition: none;
    }
  }
</style>
