import uuid4 from 'uuid4';

export interface IPhone {
  number: string;
  description: string;
}

export enum ERROR {
  ITEM_NOT_FOUND = 'ITEM_NOT_FOUND',
  ITEM_ALREADY_EXISTS = 'ITEM_ALREADY_EXISTS',
  AUTH_ERROR = 'AUTH_ERROR',
  NOT_SUPPORTED = 'NOT_SUPPORTED',
  NOTIFICATION_PERMISSIONS = 'NOTIFICATION_PERMISSIONS',
  REQUIRED_PROPERTIES = 'REQUIRED_PROPERTIES'
}

export enum USER_ROLE {
  NEIGHBOR = 'NEIGHBOR',
  ADMIN = 'ADMIN',
  SECURITY = 'SECURITY',
  CONFIG = 'CONFIG',
  SECURITY_GROUP_1 = 'SECURITY_GROUP_1',
  SECURITY_GROUP_2 = 'SECURITY_GROUP_2',
  SECURITY_GROUP_3 = 'SECURITY_GROUP_3',
  SECURITY_GROUP_4 = 'SECURITY_GROUP_4',
  SECURITY_GROUP_5 = 'SECURITY_GROUP_5',
  SECURITY_GROUP_6 = 'SECURITY_GROUP_6'
}

export enum USER_STATE {
  ACTIVE = 'ACTIVE',
  PENDING = 'PENDING',
  SUSPENDED = 'SUSPENDED',
  REJECTED = 'REJECTED'
}

export interface IUser {
  id: number;
  roles: Array<USER_ROLE>;
  status: USER_STATE;
  email: string;
  picture?: string | null;
  name?: string | null;
  phone?: string | null;
  lot?: number | null;
  aliasCBU?: string | null;
  topicSubscriptions?: Array<string>;
}

export interface INeighbor {
  id: string;
  lot: number;
  name: string;
  surname: string;
  security: boolean;
  alarmNumber: number | null;
  alarmControls: Array<number>;
  group: number;
  email?: string;
  created: number;
  updated: number;
}

export class Neighbor implements INeighbor {
  id: string;
  lot: number;
  name: string;
  surname: string;
  security: boolean;
  alarmNumber: number | null;
  alarmControls: Array<number>;
  group: number;
  email?: string;
  created: number;
  updated: number;

  constructor(neighbor: Omit<INeighbor, 'id' | 'created' | 'updated'>) {
    this.id = uuid4();
    this.lot = neighbor.lot;
    this.group = neighbor.group;
    this.alarmNumber = neighbor.alarmNumber ?? null;
    this.alarmControls = neighbor.alarmControls ?? [];
    this.name = neighbor.name ?? '';
    this.surname = neighbor.surname ?? '';
    this.security = neighbor.security ?? false;
    this.email = neighbor.email ?? '';
    this.created = Date.now();
    this.updated = Date.now();
  }
}

export interface ISecurityGuard {
  name: string;
  picture: string;
  description: string;
  phone?: string;
}

export interface ISecurityInvoice {
  timestamp: number;
  group: number;
}

export interface ISecurityNeighborInvoice {
  timestamp: number;
  group: number;
  neighborId: string;
  transactionId: string | null;
}

export interface ISecurity {
  fee: number;
  staff: Array<ISecurityGuard>;
  invoices: Array<ISecurityInvoice>;
  neighborInvoices: Array<ISecurityNeighborInvoice>;
}

export type Rating = 1 | 2 | 3 | 4 | 5;

export interface IContactRating {
  accountId?: string;
  accountEmail: string;
  description: string;
  value: Rating;
}

export interface IContact {
  id: string;
  accountId?: string; // Deprecated
  accountEmail: string;
  name: string;
  surname: string;
  description: string;
  rating: Array<IContactRating>;
  picture: string;
  phones: Array<IPhone>;
  tags: Array<string>;
  created: number;
  updated: number;
}

export class Contact implements IContact {
  id: string;
  accountId?: string; // Deprecated
  accountEmail: string;
  name: string;
  surname: string;
  description: string;
  rating: Array<IContactRating>;
  picture: string;
  phones: Array<IPhone>;
  tags: Array<string>;
  created: number;
  updated: number;

  constructor(contact: Omit<IContact, 'id' | 'created' | 'updated'>) {
    this.id = uuid4();
    this.accountEmail = contact.accountEmail;
    this.name = contact.name ?? '';
    this.surname = contact.surname ?? '';
    this.description = contact.description ?? '';
    this.rating = contact.rating ?? [];
    this.picture = contact.picture ?? '';
    this.phones = contact.phones ?? [];
    this.tags = contact.tags ?? [];
    this.created = Date.now();
    this.updated = Date.now();
  }
}

export interface IEcommerceProduct {
  id: string;
  accountId?: string; // Deprecated
  accountEmail: string;
  contactName: string;
  productName: string;
  price: number | null;
  description: string;
  pictures: Array<string>;
  phones: Array<IPhone>;
  tags: Array<string>;
  aliasCBU?: string;
  created: number;
  updated: number;
}

export class EcommerceProduct implements IEcommerceProduct {
  id: string;
  accountId?: string; // Deprecated
  accountEmail: string;
  contactName: string;
  productName: string;
  description: string;
  price: number | null;
  pictures: Array<string>;
  phones: Array<IPhone>;
  tags: Array<string>;
  aliasCBU?: string;
  created: number;
  updated: number;

  constructor(product: Omit<IEcommerceProduct, 'id' | 'created' | 'updated'>) {
    this.id = uuid4();
    this.accountId = product.accountId;
    this.accountEmail = product.accountEmail;
    this.contactName = product.contactName;
    this.productName = product.productName;
    this.price = product.price ?? null;
    this.description = product.description ?? '';
    this.pictures = product.pictures ?? [];
    this.phones = product.phones ?? [];
    this.tags = product.tags ?? [];
    this.aliasCBU = product.aliasCBU ?? '';
    this.created = Date.now();
    this.updated = Date.now();
  }
}

export enum TOPIC_STATE {
  ACTIVE = 'ACTIVE',
  CLOSED = 'CLOSED',
  STOPPED = 'STOPPED'
}

export enum TOPIC_DATA_TYPE {
  DATA = 'DATA',
  TEL = 'TEL',
  LINK = 'LINK',
  EMAIL = 'EMAIL',
  NUMBER = 'NUMBER'
}

export interface ITopicData {
  key: string;
  value: string;
  type: TOPIC_DATA_TYPE;
}

export interface ITopicMilestone {
  id: string;
  description: string;
  created: number;
  updated: number;
}

export class TopicMilestone implements ITopicMilestone {
  id: string;
  description: string;
  created: number;
  updated: number;

  constructor(milestone: Omit<ITopicMilestone, 'id' | 'created' | 'updated'>) {
    this.id = uuid4();
    this.description = milestone.description;
    this.created = Date.now();
    this.updated = Date.now();
  }
}

export interface ITopic {
  id: string;
  accountEmails: Array<string>;
  title: string;
  description: string;
  status: TOPIC_STATE;
  milestones: Array<ITopicMilestone>;
  data: Array<ITopicData>;
  created: number;
  updated: number;
}

export class Topic implements ITopic {
  id: string;
  accountEmails: Array<string>;
  title: string;
  description: string;
  status: TOPIC_STATE;
  data: Array<ITopicData>;
  milestones: Array<ITopicMilestone>;
  created: number;
  updated: number;

  constructor(topic: Omit<ITopic, 'id' | 'data' | 'milestones' | 'created' | 'updated'>) {
    this.id = uuid4();
    this.accountEmails = topic.accountEmails;
    this.title = topic.title;
    this.description = topic.description;
    this.status = topic.status;
    this.data = [];
    this.milestones = [];
    this.created = Date.now();
    this.updated = Date.now();
  }
}

export interface IGarbageTruckRecord {
  id: string;
  date: number;
  accountEmail: string;
  created: number;
}

export class GarbageTruckRecord implements IGarbageTruckRecord {
  id: string;
  date: number;
  accountEmail: string;
  created: number;

  constructor(record: Omit<IGarbageTruckRecord, 'id' | 'created'>) {
    this.id = uuid4();
    this.date = record.date;
    this.accountEmail = record.accountEmail;
    this.created = Date.now();
  }
}

export enum ACCOUNT_MESSAGE_TAG {
  STANDARD = 'STANDARD',
  IMPORTANT = 'IMPORTANT',
  SPAM = 'SPAM'
}

export interface IAccountMessage {
  id: string;
  from: string;
  to: Array<string>;
  read: boolean;
  archived: boolean;
  tag: ACCOUNT_MESSAGE_TAG;
  title: string;
  body: string | null;
  created: number;
}

export class AccountMessage implements IAccountMessage {
  id: string;
  from: string;
  to: Array<string>;
  read: boolean;
  archived: boolean;
  tag: ACCOUNT_MESSAGE_TAG;
  title: string;
  body: string | null;
  created: number;

  constructor(message: Omit<IAccountMessage, 'id' | 'created'>) {
    this.id = uuid4();
    this.from = message.from;
    this.to = message.to;
    this.read = message.read;
    this.archived = message.archived;
    this.tag = message.tag;
    this.title = message.title;
    this.body = message.body;
    this.created = Date.now();
  }
}
