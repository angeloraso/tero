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
import { ERROR } from '@core/model';
import { ENV } from '@env/environment';
import { Observable, Subject } from 'rxjs';

export enum FILE_TYPE {
  IMAGE,
  CSV
}
@Injectable({
  providedIn: 'root'
})
export class MobileService {
  readonly #callNumber = inject(CallNumber);
  readonly #backButton = new Subject<void>();

  #MESSAGING_TOKEN: string | null = null;

  readonly #GARBAGE_NOTIFICATION = {
    TOPIC: 'garbage',
    TITLE: 'Camión de basura!',
    BODY: 'Esta pasando el camión de basura!'
  };

  readonly #NEW_TOPIC_NOTIFICATION = {
    TOPIC: 'newTopic',
    TITLE: 'Agregaron un nuevo asunto!',
    BODY: 'Crearon el asunto'
  };

  readonly #TOPIC_UPDATE_NOTIFICATION = {
    TOPIC: 'topicUpdate',
    TITLE: 'Actualizaron un asunto',
    BODY: 'Hay avances en el asunto'
  };

  get backButton$(): Observable<void> {
    return this.#backButton.asObservable();
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
          this.#backButton.next();
        });

        await StatusBar.setBackgroundColor({ color: '#666666' });
        await StatusBar.setOverlaysWebView({ overlay: false });
        await this.#initializeFirebaseMessaging();
      } catch (error) {
        console.error('mobile.service: Error al iniciar:', error);
      } finally {
        resolve();
      }
    });
  }

  hideSplash() {
    SplashScreen.hide();
  }

  call(number: string) {
    return this.#callNumber.callNumber(number, false);
  }

  share(data: { dialogTitle?: string; title?: string; text?: string; url?: string }) {
    return new Promise<void>(async (resolve, reject) => {
      try {
        const res = await Share.canShare();
        if (!res.value) {
          throw new Error(ERROR.NOT_SUPPORTED);
        }
        await Share.share(data);
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }

  downloadFile(file: { data: string; name: string; type?: FILE_TYPE }) {
    return new Promise<void>(async (resolve, reject) => {
      try {
        const { uri } = await Filesystem.writeFile({
          path: file.name,
          data: file.data,
          directory: Directory.Documents,
          encoding:
            file.type === FILE_TYPE.CSV
              ? Encoding.UTF8
              : file.type === FILE_TYPE.IMAGE
                ? undefined
                : Encoding.UTF8
        });

        await FileOpener.open({ filePath: uri, openWithDefault: true });
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }

  sendGarbageNotification() {
    return new Promise<void>(async (resolve, reject) => {
      try {
        if (!this.#MESSAGING_TOKEN) {
          await this.#initializeFirebaseMessaging();
        }

        await FirebaseFunctions.callByName({
          name: 'sendPushNotification',
          data: {
            topic: this.#GARBAGE_NOTIFICATION.TOPIC,
            title: this.#GARBAGE_NOTIFICATION.TITLE,
            body: this.#GARBAGE_NOTIFICATION.BODY
          }
        });
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }

  sendNewTopicNotification(topicTitle: string) {
    return new Promise<void>(async (resolve, reject) => {
      try {
        if (!ENV.production || !ENV.mobile) {
          resolve();
          return;
        }

        if (!this.#MESSAGING_TOKEN) {
          await this.#initializeFirebaseMessaging();
        }

        await FirebaseFunctions.callByName({
          name: 'sendPushNotification',
          data: {
            topic: this.#NEW_TOPIC_NOTIFICATION.TOPIC,
            title: this.#NEW_TOPIC_NOTIFICATION.TITLE,
            body: `${this.#NEW_TOPIC_NOTIFICATION.BODY}: ${topicTitle}`
          }
        });
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }

  sendTopicUpdateNotification(topicTitle: string) {
    return new Promise<void>(async (resolve, reject) => {
      try {
        if (!this.#MESSAGING_TOKEN) {
          await this.#initializeFirebaseMessaging();
        }

        await FirebaseFunctions.callByName({
          name: 'sendPushNotification',
          data: {
            topic: this.#TOPIC_UPDATE_NOTIFICATION.TOPIC,
            title: this.#TOPIC_UPDATE_NOTIFICATION.TITLE,
            body: `${this.#TOPIC_UPDATE_NOTIFICATION.BODY}: ${topicTitle}`
          }
        });
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }

  #initializeFirebaseMessaging = async () => {
    return new Promise<void>(async (resolve, reject) => {
      try {
        let permStatus = await FirebaseMessaging.checkPermissions();

        if (permStatus.receive === 'prompt') {
          permStatus = await FirebaseMessaging.requestPermissions();
        }

        if (permStatus.receive !== 'granted') {
          throw new Error('Push notifications permissions rejected');
        }

        const event = await FirebaseMessaging.getToken();
        this.#MESSAGING_TOKEN = event.token;

        await Promise.all([
          FirebaseMessaging.subscribeToTopic({ topic: this.#GARBAGE_NOTIFICATION.TOPIC }),
          FirebaseMessaging.subscribeToTopic({ topic: this.#GARBAGE_NOTIFICATION.TOPIC })
        ]);

        resolve();
      } catch (error) {
        reject(error);
      }
    });
  };

  exit() {
    return Promise.all([App.exitApp()]);
  }
}
