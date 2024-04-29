import { APP_INITIALIZER, NgModule } from '@angular/core';
import { CoreModule } from '@core/core.module';
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
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
