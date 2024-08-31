import { registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es';
import { APP_INITIALIZER, LOCALE_ID, NgModule } from '@angular/core';
import { CoreModule } from '@core/core.module';
import { AppInitService } from './app-init.service';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app.routing';
registerLocaleData(localeEs, 'es');

export function initApp(appInit: AppInitService) {
  return (): Promise<void> => {
    return appInit.init();
  };
}

@NgModule({
  declarations: [AppComponent],
  imports: [AppRoutingModule, CoreModule],
  providers: [
    AppInitService,
    {
      provide: APP_INITIALIZER,
      useFactory: initApp,
      deps: [AppInitService],
      multi: true
    },
    {
      provide: Window,
      useValue: window
    },
    {
      provide: LOCALE_ID,
      useValue: 'es-AR'
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
