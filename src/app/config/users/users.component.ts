import { Component, Inject, OnInit } from '@angular/core';
import { PATH as APP_PATH } from '@app/app.routing';
import { BIZY_TAG_TYPE, BizyFilterPipe } from '@bizy/components';
import { BizyOrderByPipe, BizySearchPipe } from '@bizy/pipes';
import {
  BizyCopyToClipboardService,
  BizyExportToCSVService,
  BizyLogService,
  BizyRouterService,
  BizyToastService,
  BizyTranslateService
} from '@bizy/services';
import { PATH as CONFIG_PATH } from '@config/config.routing';
import { WHATSAPP_URL } from '@core/constants';
import { IUser, USER_ROLE, USER_STATE } from '@core/model';
import { MobileService, UsersService } from '@core/services';
import { PATH as HOME_PATH } from '@home/home.routing';

interface IUserCard extends IUser {
  _status: string;
  _roles: Array<string>;
  _isAdmin: boolean;
}

@Component({
  selector: 'tero-users',
  templateUrl: './users.html',
  styleUrls: ['./users.css']
})
export class UsersComponent implements OnInit {
  loading = false;
  csvLoading = false;
  isNeighbor = false;
  isConfig = false;
  users: Array<IUserCard> = [];
  search: string | number = '';
  searchKeys = ['name', 'email', '_status', '_roles'];
  order: 'asc' | 'desc' = 'asc';
  orderBy = 'name';
  isMobile = true;
  filterStates: Array<{ id: string; value: string; selected: boolean }> = [];
  filterRoles: Array<{ id: string; value: string; selected: boolean }> = [];
  activatedFilters: number = 0;

  readonly BIZY_TAG_TYPE = BIZY_TAG_TYPE;
  readonly USER_STATE = USER_STATE;

  constructor(
    @Inject(BizyRouterService) private router: BizyRouterService,
    @Inject(BizyLogService) private log: BizyLogService,
    @Inject(BizyToastService) private toast: BizyToastService,
    @Inject(BizyTranslateService) private translate: BizyTranslateService,
    @Inject(MobileService) private mobile: MobileService,
    @Inject(BizyCopyToClipboardService) private bizyCopyToClipboard: BizyCopyToClipboardService,
    @Inject(BizyExportToCSVService) private exportToCSV: BizyExportToCSVService,
    @Inject(BizyFilterPipe) private bizyFilterPipe: BizyFilterPipe,
    @Inject(BizySearchPipe) private bizySearchPipe: BizySearchPipe,
    @Inject(BizyOrderByPipe) private bizyOrderByPipe: BizyOrderByPipe,
    @Inject(UsersService) private usersService: UsersService
  ) {
    this.isMobile = this.mobile.isMobile();
  }

  async ngOnInit() {
    try {
      this.loading = true;
      const [users, isConfig, isNeighbor] = await Promise.all([
        this.usersService.getUsers(),
        this.usersService.isConfig(),
        this.usersService.isNeighbor()
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
          _status: this.translate.get(`CORE.USER_STATE.${_user.status}`),
          _roles: _user.roles.map(_role => this.translate.get(`CORE.USER_ROLE.${_role}`))
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
      this.log.error({
        fileName: 'users.component',
        functionName: 'ngOnInit',
        param: error
      });
      this.toast.danger();
    } finally {
      this.loading = false;
    }
  }

  editUser(user: IUserCard) {
    if (this.loading || !user || !user.email || !this.isConfig) {
      return;
    }

    this.router.goTo({
      path: `/${APP_PATH.HOME}/${HOME_PATH.CONFIG}/${CONFIG_PATH.USERS}/${user.email}`
    });
  }

  async onCall(user: IUserCard) {
    try {
      if (this.loading || !user.phone) {
        return;
      }

      await this.mobile.call(user.phone);
    } catch (error) {
      this.log.error({
        fileName: 'users.component',
        functionName: 'onCall',
        param: error
      });
      this.toast.danger();
    }
  }

  async copyText(text: string) {
    try {
      await this.bizyCopyToClipboard.copy(text);
      this.toast.success();
    } catch (error) {
      this.log.error({
        fileName: 'users.component',
        functionName: 'copyText',
        param: error
      });
      this.toast.danger();
    }
  }

  onWhatsapp(user: IUserCard) {
    if (this.loading || !user.phone) {
      return;
    }

    window.open(`${WHATSAPP_URL}${user.phone}`, '_blank');
  }

  goBack() {
    this.router.goBack();
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
      if (
        this.csvLoading ||
        this.loading ||
        !this.users ||
        this.users.length === 0 ||
        !this.isConfig
      ) {
        return;
      }

      this.csvLoading = true;

      const items = this.#filter(this.users);

      const fileName = this.translate.get('USERS.CSV_FILE_NAME');
      const model = {
        name: this.translate.get('CORE.FORM.FIELD.NAME'),
        email: this.translate.get('CORE.FORM.FIELD.EMAIL'),
        _status: this.translate.get('CORE.FORM.FIELD.STATE'),
        _roles: this.translate.get('CORE.FORM.FIELD.ROLE')
      };

      if (this.isMobile) {
        const csv = this.exportToCSV.getCSV({ items, model });
        await this.mobile.downloadFile({ data: csv, name: fileName });
      } else {
        this.exportToCSV.download({ items, model, fileName });
      }
    } catch (error) {
      this.log.error({
        fileName: 'users.component',
        functionName: 'export',
        param: error
      });
      this.toast.danger({
        title: 'Error',
        msg: `${this.translate.get('CORE.FORM.ERROR.APP')}: Excel, Spreadsheet, etc`
      });
    } finally {
      this.csvLoading = false;
    }
  }

  #filter(items: Array<IUserCard>): Array<IUserCard> {
    let _items = this.bizySearchPipe.transform(items, this.search, this.searchKeys);
    _items = this.bizyFilterPipe.transform(_items, 'status', this.filterStates);
    _items = this.bizyOrderByPipe.transform(_items, this.order, this.orderBy);
    return _items;
  }
}
