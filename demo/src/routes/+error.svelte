<script lang="ts">
  import { resolve } from '$app/paths';
  import { page } from '$app/state';
  import { DsImage } from '@desource/image-svelte';

  const errorContent = (status: number) => {
    switch (status) {
      case 404:
        return {
          label: 'Route not found',
          title: 'This page is out of frame.',
          message: 'The address may be wrong, or the page may have moved.'
        };
      case 400:
        return {
          label: 'Bad request',
          title: 'That request did not resolve.',
          message: 'Check the address or request details, then try again.'
        };
      case 401:
        return {
          label: 'Authentication required',
          title: 'This page needs authentication.',
          message: 'Sign in with an account that can access this page.'
        };
      case 403:
        return {
          label: 'Access denied',
          title: 'This page is not available to you.',
          message: 'Return home or use an account with the required access.'
        };
      case 429:
        return {
          label: 'Too many requests',
          title: 'The server needs a short pause.',
          message: 'Wait a moment, then reload the page.'
        };
      case 503:
        return {
          label: 'Service unavailable',
          title: 'The service is taking a break.',
          message: 'Try again shortly. The project links below are still available.'
        };
      default:
        if (status >= 500) {
          return {
            label: 'Server error',
            title: 'This page failed to render.',
            message: 'Reload the page. If the error continues, check the repository for updates.'
          };
        }
        return {
          label: 'Request error',
          title: 'Something interrupted this request.',
          message: 'Return home or try the address again.'
        };
    }
  };

  const content = $derived(errorContent(page.status));
</script>

<svelte:head>
  <title>{page.status} · DeSource Image</title>
  <meta name="robots" content="noindex" />
</svelte:head>

<main class="error-page">
  <div class="shell">
    <a class="error-brand" href={resolve('/')} aria-label="DeSource Image home">
      <DsImage src="/logo.png" format="avif" width="31" height="31" alt="" />
      DeSource Image
    </a>

    <section>
      <div class="error-copy">
        <p class="error-label"><span>{page.status}</span> {content.label}</p>
        <h1>{content.title}</h1>
        <p class="error-message">{content.message}</p>
        <div class="error-actions">
          <a class="primary" href={resolve('/')}>Back to homepage</a>
          <a class="secondary" href={resolve('/#providers')}>Browse providers</a>
        </div>
      </div>

      <div class="error-graphic" aria-hidden="true">
        <div class="error-aperture">
          <svg class="error-landscape" viewBox="0 0 480 320" preserveAspectRatio="none">
            <path class="ridge ridge--back" d="M0 236 112 122l91 82 98-116 179 151v81H0Z" />
            <path class="ridge ridge--front" d="M0 278 149 174l106 76 111-91 114 76v85H0Z" />
            <path class="horizon" d="M0 269h480" />
          </svg>
          <strong class="error-status">{page.status}</strong>
          <span class="missing-slot"></span>
          <span class="missing-piece">
            <i class="missing-sun"></i>
            <i class="crop-mark crop-mark--missing"></i>
          </span>
          <i class="crop-mark crop-mark--top-left"></i>
          <i class="crop-mark crop-mark--bottom-left"></i>
          <i class="crop-mark crop-mark--bottom-right"></i>
        </div>
        <div class="error-route">
          <span>Requested image</span>
          <code>{page.url.pathname}</code>
        </div>
      </div>
    </section>
  </div>
</main>

<style lang="scss">
  .error-page {
    position: relative;
    min-height: min(820px, 100svh);
    overflow: hidden;

    > .shell {
      position: relative;
      z-index: 1;
    }
  }

  .error-brand {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    min-height: 72px;
    color: #f1f6fc;
    font-size: 0.95rem;
    font-weight: 750;
    text-decoration: none;
  }

  section {
    display: grid;
    grid-template-columns: minmax(0, 0.95fr) minmax(360px, 1.05fr);
    gap: clamp(48px, 8vw, 112px);
    align-items: center;
    min-height: calc(min(820px, 100svh) - 72px);
    padding-block: 64px 100px;
  }

  .error-copy {
    max-width: 580px;
  }

  .error-label {
    display: flex;
    align-items: center;
    gap: 12px;
    margin: 0 0 24px;
    color: var(--lime);
    font-size: 0.78rem;
    font-weight: 800;
    letter-spacing: 0.08em;
    text-transform: uppercase;

    span {
      padding: 6px 9px;
      border: 1px solid rgba(191, 244, 139, 0.2);
      border-radius: 999px;
      background: rgba(191, 244, 139, 0.06);
    }
  }

  h1 {
    max-width: 660px;
    margin: 0;
    font-size: clamp(3.6rem, 8vw, 7rem);
    line-height: 0.9;
  }

  .error-message {
    max-width: 500px;
    margin: 30px 0 0;
    color: var(--muted);
    font-size: 1.08rem;
    line-height: 1.7;
  }

  .error-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    margin-top: 36px;

    a {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-height: 50px;
      padding: 0 20px;
      border-radius: var(--radius-small);
      font-size: 0.875rem;
      font-weight: 800;
      text-decoration: none;
      transition:
        border-color 180ms ease,
        color 180ms ease,
        background 180ms ease,
        transform 180ms ease;

      &:hover {
        transform: translateY(-2px);
      }
    }
  }

  .primary {
    color: #07111f;
    background: var(--lime);
    box-shadow: 0 14px 38px rgba(191, 244, 139, 0.13);

    &:hover {
      background: #d0ffa3;
    }
  }

  .secondary {
    border: 1px solid var(--line);
    color: #d8e4f1;
    background: rgba(255, 255, 255, 0.025);

    &:hover {
      border-color: rgba(143, 184, 255, 0.42);
      color: #fff;
      background: rgba(143, 184, 255, 0.07);
    }
  }

  .error-graphic {
    position: relative;
    width: min(520px, 100%);
    aspect-ratio: 1.12;
    justify-self: end;
  }

  .error-aperture {
    position: absolute;
    top: 10%;
    right: 7%;
    left: 2%;
    aspect-ratio: 1.45;
    border: 1px solid rgba(143, 184, 255, 0.34);
    border-radius: 8px;
    background: #091522;
  }

  .error-landscape {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    overflow: hidden;
    border-radius: inherit;

    .ridge {
      stroke-width: 1;
      vector-effect: non-scaling-stroke;

      &--back {
        fill: rgba(143, 184, 255, 0.045);
        stroke: rgba(143, 184, 255, 0.18);
      }

      &--front {
        fill: rgba(191, 244, 139, 0.035);
        stroke: rgba(191, 244, 139, 0.18);
      }
    }

    .horizon {
      fill: none;
      stroke: rgba(143, 184, 255, 0.16);
      stroke-width: 1;
      vector-effect: non-scaling-stroke;
    }
  }

  .error-status {
    position: absolute;
    bottom: 16%;
    left: 8%;
    z-index: 1;
    color: #e8eef7;
    font-size: clamp(5rem, 11vw, 8.2rem);
    font-weight: 720;
    letter-spacing: -0.07em;
    line-height: 0.8;
  }

  .missing-slot,
  .missing-piece {
    position: absolute;
    top: -1px;
    right: -1px;
    width: 29%;
    height: 31%;
    border: 1px solid rgba(143, 184, 255, 0.3);
    border-radius: 0 8px 0 4px;
  }

  .missing-slot {
    z-index: 2;
    border-style: dashed;
    background: #07111f;
  }

  .missing-piece {
    z-index: 3;
    background: #0d1b2b;
    transform: translate(34px, -26px);

    &::after {
      position: absolute;
      right: 0;
      bottom: 18%;
      left: 0;
      height: 1px;
      content: '';
      background: rgba(191, 244, 139, 0.3);
      transform: rotate(-18deg);
    }
  }

  .missing-sun {
    position: absolute;
    top: 25%;
    left: 28%;
    width: 34px;
    aspect-ratio: 1;
    border: 1px solid rgba(191, 244, 139, 0.68);
    border-radius: 50%;
  }

  .crop-mark {
    position: absolute;
    z-index: 4;
    width: 18px;
    height: 18px;
    border-color: rgba(143, 184, 255, 0.62);

    &--top-left {
      top: -8px;
      left: -8px;
      border-top: 1px solid;
      border-left: 1px solid;
    }

    &--bottom-left {
      bottom: -8px;
      left: -8px;
      border-bottom: 1px solid;
      border-left: 1px solid;
    }

    &--bottom-right {
      right: -8px;
      bottom: -8px;
      border-right: 1px solid;
      border-bottom: 1px solid;
    }

    &--missing {
      top: -8px;
      right: -8px;
      border-top: 1px solid;
      border-right: 1px solid;
      border-color: var(--lime);
    }
  }

  .error-route {
    position: absolute;
    right: 7%;
    bottom: 9%;
    left: 2%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20px;
    padding-top: 14px;
    border-top: 1px solid rgba(143, 184, 255, 0.18);
    color: #71869f;
    font-size: 0.72rem;

    code {
      max-width: 68%;
      overflow: hidden;
      color: #aebed0;
      font-size: 0.7rem;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }

  @media (prefers-reduced-motion: no-preference) {
    .missing-piece {
      animation: return-missing-piece 7s cubic-bezier(0.22, 1, 0.36, 1) infinite;
    }
  }

  @keyframes return-missing-piece {
    0%,
    16%,
    100% {
      transform: translate(34px, -26px);
    }

    42%,
    70% {
      transform: translate(0, 0);
    }
  }

  @media (max-width: 860px) {
    section {
      grid-template-columns: 1fr;
      min-height: auto;
      padding-block: 70px 110px;
    }

    .error-graphic {
      position: absolute;
      right: -12px;
      bottom: -100px;
      width: 360px;
      opacity: 0.24;
    }

    .error-copy {
      position: relative;
      z-index: 2;
    }
  }

  @media (max-width: 520px) {
    h1 {
      font-size: clamp(3.5rem, 19vw, 5.2rem);
    }

    .error-actions a {
      width: 100%;
    }

    .error-graphic {
      display: none;
    }
  }
</style>
