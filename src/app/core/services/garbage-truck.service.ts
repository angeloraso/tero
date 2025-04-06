import { inject, Injectable } from '@angular/core';
import { GarbageTruckRecord } from '@core/model';
import { DatabaseService } from '@core/services';

@Injectable({ providedIn: 'root' })
export class GarbageTruckService {
  readonly #database = inject(DatabaseService);

  getRecords = () => this.#database.getGarbageTruckRecords();

  postRecord = (data: { accountEmail: string; date: number }) =>
    this.#database.postGarbageTruckRecord(new GarbageTruckRecord({ accountEmail: data.accountEmail, date: data.date }));
}
