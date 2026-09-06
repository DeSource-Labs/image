<script lang="ts">
  import { DsImage } from '@desource/image-svelte';
</script>

<header class="site-header">
  <div class="shell nav">
    <a class="brand" href="#top" aria-label="DeSource Image home">
      <DsImage src="/logo.png" format="avif" width="31" height="31" alt="" />
      DeSource Image
    </a>
    <nav aria-label="Primary navigation">
      <a href="#autodetect">Auto detect</a>
      <a href="#frameworks">Frameworks</a>
      <a href="#providers">Providers</a>
      <a href="#compare">Compare</a>
    </nav>
    <a class="github-link" href="https://github.com/DeSource-Labs/image" aria-label="GitHub repository">
      <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" aria-hidden="true">
        <path
          d="M12 .75a11.25 11.25 0 0 0-3.56 21.92c.56.1.77-.24.77-.54v-2.1c-3.13.68-3.79-1.33-3.79-1.33-.51-1.3-1.25-1.65-1.25-1.65-1.02-.7.08-.69.08-.69 1.13.08 1.73 1.16 1.73 1.16 1 1.72 2.64 1.22 3.28.93.1-.73.4-1.22.71-1.5-2.5-.28-5.13-1.25-5.13-5.56 0-1.23.44-2.23 1.16-3.02-.12-.28-.5-1.43.11-2.98 0 0 .95-.3 3.09 1.15a10.75 10.75 0 0 1 5.62 0c2.14-1.45 3.08-1.15 3.08-1.15.62 1.55.24 2.7.12 2.98.72.79 1.15 1.79 1.15 3.02 0 4.32-2.63 5.27-5.14 5.55.4.35.76 1.03.76 2.08v3.11c0 .3.2.65.77.54A11.25 11.25 0 0 0 12 .75Z"
        />
      </svg>
      <span>GitHub</span>
    </a>
  </div>
</header>

<style lang="scss">
  @use '../../styles/mixins' as mixins;

  .site-header {
    position: sticky;
    top: 0;
    z-index: 20;
    border-bottom: 1px solid rgba(185, 209, 239, 0.1);
    background: rgba(7, 17, 31, 0.76);
    backdrop-filter: blur(18px);

    nav {
      display: flex;
      gap: 28px;

      a {
        position: relative;
        display: inline-flex;
        align-items: center;
        min-height: 40px;

        &::after {
          position: absolute;
          right: 0;
          bottom: 4px;
          left: 0;
          height: 1px;
          content: '';
          background: linear-gradient(90deg, var(--lime), var(--blue));
          transform: scaleX(0);
          transform-origin: right;
          transition: transform 180ms ease;
        }

        &:hover::after,
        &:focus-visible::after {
          transform: scaleX(1);
          transform-origin: left;
        }
      }
    }
  }

  .nav {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 72px;

    a:hover {
      color: #fff;
    }
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

  nav a,
  .github-link {
    color: #aab9cb;
    font-size: 0.8rem;
    font-weight: 600;
    text-decoration: none;
    transition: color 160ms ease;
  }

  .github-link {
    display: flex;
    gap: 6px;
    align-items: center;
    color: #edf4fc;
  }

  @include mixins.at-most(680px) {
    .site-header nav {
      display: none;
    }
  }

  @include mixins.at-most(480px) {
    .github-link {
      min-width: 44px;
      min-height: 44px;
      justify-content: center;

      span {
        display: none;
      }
    }
  }
</style>
