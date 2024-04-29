import { Inject, Injectable } from '@angular/core';
import { CallNumber } from '@awesome-cordova-plugins/call-number/ngx';
import { App } from '@capacitor/app';
import { SplashScreen } from '@capacitor/splash-screen';
import { StatusBar } from '@capacitor/status-bar';
import { ENV } from '@env/environment';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MobileService {
  private _backButton = new Subject<void>();

  get backButton$(): Observable<void> {
    return this._backButton.asObservable();
  }

  constructor(@Inject(CallNumber) private callNumber: CallNumber) {}

  isMobile() {
    return ENV.mobile;
  }

  init() {
    return new Promise<void>(async resolve => {
      try {
        if (!this.isMobile()) {
          resolve();
        }

        App.addListener('backButton', () => {
          this._backButton.next();
        });

        await StatusBar.setBackgroundColor({ color: '#666666' });
        resolve();
      } catch {
        resolve();
      }
    });
  }

  hideSplash() {
    SplashScreen.hide();
  }

  call(number: string) {
    return this.callNumber.callNumber(number, false);
  }

  exit(): Promise<void> {
    return App.exitApp();
  }
}
