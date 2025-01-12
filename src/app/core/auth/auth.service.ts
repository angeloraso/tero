import { inject, Injectable } from '@angular/core';
import { FirebaseAuthentication, Persistence, User } from '@capacitor-firebase/authentication';
import { Preferences } from '@capacitor/preferences';
import { MobileService } from '@core/services';
import { BehaviorSubject, distinctUntilChanged, Observable } from 'rxjs';

const PROFILE_PICTURE_KEY = 'PROFILE_PICTURE_KEY';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  readonly #mobile = inject(MobileService);
  #USER: User | null = null;
  #signedIn = new BehaviorSubject<boolean>(false);

  get signedIn$(): Observable<boolean> {
    return this.#signedIn.asObservable().pipe(distinctUntilChanged());
  }

  start() {
    return new Promise<void>(async (resolve, reject) => {
      try {
        if (!this.#mobile.isMobile()) {
          await FirebaseAuthentication.setPersistence({
            persistence: Persistence.IndexedDbLocal
          });
          const result = await FirebaseAuthentication.getRedirectResult();
          if (result && result.user) {
            this.#USER = result.user;
            if (
              result.user.providerData &&
              result.user.providerData[0] &&
              result.user.providerData[0].photoUrl
            ) {
              this.#storeProfileImage(result.user.providerData[0].photoUrl);
            }
            this.#signedIn.next(Boolean(this.#USER));
            await FirebaseAuthentication.setPersistence({
              persistence: Persistence.IndexedDbLocal
            });
          } else {
            const result = await FirebaseAuthentication.getCurrentUser();
            this.#USER = result.user;
            if (
              result.user &&
              result.user.providerData &&
              result.user.providerData[0] &&
              result.user.providerData[0].photoUrl
            ) {
              this.#storeProfileImage(result.user.providerData[0].photoUrl);
            }

            if (result.user) {
              this.#signedIn.next(true);
            }
          }
        } else {
          const res = await FirebaseAuthentication.getCurrentUser();
          this.#USER = res.user;
          if (res.user) {
            this.#signedIn.next(true);
          }
        }

        await FirebaseAuthentication.removeAllListeners();
        FirebaseAuthentication.addListener('authStateChange', async change => {
          this.#USER = change ? change.user : null;
          const signedIn = Boolean(change.user);
          this.#signedIn.next(signedIn);
        });
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }

  async signIn() {
    return FirebaseAuthentication.signInWithGoogle({
      mode: this.#mobile.isMobile() ? 'redirect' : 'popup'
    });
  }

  getEmail(): string | null {
    if (this.#USER && this.#USER.providerData[0]) {
      return this.#USER.providerData[0].email;
    }

    return null;
  }

  getName(): string | null {
    if (this.#USER && this.#USER.providerData[0]) {
      return this.#USER.providerData[0].displayName;
    }

    return null;
  }

  getId(): string | null {
    if (this.#USER && this.#USER.providerData[0]) {
      return this.#USER.providerData[0].uid;
    }

    return null;
  }

  getProfilePictureURL(): string | null {
    if (this.#USER && this.#USER.providerData[0]) {
      return this.#USER.providerData[0].photoUrl;
    }

    return null;
  }

  async getProfilePicture(): Promise<string | null> {
    const image = await this.#getProfileImage();
    return image;
  }

  signOut() {
    return FirebaseAuthentication.signOut();
  }

  #downloadAndConvertImage(url: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.onload = () => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(xhr.response);
      };
      xhr.onerror = () => reject('Error downloading image');
      xhr.open('GET', url);
      xhr.responseType = 'blob';
      xhr.send();
    });
  }

  async #storeProfileImage(imageUrl: string): Promise<void> {
    try {
      const base64Image = await this.#downloadAndConvertImage(imageUrl);
      await Preferences.set({
        key: PROFILE_PICTURE_KEY,
        value: base64Image
      });
    } catch (error) {
      console.error('Error storing profile image:', error);
    }
  }

  async #getProfileImage(): Promise<string | null> {
    const { value } = await Preferences.get({ key: PROFILE_PICTURE_KEY });
    return value;
  }
}
