import { Inject, Injectable } from '@angular/core';
import { ROLE } from '@core/model';
import { DatabaseService } from '@core/services';

@Injectable({
  providedIn: 'root'
})
export class UserSettingsService {
  constructor(@Inject(DatabaseService) private database: DatabaseService) {}

  isAdmin() {
    return new Promise<boolean>(async resolve => {
      try {
        const roles = await this.database.getUserRoles();
        resolve(roles && roles.includes(ROLE.ADMIN));
      } catch {
        resolve(false);
      }
    });
  }

  isNeighbor() {
    return new Promise<boolean>(async resolve => {
      try {
        const roles = await this.database.getUserRoles();
        resolve(roles && (roles.includes(ROLE.NEIGHBOR) || roles.includes(ROLE.ADMIN)));
      } catch {
        resolve(false);
      }
    });
  }

  isSecurity() {
    return new Promise<boolean>(async resolve => {
      try {
        const roles = await this.database.getUserRoles();
        resolve(roles && (roles.includes(ROLE.SECURITY) || roles.includes(ROLE.ADMIN)));
      } catch {
        resolve(false);
      }
    });
  }

  isConfig() {
    return new Promise<boolean>(async resolve => {
      try {
        const roles = await this.database.getUserRoles();
        resolve(roles && (roles.includes(ROLE.CONFIG) || roles.includes(ROLE.ADMIN)));
      } catch {
        resolve(false);
      }
    });
  }

  getStatus() {
    return this.database.getUserStatus();
  }

  getRoles() {
    return this.database.getUserRoles();
  }

  getId() {
    return this.database.getUserId();
  }

  postUserSettings() {
    return new Promise<void>(async (resolve, reject) => {
      try {
        const userSettings = await this.database.getUserSettings();
        if (!userSettings) {
          await this.database.postUserSettings();
        }

        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }

  getPendingUsers() {
    return this.database.getPendingUsers();
  }

  acceptPendingUser(email: string) {
    return this.database.acceptPendingUser(email);
  }

  rejectPendingUser(email: string) {
    return this.database.rejectPendingUser(email);
  }
}
