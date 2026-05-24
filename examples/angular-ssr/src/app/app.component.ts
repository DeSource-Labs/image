import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DsImageComponent } from '@desource/angular-image';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [DsImageComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <main>
      <ds-image
        src="/img/hero.jpg"
        alt="Background"
        quality="75"
        sizes="100vw md:1100px"
        format="webp"
        loading="lazy"
      />
    </main>
  `
})
export class AppComponent {}
