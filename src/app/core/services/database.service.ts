import { Injectable } from '@angular/core';
import { INeighbor } from '@core/model';
import { FirebaseApp } from 'firebase/app';
import {
  Firestore,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  orderBy,
  query,
  setDoc
} from 'firebase/firestore';

enum DB {
  NEIGHBORHOOD = 'NEIGHBORHOOD',
  SETTINGS = 'SETTINGS'
}

enum SETTINGS_ID {
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
export class DatabaseService {
  DB: Firestore | null = null;

  start(app: FirebaseApp) {
    this.DB = getFirestore(app);
    console.log(OPERATOR);
  }

  getNeighbors(): Promise<Array<unknown>> {
    return new Promise<Array<unknown>>(async (resolve, reject) => {
      try {
        const snap = await getDocs(
          query(collection(this.DB!, DB.NEIGHBORHOOD), orderBy('lot', 'asc'))
        );
        if (snap.empty) {
          resolve([]);
        } else {
          const docs: Array<unknown> = [];
          snap.forEach(doc => {
            docs.push(doc.data());
          });
          resolve(docs);
        }
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
    return new Promise<unknown>(async (resolve, reject) => {
      try {
        const docRef = doc(this.DB!, DB.SETTINGS, SETTINGS_ID.SECURITY);
        const snap = await getDoc(docRef);
        resolve(snap.exists() ? snap.data() : null);
      } catch (error) {
        reject(error);
      }
    });
  }
}
