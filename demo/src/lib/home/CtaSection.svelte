<script lang="ts">
  import RayField from '$lib/RayField.svelte';
</script>

<section class="cta shell">
  <div class="cta-field" aria-hidden="true">
    <RayField
      variant="prism"
      originX={0.84}
      originY={0.48}
      speed={0.76}
      intensity={0.72}
      colorA="#bff48b"
      colorB="#8fb8ff"
    />
  </div>
  <div class="cta-copy">
    <p class="cta-label">Source · transform · deliver</p>
    <h2>Better images for every screen.</h2>
    <p>
      Install the framework package. Keep auto-detection, or select any built-in provider when the application needs
      control.
    </p>
    <div class="cta-actions">
      <a class="primary-action" href="#quickstart">Use DeSource Image</a>
      <a class="secondary-action" href="https://github.com/DeSource-Labs/image">Read the source</a>
    </div>
  </div>
  <div class="cta-output" aria-hidden="true">
    <div class="output-heading">
      <span>Image pipeline</span>
      <span class="output-status"><i></i> ready</span>
    </div>
    <div class="output-source">
      <small>source</small>
      <code>/img/hero.jpg</code>
    </div>
    <div class="output-route">
      <span></span>
      <b>provider: auto</b>
      <span></span>
    </div>
    <div class="output-result">
      <div><small>format</small><strong>AVIF</strong></div>
      <div><small>quality</small><strong>76</strong></div>
      <div><small>delivery</small><strong>CDN</strong></div>
    </div>
    <div class="output-foot">
      <span>46 providers</span>
      <span>3 frameworks</span>
    </div>
  </div>
</section>

<style lang="scss">
  @use '../../styles/mixins' as mixins;

  .cta {
    position: relative;
    isolation: isolate;
    display: grid;
    grid-template-columns: minmax(0, 1.08fr) minmax(300px, 0.72fr);
    gap: clamp(40px, 8vw, 110px);
    align-items: center;
    min-height: 460px;
    margin-bottom: 120px;
    overflow: hidden;
    padding: clamp(56px, 7vw, 84px);
    border-radius: 28px;
    box-shadow:
      inset 0 1px rgba(255, 255, 255, 0.055),
      0 42px 100px rgba(0, 0, 0, 0.3);

    h2 {
      max-width: 620px;
      margin-bottom: 22px;
    }
  }

  .cta-copy {
    position: relative;
    z-index: 2;

    > p:not(.cta-label) {
      max-width: 590px;
      margin: 0;
      color: var(--muted);
      font-size: 1rem;
      line-height: 1.75;
    }
  }

  .cta-label {
    margin-bottom: 22px;
    color: var(--lime) !important;
    font-size: 0.78rem;
    font-weight: 800;
    letter-spacing: 0.09em;
    text-transform: uppercase;
  }

  .cta-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    margin-top: 34px;
  }

  .primary-action,
  .secondary-action {
    @include mixins.action-link;
  }

  .primary-action {
    @include mixins.primary-action;
  }

  .secondary-action {
    @include mixins.secondary-action;
  }

  .cta-field {
    position: absolute;
    inset: 0;
    z-index: 0;
    overflow: hidden;
    pointer-events: none;
    mix-blend-mode: screen;

    &::before {
      position: absolute;
      inset: 0;
      z-index: 1;
      content: '';
      opacity: 0.5;
      background-image:
        linear-gradient(rgba(143, 184, 255, 0.06) 1px, transparent 1px),
        linear-gradient(90deg, rgba(143, 184, 255, 0.06) 1px, transparent 1px);
      background-size: 54px 54px;
      mask-image: linear-gradient(90deg, transparent 34%, rgba(0, 0, 0, 0.7) 62%, black);
    }
  }

  .cta-output {
    position: relative;
    z-index: 2;
    width: min(360px, 100%);
    justify-self: end;
    overflow: hidden;
    border-radius: 18px;
    background: linear-gradient(145deg, rgba(17, 39, 61, 0.95), rgba(5, 15, 26, 0.95));
    box-shadow:
      inset 0 1px rgba(255, 255, 255, 0.08),
      0 30px 72px rgba(0, 0, 0, 0.4),
      0 0 50px rgba(143, 184, 255, 0.1);
    transform: perspective(850px) rotateY(-7deg) rotateX(2deg);
    transform-style: preserve-3d;

    &::before {
      position: absolute;
      inset: 0;
      content: '';
      opacity: 0;
      background: linear-gradient(108deg, transparent 26%, rgba(255, 255, 255, 0.12) 48%, transparent 68%);
      transform: translateX(-120%);
    }
  }

  .output-heading,
  .output-source,
  .output-foot {
    display: grid;
    grid-template-columns: 1fr auto;
    align-items: center;
    gap: 16px;
  }

  .output-heading {
    min-height: 52px;
    padding: 0 18px;
    border-bottom: 1px solid rgba(166, 203, 243, 0.13);
    color: #e9f2fb;
    font-size: 0.72rem;
    font-weight: 780;
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }

  .output-status {
    display: flex;
    align-items: center;
    gap: 7px;
    color: var(--lime);
    font-size: 0.62rem;

    i {
      width: 6px;
      height: 6px;
      border-radius: 1px;
      background: var(--lime);
      box-shadow: 0 0 12px rgba(191, 244, 139, 0.72);
    }
  }

  .output-source {
    padding: 25px 20px 20px;

    code {
      color: #dce8f4;
      font-size: 0.75rem;
    }
  }

  .output-source small,
  .output-result small {
    color: #6f859d;
    font-size: 0.61rem;
    font-weight: 750;
    letter-spacing: 0.09em;
    text-transform: uppercase;
  }

  .output-route {
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    align-items: center;
    gap: 10px;
    padding: 0 20px;

    span {
      height: 1px;
      overflow: hidden;
      background: linear-gradient(90deg, transparent, rgba(143, 184, 255, 0.64));
      transform-origin: right;

      &:last-child {
        background: linear-gradient(90deg, rgba(191, 244, 139, 0.7), transparent);
        transform-origin: left;
      }
    }

    b {
      padding: 7px 10px;
      border: 1px solid rgba(191, 244, 139, 0.18);
      border-radius: 7px;
      color: var(--lime);
      background: rgba(191, 244, 139, 0.055);
      font: 700 0.62rem/1 var(--font-mono, monospace);
    }
  }

  .output-result {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1px;
    margin: 20px;
    overflow: hidden;
    border: 1px solid rgba(143, 184, 255, 0.13);
    border-radius: 10px;
    background: rgba(143, 184, 255, 0.12);

    > div {
      display: grid;
      gap: 7px;
      padding: 15px 13px;
      background: rgba(5, 15, 26, 0.8);
    }

    strong {
      color: #eef5fc;
      font-size: 0.83rem;
    }
  }

  .output-foot {
    min-height: 46px;
    padding: 0 20px;
    border-top: 1px solid rgba(166, 203, 243, 0.1);
    color: #70869e;
    font-size: 0.64rem;
    font-weight: 700;

    span:last-child {
      text-align: right;
    }
  }

  @keyframes output-float {
    0%,
    100% {
      transform: perspective(850px) rotateY(-7deg) rotateX(2deg) translateY(0);
    }

    50% {
      transform: perspective(850px) rotateY(-4deg) rotateX(1deg) translateY(-8px);
    }
  }

  @keyframes output-sheen {
    0%,
    62% {
      opacity: 0;
      transform: translateX(-120%);
    }

    72% {
      opacity: 1;
    }

    to {
      opacity: 0;
      transform: translateX(120%);
    }
  }

  @keyframes output-flow {
    50% {
      opacity: 0.42;
      transform: scaleX(0.74);
    }
  }

  @media (prefers-reduced-motion: no-preference) {
    .cta-output {
      animation: output-float 7s ease-in-out infinite;

      &::before {
        animation: output-sheen 8s ease-in-out infinite;
      }
    }

    .output-route span {
      animation: output-flow 2.8s ease-in-out infinite;

      &:last-child {
        animation-delay: -1.4s;
      }
    }
  }

  @include mixins.at-most(680px) {
    .cta {
      grid-template-columns: minmax(0, 1fr);
      gap: 54px;
      min-height: auto;
      padding: 54px 24px;
      border-radius: 20px;

      .secondary-action {
        display: none;
      }
    }

    .cta-output {
      width: min(380px, 100%);
      justify-self: end;
    }
  }

  @include mixins.at-most(480px) {
    .cta-actions > a {
      width: 100%;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .cta-output {
      transform: none;
    }
  }
</style>
