import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component.js';
import { appConfig } from './app/app.config.js';

bootstrapApplication(AppComponent, appConfig).catch((error) => console.error(error));
