import { Inject, Injectable } from '@angular/core';
import { FirebaseAuthentication, Persistence, User } from '@capacitor-firebase/authentication';
import { MobileService } from '@core/services';
import { BehaviorSubject, distinctUntilChanged, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  #USER: User | null = null;
  #signedIn = new BehaviorSubject<boolean>(false);

  get signedIn$(): Observable<boolean> {
    return this.#signedIn.asObservable().pipe(distinctUntilChanged());
  }

  constructor(@Inject(MobileService) private mobile: MobileService) {}

  start() {
    return new Promise<void>(async (resolve, reject) => {
      try {
        if (!this.mobile.isMobile()) {
          await FirebaseAuthentication.setPersistence({
            persistence: Persistence.IndexedDbLocal
          });
          const result = await FirebaseAuthentication.getRedirectResult();
          if (result && result.user) {
            this.#USER = result.user;
            this.#signedIn.next(Boolean(this.#USER));
            await FirebaseAuthentication.setPersistence({
              persistence: Persistence.IndexedDbLocal
            });
          } else {
            const res = await FirebaseAuthentication.getCurrentUser();
            this.#USER = res.user;
            if (res.user) {
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
      mode: this.mobile.isMobile() ? 'redirect' : 'popup'
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

  getProfilePicture(): string | null {
    if (this.#USER && this.#USER.providerData[0]) {
      return this.#USER.providerData[0].photoUrl;
    }

    return null;
  }

  signOut() {
    return FirebaseAuthentication.signOut();
  }
}
