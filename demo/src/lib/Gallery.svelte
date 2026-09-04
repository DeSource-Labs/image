<script lang="ts">
  /* eslint-disable svelte/no-navigation-without-resolve -- This reusable gallery receives resolved application paths or external URLs from its caller. */
  import { mount, onMount, unmount } from 'svelte';
  import { Image } from '@desource/image-svelte';
  import { SvelteMap } from 'svelte/reactivity';

  interface ImageItem {
    src: string;
    alt?: string;
    href?: string;
  }

  interface GalleryProps {
    images?: (string | ImageItem)[];
    fit?: number;
    fitBasis?: 'auto' | 'min' | 'max' | 'width' | 'height';
    minRadius?: number;
    maxRadius?: number;
    padFactor?: number;
    overlayBlurColor?: string;
    maxVerticalRotationDeg?: number;
    dragSensitivity?: number;
    enlargeTransitionMs?: number;
    segments?: number;
    dragDampening?: number;
    openedImageWidth?: string;
    openedImageHeight?: string;
    imageBorderRadius?: string;
    openedImageBorderRadius?: string;
    imageFit?: 'cover' | 'contain';
  }

  let {
    images = [],
    fit = 0.5,
    fitBasis = 'auto',
    minRadius = 600,
    maxRadius = Infinity,
    padFactor = 0.25,
    overlayBlurColor = '#120F17',
    maxVerticalRotationDeg = 5,
    dragSensitivity = 20,
    enlargeTransitionMs = 300,
    segments = 35,
    dragDampening = 2,
    openedImageWidth = '250px',
    openedImageHeight = '350px',
    imageBorderRadius = '30px',
    openedImageBorderRadius = '30px',
    imageFit = 'cover'
  }: GalleryProps = $props();

  let rootRef: HTMLDivElement;
  let mainRef: HTMLDivElement;
  let sphereRef: HTMLDivElement;
  let viewerRef: HTMLDivElement;
  let scrimRef: HTMLButtonElement;
  let frameRef: HTMLDivElement;
  let isEnlarging = $state(false);
  let reducedMotion = false;
  const mountedImages = new SvelteMap<HTMLElement, ReturnType<typeof mount>>();
  function mountImage(target: HTMLElement, src: string, alt: string) {
    mountedImages.set(
      target,
      mount(Image, {
        target,
        props: {
          src,
          alt,
          draggable: false,
          loading: 'lazy',
          fetchpriority: 'low',
          width: 60,
          height: 60,
          quality: 100,
          style: `display:block;width:100%;height:100%;object-fit:${imageFit}`
        }
      })
    );
  }
  function removeOverlay(target: HTMLElement) {
    const instance = mountedImages.get(target);
    if (instance) {
      void unmount(instance);
      mountedImages.delete(target);
    }
    target.remove();
  }

  const rotationRef = { x: 0, y: 0 };
  const startRotRef = { x: 0, y: 0 };
  let startPosRef: { x: number; y: number } | null = null;
  let draggingRef = false;
  let movedRef = false;
  let inertiaRAF: number | null = null;
  let openingRef = false;
  let openStartedAtRef = 0;
  let lastDragEndAt = 0;
  let activeTileIndex = $state(0);
  let focusedElRef: HTMLElement | null = null;
  let originalTilePositionRef: { left: number; top: number; width: number; height: number } | null = null;
  let scrollLockedRef = false;
  let resizeObserver: ResizeObserver | null = null;
  let keydownHandler: ((e: KeyboardEvent) => void) | null = null;

  const clamp = (v: number, min: number, max: number): number => Math.min(Math.max(v, min), max);
  const normalizeAngle = (d: number): number => ((d % 360) + 360) % 360;
  const wrapAngleSigned = (deg: number): number => {
    const a = (((deg + 180) % 360) + 360) % 360;
    return a - 180;
  };
  const getDataNumber = (el: HTMLElement, name: string, fallback: number): number => {
    const attr = el.dataset[name] ?? el.getAttribute(`data-${name}`);
    const n = attr == null ? NaN : parseFloat(attr);
    return Number.isFinite(n) ? n : fallback;
  };

  interface TileCoord {
    x: number;
    y: number;
  }
  interface TileItem extends TileCoord {
    src: string;
    alt: string;
    href?: string;
  }

  function buildItems(pool: (string | ImageItem)[], seg: number): TileItem[] {
    const xCols = Array.from({ length: seg }, (_, i) => -37 + i * 2);
    const evenYs = [-4, -2, 0, 2, 4];
    const oddYs = [-3, -1, 1, 3, 5];
    const coords: TileCoord[] = xCols.flatMap((x, c) => {
      const ys = c % 2 === 0 ? evenYs : oddYs;
      return ys.map((y) => ({ x, y }));
    });
    const totalSlots = coords.length;
    if (pool.length === 0) return coords.map((c) => ({ ...c, src: '', alt: '' }));
    if (pool.length > totalSlots) {
      console.warn(`[Gallery] ${pool.length} images > ${totalSlots} tiles. Some won't show.`);
    }
    const normalizedImages: ImageItem[] = pool.map((img) =>
      typeof img === 'string' ? { src: img, alt: '' } : { src: img.src || '', alt: img.alt || '', href: img.href }
    );
    const usedImages: ImageItem[] = Array.from(
      { length: totalSlots },
      (_, i) => normalizedImages[i % normalizedImages.length]
    );
    for (let i = 1; i < usedImages.length; i++) {
      if (usedImages[i].src === usedImages[i - 1].src) {
        for (let j = i + 1; j < usedImages.length; j++) {
          if (usedImages[j].src !== usedImages[i].src) {
            [usedImages[i], usedImages[j]] = [usedImages[j], usedImages[i]];
            break;
          }
        }
      }
    }
    return coords.map((c, i) => ({
      ...c,
      src: usedImages[i].src,
      alt: usedImages[i].alt ?? '',
      href: usedImages[i].href
    }));
  }

  const items = $derived(buildItems(images, segments));
  const tabStopIndex = $derived(Math.min(activeTileIndex, Math.max(items.length - 1, 0)));

  function computeItemBaseRotation(offsetX: number, offsetY: number, segments: number) {
    const unit = 360 / segments / 2;
    return {
      rotateY: unit * (offsetX + 1 / 2),
      rotateX: unit * (offsetY - 1 / 2)
    };
  }

  const applyTransform = (xDeg: number, yDeg: number) => {
    const el = sphereRef;
    if (el) el.style.transform = `translateZ(calc(var(--radius) * -1)) rotateX(${xDeg}deg) rotateY(${yDeg}deg)`;
  };

  const applyRootVars = () => {
    const root = rootRef;
    if (!root) return;
    root.style.setProperty('--overlay-blur-color', overlayBlurColor);
    root.style.setProperty('--tile-radius', imageBorderRadius);
    root.style.setProperty('--enlarge-radius', openedImageBorderRadius);
  };

  const computeRadius = () => {
    const root = rootRef;
    if (!root) return;
    const cr = root.getBoundingClientRect();
    const w = Math.max(1, cr.width);
    const h = Math.max(1, cr.height);
    const minDim = Math.min(w, h);
    const maxDim = Math.max(w, h);
    const aspect = w / h;
    let basis: number;
    switch (fitBasis) {
      case 'min':
        basis = minDim;
        break;
      case 'max':
        basis = maxDim;
        break;
      case 'width':
        basis = w;
        break;
      case 'height':
        basis = h;
        break;
      default:
        basis = aspect >= 1.3 ? w : minDim;
    }
    let radius = basis * fit;
    radius = Math.min(radius, h * 1.35);
    radius = clamp(radius, minRadius, maxRadius);
    const viewerPad = Math.max(8, Math.round(minDim * padFactor));
    root.style.setProperty('--radius', `${Math.round(radius)}px`);
    root.style.setProperty('--viewer-pad', `${viewerPad}px`);
    applyRootVars();
    applyTransform(rotationRef.x, rotationRef.y);

    const enlargedOverlay = viewerRef?.querySelector('.dg-enlarge') as HTMLElement | null;
    if (enlargedOverlay && frameRef && mainRef) {
      const frameR = frameRef.getBoundingClientRect();
      const mainR = mainRef.getBoundingClientRect();
      if (openedImageWidth && openedImageHeight) {
        const tmp = document.createElement('div');
        tmp.style.cssText = `position:absolute;visibility:hidden;pointer-events:none;width:${openedImageWidth};height:${openedImageHeight};`;
        document.body.appendChild(tmp);
        const tmpR = tmp.getBoundingClientRect();
        document.body.removeChild(tmp);
        enlargedOverlay.style.left = `${frameR.left - mainR.left + (frameR.width - tmpR.width) / 2}px`;
        enlargedOverlay.style.top = `${frameR.top - mainR.top + (frameR.height - tmpR.height) / 2}px`;
      } else {
        enlargedOverlay.style.left = `${frameR.left - mainR.left}px`;
        enlargedOverlay.style.top = `${frameR.top - mainR.top}px`;
        enlargedOverlay.style.width = `${frameR.width}px`;
        enlargedOverlay.style.height = `${frameR.height}px`;
      }
    }
  };

  const lockScroll = () => {
    if (scrollLockedRef) return;
    scrollLockedRef = true;
    document.body.classList.add('dg-scroll-lock');
  };

  const unlockScroll = () => {
    if (!scrollLockedRef) return;
    if (rootRef?.getAttribute('data-enlarging') === 'true') return;
    scrollLockedRef = false;
    document.body.classList.remove('dg-scroll-lock');
  };

  const stopInertia = () => {
    if (inertiaRAF !== null) {
      cancelAnimationFrame(inertiaRAF);
      inertiaRAF = null;
    }
  };

  const startInertia = (vx: number, vy: number) => {
    if (reducedMotion) return;
    const MAX_V = 1.4;
    let vX = clamp(vx, -MAX_V, MAX_V) * 80;
    let vY = clamp(vy, -MAX_V, MAX_V) * 80;
    let frames = 0;
    const d = clamp(dragDampening ?? 0.6, 0, 1);
    const frictionMul = 0.94 + 0.055 * d;
    const stopThreshold = 0.015 - 0.01 * d;
    const maxFrames = Math.round(90 + 270 * d);
    const step = () => {
      vX *= frictionMul;
      vY *= frictionMul;
      if (Math.abs(vX) < stopThreshold && Math.abs(vY) < stopThreshold) {
        inertiaRAF = null;
        return;
      }
      if (++frames > maxFrames) {
        inertiaRAF = null;
        return;
      }
      const nextX = clamp(rotationRef.x - vY / 200, -maxVerticalRotationDeg, maxVerticalRotationDeg);
      const nextY = wrapAngleSigned(rotationRef.y + vX / 200);
      rotationRef.x = nextX;
      rotationRef.y = nextY;
      applyTransform(nextX, nextY);
      inertiaRAF = requestAnimationFrame(step);
    };
    stopInertia();
    inertiaRAF = requestAnimationFrame(step);
  };

  const onDragStart = (e: MouseEvent | TouchEvent) => {
    if (focusedElRef || ('button' in e && e.button !== 0)) return;
    stopInertia();
    draggingRef = true;
    movedRef = false;
    startRotRef.x = rotationRef.x;
    startRotRef.y = rotationRef.y;
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    startPosRef = { x: clientX, y: clientY };
  };

  const onDragMove = (e: MouseEvent | TouchEvent) => {
    if (focusedElRef || !draggingRef || !startPosRef) return;
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const dxTotal = clientX - startPosRef.x;
    const dyTotal = clientY - startPosRef.y;
    if (!movedRef && dxTotal * dxTotal + dyTotal * dyTotal > 16) movedRef = true;
    const nextX = clamp(startRotRef.x - dyTotal / dragSensitivity, -maxVerticalRotationDeg, maxVerticalRotationDeg);
    const nextY = wrapAngleSigned(startRotRef.y + dxTotal / dragSensitivity);
    if (rotationRef.x !== nextX || rotationRef.y !== nextY) {
      rotationRef.x = nextX;
      rotationRef.y = nextY;
      applyTransform(nextX, nextY);
    }
  };

  const onDragEnd = (e: MouseEvent | TouchEvent) => {
    if (!draggingRef) return;
    draggingRef = false;
    if (movedRef && startPosRef) {
      const clientX = 'changedTouches' in e ? (e.changedTouches[0]?.clientX ?? 0) : e.clientX;
      const clientY = 'changedTouches' in e ? (e.changedTouches[0]?.clientY ?? 0) : e.clientY;
      const vx = clamp(((clientX - startPosRef.x) / dragSensitivity) * 0.02, -1.2, 1.2);
      const vy = clamp(((clientY - startPosRef.y) / dragSensitivity) * 0.02, -1.2, 1.2);
      if (Math.abs(vx) > 0.005 || Math.abs(vy) > 0.005) startInertia(vx, vy);
      lastDragEndAt = performance.now();
    }
    startPosRef = null;
  };

  const openItemFromElement = (el: HTMLElement) => {
    if (openingRef) return;
    openingRef = true;
    openStartedAtRef = performance.now();
    lockScroll();

    const parent = el.parentElement;
    if (!parent) {
      openingRef = false;
      unlockScroll();
      return;
    }

    focusedElRef = el;
    el.setAttribute('data-focused', 'true');

    const offsetX = getDataNumber(parent, 'offsetX', 0);
    const offsetY = getDataNumber(parent, 'offsetY', 0);

    const parentRot = computeItemBaseRotation(offsetX, offsetY, segments);
    const parentY = normalizeAngle(parentRot.rotateY);
    const globalY = normalizeAngle(rotationRef.y);
    let rotY = -(parentY + globalY) % 360;
    if (rotY < -180) rotY += 360;
    const rotX = -parentRot.rotateX - rotationRef.x;

    parent.style.setProperty('--rot-y-delta', `${rotY}deg`);
    parent.style.setProperty('--rot-x-delta', `${rotX}deg`);

    // Reference div: same geometry as the clickable tile so we can measure its
    // screen position. Must match the tile's inline styles exactly.
    const refDiv = document.createElement('div');
    refDiv.style.cssText = `
    position: absolute;
    display: block;
    inset: 10px;
    opacity: 0;
    border-radius: var(--tile-radius, 12px);
    background: transparent;
    overflow: hidden;
    backface-visibility: hidden;
    transform: rotateX(${-parentRot.rotateX}deg) rotateY(${-parentRot.rotateY}deg) translateZ(0);
    pointer-events: none;
  `;
    parent.appendChild(refDiv);
    void refDiv.offsetHeight;

    const tileR = refDiv.getBoundingClientRect();
    const mainR = mainRef?.getBoundingClientRect();
    const frameR = frameRef?.getBoundingClientRect();

    if (!mainR || !frameR || tileR.width <= 0 || tileR.height <= 0) {
      openingRef = false;
      focusedElRef = null;
      parent.removeChild(refDiv);
      unlockScroll();
      return;
    }

    originalTilePositionRef = { left: tileR.left, top: tileR.top, width: tileR.width, height: tileR.height };
    el.style.visibility = 'hidden';
    el.style.zIndex = '0';

    const overlay = document.createElement('div');
    overlay.className = 'dg-enlarge';
    overlay.style.cssText = `
    position: absolute;
    left: ${frameR.left - mainR.left}px;
    top: ${frameR.top - mainR.top}px;
    width: ${frameR.width}px;
    height: ${frameR.height}px;
    opacity: 0;
    z-index: 30;
    will-change: transform, opacity;
    transform-origin: top left;
    transition: transform ${enlargeTransitionMs}ms ease, opacity ${enlargeTransitionMs}ms ease;
    border-radius: var(--enlarge-radius, 32px);
    overflow: hidden;
    box-shadow: 0 10px 30px rgba(0,0,0,0.35);
  `;

    const rawSrc = parent.dataset['src'] ?? el.querySelector('img')?.src ?? '';
    mountImage(overlay, rawSrc, el.querySelector('img')?.alt ?? '');
    // The viewer is an empty mount target owned by this animation.
    // eslint-disable-next-line svelte/no-dom-manipulating
    viewerRef?.appendChild(overlay);

    const tx0 = tileR.left - frameR.left;
    const ty0 = tileR.top - frameR.top;
    const sx0 = tileR.width / frameR.width;
    const sy0 = tileR.height / frameR.height;
    const validSx = isFinite(sx0) && sx0 > 0 ? sx0 : 1;
    const validSy = isFinite(sy0) && sy0 > 0 ? sy0 : 1;
    overlay.style.transform = `translate(${tx0}px, ${ty0}px) scale(${validSx}, ${validSy})`;

    setTimeout(() => {
      if (!overlay.parentElement) return;
      overlay.style.opacity = '1';
      overlay.style.transform = 'translate(0px, 0px) scale(1, 1)';
      rootRef?.setAttribute('data-enlarging', 'true');
      isEnlarging = true;
    }, 16);

    const wantsResize = openedImageWidth || openedImageHeight;
    if (wantsResize) {
      const onFirstEnd = (ev: TransitionEvent) => {
        if (ev.propertyName !== 'transform') return;
        overlay.removeEventListener('transitionend', onFirstEnd);
        const prevTransition = overlay.style.transition;
        overlay.style.transition = 'none';
        const tempW = openedImageWidth || `${frameR.width}px`;
        const tempH = openedImageHeight || `${frameR.height}px`;
        overlay.style.width = tempW;
        overlay.style.height = tempH;
        const newRect = overlay.getBoundingClientRect();
        overlay.style.width = `${frameR.width}px`;
        overlay.style.height = `${frameR.height}px`;
        void overlay.offsetWidth;
        overlay.style.transition = `left ${enlargeTransitionMs}ms ease, top ${enlargeTransitionMs}ms ease, width ${enlargeTransitionMs}ms ease, height ${enlargeTransitionMs}ms ease`;
        const centeredLeft = frameR.left - mainR.left + (frameR.width - newRect.width) / 2;
        const centeredTop = frameR.top - mainR.top + (frameR.height - newRect.height) / 2;
        requestAnimationFrame(() => {
          overlay.style.left = `${centeredLeft}px`;
          overlay.style.top = `${centeredTop}px`;
          overlay.style.width = tempW;
          overlay.style.height = tempH;
        });
        const cleanupSecond = () => {
          overlay.removeEventListener('transitionend', cleanupSecond);
          overlay.style.transition = prevTransition;
        };
        overlay.addEventListener('transitionend', cleanupSecond, { once: true });
      };
      overlay.addEventListener('transitionend', onFirstEnd);
    }
  };

  const closeEnlargedImage = () => {
    if (performance.now() - openStartedAtRef < 250) return;
    const el = focusedElRef;
    if (!el) return;
    const parent = el.parentElement;
    const overlay = viewerRef?.querySelector('.dg-enlarge') as HTMLElement | null;
    if (!overlay || !parent) return;

    const refDiv = Array.from(parent.children).find((c) => (c as HTMLElement).style?.opacity === '0' && c !== el) as
      HTMLElement | undefined;

    const originalPos = originalTilePositionRef;

    if (!originalPos) {
      removeOverlay(overlay);
      if (refDiv) refDiv.remove();
      parent.style.setProperty('--rot-y-delta', '0deg');
      parent.style.setProperty('--rot-x-delta', '0deg');
      el.style.visibility = '';
      el.style.zIndex = '0';
      focusedElRef = null;
      rootRef?.removeAttribute('data-enlarging');
      isEnlarging = false;
      openingRef = false;
      unlockScroll();
      return;
    }

    const currentRect = overlay.getBoundingClientRect();
    const rootRect = rootRef?.getBoundingClientRect();
    if (!rootRect) return;

    const origRel = {
      left: originalPos.left - rootRect.left,
      top: originalPos.top - rootRect.top,
      width: originalPos.width,
      height: originalPos.height
    };
    const overlayRel = {
      left: currentRect.left - rootRect.left,
      top: currentRect.top - rootRect.top,
      width: currentRect.width,
      height: currentRect.height
    };

    const animOverlay = document.createElement('div');
    animOverlay.style.cssText = `
    position: absolute;
    left: ${overlayRel.left}px;
    top: ${overlayRel.top}px;
    width: ${overlayRel.width}px;
    height: ${overlayRel.height}px;
    z-index: 9999;
    border-radius: var(--enlarge-radius, 32px);
    overflow: hidden;
    box-shadow: 0 10px 30px rgba(0,0,0,.35);
    transition: all ${enlargeTransitionMs}ms ease-out;
    pointer-events: none;
    margin: 0;
    transform: none;
  `;
    const origImg = overlay.querySelector('img');
    if (origImg) mountImage(animOverlay, origImg.src, origImg.alt);

    removeOverlay(overlay);
    rootRef?.removeAttribute('data-enlarging');
    isEnlarging = false;
    // The closing overlay is an independently mounted Image, removed after its transition.
    // eslint-disable-next-line svelte/no-dom-manipulating
    rootRef?.appendChild(animOverlay);
    void animOverlay.getBoundingClientRect();

    requestAnimationFrame(() => {
      animOverlay.style.left = `${origRel.left}px`;
      animOverlay.style.top = `${origRel.top}px`;
      animOverlay.style.width = `${origRel.width}px`;
      animOverlay.style.height = `${origRel.height}px`;
      animOverlay.style.opacity = '0';
    });

    let cleanedUp = false;
    const cleanup = () => {
      if (cleanedUp) return;
      cleanedUp = true;
      clearTimeout(cleanupTimer);
      removeOverlay(animOverlay);
      originalTilePositionRef = null;
      if (refDiv) refDiv.remove();
      parent.style.transition = 'none';
      el.style.transition = 'none';
      parent.style.setProperty('--rot-y-delta', '0deg');
      parent.style.setProperty('--rot-x-delta', '0deg');
      requestAnimationFrame(() => {
        el.style.visibility = '';
        el.style.opacity = '0';
        el.style.zIndex = '0';
        focusedElRef = null;
        requestAnimationFrame(() => {
          parent.style.transition = 'transform 300ms';
          el.style.transition = 'opacity 300ms ease-out';
          requestAnimationFrame(() => {
            el.style.opacity = '1';
            setTimeout(() => {
              el.style.transition = '';
              el.style.opacity = '';
              openingRef = false;
              if (!draggingRef) {
                unlockScroll();
              }
            }, 300);
          });
        });
      });
    };

    animOverlay.addEventListener('transitionend', cleanup, { once: true });
    const cleanupTimer = setTimeout(cleanup, enlargeTransitionMs + 50);
  };

  const onTileClick = (e: MouseEvent, item: TileItem) => {
    if (e.detail !== 0 && (draggingRef || movedRef || performance.now() - lastDragEndAt < 80)) {
      e.preventDefault();
      return;
    }
    if (item.href) return;
    if (!openingRef) openItemFromElement(e.currentTarget as HTMLElement);
  };

  function focusTile(el: HTMLElement, item: TileItem) {
    stopInertia();
    const index = items.indexOf(item);
    if (index >= 0) activeTileIndex = index;
    const base = computeItemBaseRotation(item.x, item.y, segments);
    rotationRef.y = wrapAngleSigned(-base.rotateY);
    rotationRef.x = clamp(-base.rotateX, -maxVerticalRotationDeg, maxVerticalRotationDeg);
    applyTransform(rotationRef.x, rotationRef.y);
    el.focus({ preventScroll: true });
  }

  function onTileKeydown(event: KeyboardEvent, item: TileItem) {
    if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) return;
    event.preventDefault();
    const index = items.indexOf(item);
    const offset = { ArrowLeft: -5, ArrowRight: 5, ArrowUp: -1, ArrowDown: 1 }[event.key] ?? 0;
    const nextIndex = (index + offset + items.length) % items.length;
    const tile = sphereRef.querySelectorAll<HTMLElement>('.gallery-tile')[nextIndex];
    if (tile) focusTile(tile, items[nextIndex]);
  }

  onMount(() => {
    const root = rootRef;
    const main = mainRef;
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updateMotion = () => {
      reducedMotion = motionQuery.matches;
      if (reducedMotion) stopInertia();
    };
    updateMotion();
    motionQuery.addEventListener('change', updateMotion);
    computeRadius();
    resizeObserver = new ResizeObserver(computeRadius);
    resizeObserver.observe(root);
    main.addEventListener('mousedown', onDragStart, { passive: true });
    main.addEventListener('touchstart', onDragStart, { passive: true });
    window.addEventListener('mousemove', onDragMove, { passive: true });
    window.addEventListener('touchmove', onDragMove, { passive: true });
    window.addEventListener('mouseup', onDragEnd);
    window.addEventListener('touchend', onDragEnd);
    const cancelDrag = () => {
      draggingRef = false;
      startPosRef = null;
      movedRef = true;
      stopInertia();
    };
    window.addEventListener('touchcancel', cancelDrag);
    window.addEventListener('blur', cancelDrag);
    scrimRef.addEventListener('click', closeEnlargedImage);
    keydownHandler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeEnlargedImage();
    };
    window.addEventListener('keydown', keydownHandler);
    return () => {
      stopInertia();
      resizeObserver?.disconnect();
      motionQuery.removeEventListener('change', updateMotion);
      main.removeEventListener('mousedown', onDragStart);
      main.removeEventListener('touchstart', onDragStart);
      scrimRef.removeEventListener('click', closeEnlargedImage);
      window.removeEventListener('mousemove', onDragMove);
      window.removeEventListener('touchmove', onDragMove);
      window.removeEventListener('mouseup', onDragEnd);
      window.removeEventListener('touchend', onDragEnd);
      window.removeEventListener('touchcancel', cancelDrag);
      window.removeEventListener('blur', cancelDrag);
      if (keydownHandler) window.removeEventListener('keydown', keydownHandler);
      for (const target of mountedImages.keys()) removeOverlay(target);
      document.body.classList.remove('dg-scroll-lock');
    };
  });

  $effect(() => {
    // These props affect layout independently of container resizing.
    void [
      fit,
      fitBasis,
      minRadius,
      maxRadius,
      padFactor,
      overlayBlurColor,
      imageBorderRadius,
      openedImageBorderRadius,
      openedImageWidth,
      openedImageHeight,
      segments
    ];
    computeRadius();
  });
</script>

<div
  bind:this={rootRef}
  class="gallery"
  class:logo-tiles={imageFit === 'contain'}
  style={`--segments-x:${segments};--segments-y:${segments};--image-fit:${imageFit}`}
>
  <div bind:this={mainRef} class="gallery-main">
    <div class="gallery-stage">
      <div bind:this={sphereRef} class="gallery-sphere">
        {#each items as item, i (`${item.x},${item.y},${i}`)}
          <div
            class="gallery-item"
            data-src={item.src}
            data-offset-x={item.x}
            data-offset-y={item.y}
            style={`--offset-x:${item.x};--offset-y:${item.y}`}
          >
            {#if item.href}
              <!-- The caller supplies resolved application paths or external URLs. -->
              <a
                class="gallery-tile"
                href={item.href}
                aria-label={item.alt ? `${item.alt} documentation` : 'Provider documentation'}
                draggable="false"
                tabindex={i === tabStopIndex ? 0 : -1}
                onclick={(event) => onTileClick(event, item)}
                onkeydown={(event) => onTileKeydown(event, item)}
                onfocus={(event) => {
                  if (event.currentTarget.matches(':focus-visible')) focusTile(event.currentTarget, item);
                }}
              >
                <Image
                  src={item.src}
                  alt={item.alt}
                  draggable={false}
                  loading="lazy"
                  fetchpriority="low"
                  width={60}
                  height={60}
                  quality={100}
                />
              </a>
            {:else}
              <button
                type="button"
                class="gallery-tile"
                aria-label={item.alt || 'Open image'}
                tabindex={i === tabStopIndex ? 0 : -1}
                onclick={(event) => onTileClick(event, item)}
                onkeydown={(event) => onTileKeydown(event, item)}
                onfocus={(event) => {
                  if (event.currentTarget.matches(':focus-visible')) focusTile(event.currentTarget, item);
                }}
              >
                <Image
                  src={item.src}
                  alt={item.alt}
                  draggable={false}
                  loading="lazy"
                  fetchpriority="low"
                  width={60}
                  height={60}
                  quality={100}
                />
              </button>
            {/if}
          </div>
        {/each}
      </div>
    </div>
    <div class="gallery-overlay"></div>
    <div class="gallery-blur"></div>
    <div class="gallery-fade gallery-fade-top"></div>
    <div class="gallery-fade gallery-fade-bottom"></div>
    <div bind:this={viewerRef} class="gallery-viewer">
      <button
        bind:this={scrimRef}
        type="button"
        class="gallery-scrim"
        aria-label="Close image"
        tabindex={isEnlarging ? 0 : -1}
        style:opacity={isEnlarging ? 1 : 0}
        style:pointer-events={isEnlarging ? 'all' : 'none'}
      ></button>
      <div bind:this={frameRef} class="gallery-frame"></div>
    </div>
  </div>
</div>

<style>
  .gallery {
    --radius: 600px;
    --circ: calc(var(--radius) * 3.14);
    --rot-y: calc((360deg / var(--segments-x)) / 2);
    --rot-x: calc((360deg / var(--segments-y)) / 2);
    --item-width: calc(var(--circ) / var(--segments-x));
    --item-height: calc(var(--circ) / var(--segments-y));
    position: relative;
    width: 100%;
    height: 100%;
  }
  .gallery-main {
    position: absolute;
    inset: 0;
    display: grid;
    place-items: center;
    background: transparent;
    overflow: hidden;
    touch-action: none;
    user-select: none;
    cursor: grab;
  }
  .gallery-main:active {
    cursor: grabbing;
  }
  .gallery-stage {
    display: grid;
    place-items: center;
    width: 100%;
    height: 100%;
    perspective: calc(var(--radius) * 2);
    perspective-origin: 50% 50%;
    contain: layout paint size;
  }
  .gallery-sphere {
    will-change: transform;
    transform-style: preserve-3d;
    transform: translateZ(calc(var(--radius) * -1));
  }
  .gallery-item {
    width: calc(var(--item-width) * 2);
    height: calc(var(--item-height) * 2);
    position: absolute;
    inset: -999px;
    margin: auto;
    transform-style: preserve-3d;
    transform-origin: 50% 50%;
    backface-visibility: hidden;
    transition: transform 300ms;
    transform: rotateY(calc(var(--rot-y) * (var(--offset-x) + (1 / 2)) + var(--rot-y-delta, 0deg)))
      rotateX(calc(var(--rot-x) * (var(--offset-y) - (1 / 2)) + var(--rot-x-delta, 0deg))) translateZ(var(--radius));
  }
  .gallery-tile {
    position: absolute;
    display: block;
    inset: 10px;
    padding: 0;
    border: 0;
    border-radius: var(--tile-radius, 12px);
    background: transparent;
    overflow: hidden;
    transform-style: preserve-3d;
    backface-visibility: hidden;
    transition: transform 300ms;
    cursor: pointer;
    touch-action: none;
    -webkit-tap-highlight-color: transparent;
    transform: translateZ(0);
    pointer-events: auto;
    text-decoration: none;
  }
  .gallery-tile :global(img) {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: var(--image-fit);
    pointer-events: none;
    backface-visibility: hidden;
  }
  .logo-tiles .gallery-tile {
    background: #f6f7f4;
    border: 1px solid #f6f7f4;
  }
  .logo-tiles .gallery-tile :global(img) {
    padding: 0;
    filter: saturate(0.75);
    border-radius: var(--tile-radius, 12px);
  }
  .gallery-overlay,
  .gallery-blur {
    z-index: 3;
    position: absolute;
    inset: 0;
    margin: auto;
    pointer-events: none;
  }
  .gallery-overlay {
    background-image: radial-gradient(rgba(235, 235, 235, 0) 65%, var(--overlay-blur-color, #120f17) 100%);
  }
  .gallery-blur {
    mask-image: radial-gradient(rgba(235, 235, 235, 0) 70%, var(--overlay-blur-color, #120f17) 90%);
    backdrop-filter: blur(3px);
  }
  .gallery-fade {
    z-index: 5;
    position: absolute;
    right: 0;
    left: 0;
    height: 120px;
    pointer-events: none;
    background: linear-gradient(to bottom, transparent, var(--overlay-blur-color, #120f17));
  }
  .gallery-fade-top {
    top: 0;
    transform: rotate(180deg);
  }
  .gallery-fade-bottom {
    bottom: 0;
  }
  .gallery-viewer {
    z-index: 20;
    position: absolute;
    inset: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    pointer-events: none;
    padding: var(--viewer-pad);
  }
  .gallery-scrim {
    z-index: 10;
    position: absolute;
    inset: 0;
    width: 100%;
    border: 0;
    background: rgba(0, 0, 0, 0.4);
    transition: opacity 500ms linear;
    backdrop-filter: blur(3px);
  }
  .gallery-frame {
    display: flex;
    height: 100%;
    aspect-ratio: 1;
    border-radius: var(--enlarge-radius, 32px);
  }
  :global(body.dg-scroll-lock) {
    overflow: hidden;
  }
</style>
