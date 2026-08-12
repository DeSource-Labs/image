import { type ApplicationConfig, mergeApplicationConfig } from '@angular/core';
import { provideServerRendering } from '@angular/platform-server';
import { appConfig } from './app.config.js';

const serverOnlyConfig: ApplicationConfig = {
  providers: [provideServerRendering()]
};

export const serverConfig = mergeApplicationConfig(appConfig, serverOnlyConfig);
export default serverConfig;
