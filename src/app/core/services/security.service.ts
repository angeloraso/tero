import { Inject, Injectable } from '@angular/core';
import { ISecurity, ISecurityInvoice } from '@core/model';
import { DatabaseService } from './database.service';

@Injectable({
  providedIn: 'root'
})
export class SecurityService {
  constructor(@Inject(DatabaseService) private database: DatabaseService) {}

  getSecurity() {
    return new Promise<ISecurity | null>(async (resolve, reject) => {
      try {
        const security = await this.database.getSecurity();
        resolve(security);
      } catch (error) {
        reject(error);
      }
    });
  }

  postGroupInvoice(group: number) {
    return this.database.postSecurityGroupInvoice({ group, timestamp: Date.now() });
  }

  deleteGroupInvoice(invoice: ISecurityInvoice) {
    return this.database.deleteSecurityGroupInvoice(invoice);
  }

  postNeighborInvoice(data: { neighborId: string; group: number; transactionId?: string }) {
    return this.database.postSecurityNeighborInvoice({
      neighborId: data.neighborId,
      group: data.group,
      transactionId: data.transactionId || null,
      timestamp: Date.now()
    });
  }
}
