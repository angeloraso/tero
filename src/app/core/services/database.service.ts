import { Injectable, OnDestroy } from '@angular/core';
import { Empty, INeighbor, ISecuritySettings } from '@core/model';
import { FirebaseApp } from 'firebase/app';
import {
  Firestore,
  Unsubscribe,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getFirestore,
  onSnapshot,
  orderBy,
  query,
  setDoc
} from 'firebase/firestore';
import { BehaviorSubject, fromEvent, take } from 'rxjs';

enum DB {
  NEIGHBORHOOD = 'NEIGHBORHOOD',
  SETTINGS = 'SETTINGS'
}

export enum SETTINGS_ID {
  SECURITY = 'SECURITY'
}

enum OPERATOR {
  EQUAL = '==',
  NOT_EQUAL = '!=',
  LESS = '<',
  LESS_OR_EQUAL = '<=',
  GREATER = '>',
  GREATER_OR_EQUAL = '>=',
  CONTAINS = 'array-contains'
}

@Injectable()
export class DatabaseService implements OnDestroy {
  DB: Firestore | null = null;
  #subscriptions = new Set<Unsubscribe>();
  #neighborhood = new BehaviorSubject<Array<INeighbor> | undefined>(undefined);
  #securitySettings = new BehaviorSubject<ISecuritySettings | Empty>(undefined);

  start(app: FirebaseApp) {
    this.DB = getFirestore(app);
    console.log(OPERATOR);
    fromEvent(window, 'beforeunload')
      .pipe(take(1))
      .subscribe(() => {
        this.ngOnDestroy();
      });
  }

  getNeighborhood(): Promise<Array<INeighbor>> {
    return new Promise<Array<INeighbor>>((resolve, reject) => {
      try {
        if (typeof this.#neighborhood.value !== 'undefined') {
          resolve(this.#neighborhood.value);
          return;
        }

        const q = query(collection(this.DB!, DB.NEIGHBORHOOD), orderBy('lot', 'asc'));
        const unsubscribe = onSnapshot(q, querySnapshot => {
          const docs: Array<unknown> = [];
          querySnapshot.forEach(doc => {
            docs.push(doc.data());
          });
          this.#neighborhood.next(docs as Array<INeighbor>);
          resolve(this.#neighborhood.value as Array<INeighbor>);
        });

        this.#subscriptions.add(unsubscribe);
      } catch (error) {
        reject(error);
      }
    });
  }

  getNeighbor(id: string): Promise<unknown> {
    return new Promise<unknown>(async (resolve, reject) => {
      try {
        const docRef = doc(this.DB!, DB.NEIGHBORHOOD, id);
        const snap = await getDoc(docRef);
        resolve(snap.exists() ? snap.data() : null);
      } catch (error) {
        reject(error);
      }
    });
  }

  postNeighbor(neighbor: INeighbor): Promise<void> {
    return new Promise<void>(async (resolve, reject) => {
      try {
        await setDoc(doc(this.DB!, DB.NEIGHBORHOOD, neighbor.id), Object.assign({}, neighbor));
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }

  putNeighbor(neighbor: INeighbor): Promise<void> {
    return new Promise<void>(async (resolve, reject) => {
      try {
        await setDoc(doc(this.DB!, DB.NEIGHBORHOOD, neighbor.id), Object.assign({}, neighbor));
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }

  deleteNeighbor(id: string): Promise<void> {
    return new Promise<void>(async (resolve, reject) => {
      try {
        await deleteDoc(doc(this.DB!, DB.NEIGHBORHOOD, id));
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }

  getSecuritySettings() {
    return new Promise<ISecuritySettings | null>((resolve, reject) => {
      try {
        if (typeof this.#securitySettings.value !== 'undefined') {
          resolve(this.#securitySettings.value);
          return;
        }

        const unsubscribe = onSnapshot(collection(this.DB!, DB.SETTINGS), querySnapshot => {
          const setting = querySnapshot.docs.find(_setting => _setting.id === SETTINGS_ID.SECURITY);
          if (setting) {
            this.#securitySettings.next(setting.data() as ISecuritySettings);
            resolve(this.#securitySettings.value as ISecuritySettings);
          }
        });

        this.#subscriptions.add(unsubscribe);
      } catch (error) {
        reject(error);
      }
    });
  }

  ngOnDestroy() {
    const subscriptions = Array.from(this.#subscriptions);
    subscriptions.forEach(unsubscribe => {
      unsubscribe();
    });
    this.#subscriptions.clear();
  }
}
