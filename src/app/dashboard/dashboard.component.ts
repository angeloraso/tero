import { Component, inject, OnInit } from '@angular/core';
import { BIZY_TAG_TYPE } from '@bizy/components';
import { LOADING_TYPE } from '@bizy/directives';
import {
  BizyLogService,
  BizyPopupService,
  BizyRouterService,
  BizyToastService,
  BizyTranslateService
} from '@bizy/services';
import { AuthService } from '@core/auth/auth.service';
import { LOGO_PATH } from '@core/constants';
import { IEcommerceProduct, ITopic } from '@core/model';
import {
  EcommerceService,
  GarbageTruckService,
  NeighborsService,
  SecurityService,
  UsersService,
  UtilsService
} from '@core/services';
import { PopupComponent } from '@shared/components';
import { PATH } from './dashboard.routing';
interface IGroup {
  value: number;
  lots: Set<number>;
  fee: number;
  debt: boolean;
}
@Component({
  selector: 'tero-dashboard',
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class DashboardComponent implements OnInit {
  readonly #neighborsService = inject(NeighborsService);
  readonly #securityService = inject(SecurityService);
  readonly #ecommerceService = inject(EcommerceService);
  readonly #garbageTruckService = inject(GarbageTruckService);
  readonly #auth = inject(AuthService);
  readonly #utils = inject(UtilsService);
  readonly #popup = inject(BizyPopupService);
  readonly #translate = inject(BizyTranslateService);
  readonly #router = inject(BizyRouterService);
  readonly #log = inject(BizyLogService);
  readonly #toast = inject(BizyToastService);
  readonly #usersService = inject(UsersService);

  loading = false;
  showInfo = false;
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
  isNeighbor: boolean = false;
  readonly BIZY_TAG_TYPE = BIZY_TAG_TYPE;
  readonly LOGO_PATH = LOGO_PATH;
  readonly LOADING_TYPE = LOADING_TYPE;

  async ngOnInit() {
    try {
      this.loading = true;

      const [isConfig, isNeighbor, isSecurity, products] = await Promise.all([
        this.#usersService.isConfig(),
        this.#usersService.isNeighbor(),
        this.#usersService.isSecurity(),
        this.#ecommerceService.getProducts()
      ]);

      this.isSecurity = isSecurity;
      this.isNeighbor = isNeighbor;
      this.products = products;

      this.showInfo = isNeighbor || isSecurity || isConfig;
      if (!this.showInfo) {
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
      const [neighbors, security] = await Promise.all([
        this.#neighborsService.getNeighbors(),
        this.#securityService.getSecurity()
      ]);

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
              _invoice =>
                _invoice.group === _group.value &&
                _invoice.timestamp >= startDate &&
                _invoice.timestamp <= endDate
            );
          }
        });

        this.membershipFee = this.#utils.roundNumber(security.fee / this.members) ?? 0;
        this.groups = this.groups.map(_group => {
          return { ..._group, fee: this.#utils.roundNumber(this.membershipFee * _group.lots.size) };
        });
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
    if (this.loading || !this.isNeighbor) {
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
            const email = await this.#auth.getEmail();
            if (!email) {
              return;
            }

            await this.#garbageTruckService.postRecord({ accountEmail: email });

            this.#toast.success();
          }
        } catch (error) {
          this.#log.error({
            fileName: 'dashboard.component',
            functionName: 'showGarbageTruckPopup',
            param: error
          });
          this.#toast.danger();
        } finally {
          this.loading = false;
        }
      }
    );
  }

  goToSecurity() {
    this.#router.goTo({ path: PATH.SECURITY });
  }

  goToEcommerce() {
    this.#router.goTo({ path: PATH.ECOMMERCE });
  }

  setGroupDebt(group: IGroup, event: PointerEvent) {
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
