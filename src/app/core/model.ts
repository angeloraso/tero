import uuid4 from 'uuid4';
import { DEFAULT_USER_PICTURE } from './constants';

export interface IPhone {
  number: string;
  description: string;
}

export enum ERROR {
  ITEM_NOT_FOUND = 'ITEM_NOT_FOUND',
  AUTH_ERROR = 'AUTH_ERROR',
  NOT_SUPPORTED = 'NOT_SUPPORTED'
}

export enum USER_ROLE {
  NEIGHBOR = 'NEIGHBOR',
  ADMIN = 'ADMIN',
  SECURITY = 'SECURITY',
  CONFIG = 'CONFIG'
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
}

export interface INeighbor {
  id: string;
  lot: number;
  surname: string;
  name: string;
  security: boolean;
  picture: string;
  group: number;
  phones: Array<IPhone>;
  created: number;
  updated: number;
}

export class Neighbor implements INeighbor {
  id: string;
  lot: number;
  surname: string;
  name: string;
  group: number;
  security: boolean;
  picture: string;
  phones: Array<IPhone>;
  created: number;
  updated: number;

  constructor(neighbor: Omit<INeighbor, 'id'>) {
    this.id = uuid4();
    this.lot = neighbor.lot;
    this.group = neighbor.group;
    this.surname = neighbor.surname ?? '';
    this.name = neighbor.name ?? '';
    this.security = neighbor.security ?? false;
    this.picture = neighbor.picture ?? DEFAULT_USER_PICTURE;
    this.phones = neighbor.phones ?? [];
    this.created = Date.now();
    this.updated = Date.now();
  }
}

export interface ISecurityGuard {
  name: string;
  picture: string;
  description: string;
}

export interface ISecurityInvoice {
  timestamp: number;
  group: number;
}

export interface ISecurity {
  fee: number;
  staff: Array<ISecurityGuard>;
  invoices: Array<ISecurityInvoice>;
}

export type Rating = 1 | 2 | 3 | 4 | 5;

export interface IContactRating {
  accountId: string;
  description: string;
  value: Rating;
}

export interface IContact {
  id: string;
  accountId: string;
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
  accountId: string;
  name: string;
  surname: string;
  description: string;
  rating: Array<IContactRating>;
  picture: string;
  phones: Array<IPhone>;
  tags: Array<string>;
  created: number;
  updated: number;

  constructor(contact: Omit<IContact, 'id' | 'score'>) {
    this.id = uuid4();
    this.accountId = contact.accountId;
    this.name = contact.name ?? '';
    this.surname = contact.surname ?? '';
    this.description = contact.description ?? '';
    this.rating = contact.rating ?? [];
    this.picture = contact.picture ?? DEFAULT_USER_PICTURE;
    this.phones = contact.phones ?? [];
    this.tags = contact.tags ?? [];
    this.created = Date.now();
    this.updated = Date.now();
  }
}

export interface IEcommerceProduct {
  id: string;
  accountId: string;
  contactName: string;
  productName: string;
  price: number | null;
  description: string;
  pictures: Array<string>;
  phones: Array<IPhone>;
  tags: Array<string>;
  created: number;
  updated: number;
}

export class EcommerceProduct implements IEcommerceProduct {
  id: string;
  accountId: string;
  contactName: string;
  productName: string;
  description: string;
  price: number | null;
  pictures: Array<string>;
  phones: Array<IPhone>;
  tags: Array<string>;
  created: number;
  updated: number;

  constructor(product: Omit<IEcommerceProduct, 'id' | 'created' | 'updated'>) {
    this.id = uuid4();
    this.accountId = product.accountId;
    this.contactName = product.contactName;
    this.productName = product.productName;
    this.price = product.price ?? null;
    this.description = product.description ?? '';
    this.pictures = product.pictures ?? [];
    this.phones = product.phones ?? [];
    this.tags = product.tags ?? [];
    this.created = Date.now();
    this.updated = Date.now();
  }
}
