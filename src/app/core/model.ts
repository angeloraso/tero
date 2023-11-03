import uuid4 from 'uuid4';
import { DEFAULT_PICTURE } from './constants';

export interface INeighbor {
  id: string;
  lot: number;
  surname: string;
  name: string;
  security: boolean;
  picture: string;
  phones: Array<IPhone>;
}

export interface IPhone {
  number: string;
  description: string;
}

export type Empty = undefined | null;

export class Neighbor implements INeighbor {
  id: string;
  lot: number;
  surname: string;
  name: string;
  security: boolean;
  picture: string;
  phones: Array<IPhone>;

  constructor(neighbor: Omit<INeighbor, 'id'>) {
    this.id = uuid4();
    this.lot = neighbor.lot;
    this.surname = neighbor.surname ?? '';
    this.name = neighbor.name ?? '';
    this.security = neighbor.security ?? false;
    this.picture = neighbor.picture ?? DEFAULT_PICTURE;
    this.phones = neighbor.phones ?? [];
  }
}

export interface ISecurityGuard {
  name: string;
  picture: string;
  description: string;
}

export interface ISecuritySettings {
  fee: number;
  staff: Array<ISecurityGuard>;
}

export interface IContact {
  id: string;
  name: string;
  surname: string;
  description: string;
  picture: string;
  phones: Array<IPhone>;
  score: number;
}

export class Contact implements IContact {
  id: string;
  name: string;
  surname: string;
  description: string;
  picture: string;
  phones: Array<IPhone>;
  score: number;

  constructor(contact: Omit<IContact, 'id' | 'score'>) {
    this.id = uuid4();
    this.name = contact.name ?? '';
    this.surname = contact.surname ?? '';
    this.description = contact.description ?? false;
    this.picture = contact.picture ?? DEFAULT_PICTURE;
    this.phones = contact.phones ?? [];
    this.score = 0;
  }
}
