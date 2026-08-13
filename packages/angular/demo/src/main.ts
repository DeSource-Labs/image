import { bootstrapApplication } from '@angular/platform-browser';
import { defineProvider } from '@desource/image';
import { provideDsImage } from '@desource/image-angular';
import { AppComponent } from './app.component.js';

const demoProvider = defineProvider({
  getImage(src, { modifiers }) {
    const query = new URLSearchParams();
    if (modifiers.width) query.set('w', String(modifiers.width));
    if (modifiers.height) query.set('h', String(modifiers.height));
    if (modifiers.quality) query.set('q', String(modifiers.quality));
    if (modifiers.format) query.set('fm', String(modifiers.format));
    const suffix = query.size ? `?${query}` : '';
    return { url: `${src}${suffix}` };
  }
});

void bootstrapApplication(AppComponent, {
  providers: [
    provideDsImage({
      provider: 'demo',
      providers: { demo: demoProvider },
      screens: { sm: 640, md: 768, lg: 1024 }
    })
  ]
});
