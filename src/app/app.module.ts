import { APP_INITIALIZER, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ServiceWorkerModule } from '@angular/service-worker';
import { CoreModule } from '@core/core.module';
import { ENV } from '@env/environment';
import { TranslateModule } from '@ngx-translate/core';
import { AppInitService } from './app-init.service';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app.routing';

export function initApp(appInit: AppInitService) {
  return (): Promise<void> => {
    return appInit.init();
  };
}

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    TranslateModule.forRoot(),
    CoreModule,
    ServiceWorkerModule.register('ngsw-worker.js', { enabled: ENV.production && !ENV.mobile })
  ],
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
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
