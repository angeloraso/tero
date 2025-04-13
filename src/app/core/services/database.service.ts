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
  #contactData = new BehaviorSubject<{ data: Array<IContact>; tags: Array<string> } | undefined>(undefined);
  #security = new BehaviorSubject<ISecurity | undefined>(undefined);
  #users = new BehaviorSubject<Array<IUser> | undefined>(undefined);
  #currentUser = new BehaviorSubject<IUser | undefined>(undefined);
  #ecommerceData = new BehaviorSubject<{ data: Array<IEcommerceProduct>; tags: Array<string> } | undefined>(undefined);
  #topics = new BehaviorSubject<Array<ITopic> | undefined>(undefined);

  start() {
    return FirebaseFirestore.clearPersistence();
  }

  getNeighbors(): Promise<Array<INeighbor>> {
    if (typeof this.#neighbors.value !== 'undefined' && this.#neighbors.value !== null) {
      return Promise.resolve(this.#neighbors.value);
    }

    return new Promise<Array<INeighbor>>((resolve, reject) => {
      FirebaseFirestore.addDocumentSnapshotListener<{ data: Array<INeighbor> }>(
        { reference: `${COLLECTION.CORE}/${CORE_DOCUMENT.NEIGHBORS}` },
        (event, error) => {
          if (error) {
            reject(error);
          } else {
            const neighbors = event && event.snapshot.data && event.snapshot.data.data ? event.snapshot.data.data : [];
            this.#neighbors.next(neighbors);
            resolve(neighbors);
          }
        }
      );
    });
  }

  async getNeighbor(id: string): Promise<INeighbor> {
    if (typeof this.#neighbors.value !== 'undefined' && this.#neighbors.value !== null) {
      const neighbor = this.#neighbors.value.find(_neighbor => _neighbor.id === id);
      if (!neighbor) {
        throw new Error(ERROR.ITEM_NOT_FOUND);
      }

      return Promise.resolve(neighbor);
    }

    const neighbors = await this.getNeighbors();
    const neighbor = neighbors.find(_neighbor => _neighbor.id === id);
    if (!neighbor) {
      throw new Error(ERROR.ITEM_NOT_FOUND);
    }

    return Promise.resolve(neighbor);
  }

  async postNeighbor(neighbor: INeighbor): Promise<void> {
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
  }

  async putNeighbor(neighbor: INeighbor): Promise<void> {
    const neighbors = await this.getNeighbors();
    const index = neighbors.findIndex(_neighbor => _neighbor.id === neighbor.id);

    if (index === -1) {
      throw new Error(ERROR.ITEM_NOT_FOUND);
    }

    neighbors[index] = neighbor;

    const neighborsDocument = JSON.parse(JSON.stringify({ data: neighbors }));
    await FirebaseFirestore.setDocument({
      reference: `${COLLECTION.CORE}/${CORE_DOCUMENT.NEIGHBORS}`,
      data: neighborsDocument
    });
  }

  async deleteNeighbor(id: string): Promise<void> {
    let neighbors = await this.getNeighbors();
    neighbors = neighbors.filter(_neighbor => _neighbor.id !== id);

    const neighborsDocument = JSON.parse(JSON.stringify({ data: neighbors }));

    await FirebaseFirestore.setDocument({
      reference: `${COLLECTION.CORE}/${CORE_DOCUMENT.NEIGHBORS}`,
      data: neighborsDocument
    });
  }

  getContactTags(): Promise<Array<string>> {
    if (typeof this.#contactData.value !== 'undefined' && this.#contactData.value !== null) {
      Promise.resolve(this.#contactData.value.tags);
    }

    return new Promise<Array<string>>((resolve, reject) => {
      FirebaseFirestore.addDocumentSnapshotListener<{
        data: Array<IContact>;
        tags: Array<string>;
      }>({ reference: `${COLLECTION.CORE}/${CORE_DOCUMENT.CONTACTS}` }, (event, error) => {
        if (error) {
          reject(error);
        } else if (event && event.snapshot && event.snapshot.data) {
          this.#contactData.next(event.snapshot.data);
          resolve(event.snapshot.data.tags ?? []);
        } else {
          resolve([]);
        }
      });
    });
  }

  getContacts(): Promise<Array<IContact>> {
    if (typeof this.#contactData.value !== 'undefined') {
      return Promise.resolve(this.#contactData.value.data);
    }

    return new Promise<Array<IContact>>((resolve, reject) => {
      FirebaseFirestore.addDocumentSnapshotListener<{
        data: Array<IContact>;
        tags: Array<string>;
      }>({ reference: `${COLLECTION.CORE}/${CORE_DOCUMENT.CONTACTS}` }, (event, error) => {
        if (error) {
          reject(error);
        } else if (event && event.snapshot && event.snapshot.data) {
          this.#contactData.next(event.snapshot.data);
          resolve(event.snapshot.data.data ?? []);
        } else {
          resolve([]);
        }
      });
    });
  }

  async getContact(id: string): Promise<IContact> {
    if (typeof this.#contactData.value !== 'undefined') {
      const contact = this.#contactData.value.data.find(_contact => _contact.id === id);
      if (!contact) {
        throw new Error(ERROR.ITEM_NOT_FOUND);
      }

      return Promise.resolve(contact);
    }

    const data = await this.getContacts();
    const contact = data.find(_contact => _contact.id === id);
    if (!contact) {
      throw new Error(ERROR.ITEM_NOT_FOUND);
    }

    return Promise.resolve(contact);
  }

  async postContact(contact: IContact): Promise<void> {
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
  }

  async putContact(contact: IContact): Promise<void> {
    const data = await this.getContacts();
    const index = data.findIndex(_contact => _contact.id === contact.id);

    if (index === -1) {
      throw new Error(ERROR.ITEM_NOT_FOUND);
    }

    data[index] = contact;

    const tags = await this.getContactTags();

    const contactsDocument = JSON.parse(JSON.stringify({ data, tags }));
    await FirebaseFirestore.setDocument({
      reference: `${COLLECTION.CORE}/${CORE_DOCUMENT.CONTACTS}`,
      data: contactsDocument
    });
  }

  async deleteContact(id: string): Promise<void> {
    let data = await this.getContacts();
    data = data.filter(_contact => _contact.id !== id);

    const tags = await this.getContactTags();

    const contactsDocument = JSON.parse(JSON.stringify({ data, tags }));

    await FirebaseFirestore.setDocument({
      reference: `${COLLECTION.CORE}/${CORE_DOCUMENT.CONTACTS}`,
      data: contactsDocument
    });
  }

  getSecurity(): Promise<ISecurity | null> {
    if (typeof this.#security.value !== 'undefined') {
      return Promise.resolve(this.#security.value);
    }

    return new Promise<ISecurity | null>((resolve, reject) => {
      FirebaseFirestore.addDocumentSnapshotListener<ISecurity>({ reference: `${COLLECTION.CORE}/${CORE_DOCUMENT.SECURITY}` }, (event, error) => {
        if (error) {
          reject(error);
        } else {
          const security = event && event.snapshot.data ? event.snapshot.data : undefined;
          this.#security.next(security);
          resolve(security ?? null);
        }
      });
    });
  }

  async postSecurityGroupInvoice(invoice: ISecurityInvoice): Promise<void> {
    const data = await this.getSecurity();
    if (!data) {
      throw new Error(ERROR.ITEM_NOT_FOUND);
    }

    if (!data.invoices) {
      data.invoices = [invoice];
    } else {
      const index = data.invoices.findIndex(_invoice => _invoice.timestamp === invoice.timestamp);
      if (index === -1) {
        data.invoices.push(invoice);
      }
    }

    const securityDocument = JSON.parse(JSON.stringify(data));

    await FirebaseFirestore.setDocument({
      reference: `${COLLECTION.CORE}/${CORE_DOCUMENT.SECURITY}`,
      data: securityDocument
    });
  }

  async deleteSecurityGroupInvoice(invoice: ISecurityInvoice): Promise<void> {
    const data = await this.getSecurity();
    if (!data || !data.invoices || data.invoices.length === 0) {
      throw new Error(ERROR.ITEM_NOT_FOUND);
    }

    const index = data.invoices.findIndex(_invoice => _invoice.timestamp === invoice.timestamp && _invoice.group === invoice.group);

    if (index === -1) {
      throw new Error(ERROR.ITEM_NOT_FOUND);
    }

    data.invoices.splice(index, 1);

    const securityDocument = JSON.parse(JSON.stringify(data));

    await FirebaseFirestore.setDocument({
      reference: `${COLLECTION.CORE}/${CORE_DOCUMENT.SECURITY}`,
      data: securityDocument
    });
  }

  async deleteSecurityNeighborInvoice(invoice: ISecurityNeighborInvoice): Promise<void> {
    const data = await this.getSecurity();
    if (!data || !data.neighborInvoices || data.neighborInvoices.length === 0) {
      throw new Error(ERROR.ITEM_NOT_FOUND);
    }

    const index = data.neighborInvoices.findIndex(
      _invoice => _invoice.timestamp === invoice.timestamp && _invoice.transactionId === invoice.transactionId
    );

    if (index === -1) {
      throw new Error(ERROR.ITEM_NOT_FOUND);
    }

    data.neighborInvoices.splice(index, 1);

    const securityDocument = JSON.parse(JSON.stringify(data));

    await FirebaseFirestore.setDocument({
      reference: `${COLLECTION.CORE}/${CORE_DOCUMENT.SECURITY}`,
      data: securityDocument
    });
  }

  async postSecurityNeighborInvoice(invoice: ISecurityNeighborInvoice): Promise<void> {
    const data = await this.getSecurity();
    if (!data) {
      throw new Error(ERROR.ITEM_NOT_FOUND);
    }

    if (!data.neighborInvoices) {
      data.neighborInvoices = [invoice];
    } else {
      const index = data.neighborInvoices.findIndex(
        _invoice => _invoice.timestamp === invoice.timestamp && _invoice.neighborId === invoice.neighborId
      );
      if (index === -1) {
        data.neighborInvoices.push(invoice);
      }
    }

    const securityDocument = JSON.parse(JSON.stringify(data));

    await FirebaseFirestore.setDocument({
      reference: `${COLLECTION.CORE}/${CORE_DOCUMENT.SECURITY}`,
      data: securityDocument
    });
  }

  async getUsers(): Promise<Array<IUser>> {
    const res = await FirebaseFirestore.getCollection<IUser>({ reference: COLLECTION.USERS });
    if (res.snapshots) {
      const users = res.snapshots.map(_snap => {
        return _snap.data as IUser;
      }) as Array<IUser>;
      this.#users.next(users);
      return users;
    } else {
      this.#users.next([]);
      return [];
    }
  }

  getCurrentUser(): Promise<IUser> {
    if (typeof this.#currentUser.value !== 'undefined' && this.#currentUser.value !== null) {
      Promise.resolve(this.#currentUser.value);
    }

    const userEmail = this.#auth.getEmail();
    if (!userEmail) {
      throw new Error(ERROR.AUTH_ERROR);
    }

    return new Promise<IUser>((resolve, reject) => {
      FirebaseFirestore.addDocumentSnapshotListener<IUser>({ reference: `${COLLECTION.USERS}/${userEmail}` }, (event, error) => {
        if (error) {
          reject(error);
        } else {
          const currentUser = event && event.snapshot.data ? event.snapshot.data : undefined;
          this.#currentUser.next(currentUser);

          if (!currentUser) {
            throw new Error(ERROR.ITEM_NOT_FOUND);
          }

          resolve(currentUser);
        }
      });
    });
  }

  async getUser(email: string) {
    if (typeof this.#users.value !== 'undefined' && this.#users.value !== null) {
      const user = this.#users.value.find(_user => _user.email === email);
      if (!user) {
        throw new Error(ERROR.ITEM_NOT_FOUND);
      }
      return user;
    }

    const users = await this.getUsers();
    const user = users.find(_user => _user.email === email);
    if (!user) {
      throw new Error(ERROR.ITEM_NOT_FOUND);
    }

    return user;
  }

  async postUser(): Promise<void> {
    const userEmail = this.#auth.getEmail();
    if (!userEmail) {
      throw new Error(ERROR.AUTH_ERROR);
    }

    const userSettings: IUser = {
      roles: [],
      status: USER_STATE.PENDING,
      id: Date.now(),
      email: userEmail,
      name: this.#auth.getName(),
      picture: this.#auth.getProfilePictureURL(),
      phone: null,
      lot: null,
      aliasCBU: null
    };

    const userDocument = JSON.parse(JSON.stringify(userSettings));

    await FirebaseFirestore.setDocument({
      reference: `${COLLECTION.USERS}/${userEmail}`,
      data: userDocument
    });
  }

  async putUser(user: IUser): Promise<void> {
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
  }

  getEcommerceTags(): Promise<Array<string>> {
    if (typeof this.#ecommerceData.value !== 'undefined' && this.#ecommerceData.value !== null) {
      return Promise.resolve(this.#ecommerceData.value.tags);
    }

    return new Promise<Array<string>>((resolve, reject) => {
      FirebaseFirestore.addDocumentSnapshotListener<{
        data: Array<IEcommerceProduct>;
        tags: Array<string>;
      }>({ reference: `${COLLECTION.CORE}/${CORE_DOCUMENT.ECOMMERCE}` }, (event, error) => {
        if (error) {
          reject(error);
        } else if (event && event.snapshot && event.snapshot.data) {
          this.#ecommerceData.next(event.snapshot.data);
          resolve(event.snapshot.data.tags ?? []);
        } else {
          resolve([]);
        }
      });
    });
  }

  getEcommerceProducts(): Promise<Array<IEcommerceProduct>> {
    if (typeof this.#ecommerceData.value !== 'undefined' && this.#ecommerceData.value !== null) {
      return Promise.resolve(this.#ecommerceData.value.data);
    }

    return new Promise<Array<IEcommerceProduct>>((resolve, reject) => {
      FirebaseFirestore.addDocumentSnapshotListener<{
        data: Array<IEcommerceProduct>;
        tags: Array<string>;
      }>({ reference: `${COLLECTION.CORE}/${CORE_DOCUMENT.ECOMMERCE}` }, (event, error) => {
        if (error) {
          reject(error);
        } else if (event && event.snapshot && event.snapshot.data) {
          this.#ecommerceData.next(event.snapshot.data);
          resolve(event.snapshot.data.data ?? []);
        } else {
          resolve([]);
        }
      });
    });
  }

  async getEcommerceProduct(id: string): Promise<IEcommerceProduct> {
    if (typeof this.#ecommerceData.value !== 'undefined') {
      const product = this.#ecommerceData.value.data.find(_ecommerceProduct => _ecommerceProduct.id === id);
      if (!product) {
        throw new Error(ERROR.ITEM_NOT_FOUND);
      }

      return Promise.resolve(product);
    }

    const data = await this.getEcommerceProducts();
    const product = data.find(_ecommerceProduct => _ecommerceProduct.id === id);
    if (!product) {
      throw new Error(ERROR.ITEM_NOT_FOUND);
    }

    return product;
  }

  async postEcommerceProduct(ecommerceProduct: IEcommerceProduct): Promise<void> {
    const data = await this.getEcommerceProducts();
    const index = data.findIndex(_ecommerceProduct => _ecommerceProduct.id === ecommerceProduct.id);
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
  }

  async putEcommerceProduct(ecommerceProduct: IEcommerceProduct): Promise<void> {
    const data = await this.getEcommerceProducts();
    const index = data.findIndex(_ecommerceProduct => _ecommerceProduct.id === ecommerceProduct.id);

    if (index === -1) {
      throw new Error(ERROR.ITEM_NOT_FOUND);
    }

    data[index] = ecommerceProduct;

    const tags = await this.getEcommerceTags();

    const ecommerceProductsDocument = JSON.parse(JSON.stringify({ data, tags }));
    await FirebaseFirestore.setDocument({
      reference: `${COLLECTION.CORE}/${CORE_DOCUMENT.ECOMMERCE}`,
      data: ecommerceProductsDocument
    });
  }

  async deleteEcommerceProduct(id: string): Promise<void> {
    let data = await this.getEcommerceProducts();
    data = data.filter(_ecommerceProduct => _ecommerceProduct.id !== id);

    const tags = await this.getEcommerceTags();

    const ecommerceProductsDocument = JSON.parse(JSON.stringify({ data, tags }));

    await FirebaseFirestore.setDocument({
      reference: `${COLLECTION.CORE}/${CORE_DOCUMENT.ECOMMERCE}`,
      data: ecommerceProductsDocument
    });
  }

  getGarbageTruckRecords(): Promise<Array<IGarbageTruckRecord>> {
    if (typeof this.#garbageTruckRecords.value !== 'undefined') {
      return Promise.resolve(this.#garbageTruckRecords.value as Array<IGarbageTruckRecord>);
    }

    return new Promise((resolve, reject) => {
      FirebaseFirestore.addDocumentSnapshotListener<{ data: Array<IGarbageTruckRecord> }>(
        { reference: `${COLLECTION.CORE}/${CORE_DOCUMENT.GARBAGE}` },
        (event, error) => {
          if (error) {
            return reject(error);
          } else {
            const garbageTruckRecords = event && event.snapshot.data ? event.snapshot.data.data : [];
            this.#garbageTruckRecords.next(garbageTruckRecords);
            return resolve(garbageTruckRecords ?? []);
          }
        }
      );
    });
  }

  async postGarbageTruckRecord(garbageTruckRecord: IGarbageTruckRecord): Promise<void> {
    const garbageTruckRecords = await this.getGarbageTruckRecords();
    const index = garbageTruckRecords.findIndex(_garbageTruckRecord => _garbageTruckRecord.date === garbageTruckRecord.date);

    if (index !== -1) {
      throw new Error(ERROR.ITEM_ALREADY_EXISTS);
    }

    garbageTruckRecords.push(garbageTruckRecord);

    const garbageTruckRecordsDocument = JSON.parse(JSON.stringify({ data: garbageTruckRecords }));

    await FirebaseFirestore.setDocument({
      reference: `${COLLECTION.CORE}/${CORE_DOCUMENT.GARBAGE}`,
      data: garbageTruckRecordsDocument
    });
  }

  getTopics(): Promise<Array<ITopic>> {
    if (typeof this.#topics.value !== 'undefined' && this.#topics.value !== null) {
      return Promise.resolve(this.#topics.value);
    }

    return new Promise<Array<ITopic>>((resolve, reject) => {
      FirebaseFirestore.addDocumentSnapshotListener<{ data: Array<ITopic> }>(
        { reference: `${COLLECTION.CORE}/${CORE_DOCUMENT.TOPICS}` },
        (event, error) => {
          if (error) {
            reject(error);
          } else {
            const topics = event && event.snapshot.data && event.snapshot.data.data ? event.snapshot.data.data : [];
            this.#topics.next(topics);
            resolve(topics);
          }
        }
      );
    });
  }

  async getTopic(id: string): Promise<ITopic> {
    if (typeof this.#topics.value !== 'undefined' && this.#topics.value !== null) {
      const topic = this.#topics.value.find(_topic => _topic.id === id);
      if (!topic) {
        throw new Error(ERROR.ITEM_NOT_FOUND);
      }

      return Promise.resolve(topic);
    }

    const topics = await this.getTopics();
    const topic = topics.find(_topic => _topic.id === id);
    if (!topic) {
      throw new Error(ERROR.ITEM_NOT_FOUND);
    }

    return Promise.resolve(topic);
  }

  async postTopic(topic: ITopic): Promise<void> {
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
  }

  async putTopic(topic: ITopic): Promise<void> {
    const topics = await this.getTopics();
    const index = topics.findIndex(_topic => _topic.id === topic.id);

    if (index === -1) {
      throw new Error(ERROR.ITEM_NOT_FOUND);
    }

    topics[index] = topic;

    const topicsDocument = JSON.parse(JSON.stringify({ data: topics }));
    await FirebaseFirestore.setDocument({
      reference: `${COLLECTION.CORE}/${CORE_DOCUMENT.TOPICS}`,
      data: topicsDocument
    });
  }

  async deleteTopic(id: string): Promise<void> {
    let topics = await this.getTopics();
    topics = topics.filter(_topic => _topic.id !== id);

    const topicsDocument = JSON.parse(JSON.stringify({ data: topics }));

    await FirebaseFirestore.setDocument({
      reference: `${COLLECTION.CORE}/${CORE_DOCUMENT.TOPICS}`,
      data: topicsDocument
    });
  }

  async postTopicMilestone(data: { topicId: string; milestone: TopicMilestone }): Promise<void> {
    const topics = await this.getTopics();
    const index = topics.findIndex(_topic => _topic.id === data.topicId);

    if (index === -1) {
      throw new Error(ERROR.ITEM_NOT_FOUND);
    }

    topics[index].milestones.push(data.milestone);

    const topicsDocument = JSON.parse(JSON.stringify({ data: topics }));

    await FirebaseFirestore.setDocument({
      reference: `${COLLECTION.CORE}/${CORE_DOCUMENT.TOPICS}`,
      data: topicsDocument
    });
  }

  async putTopicMilestone(data: { topicId: string; milestone: TopicMilestone }): Promise<void> {
    const topics = await this.getTopics();
    const topicIndex = topics.findIndex(_topic => _topic.id === data.topicId);

    if (topicIndex === -1) {
      throw new Error(ERROR.ITEM_NOT_FOUND);
    }

    const milestoneIndex = topics[topicIndex].milestones.findIndex(_milestone => _milestone.id === data.milestone.id);

    if (milestoneIndex === -1) {
      throw new Error(ERROR.ITEM_NOT_FOUND);
    }

    topics[topicIndex].milestones[milestoneIndex] = data.milestone;

    const topicsDocument = JSON.parse(JSON.stringify({ data: topics }));

    await FirebaseFirestore.setDocument({
      reference: `${COLLECTION.CORE}/${CORE_DOCUMENT.TOPICS}`,
      data: topicsDocument
    });
  }

  async deleteTopicMilestone(data: { topicId: string; milestoneId: string }): Promise<void> {
    const topics = await this.getTopics();
    const topicIndex = topics.findIndex(_topic => _topic.id === data.topicId);
    if (topicIndex === -1) {
      throw new Error(ERROR.ITEM_NOT_FOUND);
    }

    const milestoneIndex = topics[topicIndex].milestones.findIndex(_milestone => _milestone.id === data.milestoneId);
    if (milestoneIndex === -1) {
      throw new Error(ERROR.ITEM_NOT_FOUND);
    }

    topics[topicIndex].milestones.splice(milestoneIndex, 1);

    const topicsDocument = JSON.parse(JSON.stringify({ data: topics }));

    await FirebaseFirestore.setDocument({
      reference: `${COLLECTION.CORE}/${CORE_DOCUMENT.TOPICS}`,
      data: topicsDocument
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
    return Promise.all([FirebaseFirestore.clearPersistence(), FirebaseFirestore.removeAllListeners()]);
  };

  ngOnDestroy() {
    this.destroy();
  }
}
