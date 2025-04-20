import { Injectable } from '@angular/core';
import { FirebaseAuthentication, Persistence, User } from '@capacitor-firebase/authentication';
import { Preferences } from '@capacitor/preferences';
import { ENV } from '@env/environment';
import { BehaviorSubject, distinctUntilChanged, Observable } from 'rxjs';

const PROFILE_PICTURE_KEY = 'PROFILE_PICTURE_KEY';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  #USER: User | null = null;
  #signedIn = new BehaviorSubject<boolean>(false);

  get signedIn$(): Observable<boolean> {
    return this.#signedIn.asObservable().pipe(distinctUntilChanged());
  }

  async start() {
    try {
      await FirebaseAuthentication.removeAllListeners();
      FirebaseAuthentication.addListener('authStateChange', async change => {
        this.#USER = change ? change.user : null;

        const signedIn = Boolean(change.user);
        this.#signedIn.next(signedIn);
        if (!signedIn) {
          Preferences.clear();
        } else {
          if (change.user && change.user.providerData && change.user.providerData[0] && change.user.providerData[0].photoUrl) {
            this.#storeProfileImage(change.user.providerData[0].photoUrl);
          }
        }
      });

      if (!ENV.mobile) {
        await FirebaseAuthentication.setPersistence({
          persistence: Persistence.IndexedDbLocal
        });
        const result = await FirebaseAuthentication.getRedirectResult();
        if (result && result.user) {
          this.#USER = result.user;
          if (result.user.providerData && result.user.providerData[0] && result.user.providerData[0].photoUrl) {
            this.#storeProfileImage(result.user.providerData[0].photoUrl);
          }
          this.#signedIn.next(Boolean(this.#USER));
        } else {
          const result = await FirebaseAuthentication.getCurrentUser();
          this.#USER = result.user;
          if (result.user && result.user.providerData && result.user.providerData[0] && result.user.providerData[0].photoUrl) {
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

      Promise.resolve();
    } catch (error) {
      Promise.reject(error);
    }
  }

  async signIn() {
    try {
      const result = await FirebaseAuthentication.signInWithGoogle({
        mode: ENV.mobile ? 'redirect' : 'popup'
      });

      this.#USER = result.user;

      if (result.user && result.user.providerData && result.user.providerData[0] && result.user.providerData[0].photoUrl) {
        this.#storeProfileImage(result.user.providerData[0].photoUrl);
      }

      if (result.user) {
        this.#signedIn.next(true);
      }
      Promise.resolve();
    } catch (error) {
      Promise.reject(error);
    }
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
    return this.#getProfileImage();
  }

  async signOut() {
    try {
      await FirebaseAuthentication.signOut();
      this.#USER = null;
      this.#signedIn.next(false);
      Preferences.clear();
      Promise.resolve();
    } catch (error) {
      Promise.reject(error);
    }
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
