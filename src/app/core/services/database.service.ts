import { inject, Injectable, OnDestroy } from '@angular/core';
import { AuthService } from '@auth/auth.service';
import { FirebaseFirestore } from '@capacitor-firebase/firestore';
import {
  ERROR,
  IContact,
  IEcommerceProduct,
  IGarbageTruckRecord,
  INeighbor,
  ISecurity,
  ISecurityInvoice,
  ISecurityNeighborInvoice,
  ITopic,
  IUser,
  TopicMilestone,
  USER_STATE
} from '@core/model';
import { BehaviorSubject } from 'rxjs';

enum COLLECTION {
  CORE = 'core',
  USERS = 'users'
}

enum CORE_DOCUMENT {
  NEIGHBORS = 'neighbors',
  TOPICS = 'topics',
  CONTACTS = 'contacts',
  SECURITY = 'security',
  ECOMMERCE = 'ecommerce',
  GARBAGE = 'garbage'
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
  readonly #auth = inject(AuthService);
  #neighbors = new BehaviorSubject<Array<INeighbor> | undefined>(undefined);
  #garbageTruckRecords = new BehaviorSubject<Array<IGarbageTruckRecord> | undefined>(undefined);
  #contactData = new BehaviorSubject<{ data: Array<IContact>; tags: Array<string> } | undefined>(
    undefined
  );
  #security = new BehaviorSubject<ISecurity | undefined>(undefined);
  #users = new BehaviorSubject<Array<IUser> | undefined>(undefined);
  #currentUser = new BehaviorSubject<IUser | undefined>(undefined);
  #ecommerceData = new BehaviorSubject<
    { data: Array<IEcommerceProduct>; tags: Array<string> } | undefined
  >(undefined);
  #topics = new BehaviorSubject<Array<ITopic> | undefined>(undefined);

  start() {
    return FirebaseFirestore.clearPersistence()
  }

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
    return new Promise<INeighbor>(async (resolve, reject) => {
      try {
        if (typeof this.#neighbors.value !== 'undefined') {
          const neighbor = this.#neighbors.value.find(_neighbor => _neighbor.id === id);
          if (!neighbor) {
            reject(new Error(ERROR.ITEM_NOT_FOUND));
            return;
          }

          resolve(neighbor);
          return;
        }

        const neighbors = await this.getNeighbors();
        const neighbor = neighbors.find(_neighbor => _neighbor.id === id);
        if (!neighbor) {
          reject(new Error(ERROR.ITEM_NOT_FOUND));
          return;
        }

        resolve(neighbor);
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
    return new Promise<IContact>(async (resolve, reject) => {
      try {
        if (typeof this.#contactData.value !== 'undefined') {
          const contact = this.#contactData.value.data.find(_contact => _contact.id === id);
          if (!contact) {
            reject(new Error(ERROR.ITEM_NOT_FOUND));
            return;
          }

          resolve(contact);
          return;
        }

        const data = await this.getContacts();
        const contact = data.find(_contact => _contact.id === id);
        if (!contact) {
          reject(new Error(ERROR.ITEM_NOT_FOUND));
          return;
        }

        resolve(contact);
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
          reject(new Error(ERROR.ITEM_NOT_FOUND));
          return;
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

  deleteSecurityGroupInvoice(invoice: ISecurityInvoice): Promise<void> {
    return new Promise<void>(async (resolve, reject) => {
      try {
        const data = await this.getSecurity();
        if (!data || !data.invoices || data.invoices.length === 0) {
          reject(new Error(ERROR.ITEM_NOT_FOUND));
          return;
        }

        const index = data.invoices.findIndex(
          _invoice => _invoice.timestamp === invoice.timestamp && _invoice.group === invoice.group
        );

        if (index === -1) {
          reject(new Error(ERROR.ITEM_NOT_FOUND));
          return;
        }

        data.invoices.splice(index, 1);

        const securityDocument = JSON.parse(JSON.stringify(data));

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

  deleteSecurityNeighborInvoice(invoice: ISecurityNeighborInvoice): Promise<void> {
    return new Promise<void>(async (resolve, reject) => {
      try {
        const data = await this.getSecurity();
        if (!data || !data.neighborInvoices || data.neighborInvoices.length === 0) {
          reject(new Error(ERROR.ITEM_NOT_FOUND));
          return;
        }

        const index = data.neighborInvoices.findIndex(
          _invoice =>
            _invoice.timestamp === invoice.timestamp &&
            _invoice.transactionId === invoice.transactionId
        );

        if (index === -1) {
          reject(new Error(ERROR.ITEM_NOT_FOUND));
          return;
        }

        data.neighborInvoices.splice(index, 1);

        const securityDocument = JSON.parse(JSON.stringify(data));

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

  postSecurityNeighborInvoice(invoice: ISecurityNeighborInvoice): Promise<void> {
    return new Promise<void>(async (resolve, reject) => {
      try {
        const data = await this.getSecurity();
        if (!data) {
          reject(new Error(ERROR.ITEM_NOT_FOUND));
          return;
        }

        if (!data.neighborInvoices) {
          data.neighborInvoices = [invoice];
        } else {
          const index = data.neighborInvoices.findIndex(
            _invoice =>
              _invoice.timestamp === invoice.timestamp && _invoice.neighborId === invoice.neighborId
          );
          if (index === -1) {
            data.neighborInvoices.push(invoice);
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

  getUsers() {
    return new Promise<Array<IUser>>(async (resolve, reject) => {
      try {
        const res = await FirebaseFirestore.getCollection<IUser>({ reference: COLLECTION.USERS });
        if (res.snapshots) {
          const users = res.snapshots.map(_snap => {
            return _snap.data as IUser;
          }) as Array<IUser>;
          this.#users.next(users);
          resolve(users);
        } else {
          this.#users.next([]);
          resolve([]);
        }
      } catch (error) {
        reject(error);
      }
    });
  }

  getCurrentUser() {
    return new Promise<IUser>(async (resolve, reject) => {
      try {
        if (typeof this.#currentUser.value !== 'undefined') {
          resolve(this.#currentUser.value);
          return;
        }

        const userEmail = this.#auth.getEmail();
        if (!userEmail) {
          reject(new Error(ERROR.AUTH_ERROR));
          return;
        }

        await FirebaseFirestore.addDocumentSnapshotListener<IUser>(
          { reference: `${COLLECTION.USERS}/${userEmail}` },
          (event, error) => {
            if (error) {
              console.log(error);
            } else {
              const currentUser = event && event.snapshot.data ? event.snapshot.data : undefined;
              this.#currentUser.next(currentUser);

              if (!currentUser) {
                reject(new Error(ERROR.ITEM_NOT_FOUND));
                return;
              }

              resolve(currentUser);
            }
          }
        );
      } catch (error) {
        reject(error);
      }
    });
  }

  getUser(email: string) {
    return new Promise<IUser>(async (resolve, reject) => {
      try {
        if (typeof this.#users.value !== 'undefined') {
          const user = this.#users.value.find(_user => _user.email === email);
          if (!user) {
            reject(new Error(ERROR.ITEM_NOT_FOUND));
            return;
          }

          resolve(user);
          return;
        }

        const users = await this.getUsers();
        const user = users.find(_user => _user.email === email);
        if (!user) {
          reject(new Error(ERROR.ITEM_NOT_FOUND));
          return;
        }

        resolve(user);
      } catch (error) {
        reject(error);
      }
    });
  }

  postUser() {
    return new Promise<void>(async (resolve, reject) => {
      try {
        const userEmail = this.#auth.getEmail();
        if (!userEmail) {
          reject(new Error(ERROR.AUTH_ERROR));
          return;
        }

        const userSettings: IUser = {
          roles: [],
          status: USER_STATE.PENDING,
          id: Date.now(),
          email: userEmail,
          name: this.#auth.getName(),
          picture: this.#auth.getProfilePictureURL(),
          phone: null,
          lot: null
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

  putUser(user: IUser): Promise<void> {
    return new Promise<void>(async (resolve, reject) => {
      try {
        const userDocument = JSON.parse(JSON.stringify(user));

        await FirebaseFirestore.setDocument({
          reference: `${COLLECTION.USERS}/${user.email}`,
          data: userDocument
        });

        const users = this.#users.value ?? [];
        const index = users.findIndex(_user => _user.email === user.email);
        if (index !== -1) {
          users[index] = user;
          this.#users.next(users);
        }

        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }

  getEcommerceTags() {
    return new Promise<Array<string>>(async (resolve, reject) => {
      try {
        if (typeof this.#ecommerceData.value !== 'undefined') {
          resolve(this.#ecommerceData.value.tags);
          return;
        }

        await FirebaseFirestore.addDocumentSnapshotListener<{
          data: Array<IEcommerceProduct>;
          tags: Array<string>;
        }>({ reference: `${COLLECTION.CORE}/${CORE_DOCUMENT.ECOMMERCE}` }, (event, error) => {
          if (error) {
            console.log(error);
          } else if (event && event.snapshot && event.snapshot.data) {
            this.#ecommerceData.next(event.snapshot.data);
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

  getEcommerceProducts() {
    return new Promise<Array<IEcommerceProduct>>(async (resolve, reject) => {
      try {
        if (typeof this.#ecommerceData.value !== 'undefined') {
          resolve(this.#ecommerceData.value.data);
          return;
        }

        await FirebaseFirestore.addDocumentSnapshotListener<{
          data: Array<IEcommerceProduct>;
          tags: Array<string>;
        }>({ reference: `${COLLECTION.CORE}/${CORE_DOCUMENT.ECOMMERCE}` }, (event, error) => {
          if (error) {
            console.log(error);
          } else if (event && event.snapshot && event.snapshot.data) {
            this.#ecommerceData.next(event.snapshot.data);
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

  getEcommerceProduct(id: string) {
    return new Promise<IEcommerceProduct>(async (resolve, reject) => {
      try {
        if (typeof this.#ecommerceData.value !== 'undefined') {
          const product = this.#ecommerceData.value.data.find(
            _ecommerceProduct => _ecommerceProduct.id === id
          );
          if (!product) {
            reject(new Error(ERROR.ITEM_NOT_FOUND));
            return;
          }

          resolve(product);
          return;
        }

        const data = await this.getEcommerceProducts();
        const product = data.find(_ecommerceProduct => _ecommerceProduct.id === id);
        if (!product) {
          reject(new Error(ERROR.ITEM_NOT_FOUND));
          return;
        }

        resolve(product);
      } catch (error) {
        reject(error);
      }
    });
  }

  postEcommerceProduct(ecommerceProduct: IEcommerceProduct): Promise<void> {
    return new Promise<void>(async (resolve, reject) => {
      try {
        const data = await this.getEcommerceProducts();
        const index = data.findIndex(
          _ecommerceProduct => _ecommerceProduct.id === ecommerceProduct.id
        );
        if (index !== -1) {
          data[index] = ecommerceProduct;
        } else {
          data.push(ecommerceProduct);
        }

        const tags = await this.getEcommerceTags();

        const ecommerceProductsDocument = JSON.parse(JSON.stringify({ data, tags }));

        await FirebaseFirestore.setDocument({
          reference: `${COLLECTION.CORE}/${CORE_DOCUMENT.ECOMMERCE}`,
          data: ecommerceProductsDocument
        });
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }

  putEcommerceProduct(ecommerceProduct: IEcommerceProduct): Promise<void> {
    return new Promise<void>(async (resolve, reject) => {
      try {
        const data = await this.getEcommerceProducts();
        const index = data.findIndex(
          _ecommerceProduct => _ecommerceProduct.id === ecommerceProduct.id
        );
        if (index !== -1) {
          data[index] = ecommerceProduct;

          const tags = await this.getEcommerceTags();

          const ecommerceProductsDocument = JSON.parse(JSON.stringify({ data, tags }));
          await FirebaseFirestore.setDocument({
            reference: `${COLLECTION.CORE}/${CORE_DOCUMENT.ECOMMERCE}`,
            data: ecommerceProductsDocument
          });
        }

        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }

  deleteEcommerceProduct(id: string): Promise<void> {
    return new Promise<void>(async (resolve, reject) => {
      try {
        let data = await this.getEcommerceProducts();
        data = data.filter(_ecommerceProduct => _ecommerceProduct.id !== id);

        const tags = await this.getEcommerceTags();

        const ecommerceProductsDocument = JSON.parse(JSON.stringify({ data, tags }));

        await FirebaseFirestore.setDocument({
          reference: `${COLLECTION.CORE}/${CORE_DOCUMENT.ECOMMERCE}`,
          data: ecommerceProductsDocument
        });
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }

  getGarbageTruckRecords() {
    return new Promise<Array<IGarbageTruckRecord>>(async (resolve, reject) => {
      try {
        if (typeof this.#garbageTruckRecords.value !== 'undefined') {
          resolve(this.#garbageTruckRecords.value);
          return;
        }

        await FirebaseFirestore.addDocumentSnapshotListener<{ data: Array<IGarbageTruckRecord> }>(
          { reference: `${COLLECTION.CORE}/${CORE_DOCUMENT.GARBAGE}` },
          (event, error) => {
            if (error) {
              console.log(error);
            } else {
              const garbageTruckRecords =
                event && event.snapshot.data ? event.snapshot.data.data : [];
              this.#garbageTruckRecords.next(garbageTruckRecords);
              resolve(garbageTruckRecords);
            }
          }
        );
      } catch (error) {
        reject(error);
      }
    });
  }

  postGarbageTruckRecord(garbageTruckRecord: IGarbageTruckRecord): Promise<void> {
    return new Promise<void>(async (resolve, reject) => {
      try {
        const garbageTruckRecords = await this.getGarbageTruckRecords();
        const index = garbageTruckRecords.findIndex(
          _garbageTruckRecord => _garbageTruckRecord.id === garbageTruckRecord.id
        );
        if (index !== -1) {
          throw new Error(ERROR.ITEM_ALREADY_EXISTS);
        } else {
          garbageTruckRecords.push(garbageTruckRecord);
        }

        const garbageTruckRecordsDocument = JSON.parse(
          JSON.stringify({ data: garbageTruckRecords })
        );

        await FirebaseFirestore.setDocument({
          reference: `${COLLECTION.CORE}/${CORE_DOCUMENT.GARBAGE}`,
          data: garbageTruckRecordsDocument
        });
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }

  getTopics() {
    return new Promise<Array<ITopic>>(async (resolve, reject) => {
      try {
        if (typeof this.#topics.value !== 'undefined') {
          resolve(this.#topics.value);
          return;
        }

        await FirebaseFirestore.addDocumentSnapshotListener<{ data: Array<ITopic> }>(
          { reference: `${COLLECTION.CORE}/${CORE_DOCUMENT.TOPICS}` },
          (event, error) => {
            if (error) {
              console.log(error);
            } else {
              const topics = event && event.snapshot.data ? event.snapshot.data.data : [];
              this.#topics.next(topics);
              resolve(topics);
            }
          }
        );
      } catch (error) {
        reject(error);
      }
    });
  }

  getTopic(id: string) {
    return new Promise<ITopic>(async (resolve, reject) => {
      try {
        if (typeof this.#topics.value !== 'undefined') {
          const topic = this.#topics.value.find(_topic => _topic.id === id);
          if (!topic) {
            reject(new Error(ERROR.ITEM_NOT_FOUND));
            return;
          }

          resolve(topic);
          return;
        }

        const topics = await this.getTopics();
        const topic = topics.find(_topic => _topic.id === id);
        if (!topic) {
          reject(new Error(ERROR.ITEM_NOT_FOUND));
          return;
        }

        resolve(topic);
      } catch (error) {
        reject(error);
      }
    });
  }

  postTopic(topic: ITopic): Promise<void> {
    return new Promise<void>(async (resolve, reject) => {
      try {
        const topics = await this.getTopics();
        const index = topics.findIndex(_topic => _topic.id === topic.id);
        if (index !== -1) {
          topics[index] = topic;
        } else {
          topics.push(topic);
        }

        const topicsDocument = JSON.parse(JSON.stringify({ data: topics }));

        await FirebaseFirestore.setDocument({
          reference: `${COLLECTION.CORE}/${CORE_DOCUMENT.TOPICS}`,
          data: topicsDocument
        });
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }

  putTopic(topic: ITopic): Promise<void> {
    return new Promise<void>(async (resolve, reject) => {
      try {
        const topics = await this.getTopics();
        const index = topics.findIndex(_topic => _topic.id === topic.id);
        if (index !== -1) {
          topics[index] = topic;

          const topicsDocument = JSON.parse(JSON.stringify({ data: topics }));
          await FirebaseFirestore.setDocument({
            reference: `${COLLECTION.CORE}/${CORE_DOCUMENT.TOPICS}`,
            data: topicsDocument
          });
        }

        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }

  deleteTopic(id: string): Promise<void> {
    return new Promise<void>(async (resolve, reject) => {
      try {
        let topics = await this.getTopics();
        topics = topics.filter(_topic => _topic.id !== id);

        const topicsDocument = JSON.parse(JSON.stringify({ data: topics }));

        await FirebaseFirestore.setDocument({
          reference: `${COLLECTION.CORE}/${CORE_DOCUMENT.TOPICS}`,
          data: topicsDocument
        });
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }

  postTopicMilestone(data: { topicId: string; milestone: TopicMilestone }): Promise<void> {
    return new Promise<void>(async (resolve, reject) => {
      try {
        const topics = await this.getTopics();
        const index = topics.findIndex(_topic => _topic.id === data.topicId);
        if (index === -1) {
          reject(new Error(ERROR.ITEM_NOT_FOUND));
          return;
        }

        topics[index].milestones.push(data.milestone);

        const topicsDocument = JSON.parse(JSON.stringify({ data: topics }));

        await FirebaseFirestore.setDocument({
          reference: `${COLLECTION.CORE}/${CORE_DOCUMENT.TOPICS}`,
          data: topicsDocument
        });
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }

  putTopicMilestone(data: { topicId: string; milestone: TopicMilestone }): Promise<void> {
    return new Promise<void>(async (resolve, reject) => {
      try {
        const topics = await this.getTopics();
        const topicIndex = topics.findIndex(_topic => _topic.id === data.topicId);
        if (topicIndex === -1) {
          reject(new Error(ERROR.ITEM_NOT_FOUND));
          return;
        }

        const milestoneIndex = topics[topicIndex].milestones.findIndex(
          _milestone => _milestone.id === data.milestone.id
        );
        if (milestoneIndex === -1) {
          reject(new Error(ERROR.ITEM_NOT_FOUND));
          return;
        }

        topics[topicIndex].milestones[milestoneIndex] = data.milestone;

        const topicsDocument = JSON.parse(JSON.stringify({ data: topics }));

        await FirebaseFirestore.setDocument({
          reference: `${COLLECTION.CORE}/${CORE_DOCUMENT.TOPICS}`,
          data: topicsDocument
        });
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }

  deleteTopicMilestone(data: { topicId: string; milestoneId: string }): Promise<void> {
    return new Promise<void>(async (resolve, reject) => {
      try {
        const topics = await this.getTopics();
        const topicIndex = topics.findIndex(_topic => _topic.id === data.topicId);
        if (topicIndex === -1) {
          reject(new Error(ERROR.ITEM_NOT_FOUND));
          return;
        }

        const milestoneIndex = topics[topicIndex].milestones.findIndex(
          _milestone => _milestone.id === data.milestoneId
        );
        if (milestoneIndex === -1) {
          reject(new Error(ERROR.ITEM_NOT_FOUND));
          return;
        }

        topics[topicIndex].milestones.splice(milestoneIndex, 1);

        const topicsDocument = JSON.parse(JSON.stringify({ data: topics }));

        await FirebaseFirestore.setDocument({
          reference: `${COLLECTION.CORE}/${CORE_DOCUMENT.TOPICS}`,
          data: topicsDocument
        });
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }

  destroy = () => {
    this.#neighbors.next(undefined);
    this.#contactData.next(undefined);
    this.#ecommerceData.next(undefined);
    this.#security.next(undefined);
    this.#users.next(undefined);
    this.#garbageTruckRecords.next(undefined);
    this.#topics.next(undefined);
    this.#currentUser.next(undefined);
    return Promise.all([
      FirebaseFirestore.clearPersistence(),
      FirebaseFirestore.removeAllListeners()
    ]);
  };

  ngOnDestroy() {
    this.destroy();
  }
}
