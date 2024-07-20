import { Inject, Injectable } from '@angular/core';
import { CallNumber } from '@awesome-cordova-plugins/call-number/ngx';
import { FileOpener } from '@capacitor-community/file-opener';
import { App } from '@capacitor/app';
import { Directory, Encoding, Filesystem } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
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

  share(data: { dialogTitle?: string; title?: string; text?: string; url?: string }) {
    return new Promise<void>(async (resolve, reject) => {
      try {
        const res = await Share.canShare();
        if (!res.value) {
          throw new Error('Not supported');
        }
        await Share.share(data);
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }

  downloadFile(file: { data: string; name: string }) {
    return new Promise<void>(async (resolve, reject) => {
      try {
        const { uri } = await Filesystem.writeFile({
          path: file.name,
          data: file.data,
          directory: Directory.Documents,
          encoding: Encoding.UTF8
        });

        await FileOpener.open({ filePath: uri, openWithDefault: true });
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }

  exit(): Promise<void> {
    return App.exitApp();
  }
}
