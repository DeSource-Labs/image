<script lang="ts">
  import { useDsImage } from '@desource/image-svelte';
  import type { ImageFit, ImageFormat } from '@desource/image';

  const image = useDsImage();
  let width = $state(960);
  let quality = $state(76);
  let format = $state<ImageFormat>('webp');
  let fit = $state<ImageFit>('cover');
  let responsive = $state(true);
  let copyLabel = $state('Copy URL');

  const height = $derived(Math.round(width * 0.625));
  const attrs = $derived(
    image.getAttrs({
      src: '/img/workspace.jpg',
      alt: 'A creative workspace with a monitor, drawing tablet, lamp, and plants',
      width,
      height,
      quality,
      format,
      fit,
      sizes: responsive ? '100vw md:760px' : undefined
    })
  );
  const url = $derived(image('/img/workspace.jpg', { width, height, quality, format, fit }));

  async function copyUrl() {
    try {
      await navigator.clipboard.writeText(new URL(url, window.location.origin).href);
      copyLabel = 'Copied';
      globalThis.setTimeout(() => (copyLabel = 'Copy URL'), 1400);
    } catch (error) {
      console.warn('Failed to copy URL:', error);
    }
  }
</script>

<div class="playground">
  <div class="preview">
    <div class="preview-bar">
      <span class="lights"><i></i><i></i><i></i></span>
      <span>Live optimized output</span>
      <strong>{format}</strong>
    </div>
    <div class="image-stage">
      <img
        src={attrs.src}
        srcset={attrs.srcset}
        sizes={attrs.sizes}
        width={attrs.width}
        height={attrs.height}
        alt={attrs.alt ?? ''}
      />
      <div class="stats" aria-label="Current image settings">
        <span>{width}px</span>
        <span>{quality}% quality</span>
        <span>{responsive ? 'responsive' : 'fixed'}</span>
      </div>
    </div>
  </div>

  <div class="controls">
    <header>
      <h3>Change the request</h3>
      <span class="live"><i></i> live</span>
    </header>

    <label>
      <span>Width <output>{width}px</output></span>
      <input bind:value={width} type="range" min="320" max="1600" step="80" aria-label="Width" />
    </label>

    <label>
      <span>Quality <output>{quality}</output></span>
      <input bind:value={quality} type="range" min="10" max="100" step="1" aria-label="Quality" />
    </label>

    <div class="control-grid">
      <label>
        <span>Format</span>
        <select bind:value={format}>
          <option value="avif">AVIF</option>
          <option value="webp">WebP</option>
          <option value="jpeg">JPEG</option>
          <option value="png">PNG</option>
        </select>
      </label>
      <label>
        <span>Fit</span>
        <select bind:value={fit}>
          <option value="cover">Cover</option>
          <option value="contain">Contain</option>
          <option value="fill">Fill</option>
          <option value="inside">Inside</option>
        </select>
      </label>
    </div>

    <label class="switch-row">
      <span><b>Responsive candidates</b><small>Generate sizes and srcset</small></span>
      <input bind:checked={responsive} type="checkbox" />
    </label>

    <div class="url-output">
      <div><span>Generated URL</span><code>{url}</code></div>
      <button type="button" onclick={copyUrl}>{copyLabel}</button>
    </div>
  </div>
</div>

<style>
  .playground {
    display: grid;
    grid-template-columns: minmax(0, 1.2fr) minmax(320px, 0.8fr);
    overflow: hidden;
    border: 1px solid var(--line);
    border-radius: 28px;
    background: rgba(7, 17, 31, 0.72);
    box-shadow: 0 36px 100px rgba(0, 0, 0, 0.32);
  }
  .preview {
    min-width: 0;
    padding: 16px;
    border-right: 1px solid var(--line);
    background: #091522;
  }
  .preview-bar {
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    align-items: center;
    padding: 1px 2px 14px;
    color: #7e91a8;
    font-size: 0.72rem;
    letter-spacing: 0.04em;
  }
  .lights {
    display: flex;
    gap: 5px;
  }
  .lights i {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: #39506a;
  }
  .preview-bar strong {
    justify-self: end;
    padding: 5px 8px;
    border: 1px solid var(--line);
    border-radius: 999px;
    color: var(--lime);
    font-size: 0.7rem;
    text-transform: uppercase;
  }
  .image-stage {
    position: relative;
    min-height: 500px;
    overflow: hidden;
    border-radius: 18px;
    background: #101b29;
  }
  .image-stage img {
    display: block;
    width: 100%;
    height: 100%;
    min-height: 500px;
    object-fit: cover;
  }
  .stats {
    position: absolute;
    right: 14px;
    bottom: 14px;
    left: 14px;
    display: flex;
    flex-wrap: wrap;
    gap: 7px;
  }
  .stats span {
    padding: 7px 10px;
    border: 1px solid rgba(255, 255, 255, 0.19);
    border-radius: 999px;
    color: #f8fbff;
    background: rgba(6, 13, 22, 0.72);
    backdrop-filter: blur(14px);
    font-size: 0.72rem;
    font-weight: 650;
  }
  .controls {
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 24px;
    padding: 34px;
    background: linear-gradient(145deg, rgba(18, 35, 56, 0.98), rgba(11, 25, 42, 0.98));
  }
  header {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 16px;
  }
  h3 {
    margin: 7px 0 0;
    font-size: 1.45rem;
  }
  .live {
    display: flex;
    align-items: center;
    gap: 7px;
    color: var(--muted);
    font-size: 0.72rem;
    text-transform: uppercase;
  }
  .live i {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: var(--lime);
    box-shadow: 0 0 12px var(--lime);
  }
  label > span {
    display: flex;
    justify-content: space-between;
    margin-bottom: 10px;
    color: #c9d5e4;
    font-size: 0.82rem;
    font-weight: 650;
  }
  output {
    color: var(--lime);
  }
  input[type='range'] {
    width: 100%;
    accent-color: var(--lime);
  }
  .control-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
  }
  label {
    min-width: 0;
  }
  select {
    min-width: 0;
    width: 100%;
    padding: 11px 12px;
    border: 1px solid var(--line);
    border-radius: 10px;
    color: #ecf4ff;
    background: #0a1727;
  }
  input[type='range'],
  input[type='checkbox'],
  label {
    min-width: 0;
  }
  select {
    min-width: 0;
    cursor: pointer;
  }
  .switch-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    padding: 14px 0;
    border-block: 1px solid var(--line);
  }
  .switch-row > span {
    display: grid;
    justify-content: initial;
    gap: 4px;
    margin: 0;
  }
  .switch-row small {
    color: var(--muted);
    font-weight: 400;
  }
  .switch-row input {
    width: 42px;
    height: 22px;
    accent-color: var(--lime);
  }
  .url-output {
    display: flex;
    align-items: flex-end;
    gap: 12px;
    margin-top: auto;
    padding: 14px;
    border: 1px solid var(--line);
    border-radius: 14px;
    background: rgba(2, 9, 17, 0.55);
  }
  .url-output > div {
    min-width: 0;
    flex: 1;
  }
  .url-output span {
    display: block;
    margin-bottom: 7px;
    color: #7f93aa;
    font-size: 0.68rem;
    font-weight: 750;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }
  code {
    display: block;
    overflow: hidden;
    color: #bed1e8;
    font-size: 0.72rem;
    text-overflow: ellipsis;
    overflow-wrap: anywhere;
    white-space: normal;
  }
  button {
    padding: 9px 11px;
    border: 0;
    border-radius: 8px;
    color: #07111f;
    background: var(--lime);
    font-size: 0.72rem;
    font-weight: 800;
    cursor: pointer;
  }
  @media (max-width: 900px) {
    .playground {
      grid-template-columns: 1fr;
    }
    .preview {
      border-right: 0;
      border-bottom: 1px solid var(--line);
    }
    .image-stage,
    .image-stage img {
      min-height: 360px;
    }
  }
  @media (max-width: 520px) {
    .controls {
      min-width: 0;
      padding: 22px 14px;
    }
    .preview {
      padding: 10px;
    }
    .preview-bar {
      grid-template-columns: auto minmax(0, 1fr) auto;
      gap: 10px;
      font-size: 0.65rem;
    }
    .preview-bar > span:nth-child(2) {
      text-align: center;
    }
    .image-stage,
    .image-stage img {
      min-height: 260px;
    }
    .switch-row input {
      flex-shrink: 0;
    }
    .url-output {
      align-items: stretch;
      flex-direction: column;
    }
  }
</style>
