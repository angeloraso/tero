import { inject, Injectable } from '@angular/core';
import { AuthService } from '@auth/auth.service';
import { ERROR, IUser, USER_ROLE } from '@core/model';
import { DatabaseService } from '@core/services';

@Injectable({ providedIn: 'root' })
export class UsersService {
  readonly #auth = inject(AuthService);
  readonly #database = inject(DatabaseService);

  getUsers = () => this.#database.getUsers();

  getCurrentUser = (): Promise<IUser> => {
    const userEmail = this.#auth.getEmail();
    if (!userEmail) {
      throw new Error(ERROR.AUTH_ERROR);
    }

    return this.#database.getCurrentUser(userEmail);
  };

  getUser = (email: string) => this.#database.getUser(email);

  postUser = (): Promise<void> => {
    const email = this.#auth.getEmail();
    if (!email) {
      throw new Error(ERROR.AUTH_ERROR);
    }

    return this.#database.postUser({ email, name: this.#auth.getName() || email, picture: this.#auth.getProfilePictureURL() });
  };

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
