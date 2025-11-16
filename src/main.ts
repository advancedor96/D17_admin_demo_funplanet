import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';


(globalThis as any).myGlobal = {
  apiUrl: 'https://demoapi-funplanet.ddns.net',
  // apiUrl: 'http://localhost:8080',
  appName: 'sss FunPlanet',
  version: '1.0.0'
}

bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));
