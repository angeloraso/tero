import { Injectable, OnDestroy } from '@angular/core';
import { Empty, IContact, INeighbor, ISecuritySettings } from '@core/model';
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
  SETTINGS = 'SETTINGS',
  CONTACTS = 'CONTACTS'
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
  #contacts = new BehaviorSubject<Array<IContact> | undefined>(undefined);

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

  getNeighbor(id: string): Promise<INeighbor | null> {
    return new Promise<INeighbor | null>(async (resolve, reject) => {
      try {
        const docRef = doc(this.DB!, DB.NEIGHBORHOOD, id);
        const snap = await getDoc(docRef);
        resolve(snap.exists() ? (snap.data() as INeighbor) : null);
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

  getContacts(): Promise<Array<IContact>> {
    return new Promise<Array<IContact>>((resolve, reject) => {
      try {
        if (typeof this.#contacts.value !== 'undefined') {
          resolve(this.#contacts.value);
          return;
        }

        const q = query(collection(this.DB!, DB.CONTACTS), orderBy('score', 'desc'));
        const unsubscribe = onSnapshot(q, querySnapshot => {
          const docs: Array<unknown> = [];
          querySnapshot.forEach(doc => {
            docs.push(doc.data());
          });
          this.#contacts.next(docs as Array<IContact>);
          resolve(this.#contacts.value as Array<IContact>);
        });

        this.#subscriptions.add(unsubscribe);
      } catch (error) {
        reject(error);
      }
    });
  }

  getContact(id: string): Promise<IContact | null> {
    return new Promise<IContact | null>(async (resolve, reject) => {
      try {
        const docRef = doc(this.DB!, DB.CONTACTS, id);
        const snap = await getDoc(docRef);
        resolve(snap.exists() ? (snap.data() as IContact) : null);
      } catch (error) {
        reject(error);
      }
    });
  }

  postContact(contact: IContact): Promise<void> {
    return new Promise<void>(async (resolve, reject) => {
      try {
        await setDoc(doc(this.DB!, DB.CONTACTS, contact.id), Object.assign({}, contact));
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }

  putContact(contact: IContact): Promise<void> {
    return new Promise<void>(async (resolve, reject) => {
      try {
        await setDoc(doc(this.DB!, DB.CONTACTS, contact.id), Object.assign({}, contact));
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }

  deleteContact(id: string): Promise<void> {
    return new Promise<void>(async (resolve, reject) => {
      try {
        await deleteDoc(doc(this.DB!, DB.CONTACTS, id));
        resolve();
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
