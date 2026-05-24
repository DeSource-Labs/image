import { type ApplicationConfig, provideZonelessChangeDetection } from '@angular/core';
import { provideClientHydration } from '@angular/platform-browser';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(),
    provideClientHydration()
  ]
};
