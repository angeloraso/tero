import { Injectable, OnDestroy } from '@angular/core';
import { INeighbor } from '@core/model';
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
import { fromEvent, take } from 'rxjs';

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

  start(app: FirebaseApp) {
    this.DB = getFirestore(app);
    console.log(OPERATOR);
    fromEvent(window, 'beforeunload')
      .pipe(take(1))
      .subscribe(() => {
        this.ngOnDestroy();
      });
  }

  getNeighbors(): Promise<Array<unknown>> {
    return new Promise<Array<unknown>>(async (resolve, reject) => {
      try {
        const q = query(collection(this.DB!, DB.NEIGHBORHOOD), orderBy('lot', 'asc'));
        const unsubscribe = onSnapshot(q, querySnapshot => {
          const docs: Array<unknown> = [];
          querySnapshot.forEach(doc => {
            docs.push(doc.data());
          });
          resolve(docs);
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

  getSettings(id: SETTINGS_ID) {
    return new Promise<unknown>(async (resolve, reject) => {
      try {
        try {
          const unsubscribe = onSnapshot(collection(this.DB!, DB.SETTINGS), querySnapshot => {
            const setting = querySnapshot.docs.find(_setting => _setting.id === id);
            if (setting) {
              resolve(setting.data());
            } else {
              resolve(null);
            }
          });

          this.#subscriptions.add(unsubscribe);
        } catch (error) {
          reject(error);
        }
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
