import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { SharedModules } from '@app/shared';
import { BizyFilterPipe, BizyLogService, BizyPopupService, BizyToastService, BizyTranslateService } from '@bizy/core';
import { AuthService } from '@core/auth/auth.service';
import { USER_STATE } from '@core/model';
import { UsersService } from '@core/services';
import { es } from './i18n';

@Component({
  selector: 'tero-users-popup',
  templateUrl: 'users-popup.html',
  styleUrls: ['users-popup.css'],
  imports: SharedModules
})
export class UsersPopupComponent implements OnInit {
  readonly #popup = inject(BizyPopupService);
  readonly #usersService = inject(UsersService);
  readonly #ref = inject(ChangeDetectorRef);
  readonly #log = inject(BizyLogService);
  readonly #toast = inject(BizyToastService);
  readonly #filterPipe = inject(BizyFilterPipe);
  readonly #auth = inject(AuthService);
  readonly #translate = inject(BizyTranslateService);

  users: Array<{ value: string; email: string; selected: boolean }> = [];
  loading: boolean = false;
  search: string | number = '';
  searchKeys = ['value'];
  order: 'asc' | 'desc' = 'asc';
  orderBy = 'value';
  activatedFilters: number = 0;
  selectedUsers: number = 0;

  maxLimit: number = 0;

  async ngOnInit() {
    try {
      this.loading = true;
      this.#translate.loadTranslations(es);
      const users: Array<{ value: string; email: string; selected: boolean }> = [];
      const accountEmail = this.#auth.getEmail()!;
      const _users = await this.#usersService.getUsers();
      _users
        .filter(_user => _user.status === USER_STATE.ACTIVE && _user.email !== accountEmail)
        .forEach(_user => {
          users.push({
            email: _user.email,
            value: _user.name || _user.email,
            selected: false
          });
        });

      const data = this.#popup.getData<{ emails: Array<string>; maxLimit: number }>();
      if (data) {
        if (data.emails) {
          users.forEach(_user => {
            _user.selected = data.emails.includes(_user.email);
          });
        }

        if (data.maxLimit > 0) {
          this.maxLimit = data.maxLimit;
        }
      }

      this.selectedUsers = this.#filterPipe.transform(users, 'selected', true).length;
      this.users = users;
    } catch (error) {
      this.#log.error({
        fileName: 'users-popup.component',
        functionName: 'ngOnInit',
        param: error
      });
      this.#toast.danger();
    } finally {
      this.loading = false;
      this.#ref.detectChanges();
    }
  }

  checkFilters(activated: boolean) {
    if (activated) {
      this.activatedFilters++;
    } else if (this.activatedFilters > 0) {
      this.activatedFilters--;
    }
  }

  onSort() {
    this.order = this.order === 'asc' ? 'desc' : 'asc';
  }

  onRemoveFilters() {
    this.search = '';
    this.activatedFilters = 0;
    this.refresh();
  }

  refresh() {
    this.users = [...this.users];
  }

  selectUser(user: { value: string; email: string; selected: boolean }) {
    user.selected = !user.selected;
    this.selectedUsers = this.#filterPipe.transform(this.users, 'selected', true).length;
    this.refresh();
  }

  apply() {
    if (this.maxLimit !== 0 && this.selectedUsers > this.maxLimit) {
      return;
    }

    this.#popup.close({
      response: this.users
        .filter(_user => _user.selected)
        .map(_user => {
          return {
            email: _user.email,
            name: _user.value
          };
        })
    });
  }

  close() {
    this.#popup.close();
  }
}
