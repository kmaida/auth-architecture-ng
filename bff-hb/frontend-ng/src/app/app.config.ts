import { ApplicationConfig, importProvidersFrom, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { environment } from '../environments/environment';
import { FusionAuthModule } from '@fusionauth/angular-sdk';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    importProvidersFrom(
      FusionAuthModule.forRoot({
        clientId: environment.clientId,
        serverUrl: environment.fusionAuthUrl,
        redirectUri: environment.frontendUrl,
        postLogoutRedirectUri: environment.frontendUrl,
        scope: 'offline_access openid profile email',
        shouldAutoRefresh: true
      })
    )
  ]
};
