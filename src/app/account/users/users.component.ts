import { PATH as ACCOUNT_PATH } from '@account/account.routing';
import { Component, inject, OnInit } from '@angular/core';
import { PATH as APP_PATH } from '@app/app.routing';
import { SharedModules } from '@app/shared';
import {
  BIZY_SKELETON_SHAPE,
  BIZY_TAG_TYPE,
  BizyCopyToClipboardService,
  BizyExportToCSVService,
  BizyFilterPipe,
  BizyLogService,
  BizyOrderByPipe,
  BizyRouterService,
  BizySearchPipe,
  BizyToastService,
  BizyTranslateService
} from '@bizy/core';
import { WHATSAPP_URL } from '@core/constants';
import { IUser, USER_ROLE, USER_STATE } from '@core/model';
import { MobileService, UsersService } from '@core/services';
import { ENV } from '@env/environment';
import { PATH as HOME_PATH } from '@home/home.routing';
import { HomeService } from '@home/home.service';
import { es } from './i18n';

interface IUserCard extends IUser {
  _status: string;
  _roles: Array<string>;
  _isAdmin: boolean;
}

@Component({
  selector: 'tero-users',
  templateUrl: './users.html',
  styleUrls: ['./users.css'],
  imports: SharedModules
})
export class UsersComponent implements OnInit {
  readonly #router = inject(BizyRouterService);
  readonly #log = inject(BizyLogService);
  readonly #toast = inject(BizyToastService);
  readonly #translate = inject(BizyTranslateService);
  readonly #mobile = inject(MobileService);
  readonly #exportToCSV = inject(BizyExportToCSVService);
  readonly #copyToClipboard = inject(BizyCopyToClipboardService);
  readonly #searchPipe = inject(BizySearchPipe);
  readonly #filterPipe = inject(BizyFilterPipe);
  readonly #orderByPipe = inject(BizyOrderByPipe);
  readonly #usersService = inject(UsersService);
  readonly #home = inject(HomeService);

  loading = false;
  csvLoading = false;
  isNeighbor = false;
  isConfig = false;
  users: Array<IUserCard> = [];
  search: string | number = '';
  searchKeys = ['name', 'email', '_status', '_roles'];
  order: 'asc' | 'desc' = 'asc';
  orderBy = 'name';
  filterStates: Array<{ id: string; value: string; selected: boolean }> = [];
  filterRoles: Array<{ id: string; value: string; selected: boolean }> = [];
  activatedFilters: number = 0;

  readonly BIZY_TAG_TYPE = BIZY_TAG_TYPE;
  readonly BIZY_SKELETON_SHAPE = BIZY_SKELETON_SHAPE;
  readonly USER_STATE = USER_STATE;

  async ngOnInit() {
    try {
      this.loading = true;
      this.#home.hideTabs();
      this.#translate.loadTranslations(es);
      const [users, isConfig, isNeighbor] = await Promise.all([
        this.#usersService.getUsers(),
        this.#usersService.isConfig(),
        this.#usersService.isNeighbor()
      ]);

      this.isConfig = isConfig;
      this.isNeighbor = isNeighbor;

      const states: Set<USER_STATE> = new Set();
      const roles: Set<USER_ROLE> = new Set();

      this.users = users.map(_user => {
        states.add(_user.status);
        if (_user.roles) {
          _user.roles.forEach(_role => {
            roles.add(_role);
          });
        }

        return {
          ..._user,
          _isAdmin: _user.roles && _user.roles.includes(USER_ROLE.ADMIN),
          _status: this.#translate.get(`CORE.USER_STATE.${_user.status}`),
          _roles: _user.roles.map(_role => this.#translate.get(`CORE.USER_ROLE.${_role}`))
        };
      });

      this.filterStates = Array.from(states).map(_state => {
        return {
          id: _state,
          value: `CORE.USER_STATE.${_state}`,
          selected: _state !== USER_STATE.REJECTED
        };
      });

      this.filterRoles = Array.from(roles).map(_role => {
        return { id: _role, value: `CORE.USER_ROLE.${_role}`, selected: true };
      });
    } catch (error) {
      this.#log.error({
        fileName: 'users.component',
        functionName: 'ngOnInit',
        param: error
      });
      this.#toast.danger();
    } finally {
      this.loading = false;
    }
  }

  editUser(user: IUserCard) {
    if (this.loading || !user || !user.email || !this.isConfig) {
      return;
    }

    this.#router.goTo({
      path: `/${APP_PATH.HOME}/${HOME_PATH.ACCOUNT}/${ACCOUNT_PATH.USERS}/${user.email}`
    });
  }

  async onCall(user: IUserCard) {
    try {
      if (this.loading || !user.phone) {
        return;
      }

      await this.#mobile.call(user.phone);
    } catch (error) {
      this.#log.error({
        fileName: 'users.component',
        functionName: 'onCall',
        param: error
      });
      this.#toast.danger();
    }
  }

  async copyText(text: string) {
    try {
      await this.#copyToClipboard.copy(text);
      this.#toast.success();
    } catch (error) {
      this.#log.error({
        fileName: 'users.component',
        functionName: 'copyText',
        param: error
      });
      this.#toast.danger();
    }
  }

  onWhatsapp(user: IUserCard) {
    if (this.loading || !user.phone) {
      return;
    }

    window.open(`${WHATSAPP_URL}${user.phone}`, '_blank');
  }

  goBack() {
    this.#router.goBack({ path: `/${APP_PATH.HOME}/${HOME_PATH.ACCOUNT}` });
  }

  checkFilters(activated: boolean) {
    if (activated) {
      this.activatedFilters++;
    } else if (this.activatedFilters > 0) {
      this.activatedFilters--;
    }
  }

  onRemoveFilters() {
    this.search = '';
    this.filterStates.forEach(_state => {
      _state.selected = true;
    });
    this.activatedFilters = 0;
    this.refresh();
  }

  refresh() {
    this.users = [...this.users];
  }

  async export() {
    try {
      if (this.csvLoading || this.loading || !this.users || this.users.length === 0 || !this.isConfig) {
        return;
      }

      this.csvLoading = true;

      const items = this.#filter(this.users);

      const fileName = this.#translate.get('USERS.CSV_FILE_NAME');
      const model = {
        name: this.#translate.get('CORE.FORM.FIELD.NAME'),
        email: this.#translate.get('CORE.FORM.FIELD.EMAIL'),
        _status: this.#translate.get('CORE.FORM.FIELD.STATE'),
        _roles: this.#translate.get('CORE.FORM.FIELD.ROLE')
      };

      if (ENV.mobile) {
        const csv = this.#exportToCSV.getCSV({ items, model });
        await this.#mobile.downloadFile({ data: csv, name: fileName });
      } else {
        this.#exportToCSV.download({ items, model, fileName });
      }
    } catch (error) {
      this.#log.error({
        fileName: 'users.component',
        functionName: 'export',
        param: error
      });
      this.#toast.danger({
        title: 'Error',
        msg: `${this.#translate.get('CORE.FORM.ERROR.APP')}: Excel, Spreadsheet, etc`
      });
    } finally {
      this.csvLoading = false;
    }
  }

  #filter(items: Array<IUserCard>): Array<IUserCard> {
    let _items = this.#searchPipe.transform(items, this.search, this.searchKeys);
    _items = this.#filterPipe.transform(_items, 'status', this.filterStates);
    _items = this.#orderByPipe.transform(_items, this.order, this.orderBy);
    return _items;
  }
}
