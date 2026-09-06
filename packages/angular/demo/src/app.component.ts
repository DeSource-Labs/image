import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { DsImageComponent, DsImageDirective, DsPictureComponent, DsPictureDirective } from '@desource/image-angular';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [DsImageComponent, DsImageDirective, DsPictureComponent, DsPictureDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <main>
      <header>
        <span class="eyebrow">DeSource Image for Angular</span>
        <h1>Optimized images across four Angular surfaces.</h1>
        <p>DsImage and DsPicture components and directives share one provider and responsive-output model.</p>
      </header>

      <label class="control">
        Render width: <strong data-testid="width-value">{{ width() }}px</strong>
        <input
          data-testid="width"
          type="range"
          min="320"
          max="960"
          step="80"
          [value]="width()"
          (input)="width.set(+$any($event.target).value)"
        />
      </label>

      <section class="grid">
        <article>
          <span>DsImage component</span>
          <ds-image
            data-testid="image-component"
            src="/hero.jpg"
            alt="Aurora over a mountain lake"
            [width]="width()"
            [height]="540"
            sizes="sm:100vw md:50vw 680px"
            [quality]="82"
            [preload]="true"
            class="media"
          />
        </article>

        <article>
          <span>DsImage directive</span>
          <img
            data-testid="image-directive"
            dsImage="/hero.jpg"
            alt="Aurora reflected in water"
            [width]="width()"
            [height]="540"
            densities="1x 2x"
            class="media"
          />
        </article>

        <article>
          <span>DsPicture component</span>
          <ds-picture
            data-testid="picture-component"
            src="/hero.jpg"
            alt="Responsive mountain landscape"
            [width]="width()"
            [height]="540"
            [formats]="['avif', 'webp']"
            fallbackFormat="jpg"
            class="media"
          />
        </article>

        <article>
          <span>DsPicture directive</span>
          <picture
            data-testid="picture-directive"
            dsPicture="/hero.jpg"
            alt="Mountain landscape art direction"
            [width]="width()"
            [height]="540"
            [formats]="['webp']"
          >
            <img class="media" alt="Mountain landscape art direction" />
          </picture>
        </article>
      </section>
    </main>
  `
})
export class AppComponent {
  readonly width = signal(720);
}
