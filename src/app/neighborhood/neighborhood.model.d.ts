import { INeighbor } from '@core/model';

interface ILot {
  number: number;
  security: boolean;
  neighbors: Array<INeighbor>;
}
