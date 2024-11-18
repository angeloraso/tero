import { INeighbor } from '@core/model';

interface ILot {
  number: number;
  neighbors: Array<INeighbor>;
  cadastralNumber: number;
  district: number;
  cadastralJurisdiction: number;
  section: string;
  subdivision: number;
  block: string;
  parcel: number;
}
