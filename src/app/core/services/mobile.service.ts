import { Injectable } from '@angular/core';
import { App } from '@capacitor/app';
import { SplashScreen } from '@capacitor/splash-screen';
import { StatusBar } from '@capacitor/status-bar';
import { ENV } from '@env/environment';
import { Observable, Subject } from 'rxjs';

@Injectable()
export class MobileService {
  private _backButton = new Subject<void>();
  private _browserData = new Subject<any>();

  get backButton$(): Observable<void> {
    return this._backButton.asObservable();
  }

  get browserData$(): Observable<any> {
    return this._browserData.asObservable();
  }

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

        App.addListener('appUrlOpen', data => {
          this._browserData.next(data);
        });

        await StatusBar.setBackgroundColor({ color: '#f5f5f5' });
        resolve();
      } catch {
        resolve();
      }
    });
  }

  hideSplash() {
    SplashScreen.hide();
  }

  exit(): Promise<void> {
    return App.exitApp();
  }
}
