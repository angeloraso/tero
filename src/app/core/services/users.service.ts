import { inject, Injectable } from '@angular/core';
import { IUser, USER_ROLE } from '@core/model';
import { DatabaseService } from '@core/services';

@Injectable({ providedIn: 'root' })
export class UsersService {
  readonly #database = inject(DatabaseService);

  getUsers = () => this.#database.getUsers();

  getCurrentUser = () => this.#database.getCurrentUser();

  getUser = (email: string) => this.#database.getUser(email);

  postUser = () => this.#database.postUser();

  putUser = (user: IUser) => this.#database.putUser(user);

  async isAdmin() {
    try {
      const user = await this.getCurrentUser();
      return user.roles && user.roles.includes(USER_ROLE.ADMIN);
    } catch {
      return false;
    }
  }

  async isNeighbor() {
    try {
      const user = await this.getCurrentUser();
      return user.roles && (user.roles.includes(USER_ROLE.NEIGHBOR) || user.roles.includes(USER_ROLE.ADMIN));
    } catch {
      return false;
    }
  }

  async isSecurity() {
    try {
      const user = await this.getCurrentUser();
      return user.roles && (user.roles.includes(USER_ROLE.SECURITY) || user.roles.includes(USER_ROLE.ADMIN));
    } catch {
      return false;
    }
  }

  async isConfig() {
    try {
      const user = await this.getCurrentUser();
      return user.roles && (user.roles.includes(USER_ROLE.CONFIG) || user.roles.includes(USER_ROLE.ADMIN));
    } catch {
      return false;
    }
  }
}
