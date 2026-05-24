import { bootstrapApplication, type BootstrapContext } from '@angular/platform-browser';
import { AppComponent } from './app/app.component.js';
import { serverConfig } from './app/app.config.server.js';

const bootstrap = (context: BootstrapContext) => bootstrapApplication(AppComponent, serverConfig, context);

export default bootstrap;
