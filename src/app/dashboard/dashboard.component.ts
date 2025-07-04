import { Component, inject, OnInit } from '@angular/core';
import { SharedModules } from '@app/shared';
import { AuthService } from '@auth/auth.service';
import {
  BIZY_SKELETON_SHAPE,
  BIZY_TAG_TYPE,
  BizyLogService,
  BizyPopupService,
  BizyRouterService,
  BizyToastService,
  BizyTranslateService,
  LOADING_TYPE
} from '@bizy/core';
import { PopupComponent } from '@components/popup';
import { LOGO_PATH, TOPIC_SUBSCRIPTION } from '@core/constants';
import { ERROR, IEcommerceProduct, ITopic, TOPIC_STATE } from '@core/model';
import {
  EcommerceService,
  GarbageTruckService,
  MobileService,
  NeighborsService,
  SecurityService,
  TopicsService,
  UsersService,
  UtilsService
} from '@core/services';
import { HomeService } from '@home/home.service';
import { PATH } from './dashboard.routing';
import { es } from './i18n';

interface IGroup {
  value: number;
  lots: Set<number>;
  fee: number;
  debt: boolean;
}
@Component({
  selector: 'tero-dashboard',
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css'],
  imports: SharedModules
})
export class DashboardComponent implements OnInit {
  readonly #neighborsService = inject(NeighborsService);
  readonly #securityService = inject(SecurityService);
  readonly #ecommerceService = inject(EcommerceService);
  readonly #topicsService = inject(TopicsService);
  readonly #garbageTruckService = inject(GarbageTruckService);
  readonly #auth = inject(AuthService);
  readonly #utils = inject(UtilsService);
  readonly #popup = inject(BizyPopupService);
  readonly #translate = inject(BizyTranslateService);
  readonly #router = inject(BizyRouterService);
  readonly #log = inject(BizyLogService);
  readonly #toast = inject(BizyToastService);
  readonly #mobile = inject(MobileService);
  readonly #usersService = inject(UsersService);
  readonly #home = inject(HomeService);

  loading: boolean = false;
  showNoPermissions: boolean = false;
  securityFee: number | null = null;
  groups: Array<IGroup> = Array.from({ length: 6 }, (_, i) => ({
    value: i + 1,
    lots: new Set(),
    fee: 0,
    debt: true
  }));
  members = 0;
  membershipFee = 0;
  isSecurity: boolean = false;
  products: Array<IEcommerceProduct> = [];
  topics: Array<ITopic> = [];
  isConfig: boolean = false;
  isNeighbor: boolean = false;
  securityNoDebt: boolean = false;
  readonly BIZY_TAG_TYPE = BIZY_TAG_TYPE;
  readonly BIZY_SKELETON_SHAPE = BIZY_SKELETON_SHAPE;
  readonly LOGO_PATH = LOGO_PATH;
  readonly LOADING_TYPE = LOADING_TYPE;

  async ngOnInit() {
    try {
      this.loading = true;
      this.#home.showTabs();
      this.#translate.loadTranslations(es);
      const [isConfig, isNeighbor, isSecurity, products, topics] = await Promise.all([
        this.#usersService.isConfig(),
        this.#usersService.isNeighbor(),
        this.#usersService.isSecurity(),
        this.#ecommerceService.getProducts(),
        this.#topicsService.getTopics()
      ]);

      this.isSecurity = isSecurity;
      this.isNeighbor = isNeighbor;
      this.isConfig = isConfig;
      this.products = products;
      this.topics = topics.filter(_topic => _topic.status !== TOPIC_STATE.CLOSED);

      if (!isNeighbor && !isSecurity && !isConfig) {
        this.showNoPermissions = true;
        return;
      }

      this.groups = Array.from({ length: 6 }, (_, i) => ({
        value: i + 1,
        lots: new Set(),
        fee: 0,
        debt: true
      }));
      this.members = 0;
      this.membershipFee = 0;
      const [neighbors, security] = await Promise.all([this.#neighborsService.getNeighbors(), this.#securityService.getSecurity()]);

      neighbors.forEach(_neighbor => {
        if (_neighbor.security && this.groups[_neighbor.group - 1]) {
          this.groups[_neighbor.group - 1].lots.add(Number(_neighbor.lot));
        }
      });

      if (security) {
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
              _invoice => _invoice.group === _group.value && _invoice.timestamp >= startDate && _invoice.timestamp <= endDate
            );
          }
        });

        this.membershipFee = this.#utils.roundNumber(security.fee / this.members) ?? 0;
        this.groups = this.groups.map(_group => {
          return { ..._group, fee: this.#utils.roundNumber(this.membershipFee * _group.lots.size) };
        });

        this.securityNoDebt = !this.groups.find(_group => _group.debt);
      }
    } catch (error) {
      this.#log.error({
        fileName: 'dashboard.component',
        functionName: 'ngOnInit',
        param: error
      });
      this.#toast.danger();
    } finally {
      this.loading = false;
    }
  }

  showGarbageTruckPopup() {
    if (this.loading || (!this.isNeighbor && !this.isConfig)) {
      return;
    }

    this.#popup.open<boolean>(
      {
        component: PopupComponent,
        data: {
          title: this.#translate.get('DASHBOARD.GARBAGE_TRUCK_POPUP.TITLE'),
          msg: this.#translate.get('DASHBOARD.GARBAGE_TRUCK_POPUP.MSG')
        }
      },
      async res => {
        try {
          if (res) {
            this.loading = true;
            const accountEmail = this.#auth.getEmail();
            if (!accountEmail) {
              throw new Error();
            }

            const date = new Date();
            date.setHours(0, 0, 0, 0);

            await this.#garbageTruckService.postRecord({ accountEmail, date: date.getTime() });

            await this.#mobile.sendPushNotification({
              topicId: TOPIC_SUBSCRIPTION.GARBAGE,
              title: this.#translate.get('DASHBOARD.GARBAGE_NOTIFICATION.TITLE'),
              body: this.#translate.get('DASHBOARD.GARBAGE_NOTIFICATION.BODY')
            });

            this.#toast.success(this.#translate.get('DASHBOARD.GARBAGE_TRUCK_MSG'));
          }
        } catch (error) {
          this.#log.error({
            fileName: 'dashboard.component',
            functionName: 'showGarbageTruckPopup',
            param: error
          });

          if (error instanceof Error && error.message === ERROR.ITEM_ALREADY_EXISTS) {
            this.#toast.info(this.#translate.get('DASHBOARD.GARBAGE_TRUCK_MSG'));
            return;
          }

          if (error instanceof Error && error.message === ERROR.NOTIFICATION_PERMISSIONS) {
            this.#toast.warning(this.#translate.get('CORE.ERROR.NOTIFICATION_PERMISSIONS'));
            return;
          }

          this.#toast.danger();
        } finally {
          this.loading = false;
        }
      }
    );
  }

  goToGarbageHistory() {
    if (this.loading || (!this.isNeighbor && !this.isConfig)) {
      return;
    }

    this.#router.goTo({ path: PATH.GARBAGE_HISTORY });
  }

  goToSecurity() {
    if (this.loading || (!this.isNeighbor && !this.isConfig && !this.isSecurity)) {
      return;
    }

    this.#router.goTo({ path: PATH.SECURITY });
  }

  goToEcommerce() {
    if (this.loading || (!this.isNeighbor && !this.isConfig)) {
      return;
    }

    this.#router.goTo({ path: PATH.ECOMMERCE });
  }

  goToTopics() {
    if (this.loading || (!this.isNeighbor && !this.isConfig)) {
      return;
    }

    this.#router.goTo({ path: PATH.TOPICS });
  }

  registerGroupPayment(group: IGroup, event: PointerEvent) {
    if (this.loading || !group || !group.debt || !this.isSecurity) {
      return;
    }

    event.stopPropagation();
    this.#popup.open<boolean>(
      {
        component: PopupComponent,
        data: {
          title: `${this.#translate.get('DASHBOARD.SECURITY.GROUP_DEBT_POPUP.TITLE')} ${group.value}`,
          msg: this.#translate.get('DASHBOARD.SECURITY.GROUP_DEBT_POPUP.MSG')
        }
      },
      async res => {
        try {
          if (res) {
            this.loading = true;
            await this.#securityService.postGroupInvoice(group.value);
            group.debt = false;
            this.groups = [...this.groups];
            await this.#mobile.sendPushNotification({
              topicId: `${TOPIC_SUBSCRIPTION.GROUP_SECURITY_INVOICE}${group.value}`,
              title: this.#translate.get('DASHBOARD.SECURITY.GROUP_INVOICE_NOTIFICATION.TITLE'),
              body: `${this.#translate.get('DASHBOARD.SECURITY.GROUP_INVOICE_NOTIFICATION.BODY')} ${group.value}`
            });
          }
        } catch (error) {
          this.#log.error({
            fileName: 'dashboard.component',
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
}
