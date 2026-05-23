import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component.js';
import { serverConfig } from './app/app.config.server.js';

const bootstrap = () => bootstrapApplication(AppComponent, serverConfig);

export default bootstrap;
