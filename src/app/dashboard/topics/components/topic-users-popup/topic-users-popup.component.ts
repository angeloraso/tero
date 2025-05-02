import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { SharedModules } from '@app/shared';
import { BizyFilterPipe, BizyLogService, BizyPopupService, BizyToastService } from '@bizy/core';
import { AuthService } from '@core/auth/auth.service';
import { USER_STATE } from '@core/model';
import { UsersService } from '@core/services';
@Component({
  selector: 'tero-topic-users-popup',
  templateUrl: 'topic-users-popup.html',
  styleUrls: ['topic-users-popup.css'],
  imports: SharedModules
})
export class TopicUsersPopupComponent implements OnInit {
  readonly #popup = inject(BizyPopupService);
  readonly #usersService = inject(UsersService);
  readonly #ref = inject(ChangeDetectorRef);
  readonly #log = inject(BizyLogService);
  readonly #toast = inject(BizyToastService);
  readonly #filterPipe = inject(BizyFilterPipe);
  readonly #auth = inject(AuthService);

  users: Array<{ value: string; email: string; selected: boolean }> = [];
  loading: boolean = false;
  search: string | number = '';
  searchKeys = ['value'];
  order: 'asc' | 'desc' = 'asc';
  orderBy = 'value';
  activatedFilters: number = 0;
  selectedUsers: number = 0;

  readonly MAX_LIMIT: number = 2;

  async ngOnInit() {
    try {
      this.loading = true;
      this.users.length = 0;
      const accountEmail = this.#auth.getEmail()!;
      const users = await this.#usersService.getUsers();
      users
        .filter(_user => _user.status === USER_STATE.ACTIVE)
        .forEach(_user => {
          if (_user.email !== accountEmail) {
            this.users.push({
              email: _user.email,
              value: _user.name || _user.email,
              selected: false
            });
          }
        });

      const data = this.#popup.getData<{ userEmails: Array<string> }>();
      if (data && data.userEmails) {
        this.users.forEach(_user => {
          _user.selected = data.userEmails.includes(_user.email);
        });
      }

      this.selectedUsers = this.#filterPipe.transform(this.users, 'selected', true).length;
    } catch (error) {
      this.#log.error({
        fileName: 'topic-users-popup.component',
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
    if (this.selectedUsers > this.MAX_LIMIT) {
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
