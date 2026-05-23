import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DsImageComponent, DsPictureComponent } from '@desource/angular-image';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [DsImageComponent, DsPictureComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <main>
      <section class="hero">
        <h1>Angular SSR image optimization</h1>
        <ds-image
          src="/unsplash/photo-1500530855697-b586d89ba3ee"
          alt="Mountain cabin"
          width="2200"
          height="1467"
          sizes="100vw md:1100px"
          format="webp"
          preset="cover"
          placeholder
          placeholderClass="blur"
          priority
        />
      </section>

      <section class="grid">
        <ds-picture
          src="/unsplash/photo-1498050108023-c5249f4df085"
          alt="Developer workspace"
          [width]="1200"
          [height]="800"
          sizes="100vw md:50vw"
          [format]="['avif', 'webp']"
          [placeholder]="[48, 32, 25, 8]"
        />

        <ds-image
          src="/unsplash/photo-1507003211169-0a1dd7228f2d"
          alt="Profile"
          preset="avatar"
          class="avatar"
          placeholder
        />
      </section>
    </main>
  `
})
export class AppComponent {}
