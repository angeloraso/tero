import { Injectable } from '@angular/core';
import { FirebaseApp } from 'firebase/app';
import {
  Auth,
  User,
  getAuth,
  indexedDBLocalPersistence,
  setPersistence,
  signInWithEmailAndPassword
} from 'firebase/auth';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private AUTH: Auth | null = null;
  private _user: User | null = null;
  private _isLoggedIn = new BehaviorSubject<boolean>(false);

  get isLoggedIn$(): Observable<boolean> {
    return this._isLoggedIn.asObservable();
  }

  start(app: FirebaseApp) {
    return new Promise<void>(async (resolve, reject) => {
      try {
        this.AUTH = getAuth(app);
        await setPersistence(this.AUTH!, indexedDBLocalPersistence);
        this._user = this.AUTH.currentUser;
        this._isLoggedIn.next(Boolean(this.AUTH.currentUser));
        if (!this._user) {
          await setPersistence(this.AUTH!, indexedDBLocalPersistence);
        }
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }

  login(credentials: { email: string; password: string }) {
    return new Promise<void>(async (resolve, reject) => {
      try {
        const userCredential = await signInWithEmailAndPassword(
          this.AUTH!,
          credentials.email,
          credentials.password
        );
        this._user = userCredential.user;
        this._isLoggedIn.next(true);
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }

  getUserInfo() {
    return this._user?.providerData;
  }
}
