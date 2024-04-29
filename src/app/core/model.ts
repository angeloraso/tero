import uuid4 from 'uuid4';
import { DEFAULT_PICTURE } from './constants';

export interface IPhone {
  number: string;
  description: string;
}

export enum ROLE {
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  NEIGHBOR = 'NEIGHBOR',
  INVITED = 'INVITED'
}

export interface IUserSettings {
  roles: Array<ROLE>;
}

export type Empty = undefined | null;

export interface INeighbor {
  id: string;
  lot: number;
  surname: string;
  name: string;
  security: boolean;
  picture: string;
  phones: Array<IPhone>;
  created: number;
  updated: number;
}

export class Neighbor implements INeighbor {
  id: string;
  lot: number;
  surname: string;
  name: string;
  security: boolean;
  picture: string;
  phones: Array<IPhone>;
  created: number;
  updated: number;

  constructor(neighbor: Omit<INeighbor, 'id'>) {
    this.id = uuid4();
    this.lot = neighbor.lot;
    this.surname = neighbor.surname ?? '';
    this.name = neighbor.name ?? '';
    this.security = neighbor.security ?? false;
    this.picture = neighbor.picture ?? DEFAULT_PICTURE;
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

export interface ISecurity {
  fee: number;
  staff: Array<ISecurityGuard>;
}

export interface IContact {
  id: string;
  name: string;
  surname: string;
  comments: Array<string>;
  picture: string;
  phones: Array<IPhone>;
  score: Array<number>;
  tags: Array<string>;
  created: number;
  updated: number;
}

export class Contact implements IContact {
  id: string;
  name: string;
  surname: string;
  comments: Array<string>;
  picture: string;
  phones: Array<IPhone>;
  score: Array<number>;
  tags: Array<string>;
  created: number;
  updated: number;

  constructor(contact: Omit<IContact, 'id' | 'score'>) {
    this.id = uuid4();
    this.name = contact.name ?? '';
    this.surname = contact.surname ?? '';
    this.comments = contact.comments ?? [];
    this.picture = contact.picture ?? DEFAULT_PICTURE;
    this.phones = contact.phones ?? [];
    this.tags = contact.tags ?? [];
    this.score = [];
    this.created = Date.now();
    this.updated = Date.now();
  }
}

export interface IContactTag {
  id: string;
  value: string;
  selected: boolean;
}
