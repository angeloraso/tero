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

  constructor(neighbor: Omit<INeighbor, 'id' | 'timestamp'>) {
    this.id = uuid4();
    this.lot = neighbor.lot;
    this.surname = neighbor.surname ?? '';
    this.name = neighbor.name ?? '';
    this.security = neighbor.security ?? false;
    this.picture = neighbor.picture ?? DEFAULT_PICTURE;
    this.phones = neighbor.phones ?? [];
  }
}
