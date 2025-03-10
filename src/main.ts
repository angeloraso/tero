import { DatePipe } from '@angular/common';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { importProvidersFrom, LOCALE_ID, provideAppInitializer } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { ServiceWorkerModule } from '@angular/service-worker';
import { AppComponent } from '@app/app.component';
import { ROUTES } from '@app/app.routing';
import { AppService } from '@app/app.service';
import { CallNumber } from '@awesome-cordova-plugins/call-number/ngx';
import { BizyTranslateModule } from '@bizy/core';
import { ENV } from '@env/environment';

const initApp = () => {
  const appInit = new AppService();
  return appInit.init();
}

bootstrapApplication(AppComponent, {
  providers: [
    CallNumber,
    DatePipe,
    importProvidersFrom(ServiceWorkerModule.register('ngsw-worker.js', { enabled: ENV.production && !ENV.mobile })),
    importProvidersFrom(BizyTranslateModule.forRoot()),
    provideHttpClient(withInterceptorsFromDi()),
    provideAppInitializer(() => initApp()),
    provideRouter(ROUTES),
    provideAnimations(),
    { provide: Window, useValue: window },
    { provide: LOCALE_ID, useValue: 'es-AR'},
  ]
});
