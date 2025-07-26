import { inject, Injectable } from '@angular/core';
import { CallNumber } from '@awesome-cordova-plugins/call-number/ngx';
import { FileOpener } from '@capacitor-community/file-opener';
import { FirebaseFunctions } from '@capacitor-firebase/functions';
import { FirebaseMessaging } from '@capacitor-firebase/messaging';
import { App } from '@capacitor/app';
import { Directory, Encoding, Filesystem } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { SplashScreen } from '@capacitor/splash-screen';
import { StatusBar } from '@capacitor/status-bar';
import { EdgeToEdge } from '@capawesome/capacitor-android-edge-to-edge-support';
import { ERROR } from '@core/model';
import { ENV } from '@env/environment';
import { Observable, Subject } from 'rxjs';

export enum FILE_TYPE {
  IMAGE,
  CSV
}

enum FIREBASE_FUNCTION {
  PUSH_NOTIFICATION = 'sendPushNotification'
}

@Injectable({
  providedIn: 'root'
})
export class MobileService {
  readonly #callNumber = inject(CallNumber);
  readonly #backButton = new Subject<void>();

  #MESSAGING_TOKEN: string | null = null;

  get backButton$(): Observable<void> {
    return this.#backButton.asObservable();
  }

  async init() {
    App.addListener('backButton', () => {
      this.#backButton.next();
    });

    await EdgeToEdge.enable();
    await EdgeToEdge.setBackgroundColor({ color: '#fdc921' });
    await StatusBar.setOverlaysWebView({ overlay: true });
    await StatusBar.setBackgroundColor({ color: '#fdc921' });
  }

  hideSplash = () => SplashScreen.hide();

  call = (number: string) => this.#callNumber.callNumber(number, false);

  async share(data: { dialogTitle?: string; title?: string; text?: string; url?: string }) {
    const res = await Share.canShare();
    if (!res.value) {
      throw new Error(ERROR.NOT_SUPPORTED);
    }
    await Share.share(data);
  }

  async downloadFile(file: { data: string; name: string; type?: FILE_TYPE }) {
    const { uri } = await Filesystem.writeFile({
      path: file.name,
      data: file.data,
      directory: Directory.Documents,
      encoding: file.type === FILE_TYPE.CSV ? Encoding.UTF8 : file.type === FILE_TYPE.IMAGE ? undefined : Encoding.UTF8
    });

    await FileOpener.open({ filePath: uri, openWithDefault: true });
  }

  #initializeFirebaseMessaging = async () => {
    if (!ENV.production || !ENV.mobile) {
      return Promise.resolve();
    }

    let permStatus = await FirebaseMessaging.checkPermissions();

    if (permStatus.receive === 'prompt') {
      permStatus = await FirebaseMessaging.requestPermissions();
    }

    if (permStatus.receive !== 'granted') {
      throw new Error(ERROR.NOTIFICATION_PERMISSIONS);
    }

    const event = await FirebaseMessaging.getToken();
    this.#MESSAGING_TOKEN = event.token;
  };

  subscribeToTopic = async (topicId: string) => {
    if (!ENV.production || !ENV.mobile) {
      return Promise.resolve();
    }

    if (!this.#MESSAGING_TOKEN) {
      await this.#initializeFirebaseMessaging();
    }

    return FirebaseMessaging.subscribeToTopic({ topic: this.#keepFirebaseMessagingAllowedChars(topicId) });
  };

  unsubscribeFromTopic = async (topicId: string) => {
    if (!ENV.production || !ENV.mobile) {
      return Promise.resolve();
    }

    if (!this.#MESSAGING_TOKEN) {
      await this.#initializeFirebaseMessaging();
    }

    return FirebaseMessaging.unsubscribeFromTopic({ topic: this.#keepFirebaseMessagingAllowedChars(topicId) });
  };

  async sendPushNotification(data: { topicId: string; title: string; body: string }) {
    if (!ENV.production || !ENV.mobile) {
      return Promise.resolve();
    }

    if (!this.#MESSAGING_TOKEN) {
      await this.#initializeFirebaseMessaging();
    }

    await FirebaseFunctions.callByName({
      name: FIREBASE_FUNCTION.PUSH_NOTIFICATION,
      data: {
        topic: this.#keepFirebaseMessagingAllowedChars(data.topicId),
        title: data.title,
        body: data.body
      }
    });
  }

  #keepFirebaseMessagingAllowedChars = (topic: string) => topic.replace(/[^a-zA-Z0-9._~%-]+/g, '');

  exit = () => App.exitApp();
}
