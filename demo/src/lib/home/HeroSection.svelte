<script lang="ts">
  import { DsPicture } from '@desource/image-svelte';
  import RayField from '$lib/RayField.svelte';

  function updatePerspective(event: PointerEvent) {
    if (event.pointerType === 'touch') return;

    const stage = event.currentTarget as HTMLDivElement;
    const bounds = stage.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width - 0.5;
    const y = (event.clientY - bounds.top) / bounds.height - 0.5;
    stage.style.setProperty('--hero-tilt-x', `${(-y * 6).toFixed(2)}deg`);
    stage.style.setProperty('--hero-tilt-y', `${(x * 7).toFixed(2)}deg`);
  }

  function resetPerspective(event: PointerEvent) {
    const stage = event.currentTarget as HTMLDivElement;
    stage.style.setProperty('--hero-tilt-x', '0deg');
    stage.style.setProperty('--hero-tilt-y', '0deg');
  }
</script>

<section class="hero shell">
  <div class="hero-copy">
    <p class="eyebrow">Optimized images for React, Angular, and Svelte</p>
    <h1>
      <span>Ship the right</span>
      <span>image.</span>
      <span class="hero-title-accent">Every time.</span>
    </h1>
    <p class="hero-lede">
      AI-assisted development moves ideas into working products quickly. DeSource Image keeps image preparation inside
      that development loop. Add one suitable local or remote source, then control quality, format, crop, and responsive
      sizes with component props.
    </p>
    <div class="hero-actions">
      <a class="primary-action" href="#quickstart">Install the package</a>
      <a class="secondary-action" href="#playground">Try the live controls</a>
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
  <div class="hero-visual" role="presentation" onpointermove={updatePerspective} onpointerleave={resetPerspective}>
    <span class="crop-target crop-target--top-left" aria-hidden="true"></span>
    <span class="crop-target crop-target--top-right" aria-hidden="true"></span>
    <span class="crop-target crop-target--bottom-left" aria-hidden="true"></span>
    <span class="crop-target crop-target--bottom-right" aria-hidden="true"></span>
    <div class="hero-card-tilt">
      <div class="image-frame">
        <div class="image-crop">
          <DsPicture
            src="/img/hero.jpg"
            alt="Joshua tree at sunset in the desert"
            width={768}
            height={512}
            format="avif,webp"
            legacyFormat="jpeg"
            placeholder={true}
            preload
          />
          <div class="hero-sunlight" aria-hidden="true">
            <RayField originX={0.71} originY={0.515} speed={1} intensity={1} colorA="#fff6c8" colorB="#ffad56" />
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<style lang="scss">
  @use '../../styles/mixins' as mixins;

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

    span {
      display: block;
      font: inherit;
    }

    .hero-title-accent {
      color: var(--lime);
    }
  }

  .hero-lede {
    max-width: 620px;
    color: #aebed0;
    font-size: 1.08rem;
    line-height: 1.75;
  }

  .hero-actions {
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

  .hero-stats {
    display: flex;
    gap: 34px;
    margin: 58px 0 0;

    div {
      padding-left: 14px;
      border-left: 1px solid var(--line);

      &:first-child {
        padding-left: 0;
        border-left: 0;
      }
    }

    dt {
      color: #f4f8fd;
      font-size: 1.15rem;
      font-weight: 800;
    }

    dd {
      margin: 5px 0 0;
      color: #74879e;
      font-size: 0.69rem;
    }
  }

  .hero-visual {
    --stage-padding: clamp(30px, 3.5vw, 44px);
    --hero-tilt-x: 0deg;
    --hero-tilt-y: 0deg;
    position: relative;
    isolation: isolate;
    padding: var(--stage-padding);
    perspective: 1100px;
    transform-style: preserve-3d;

    &::before {
      position: absolute;
      inset: 0;
      z-index: 0;
      pointer-events: none;
      content: '';
      opacity: 0.9;
      background-image:
        linear-gradient(rgba(143, 184, 255, 0.14) 1px, transparent 1px),
        linear-gradient(90deg, rgba(143, 184, 255, 0.14) 1px, transparent 1px);
      background-position: 23px 23px;
      background-size: 46px 46px;
      mask-image: radial-gradient(ellipse at center, black 48%, rgba(0, 0, 0, 0.72) 72%, transparent 100%);
    }
  }

  .hero-card-tilt {
    position: relative;
    z-index: 1;
    transform: rotateX(var(--hero-tilt-x)) rotateY(var(--hero-tilt-y));
    transform-style: preserve-3d;
    transition: transform 180ms cubic-bezier(0.22, 1, 0.36, 1);
    will-change: transform;

    &::before {
      position: absolute;
      inset: 30px -15px -18px 24px;
      z-index: -1;
      content: '';
      border: 1px solid rgba(143, 184, 255, 0.15);
      border-radius: 28px;
      clip-path: polygon(0 0, calc(100% - 56px) 0, 100% 56px, 100% 100%, 0 100%);
      background: linear-gradient(145deg, rgba(143, 184, 255, 0.08), rgba(4, 11, 19, 0.82));
      box-shadow: 0 40px 90px rgba(0, 0, 0, 0.38);
      transform: translateZ(-54px);
    }
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
    box-shadow:
      0 30px 70px rgba(0, 0, 0, 0.34),
      0 0 46px rgba(191, 244, 139, 0.06);
    transform: translateZ(20px);
    transform-style: preserve-3d;

    &::before {
      position: absolute;
      inset: 1px;
      content: '';
      border-radius: calc(var(--frame-radius) - 1px);
      clip-path: inherit;
      background: #07111f;
    }
  }

  .image-crop {
    position: relative;
    z-index: 1;
    isolation: isolate;
    aspect-ratio: 1;
    overflow: hidden;
    border-radius: calc(var(--frame-radius) - 10px);
    clip-path: polygon(0 0, calc(100% - 48px) 0, 100% 48px, 100% 100%, 0 100%);
    background: #07111f;

    &::after {
      position: absolute;
      inset: 0;
      z-index: 1;
      pointer-events: none;
      content: '';
      background:
        linear-gradient(180deg, rgba(7, 17, 31, 0.02) 55%, rgba(7, 17, 31, 0.38)),
        radial-gradient(circle at 70% 42%, transparent 20%, rgba(7, 17, 31, 0.14) 84%);
    }

    :global(picture) {
      position: absolute;
      inset: 0;
      display: block;
      width: 100%;
      height: 100%;
    }

    :global(img) {
      display: block;
      width: 100%;
      height: 100%;
      object-fit: cover;
      object-position: 68% center;
    }
  }

  .hero-sunlight {
    position: absolute;
    inset: 0;
    z-index: 3;
    pointer-events: none;
    mix-blend-mode: screen;
  }

  .crop-target {
    --calibration-delay: 0s;
    position: absolute;
    z-index: 2;
    width: 22px;
    height: 22px;
    transform-origin: center;
    color: rgba(143, 184, 255, 0.68);

    &::before,
    &::after {
      position: absolute;
      content: '';
      background: currentColor;
    }

    &::before {
      top: 50%;
      left: 0;
      width: 100%;
      height: 1px;
    }

    &::after {
      top: 0;
      left: 50%;
      width: 1px;
      height: 100%;
    }

    &--top-left {
      top: -11px;
      left: -11px;
    }

    &--top-right {
      --calibration-delay: 0.24s;
      top: -11px;
      right: -11px;
    }

    &--bottom-left {
      --calibration-delay: 0.72s;
      bottom: -11px;
      left: -11px;
    }

    &--bottom-right {
      --calibration-delay: 0.48s;
      right: -11px;
      bottom: -11px;
    }
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

  @include mixins.at-most(980px) {
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
  }

  @include mixins.at-most(680px) {
    .hero {
      gap: 50px;
      padding-block: 54px;
    }

    .hero-stats {
      gap: 14px;
    }
  }

  @include mixins.at-most(480px) {
    .hero-actions > a {
      width: 100%;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .hero-card-tilt {
      transform: none !important;
    }
  }
</style>
