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
        <span class="eyebrow">Angular package fixture</span>
        <h1>One image API, four Angular surfaces.</h1>
        <p>Components and attribute directives share the same resolved provider configuration.</p>
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
          <span>Component</span>
          <ds-image
            data-testid="component"
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
          <span>Directive</span>
          <img
            data-testid="directive"
            dsImage="/hero.jpg"
            alt="Aurora reflected in water"
            [width]="width()"
            [height]="540"
            densities="1x 2x"
            class="media"
          />
        </article>

        <article>
          <span>Picture component</span>
          <ds-picture
            data-testid="picture-component"
            src="/hero.jpg"
            alt="Responsive mountain landscape"
            [width]="width()"
            [height]="540"
            [formats]="['avif', 'webp']"
            fallbackFormat="png"
            class="media"
          />
        </article>

        <article>
          <span>Picture directive</span>
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
