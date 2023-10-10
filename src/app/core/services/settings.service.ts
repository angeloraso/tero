import { Inject, Injectable } from '@angular/core';
import { ISecuritySettings } from '@core/model';
import { DatabaseService, SETTINGS_ID } from './database.service';

@Injectable()
export class SettingsService {
  constructor(@Inject(DatabaseService) private database: DatabaseService) {}

  getSecurity() {
    return new Promise<ISecuritySettings | null>(async (resolve, reject) => {
      try {
        const settings = await this.database.getSettings(SETTINGS_ID.SECURITY);
        resolve(<ISecuritySettings | null>settings);
      } catch (error) {
        reject(error);
      }
    });
  }
}
