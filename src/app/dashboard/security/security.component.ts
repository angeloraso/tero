import { Component, OnInit, inject } from '@angular/core';
import { PATH as APP_PATH } from '@app/app.routing';
import { SharedModules } from '@app/shared';
import {
  BIZY_SKELETON_SHAPE,
  BIZY_TAG_TYPE,
  BizyCopyToClipboardService,
  BizyLogService,
  BizyPopupService,
  BizyRouterService,
  BizyToastService,
  BizyTranslateService,
  LOADING_TYPE
} from '@bizy/core';
import { PopupComponent } from '@components/popup';
import { LOGO_PATH, WHATSAPP_URL } from '@core/constants';
import { ISecurityGuard, IUser, USER_ROLE } from '@core/model';
import {
  MobileService,
  NeighborsService,
  SecurityService,
  UsersService,
  UtilsService
} from '@core/services';
import { PATH as HOME_PATH } from '@home/home.routing';
import { HomeService } from '@home/home.service';
import { es } from './i18n';
import { PATH } from './security.routing';

interface IGroup {
  value: number;
  lots: Set<number>;
  fee: number;
  debt: boolean;
  user: IUser | null;
}

@Component({
    selector: 'tero-security',
    templateUrl: './security.html',
    styleUrls: ['./security.css'],
    imports: SharedModules
})
export class SecurityComponent implements OnInit {
  readonly #neighborsService = inject(NeighborsService);
  readonly #securityService = inject(SecurityService);
  readonly #utils = inject(UtilsService);
  readonly #popup = inject(BizyPopupService);
  readonly #translate = inject(BizyTranslateService);
  readonly #router = inject(BizyRouterService);
  readonly #log = inject(BizyLogService);
  readonly #toast = inject(BizyToastService);
  readonly #usersService = inject(UsersService);
  readonly #mobile = inject(MobileService);
  readonly #copyToClipboard = inject(BizyCopyToClipboardService);
  readonly #home = inject(HomeService);

  loading = false;
  showInfo = false;
  securityStaff: Array<ISecurityGuard> = Array.from({ length: 4 }, () => ({
    name: '',
    picture: '',
    description: ''
  }));
  securityFee: number = 0;
  groups: Array<IGroup> = Array.from({ length: 6 }, (_, i) => ({
    value: i + 1,
    lots: new Set(),
    fee: 0,
    debt: true,
    user: null
  }));
  members = 0;
  membershipFee = 0;
  isSecurity: boolean = false;
  readonly BIZY_TAG_TYPE = BIZY_TAG_TYPE;
  readonly LOGO_PATH = LOGO_PATH;
  readonly LOADING_TYPE = LOADING_TYPE;
  readonly BIZY_SKELETON_SHAPE = BIZY_SKELETON_SHAPE;

  async ngOnInit() {
    try {
      this.loading = true;
      this.#home.hideTabs();
      this.#translate.loadTranslations(es);
      const [isConfig, isNeighbor, isSecurity] = await Promise.all([
        this.#usersService.isConfig(),
        this.#usersService.isNeighbor(),
        this.#usersService.isSecurity()
      ]);

      this.isSecurity = isSecurity;

      this.showInfo = isNeighbor || isSecurity || isConfig;
      if (!this.showInfo) {
        return;
      }

      this.securityStaff = Array.from({ length: 4 }, () => ({
        name: '',
        picture: '',
        description: ''
      }));

      this.groups = Array.from({ length: 6 }, (_, i) => ({
        value: i + 1,
        lots: new Set(),
        fee: 0,
        debt: true,
        user: null
      }));
      this.members = 0;
      this.membershipFee = 0;
      const [neighbors, security, users] = await Promise.all([
        this.#neighborsService.getNeighbors(),
        this.#securityService.getSecurity(),
        this.#usersService.getUsers()
      ]);

      neighbors.forEach(_neighbor => {
        if (_neighbor.security && this.groups[_neighbor.group - 1] && _neighbor.lot) {
          this.groups[_neighbor.group - 1].lots.add(Number(_neighbor.lot));
        }
      });

      if (security) {
        this.securityStaff = security.staff;
        this.securityFee = security.fee;
        this.groups.forEach(_group => {
          this.members += _group.lots.size;

          if (security.invoices) {
            const date = new Date();
            date.setDate(1);
            date.setHours(0, 0, 0, 0);
            const startDate = date.getTime();
            date.setMonth(date.getMonth() + 1);
            date.setDate(0);
            date.setHours(23, 59, 59, 999);
            const endDate = date.getTime();
            _group.debt = !security.invoices.find(
              _invoice =>
                _invoice.group === _group.value &&
                _invoice.timestamp >= startDate &&
                _invoice.timestamp <= endDate
            );
          }
        });

        this.membershipFee = this.#utils.roundNumber(security.fee / this.members) ?? 0;
        this.groups = this.groups.map(_group => {
          const user = users.find(_user => this.#userIsAdmin(_user, _group));
          return {
            ..._group,
            fee: this.#utils.roundNumber(this.membershipFee * _group.lots.size),
            user: user || null
          };
        });
      }
    } catch (error) {
      this.#log.error({
        fileName: 'security.component',
        functionName: 'ngOnInit',
        param: error
      });
      this.#toast.danger();
    } finally {
      this.loading = false;
    }
  }

  goBack() {
    this.#router.goBack({ path: `/${APP_PATH.HOME}/${HOME_PATH.DASHBOARD}` });
  }

  async onCall(phone: string) {
    try {
      if (this.loading || !phone) {
        return;
      }

      await this.#mobile.call(phone);
    } catch (error) {
      this.#log.error({
        fileName: 'security.component',
        functionName: 'onCall',
        param: error
      });
      this.#toast.danger();
    }
  }

  onWhatsapp(phone: string) {
    if (this.loading || !phone) {
      return;
    }

    window.open(`${WHATSAPP_URL}${phone}`, '_blank');
  }

  goToSecurityInvoices() {
    if (this.loading) {
      return;
    }

    this.#router.goTo({ path: PATH.INVOICES });
  }

  goToSecurityGroup(group: IGroup) {
    if (this.loading || !group) {
      return;
    }

    this.#router.goTo({ path: String(group.value) });
  }

  async copyText(text: string) {
    try {
      await this.#copyToClipboard.copy(text);
      this.#toast.success();
    } catch (error) {
      this.#log.error({
        fileName: 'security.component',
        functionName: 'copyText',
        param: error
      });
      this.#toast.danger();
    }
  }

  setGroupDebt(group: IGroup) {
    if (this.loading || !group || !group.debt || !this.isSecurity) {
      return;
    }

    this.#popup.open<boolean>(
      {
        component: PopupComponent,
        data: {
          title: `${this.#translate.get('SECURITY.GROUPS.DEBT_POPUP.TITLE')} ${group.value}`,
          msg: this.#translate.get('SECURITY.GROUPS.DEBT_POPUP.MSG')
        }
      },
      async res => {
        try {
          if (res) {
            this.loading = true;
            await this.#securityService.postGroupInvoice(group.value);
            group.debt = false;
            this.groups = [...this.groups];
          }
        } catch (error) {
          this.#log.error({
            fileName: 'security.component',
            functionName: 'setGroupDebt',
            param: error
          });
          this.#toast.danger();
        } finally {
          this.loading = false;
        }
      }
    );
  }

  #userIsAdmin(user: IUser, group: IGroup): boolean {
    let isAdmin: boolean = false;

    switch (group.value) {
      case 1:
        isAdmin = user.roles.includes(USER_ROLE.SECURITY_GROUP_1);
        break;
      case 2:
        isAdmin = user.roles.includes(USER_ROLE.SECURITY_GROUP_2);
        break;
      case 3:
        isAdmin = user.roles.includes(USER_ROLE.SECURITY_GROUP_3);
        break;
      case 4:
        isAdmin = user.roles.includes(USER_ROLE.SECURITY_GROUP_4);
        break;
      case 6:
        isAdmin = user.roles.includes(USER_ROLE.SECURITY_GROUP_5);
        break;
      case 8:
        isAdmin = user.roles.includes(USER_ROLE.SECURITY_GROUP_6);
        break;
      default:
        break;
    }

    return isAdmin;
  }
}
