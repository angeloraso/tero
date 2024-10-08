import { Inject, Injectable, OnDestroy } from '@angular/core';
import { FirebaseFirestore } from '@capacitor-firebase/firestore';
import { AuthService } from '@core/auth/auth.service';
import {
  IContact,
  INeighbor,
  ISecurity,
  ISecurityInvoice,
  IUserSettings,
  ROLE,
  USER_STATUS
} from '@core/model';
import { BehaviorSubject } from 'rxjs';

enum COLLECTION {
  CORE = 'core',
  USERS = 'users'
}

enum CORE_DOCUMENT {
  NEIGHBORS = 'neighbors',
  CONTACTS = 'contacts',
  SECURITY = 'security'
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
  #contactData = new BehaviorSubject<{ data: Array<IContact>; tags: Array<string> } | undefined>(
    undefined
  );
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

  getContactTags() {
    return new Promise<Array<string>>(async (resolve, reject) => {
      try {
        if (typeof this.#contactData.value !== 'undefined') {
          resolve(this.#contactData.value.tags);
          return;
        }

        await FirebaseFirestore.addDocumentSnapshotListener<{
          data: Array<IContact>;
          tags: Array<string>;
        }>({ reference: `${COLLECTION.CORE}/${CORE_DOCUMENT.CONTACTS}` }, (event, error) => {
          if (error) {
            console.log(error);
          } else if (event && event.snapshot && event.snapshot.data) {
            this.#contactData.next(event.snapshot.data);
            resolve(event.snapshot.data.tags ?? []);
          } else {
            resolve([]);
          }
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  getContacts() {
    return new Promise<Array<IContact>>(async (resolve, reject) => {
      try {
        if (typeof this.#contactData.value !== 'undefined') {
          resolve(this.#contactData.value.data);
          return;
        }

        await FirebaseFirestore.addDocumentSnapshotListener<{
          data: Array<IContact>;
          tags: Array<string>;
        }>({ reference: `${COLLECTION.CORE}/${CORE_DOCUMENT.CONTACTS}` }, (event, error) => {
          if (error) {
            console.log(error);
          } else if (event && event.snapshot && event.snapshot.data) {
            this.#contactData.next(event.snapshot.data);
            resolve(event.snapshot.data.data ?? []);
          } else {
            resolve([]);
          }
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  getContact(id: string) {
    return new Promise<IContact | null>(async (resolve, reject) => {
      try {
        if (typeof this.#contactData.value !== 'undefined') {
          resolve(this.#contactData.value.data.find(_contact => _contact.id === id) || null);
          return;
        }

        const data = await this.getContacts();
        const contact = data.find(_contact => _contact.id === id) || null;
        resolve(contact as IContact);
      } catch (error) {
        reject(error);
      }
    });
  }

  postContact(contact: IContact): Promise<void> {
    return new Promise<void>(async (resolve, reject) => {
      try {
        const data = await this.getContacts();
        const index = data.findIndex(_contact => _contact.id === contact.id);
        if (index !== -1) {
          data[index] = contact;
        } else {
          data.push(contact);
        }

        const tags = await this.getContactTags();

        const contactsDocument = JSON.parse(JSON.stringify({ data, tags }));

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
        const data = await this.getContacts();
        const index = data.findIndex(_contact => _contact.id === contact.id);
        if (index !== -1) {
          data[index] = contact;

          const tags = await this.getContactTags();

          const contactsDocument = JSON.parse(JSON.stringify({ data, tags }));
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
        let data = await this.getContacts();
        data = data.filter(_contact => _contact.id !== id);

        const tags = await this.getContactTags();

        const contactsDocument = JSON.parse(JSON.stringify({ data, tags }));

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

  postSecurityGroupInvoice(invoice: ISecurityInvoice): Promise<void> {
    return new Promise<void>(async (resolve, reject) => {
      try {
        const data = await this.getSecurity();
        if (!data) {
          throw new Error('No security data');
        }

        if (!data.invoices) {
          data.invoices = [invoice];
        } else {
          const index = data.invoices.findIndex(
            _invoice => _invoice.timestamp === invoice.timestamp
          );
          if (index === -1) {
            data.invoices.push(invoice);
          }
        }

        const securityDocument = JSON.parse(JSON.stringify(data));
        console.log(securityDocument);

        await FirebaseFirestore.setDocument({
          reference: `${COLLECTION.CORE}/${CORE_DOCUMENT.SECURITY}`,
          data: securityDocument
        });
        resolve();
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
          { reference: `${COLLECTION.USERS}/${userEmail}` },
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

  postUserSettings() {
    return new Promise<void>(async (resolve, reject) => {
      try {
        const userEmail = this.auth.getEmail();
        if (!userEmail) {
          throw new Error('No user email');
        }

        const userSettings: IUserSettings = {
          roles: [],
          status: USER_STATUS.PENDING,
          id: Date.now()
        };

        const userDocument = JSON.parse(JSON.stringify(userSettings));

        await FirebaseFirestore.setDocument({
          reference: `${COLLECTION.USERS}/${userEmail}`,
          data: userDocument
        });
        resolve();
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

  getUserStatus() {
    return new Promise<USER_STATUS | null>(async (resolve, reject) => {
      try {
        if (typeof this.#userSettings.value !== 'undefined') {
          resolve(this.#userSettings.value.status ?? null);
          return;
        }

        const settings = await this.getUserSettings();

        if (settings && settings.status) {
          resolve(settings.status);
        } else {
          resolve(null);
        }
      } catch (error) {
        reject(error);
      }
    });
  }

  getUserId() {
    return new Promise<number | null>(async (resolve, reject) => {
      try {
        if (typeof this.#userSettings.value !== 'undefined') {
          resolve(this.#userSettings.value.id ?? null);
          return;
        }

        const settings = await this.getUserSettings();

        if (settings && settings.id) {
          resolve(settings.id);
        } else {
          resolve(null);
        }
      } catch (error) {
        reject(error);
      }
    });
  }

  getPendingUsers() {
    return new Promise<Array<IUserSettings & { email: string }>>(async (resolve, reject) => {
      try {
        const res = await FirebaseFirestore.getCollection<IUserSettings>({
          reference: COLLECTION.USERS,
          compositeFilter: {
            type: 'and',
            queryConstraints: [
              {
                type: 'where',
                fieldPath: 'status',
                opStr: '==',
                value: USER_STATUS.PENDING
              }
            ]
          }
        });
        resolve(
          res.snapshots
            ? res.snapshots.map(_snap => {
                return { ..._snap.data, email: _snap.id } as IUserSettings & { email: string };
              })
            : []
        );
      } catch (error) {
        reject(error);
      }
    });
  }

  acceptPendingUser(email: string): Promise<void> {
    return new Promise<void>(async (resolve, reject) => {
      try {
        const pendingUsers = await this.getPendingUsers();
        const index = pendingUsers.findIndex(_pendingUser => _pendingUser.email === email);
        if (index !== -1) {
          pendingUsers[index].status = USER_STATUS.ACTIVE;
          pendingUsers[index].roles = [ROLE.NEIGHBOR];

          const userDocument = JSON.parse(JSON.stringify(pendingUsers[index]));
          await FirebaseFirestore.setDocument({
            reference: `${COLLECTION.USERS}/${email}`,
            data: userDocument
          });
        }

        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }

  rejectPendingUser(email: string): Promise<void> {
    return new Promise<void>(async (resolve, reject) => {
      try {
        const pendingUsers = await this.getPendingUsers();
        const index = pendingUsers.findIndex(_pendingUser => _pendingUser.email === email);
        if (index !== -1) {
          pendingUsers[index].status = USER_STATUS.REJECTED;

          const userDocument = JSON.parse(JSON.stringify(pendingUsers[index]));
          await FirebaseFirestore.setDocument({
            reference: `${COLLECTION.USERS}/${email}`,
            data: userDocument
          });
        }

        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }

  destroy = () => {
    this.#neighbors.next(undefined);
    this.#contactData.next(undefined);
    this.#security.next(undefined);
    this.#userSettings.next(undefined);
    return FirebaseFirestore.removeAllListeners();
  };

  ngOnDestroy() {
    this.destroy();
  }
}
