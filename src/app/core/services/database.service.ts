import { Inject, Injectable, OnDestroy } from '@angular/core';
import { FirebaseFirestore } from '@capacitor-firebase/firestore';
import { AuthService } from '@core/auth/auth.service';
import { IContact, INeighbor, ISecurity, IUserSettings, ROLE } from '@core/model';
import { BehaviorSubject } from 'rxjs';

enum COLLECTION {
  CORE = 'core'
}

enum CORE_DOCUMENT {
  NEIGHBORS = 'neighbors',
  CONTACTS = 'contacts',
  SECURITY = 'security'
}

enum USER_DOCUMENT {
  SETTINGS = 'settings'
}

/* enum OPERATOR {
  EQUAL = '==',
  NOT_EQUAL = '!=',
  LESS = '<',
  LESS_OR_EQUAL = '<=',
  GREATER = '>',
  GREATER_OR_EQUAL = '>=',
  CONTAINS = 'array-contains'
} */

@Injectable({
  providedIn: 'root'
})
export class DatabaseService implements OnDestroy {
  #neighbors = new BehaviorSubject<Array<INeighbor> | undefined>(undefined);
  #contacts = new BehaviorSubject<Array<IContact> | undefined>(undefined);
  #security = new BehaviorSubject<ISecurity | undefined>(undefined);
  #userSettings = new BehaviorSubject<IUserSettings | undefined>(undefined);

  constructor(@Inject(AuthService) private auth: AuthService) {}

  getNeighbors() {
    return new Promise<Array<INeighbor>>(async (resolve, reject) => {
      try {
        if (typeof this.#neighbors.value !== 'undefined') {
          resolve(this.#neighbors.value);
          return;
        }

        await FirebaseFirestore.addDocumentSnapshotListener<{ data: Array<INeighbor> }>(
          { reference: `${COLLECTION.CORE}/${CORE_DOCUMENT.NEIGHBORS}` },
          (event, error) => {
            if (error) {
              console.log(error);
            } else {
              const neighbors = event && event.snapshot.data ? event.snapshot.data.data : [];
              this.#neighbors.next(neighbors);
              resolve(neighbors);
            }
          }
        );
      } catch (error) {
        reject(error);
      }
    });
  }

  getNeighbor(id: string) {
    return new Promise<INeighbor | null>(async (resolve, reject) => {
      try {
        if (typeof this.#neighbors.value !== 'undefined') {
          resolve(this.#neighbors.value.find(_neighbor => _neighbor.id === id) || null);
          return;
        }

        const neighbors = await this.getNeighbors();
        const neighbor = neighbors.find(_neighbor => _neighbor.id === id) || null;
        resolve(neighbor as INeighbor);
      } catch (error) {
        reject(error);
      }
    });
  }

  postNeighbor(neighbor: INeighbor): Promise<void> {
    return new Promise<void>(async (resolve, reject) => {
      try {
        const neighbors = await this.getNeighbors();
        const index = neighbors.findIndex(_neighbor => _neighbor.id === neighbor.id);
        if (index !== -1) {
          neighbors[index] = neighbor;
        } else {
          neighbors.push(neighbor);
        }

        const neighborsDocument = JSON.parse(JSON.stringify({ data: neighbors }));

        await FirebaseFirestore.setDocument({
          reference: `${COLLECTION.CORE}/${CORE_DOCUMENT.NEIGHBORS}`,
          data: neighborsDocument
        });
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }

  putNeighbor(neighbor: INeighbor): Promise<void> {
    return new Promise<void>(async (resolve, reject) => {
      try {
        const neighbors = await this.getNeighbors();
        const index = neighbors.findIndex(_neighbor => _neighbor.id === neighbor.id);
        if (index !== -1) {
          neighbors[index] = neighbor;

          const neighborsDocument = JSON.parse(JSON.stringify({ data: neighbors }));
          await FirebaseFirestore.setDocument({
            reference: `${COLLECTION.CORE}/${CORE_DOCUMENT.NEIGHBORS}`,
            data: neighborsDocument
          });
        }

        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }

  deleteNeighbor(id: string): Promise<void> {
    return new Promise<void>(async (resolve, reject) => {
      try {
        let neighbors = await this.getNeighbors();
        neighbors = neighbors.filter(_neighbor => _neighbor.id !== id);

        const neighborsDocument = JSON.parse(JSON.stringify({ data: neighbors }));

        await FirebaseFirestore.setDocument({
          reference: `${COLLECTION.CORE}/${CORE_DOCUMENT.NEIGHBORS}`,
          data: neighborsDocument
        });
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }

  getContacts() {
    return new Promise<Array<IContact>>(async (resolve, reject) => {
      try {
        if (typeof this.#contacts.value !== 'undefined') {
          resolve(this.#contacts.value);
          return;
        }

        await FirebaseFirestore.addDocumentSnapshotListener<{ data: Array<IContact> }>(
          { reference: `${COLLECTION.CORE}/${CORE_DOCUMENT.CONTACTS}` },
          (event, error) => {
            if (error) {
              console.log(error);
            } else {
              const contacts = event && event.snapshot.data ? event.snapshot.data.data : [];
              this.#contacts.next(contacts);
              resolve(contacts);
            }
          }
        );
      } catch (error) {
        reject(error);
      }
    });
  }

  getContact(id: string) {
    return new Promise<IContact | null>(async (resolve, reject) => {
      try {
        if (typeof this.#contacts.value !== 'undefined') {
          resolve(this.#contacts.value.find(_contact => _contact.id === id) || null);
          return;
        }

        const contacts = await this.getContacts();
        const contact = contacts.find(_contact => _contact.id === id) || null;
        resolve(contact as IContact);
      } catch (error) {
        reject(error);
      }
    });
  }

  postContact(contact: IContact): Promise<void> {
    return new Promise<void>(async (resolve, reject) => {
      try {
        const contacts = await this.getContacts();
        const index = contacts.findIndex(_contact => _contact.id === contact.id);
        if (index !== -1) {
          contacts[index] = contact;
        } else {
          contacts.push(contact);
        }

        const contactsDocument = JSON.parse(JSON.stringify({ data: contacts }));

        await FirebaseFirestore.setDocument({
          reference: `${COLLECTION.CORE}/${CORE_DOCUMENT.CONTACTS}`,
          data: contactsDocument
        });
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }

  putContact(contact: IContact): Promise<void> {
    return new Promise<void>(async (resolve, reject) => {
      try {
        const contacts = await this.getContacts();
        const index = contacts.findIndex(_contact => _contact.id === contact.id);
        if (index !== -1) {
          contacts[index] = contact;

          const contactsDocument = JSON.parse(JSON.stringify({ data: contacts }));
          await FirebaseFirestore.setDocument({
            reference: `${COLLECTION.CORE}/${CORE_DOCUMENT.CONTACTS}`,
            data: contactsDocument
          });
        }

        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }

  deleteContact(id: string): Promise<void> {
    return new Promise<void>(async (resolve, reject) => {
      try {
        let contacts = await this.getContacts();
        contacts = contacts.filter(_contact => _contact.id !== id);

        const contactsDocument = JSON.parse(JSON.stringify({ data: contacts }));

        await FirebaseFirestore.setDocument({
          reference: `${COLLECTION.CORE}/${CORE_DOCUMENT.CONTACTS}`,
          data: contactsDocument
        });
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }

  getSecurity() {
    return new Promise<ISecurity | null>(async (resolve, reject) => {
      try {
        if (typeof this.#security.value !== 'undefined') {
          resolve(this.#security.value);
          return;
        }

        await FirebaseFirestore.addDocumentSnapshotListener<ISecurity>(
          { reference: `${COLLECTION.CORE}/${CORE_DOCUMENT.SECURITY}` },
          (event, error) => {
            if (error) {
              console.log(error);
            } else {
              const security = event && event.snapshot.data ? event.snapshot.data : undefined;
              this.#security.next(security);
              resolve(security ?? null);
            }
          }
        );
      } catch (error) {
        reject(error);
      }
    });
  }

  getUserSettings() {
    return new Promise<IUserSettings | null>(async (resolve, reject) => {
      try {
        if (typeof this.#userSettings.value !== 'undefined') {
          resolve(this.#userSettings.value);
          return;
        }

        const userEmail = this.auth.getEmail();
        if (!userEmail) {
          throw new Error('No user email');
        }

        await FirebaseFirestore.addDocumentSnapshotListener<IUserSettings>(
          { reference: `${userEmail}/${USER_DOCUMENT.SETTINGS}` },
          (event, error) => {
            if (error) {
              console.log(error);
            } else {
              const settings = event && event.snapshot.data ? event.snapshot.data : undefined;
              this.#userSettings.next(settings);
              resolve(settings ?? null);
            }
          }
        );
      } catch (error) {
        reject(error);
      }
    });
  }

  getUserRoles() {
    return new Promise<Array<ROLE>>(async (resolve, reject) => {
      try {
        if (typeof this.#userSettings.value !== 'undefined') {
          resolve(this.#userSettings.value.roles ?? []);
          return;
        }

        const settings = await this.getUserSettings();

        if (settings && settings.roles) {
          resolve(settings.roles);
        } else {
          resolve([]);
        }
      } catch (error) {
        reject(error);
      }
    });
  }

  destroy = () => {
    return FirebaseFirestore.removeAllListeners();
  };

  ngOnDestroy() {
    this.destroy();
  }
}
