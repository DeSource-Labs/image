<script lang="ts">
  /* eslint-disable svelte/no-navigation-without-resolve -- The caller supplies resolved application paths. */
  import { onMount } from 'svelte';
  import { DsImage } from '@desource/image-svelte';

  interface GalleryImage {
    src: string;
    alt: string;
    href: string;
  }

  interface GalleryProps {
    images: readonly GalleryImage[];
  }

  let { images }: GalleryProps = $props();

  const SEGMENTS = 35;
  const MIN_RADIUS = 600;
  const MAX_VERTICAL_ROTATION = 5;
  const DRAG_SENSITIVITY = 20;
  const AUTO_ROTATION_SPEED = 0.0024;
  const KEYBOARD_ROTATION_DURATION = 320;
  const INERTIA_FRICTION = 0.995;
  const INERTIA_STOP_THRESHOLD = 0.005;
  const MAX_INERTIA_FRAMES = 360;

  interface TileCoordinate {
    x: number;
    y: number;
  }

  interface TileItem extends GalleryImage, TileCoordinate {}

  const tileCoordinates = Array.from({ length: SEGMENTS }, (_, index) => -37 + index * 2).flatMap((x, column) => {
    const rows = column % 2 === 0 ? [-4, -2, 0, 2, 4] : [-3, -1, 1, 3, 5];
    return rows.map((y) => ({ x, y }));
  });

  const items = $derived(
    tileCoordinates.map<TileItem>((coordinate, index) => ({
      ...coordinate,
      ...images[index % images.length]
    }))
  );

  let rootRef: HTMLDivElement;
  let mainRef: HTMLDivElement;
  let sphereRef: HTMLDivElement;
  let reducedMotion = false;
  let startPosition: { x: number; y: number } | null = null;
  let dragging = false;
  let moved = false;
  let motionFrame: number | null = null;
  let lastDragEndAt = 0;
  let activeTileIndex = $state(0);

  const rotation = { x: 0, y: 0 };
  const startRotation = { x: 0, y: 0 };

  const clamp = (value: number, min: number, max: number): number => Math.min(Math.max(value, min), max);

  const wrapAngle = (degrees: number): number => {
    const normalized = (((degrees + 180) % 360) + 360) % 360;
    return normalized - 180;
  };

  function computeItemRotation(offsetX: number, offsetY: number) {
    const unit = 360 / SEGMENTS / 2;
    return {
      x: unit * (offsetY - 1 / 2),
      y: unit * (offsetX + 1 / 2)
    };
  }

  function applyTransform(x: number, y: number) {
    sphereRef.style.transform = `translateZ(calc(var(--radius) * -1)) rotateX(${x}deg) rotateY(${y}deg)`;
  }

  function computeRadius() {
    const { width, height } = rootRef.getBoundingClientRect();
    const safeWidth = Math.max(1, width);
    const safeHeight = Math.max(1, height);
    const minDimension = Math.min(safeWidth, safeHeight);
    const basis = safeWidth / safeHeight >= 1.3 ? safeWidth : minDimension;
    const radius = Math.max(MIN_RADIUS, Math.min(basis * 0.5, safeHeight * 1.35));

    rootRef.style.setProperty('--radius', `${Math.round(radius)}px`);
    applyTransform(rotation.x, rotation.y);
  }

  function stopMotion() {
    if (motionFrame === null) return;
    cancelAnimationFrame(motionFrame);
    motionFrame = null;
  }

  function startAutoRotation() {
    stopMotion();
    if (reducedMotion || dragging) return;

    let previousTime = performance.now();

    const step = (time: number) => {
      const elapsed = Math.min(time - previousTime, 32);
      previousTime = time;
      rotation.y = wrapAngle(rotation.y - elapsed * AUTO_ROTATION_SPEED);
      applyTransform(rotation.x, rotation.y);
      motionFrame = requestAnimationFrame(step);
    };

    motionFrame = requestAnimationFrame(step);
  }

  function animateToRotation(targetX: number, targetY: number) {
    stopMotion();

    const finalX = clamp(targetX, -MAX_VERTICAL_ROTATION, MAX_VERTICAL_ROTATION);
    const finalY = wrapAngle(targetY);

    if (reducedMotion) {
      rotation.x = finalX;
      rotation.y = finalY;
      applyTransform(finalX, finalY);
      return;
    }

    const initialX = rotation.x;
    const initialY = rotation.y;
    const deltaX = finalX - initialX;
    const deltaY = wrapAngle(finalY - initialY);
    const startTime = performance.now();

    const step = (time: number) => {
      const progress = Math.min((time - startTime) / KEYBOARD_ROTATION_DURATION, 1);
      const easedProgress = progress * progress * (3 - 2 * progress);
      rotation.x = initialX + deltaX * easedProgress;
      rotation.y = wrapAngle(initialY + deltaY * easedProgress);
      applyTransform(rotation.x, rotation.y);

      if (progress < 1) {
        motionFrame = requestAnimationFrame(step);
      } else {
        motionFrame = null;
        startAutoRotation();
      }
    };

    motionFrame = requestAnimationFrame(step);
  }

  function startInertia(horizontalVelocity: number, verticalVelocity: number) {
    if (reducedMotion) return;

    let velocityX = horizontalVelocity * 80;
    let velocityY = verticalVelocity * 80;
    let frames = 0;

    const step = () => {
      velocityX *= INERTIA_FRICTION;
      velocityY *= INERTIA_FRICTION;

      if (
        (Math.abs(velocityX) < INERTIA_STOP_THRESHOLD && Math.abs(velocityY) < INERTIA_STOP_THRESHOLD) ||
        ++frames > MAX_INERTIA_FRAMES
      ) {
        motionFrame = null;
        startAutoRotation();
        return;
      }

      rotation.x = clamp(rotation.x - velocityY / 200, -MAX_VERTICAL_ROTATION, MAX_VERTICAL_ROTATION);
      rotation.y = wrapAngle(rotation.y + velocityX / 200);
      applyTransform(rotation.x, rotation.y);
      motionFrame = requestAnimationFrame(step);
    };

    stopMotion();
    motionFrame = requestAnimationFrame(step);
  }

  function onDragStart(event: MouseEvent | TouchEvent) {
    if ('button' in event && event.button !== 0) return;

    stopMotion();
    dragging = true;
    moved = false;
    startRotation.x = rotation.x;
    startRotation.y = rotation.y;

    const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX;
    const clientY = 'touches' in event ? event.touches[0].clientY : event.clientY;
    startPosition = { x: clientX, y: clientY };
  }

  function onDragMove(event: MouseEvent | TouchEvent) {
    if (!dragging || !startPosition) return;

    const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX;
    const clientY = 'touches' in event ? event.touches[0].clientY : event.clientY;
    const deltaX = clientX - startPosition.x;
    const deltaY = clientY - startPosition.y;

    if (!moved && deltaX * deltaX + deltaY * deltaY > 16) moved = true;

    const nextX = clamp(startRotation.x - deltaY / DRAG_SENSITIVITY, -MAX_VERTICAL_ROTATION, MAX_VERTICAL_ROTATION);
    const nextY = wrapAngle(startRotation.y + deltaX / DRAG_SENSITIVITY);

    if (rotation.x === nextX && rotation.y === nextY) return;
    rotation.x = nextX;
    rotation.y = nextY;
    applyTransform(nextX, nextY);
  }

  function onDragEnd(event: MouseEvent | TouchEvent) {
    if (!dragging) return;
    dragging = false;
    let inertiaStarted = false;

    if (moved && startPosition) {
      const clientX = 'changedTouches' in event ? (event.changedTouches[0]?.clientX ?? 0) : event.clientX;
      const clientY = 'changedTouches' in event ? (event.changedTouches[0]?.clientY ?? 0) : event.clientY;
      const velocityX = clamp(((clientX - startPosition.x) / DRAG_SENSITIVITY) * 0.02, -1.2, 1.2);
      const velocityY = clamp(((clientY - startPosition.y) / DRAG_SENSITIVITY) * 0.02, -1.2, 1.2);

      if (Math.abs(velocityX) > 0.005 || Math.abs(velocityY) > 0.005) {
        startInertia(velocityX, velocityY);
        inertiaStarted = true;
      }
      lastDragEndAt = performance.now();
    }

    startPosition = null;
    if (!inertiaStarted) startAutoRotation();
  }

  function onTileClick(event: MouseEvent) {
    if (event.detail !== 0 && (dragging || moved || performance.now() - lastDragEndAt < 80)) event.preventDefault();
  }

  function focusTile(element: HTMLElement, index: number) {
    const item = items[index];
    if (!item) return;

    activeTileIndex = index;
    const itemRotation = computeItemRotation(item.x, item.y);
    animateToRotation(-itemRotation.x, -itemRotation.y);
    element.focus({ preventScroll: true });
  }

  function onTileKeydown(event: KeyboardEvent, index: number) {
    const offset = { ArrowLeft: -5, ArrowRight: 5, ArrowUp: 1, ArrowDown: -1 }[event.key];
    if (offset === undefined) return;

    event.preventDefault();
    const nextIndex = (index + offset + items.length) % items.length;
    const tile = sphereRef.querySelectorAll<HTMLElement>('.gallery-tile')[nextIndex];
    if (tile) focusTile(tile, nextIndex);
  }

  onMount(() => {
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updateMotion = () => {
      reducedMotion = motionQuery.matches;
      if (reducedMotion) stopMotion();
      else startAutoRotation();
    };
    const cancelDrag = () => {
      dragging = false;
      startPosition = null;
      moved = true;
      startAutoRotation();
    };

    updateMotion();
    motionQuery.addEventListener('change', updateMotion);
    computeRadius();

    const resizeObserver = new ResizeObserver(computeRadius);
    resizeObserver.observe(rootRef);
    mainRef.addEventListener('mousedown', onDragStart, { passive: true });
    mainRef.addEventListener('touchstart', onDragStart, { passive: true });
    window.addEventListener('mousemove', onDragMove, { passive: true });
    window.addEventListener('touchmove', onDragMove, { passive: true });
    window.addEventListener('mouseup', onDragEnd);
    window.addEventListener('touchend', onDragEnd);
    window.addEventListener('touchcancel', cancelDrag);
    window.addEventListener('blur', cancelDrag);

    return () => {
      stopMotion();
      resizeObserver.disconnect();
      motionQuery.removeEventListener('change', updateMotion);
      mainRef.removeEventListener('mousedown', onDragStart);
      mainRef.removeEventListener('touchstart', onDragStart);
      window.removeEventListener('mousemove', onDragMove);
      window.removeEventListener('touchmove', onDragMove);
      window.removeEventListener('mouseup', onDragEnd);
      window.removeEventListener('touchend', onDragEnd);
      window.removeEventListener('touchcancel', cancelDrag);
      window.removeEventListener('blur', cancelDrag);
    };
  });
</script>

<div bind:this={rootRef} class="gallery">
  <div bind:this={mainRef} class="gallery-main">
    <div class="gallery-stage">
      <div bind:this={sphereRef} class="gallery-sphere">
        {#each items as item, index (`${item.x},${item.y},${index}`)}
          <div class="gallery-item" style={`--offset-x:${item.x};--offset-y:${item.y}`}>
            <a
              class="gallery-tile"
              href={item.href}
              aria-label={`${item.alt} documentation`}
              draggable="false"
              tabindex={index === activeTileIndex ? 0 : -1}
              onclick={onTileClick}
              onkeydown={(event) => onTileKeydown(event, index)}
              onfocus={(event) => {
                if (event.currentTarget.matches(':focus-visible')) focusTile(event.currentTarget, index);
              }}
            >
              <DsImage
                src={item.src}
                alt={item.alt}
                draggable={false}
                loading="lazy"
                fetchpriority="low"
                format="webp"
                width={60}
                height={60}
              />
            </a>
          </div>
        {/each}
      </div>
    </div>
    <div class="gallery-overlay"></div>
    <div class="gallery-blur"></div>
    <div class="gallery-fade gallery-fade-top"></div>
    <div class="gallery-fade gallery-fade-bottom"></div>
  </div>
</div>

<style lang="scss">
  .gallery {
    --radius: 600px;
    --segments: 35;
    --circumference: calc(var(--radius) * 3.14);
    --rotation-unit: calc((360deg / var(--segments)) / 2);
    --item-size: calc(var(--circumference) / var(--segments) * 2);
    position: relative;
    width: 100%;
    height: 100%;
  }

  .gallery-main {
    position: absolute;
    inset: 0;
    display: grid;
    overflow: hidden;
    background: transparent;
    cursor: grab;
    touch-action: none;
    user-select: none;

    &:active {
      cursor: grabbing;
    }
  }

  .gallery-stage {
    display: grid;
    width: 100%;
    height: 100%;
    place-items: center;
    perspective: calc(var(--radius) * 2);
    perspective-origin: 50% 50%;
    contain: layout paint size;
  }

  .gallery-sphere {
    will-change: transform;
    transform: translateZ(calc(var(--radius) * -1));
    transform-style: preserve-3d;
  }

  .gallery-item {
    position: absolute;
    inset: -999px;
    width: var(--item-size);
    height: var(--item-size);
    margin: auto;
    backface-visibility: hidden;
    transform: rotateY(calc(var(--rotation-unit) * (var(--offset-x) + (1 / 2))))
      rotateX(calc(var(--rotation-unit) * (var(--offset-y) - (1 / 2)))) translateZ(var(--radius));
    transform-origin: 50% 50%;
    transform-style: preserve-3d;
  }

  .gallery-tile {
    position: absolute;
    inset: 10px;
    display: block;
    overflow: hidden;
    padding: 0;
    border: 1px solid #f6f7f4;
    border-radius: 18px;
    backface-visibility: hidden;
    background: #f6f7f4;
    cursor: pointer;
    pointer-events: auto;
    text-decoration: none;
    touch-action: none;
    transform: translateZ(0);
    transform-style: preserve-3d;
    transition: transform 300ms;
    -webkit-tap-highlight-color: transparent;

    &:hover {
      transform: translateZ(8px) scale(1.015);
    }

    &:focus-visible {
      outline: 3px dashed var(--lime);
      outline-offset: 4px;
      transition:
        outline-color 0.2s ease-in-out,
        outline-offset 0.2s ease-in-out;
      transform: translateZ(12px) scale(1.02);
    }

    :global(img) {
      display: block;
      width: 100%;
      height: 100%;
      padding: 0;
      border-radius: 18px;
      backface-visibility: hidden;
      filter: saturate(0.75);
      object-fit: contain;
      pointer-events: none;
    }
  }

  .gallery-overlay,
  .gallery-blur {
    position: absolute;
    inset: 0;
    z-index: 3;
    margin: auto;
    pointer-events: none;
  }

  .gallery-overlay {
    background-image: radial-gradient(rgba(235, 235, 235, 0) 65%, #07111f 100%);
  }

  .gallery-blur {
    backdrop-filter: blur(3px);
    mask-image: radial-gradient(rgba(235, 235, 235, 0) 70%, #07111f 90%);
  }

  .gallery-fade {
    position: absolute;
    right: 0;
    left: 0;
    z-index: 5;
    height: 120px;
    pointer-events: none;
    background: linear-gradient(to bottom, transparent, #07111f);
  }

  .gallery-fade-top {
    top: 0;
    transform: rotate(180deg);
  }

  .gallery-fade-bottom {
    bottom: 0;
  }
</style>
