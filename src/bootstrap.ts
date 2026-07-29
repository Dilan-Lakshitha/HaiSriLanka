import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';

/** Separated so main.ts can yield a frame before evaluating app code. */
export function bootstrap() {
  return bootstrapApplication(App, appConfig);
}
