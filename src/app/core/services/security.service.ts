import { inject, Injectable } from '@angular/core';
import { ISecurityInvoice, ISecurityNeighborInvoice } from '@core/model';
import { DatabaseService } from './database.service';

@Injectable({ providedIn: 'root' })
export class SecurityService {
  readonly #database = inject(DatabaseService);

  getSecurity = () => this.#database.getSecurity();

  postGroupInvoice = (group: number) => this.#database.postSecurityGroupInvoice({ group, timestamp: Date.now() });

  deleteGroupInvoice = (invoice: ISecurityInvoice) => this.#database.deleteSecurityGroupInvoice(invoice);

  deleteNeighborInvoice = (invoice: ISecurityNeighborInvoice) => this.#database.deleteSecurityNeighborInvoice(invoice);

  postNeighborInvoice = (data: { neighborId: string; group: number; description?: string; transactionId?: string }) =>
    this.#database.postSecurityNeighborInvoice({
      neighborId: data.neighborId,
      group: data.group,
      description: data.description || null,
      transactionId: data.transactionId || null,
      timestamp: Date.now()
    });
}
