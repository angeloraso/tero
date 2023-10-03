import uuid4 from 'uuid4';

export interface INeighbor {
  id: string;
  date: number;
  amount: number;
  balance: number;
}

export class Neighbor implements INeighbor {
  id: string;
  date: number;
  amount: number;
  balance: number;

  constructor(record: Omit<INeighbor, 'id'>) {
    this.id = uuid4();
    this.date = record.date;
    this.amount = record.amount;
    this.balance = record.balance;
  }
}

export enum COUNTRY_CODE {
  ARGENTINA = 'AR'
}

export interface IInflation {
  country: COUNTRY_CODE;
  from: number;
  to: number;
  value: number;
  fixedRate: number;
}
