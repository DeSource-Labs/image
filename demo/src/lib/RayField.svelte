<script lang="ts">
  import { onMount } from 'svelte';
  import { Color, Mesh, Program, Renderer, Triangle } from 'ogl';

  type Props = {
    variant?: 'sun' | 'prism';
    originX?: number;
    originY?: number;
    speed?: number;
    intensity?: number;
    colorA?: string;
    colorB?: string;
  };

  let {
    variant = 'sun',
    originX = 0.5,
    originY = 0.5,
    speed = 1,
    intensity = 1,
    colorA = '#fff1b0',
    colorB = '#ffb45c'
  }: Props = $props();

  let host: HTMLDivElement;
  let canvas: HTMLCanvasElement;
  let ready = $state(false);

  const vertex = /* glsl */ `
    attribute vec2 position;
    attribute vec2 uv;

    varying vec2 vUv;

    void main() {
      vUv = uv;
      gl_Position = vec4(position, 0.0, 1.0);
    }
  `;

  const fragment = /* glsl */ `
    precision highp float;

    uniform float uTime;
    uniform float uMode;
    uniform float uIntensity;
    uniform vec2 uResolution;
    uniform vec2 uOrigin;
    uniform vec3 uColorA;
    uniform vec3 uColorB;

    varying vec2 vUv;

    float hash21(vec2 point) {
      point = fract(point * vec2(123.34, 456.21));
      point += dot(point, point + 45.32);
      return fract(point.x * point.y);
    }

    float noise21(vec2 point) {
      vec2 cell = floor(point);
      vec2 local = fract(point);
      local = local * local * (3.0 - 2.0 * local);

      float a = hash21(cell);
      float b = hash21(cell + vec2(1.0, 0.0));
      float c = hash21(cell + vec2(0.0, 1.0));
      float d = hash21(cell + vec2(1.0, 1.0));

      return mix(mix(a, b, local.x), mix(c, d, local.x), local.y);
    }

    float softBand(float value, float power) {
      return pow(max(0.0, 0.5 + 0.5 * sin(value)), power);
    }

    void main() {
      vec2 uv = vec2(vUv.x, 1.0 - vUv.y);
      vec2 delta = uv - uOrigin;
      delta.x *= uResolution.x / max(uResolution.y, 1.0);

      float radius = length(delta);
      float angle = atan(delta.y, delta.x);
      float drift = noise21(vec2(angle * 2.25 + 4.0, uTime * 0.045));

      vec3 color;
      float alpha;

      if (uMode < 0.5) {
        float reachA = 0.54 + 0.27 * sin(uTime * 0.31 + angle * 5.0 + drift * 2.7);
        float reachB = 0.57 + 0.24 * sin(uTime * -0.23 + angle * 8.0 - drift * 2.1);
        float reach = clamp(0.42 + 0.35 * reachA + 0.25 * reachB, 0.34, 0.92);
        float radialFade = 1.0 - smoothstep(reach * 0.5, reach, radius);

        float broad = softBand(angle * 5.0 - uTime * 0.13 + drift * 2.0, 4.0);
        float medium = softBand(angle * 11.0 + uTime * 0.18 + drift * 3.1, 10.0);
        float fine = softBand(angle * 23.0 - uTime * 0.09 - drift * 4.0, 22.0);
        float rays = (broad * 0.28 + medium * 0.62 + fine * 0.42) * radialFade;
        rays *= smoothstep(0.025, 0.13, radius) * exp(-radius * 0.72);

        float core = exp(-radius * 27.0) * 1.35;
        float bloom = exp(-radius * 5.6) * 0.26;
        float flare = exp(-abs(delta.y) * 64.0) * exp(-abs(delta.x) * 2.8) * 0.12;
        float energy = (core + bloom + flare + rays * 0.7) * uIntensity;

        color = mix(uColorB, uColorA, clamp(core * 1.8 + broad * 0.4 + 0.2, 0.0, 1.0));
        alpha = clamp(energy, 0.0, 0.86);
      } else {
        vec2 warped = delta;
        warped.y += sin(delta.x * 8.0 - uTime * 0.22) * 0.018;
        float prismRadius = length(warped);
        float prismAngle = atan(warped.y, warped.x);
        float grain = noise21(vec2(prismAngle * 4.5, uTime * 0.065));

        float slow = softBand(prismAngle * 4.0 + uTime * 0.12 + grain * 2.0, 3.0);
        float beam = softBand(prismAngle * 9.0 - uTime * 0.2 + grain * 3.0, 13.0);
        float filament = softBand(prismAngle * 25.0 + uTime * 0.11 - grain * 4.0, 28.0);
        float pulse = 0.73 + 0.27 * sin(uTime * 0.42 + prismAngle * 7.0);
        float distanceFade = (1.0 - smoothstep(0.04, 1.34, prismRadius)) * exp(-prismRadius * 0.34);
        float rays = (slow * 0.18 + beam * 0.75 + filament * 0.52) * distanceFade * pulse;

        float source = exp(-prismRadius * 18.0) * 0.92;
        float haze = exp(-prismRadius * 2.5) * 0.11;
        float energy = (source + haze + rays) * uIntensity;
        float chroma = 0.5 + 0.5 * sin(prismAngle * 3.0 + grain * 2.4 + uTime * 0.08);

        color = mix(uColorA, uColorB, chroma);
        color += vec3(0.11, 0.14, 0.18) * filament;
        alpha = clamp(energy, 0.0, 0.72);
      }

      gl_FragColor = vec4(color, alpha);
    }
  `;

  onMount(() => {
    let renderer: Renderer;

    try {
      renderer = new Renderer({
        canvas,
        alpha: true,
        antialias: false,
        depth: false,
        dpr: Math.min(window.devicePixelRatio || 1, 1.75),
        powerPreference: 'low-power'
      });
    } catch {
      return;
    }

    const gl = renderer.gl;
    gl.clearColor(0, 0, 0, 0);

    const geometry = new Triangle(gl);
    const program = new Program(gl, {
      vertex,
      fragment,
      transparent: true,
      depthTest: false,
      depthWrite: false,
      uniforms: {
        uTime: { value: 0 },
        uMode: { value: variant === 'sun' ? 0 : 1 },
        uIntensity: { value: intensity },
        uResolution: { value: [1, 1] },
        uOrigin: { value: [originX, originY] },
        uColorA: { value: new Color(colorA) },
        uColorB: { value: new Color(colorB) }
      }
    });
    const mesh = new Mesh(gl, { geometry, program });
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const startedAt = performance.now();
    let visible = true;
    let frame = 0;

    const draw = (now: number) => {
      frame = 0;
      program.uniforms.uTime.value = ((now - startedAt) / 1000) * speed;
      renderer.render({ scene: mesh });

      if (visible && !motion.matches) frame = requestAnimationFrame(draw);
      else frame = 0;
    };

    const start = () => {
      if (!frame && visible) frame = requestAnimationFrame(draw);
    };

    const resize = () => {
      const { width, height } = host.getBoundingClientRect();
      if (!width || !height) return;

      renderer.setSize(Math.ceil(width), Math.ceil(height));
      program.uniforms.uResolution.value = [gl.canvas.width, gl.canvas.height];
      if (motion.matches) renderer.render({ scene: mesh });
    };

    const resizeObserver = new ResizeObserver(resize);
    const visibilityObserver = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (visible) start();
        else if (frame) {
          cancelAnimationFrame(frame);
          frame = 0;
        }
      },
      { rootMargin: '120px' }
    );
    const handleMotionChange = () => {
      if (motion.matches) {
        if (frame) cancelAnimationFrame(frame);
        frame = 0;
        program.uniforms.uTime.value = 0;
        renderer.render({ scene: mesh });
      } else {
        start();
      }
    };

    resizeObserver.observe(host);
    visibilityObserver.observe(host);
    motion.addEventListener('change', handleMotionChange);
    resize();
    start();
    ready = true;

    return () => {
      if (frame) cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      visibilityObserver.disconnect();
      motion.removeEventListener('change', handleMotionChange);
      geometry.remove();
      program.remove();
      gl.getExtension('WEBGL_lose_context')?.loseContext();
    };
  });
</script>

<div
  class="ray-field"
  class:ray-field--sun={variant === 'sun'}
  class:ray-field--prism={variant === 'prism'}
  class:ray-field--ready={ready}
  bind:this={host}
>
  <canvas bind:this={canvas} aria-hidden="true"></canvas>
</div>

<style lang="scss">
  .ray-field {
    position: absolute;
    inset: 0;
    overflow: hidden;
    pointer-events: none;

    &::before {
      position: absolute;
      inset: 0;
      content: '';
      transition: opacity 300ms ease;
    }

    &--ready::before {
      opacity: 0.5;
    }

    &--sun {
      &::before {
        background: radial-gradient(
          circle at 72.4% 53%,
          rgba(255, 243, 185, 0.72),
          rgba(255, 181, 90, 0.17) 8%,
          transparent 28%
        );
      }
      &.ray-field--ready::before {
        opacity: 1;
      }
    }

    &--prism::before {
      background:
        linear-gradient(164deg, transparent 35%, rgba(143, 184, 255, 0.15) 49%, transparent 58%),
        linear-gradient(187deg, transparent 39%, rgba(191, 244, 139, 0.12) 50%, transparent 67%);
    }

    :global(canvas) {
      position: absolute;
      inset: 0;
      display: block;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .ray-field::before {
      transition: none;
    }
  }
</style>
