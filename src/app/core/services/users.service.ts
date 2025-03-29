import { Inject, Injectable } from '@angular/core';
import { IUser, USER_ROLE } from '@core/model';
import { DatabaseService } from '@core/services';

@Injectable({
  providedIn: 'root'
})
export class UsersService {
  constructor(@Inject(DatabaseService) private database: DatabaseService) {}

  getUsers() {
    return this.database.getUsers();
  }

  getCurrentUser() {
    return this.database.getCurrentUser();
  }

  getUser(email: string) {
    return this.database.getUser(email);
  }

  postUser() {
    return this.database.postUser();
  }

  putUser(user: IUser) {
    return this.database.putUser(user);
  }

  async isAdmin() {
    const user = await this.getCurrentUser();
    return user.roles && user.roles.includes(USER_ROLE.ADMIN);
  }

  isNeighbor() {
    return new Promise<boolean>(async resolve => {
      try {
        const user = await this.getCurrentUser();
        resolve(user.roles && (user.roles.includes(USER_ROLE.NEIGHBOR) || user.roles.includes(USER_ROLE.ADMIN)));
      } catch {
        resolve(false);
      }
    });
  }

  isSecurity() {
    return new Promise<boolean>(async resolve => {
      try {
        const user = await this.getCurrentUser();
        resolve(user.roles && (user.roles.includes(USER_ROLE.SECURITY) || user.roles.includes(USER_ROLE.ADMIN)));
      } catch {
        resolve(false);
      }
    });
  }

  isConfig() {
    return new Promise<boolean>(async resolve => {
      try {
        const user = await this.getCurrentUser();
        resolve(user.roles && (user.roles.includes(USER_ROLE.CONFIG) || user.roles.includes(USER_ROLE.ADMIN)));
      } catch {
        resolve(false);
      }
    });
  }
}
