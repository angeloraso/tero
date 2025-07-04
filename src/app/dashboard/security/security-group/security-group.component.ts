import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PATH as APP_PATH } from '@app/app.routing';
import { SharedModules } from '@app/shared';
import {
  BIZY_SKELETON_SHAPE,
  BIZY_TAG_TYPE,
  BizyDeviceService,
  BizyExportToCSVService,
  BizyFilterPipe,
  BizyLogService,
  BizyOrderByPipe,
  BizyPopupService,
  BizyRouterService,
  BizySearchPipe,
  BizyToastService,
  BizyTranslateService
} from '@bizy/core';
import { DEFAULT_USER_PICTURE, IMG_PATH, TOPIC_SUBSCRIPTION } from '@core/constants';
import { INeighbor, IUser, USER_ROLE } from '@core/model';
import { MobileService, NeighborsService, SecurityService, UsersService } from '@core/services';
import { PATH as DASHBOARD_PATH } from '@dashboard/dashboard.routing';
import { ENV } from '@env/environment';
import { PATH as HOME_PATH } from '@home/home.routing';
import { HomeService } from '@home/home.service';
import { RegisterPaymentPopupComponent } from './components';
import { es } from './i18n';
import { PATH } from './security-group.routing';

interface INeighborCard extends INeighbor {
  _debt: boolean;
}

@Component({
  selector: 'tero-security-group',
  templateUrl: './security-group.html',
  styleUrls: ['./security-group.css'],
  imports: SharedModules
})
export class SecurityGroupComponent implements OnInit {
  readonly #router = inject(BizyRouterService);
  readonly #activatedRoute = inject(ActivatedRoute);
  readonly #securityService = inject(SecurityService);
  readonly #log = inject(BizyLogService);
  readonly #toast = inject(BizyToastService);
  readonly #translate = inject(BizyTranslateService);
  readonly #mobile = inject(MobileService);
  readonly #exportToCSV = inject(BizyExportToCSVService);
  readonly #searchPipe = inject(BizySearchPipe);
  readonly #orderByPipe = inject(BizyOrderByPipe);
  readonly #filterPipe = inject(BizyFilterPipe);
  readonly #usersService = inject(UsersService);
  readonly #neighborsService = inject(NeighborsService);
  readonly #popup = inject(BizyPopupService);
  readonly #home = inject(HomeService);
  readonly #device = inject(BizyDeviceService);

  loading = false;
  group: number | null = null;
  csvLoading = false;
  neighbors: Array<INeighborCard> = [];
  search: string | number = '';
  searchKeys = ['name', 'surname', 'lot'];
  order: 'asc' | 'desc' = 'asc';
  orderBy = 'lot';
  lotSearch: string = '';
  surnameSearch: string = '';
  nameSearch: string = '';
  isDesktop = this.#device.isDesktop();
  filterDebts: Array<{ id: boolean; value: string; selected: boolean }> = [];
  activatedFilters: number = 0;
  isSecurityGroupAdmin: boolean = false;
  isConfig: boolean = false;
  contributors: number = 0;

  readonly BIZY_TAG_TYPE = BIZY_TAG_TYPE;
  readonly BIZY_SKELETON_SHAPE = BIZY_SKELETON_SHAPE;
  readonly IMG_PATH = IMG_PATH;
  readonly DEFAULT_USER_PICTURE = DEFAULT_USER_PICTURE;

  async ngOnInit() {
    try {
      this.loading = true;
      this.#home.hideTabs();
      this.#translate.loadTranslations(es);
      this.group = Number(this.#router.getId(this.#activatedRoute, 'group'));
      if (!this.group) {
        this.goBack();
        return;
      }

      const [neighbors, security, currentUser, isConfig] = await Promise.all([
        this.#neighborsService.getNeighbors(),
        this.#securityService.getSecurity(),
        this.#usersService.getCurrentUser(),
        this.#usersService.isConfig()
      ]);

      this.isConfig = isConfig;
      this.isSecurityGroupAdmin = this.#isSecurityGroupAdmin({ group: this.group, currentUser });

      const date = new Date();
      date.setDate(1);
      date.setHours(0, 0, 0, 0);
      const startDate = date.getTime();
      date.setMonth(date.getMonth() + 1);
      date.setDate(0);
      date.setHours(23, 59, 59, 999);
      const endDate = date.getTime();

      this.neighbors = neighbors
        .filter(_neighbor => _neighbor.security && _neighbor.group === this.group)
        .map(_neighbor => {
          return {
            ..._neighbor,
            _debt: security
              ? !security.neighborInvoices.find(
                  _invoice =>
                    _invoice.group === this.group &&
                    _invoice.neighborId === _neighbor.id &&
                    _invoice.timestamp >= startDate &&
                    _invoice.timestamp <= endDate
                )
              : false
          };
        });

      const lots = new Set<number>();

      this.neighbors.forEach(_neighbor => {
        if (_neighbor.lot) {
          lots.add(Number(_neighbor.lot));
        }
      });

      this.contributors = lots.size;

      this.filterDebts = [
        {
          id: true,
          value: this.#translate.get('SECURITY_GROUP.FILTER.DEBT.DEBT'),
          selected: true
        },
        {
          id: false,
          value: this.#translate.get('SECURITY_GROUP.FILTER.DEBT.NO_DEBT'),
          selected: true
        }
      ];
    } catch (error) {
      this.#log.error({
        fileName: 'security-group.component',
        functionName: 'ngOnInit',
        param: error
      });
      this.#toast.danger();
    } finally {
      this.loading = false;
    }
  }

  goBack() {
    this.#router.goBack({ path: `/${APP_PATH.HOME}/${HOME_PATH.DASHBOARD}/${DASHBOARD_PATH.SECURITY}` });
  }

  goToSecurityInvoices() {
    if (this.loading) {
      return;
    }

    this.#router.goTo({ path: PATH.INVOICES });
  }

  async openRegisterPaymentPopup(neighbor: INeighborCard) {
    if (this.loading || !neighbor || !neighbor._debt || !this.isSecurityGroupAdmin) {
      return;
    }

    this.#popup.open<{ transactionId: string; description: string }>(
      {
        component: RegisterPaymentPopupComponent,
        data: {
          neighbor
        }
      },
      async res => {
        try {
          if (res && this.group) {
            this.loading = true;
            const neighbors = this.neighbors.filter(_neighbor => _neighbor.lot === neighbor.lot);
            const promises: Array<Promise<void>> = [];

            neighbors.forEach(_neighbor => {
              promises.push(
                this.#securityService.postNeighborInvoice({
                  neighborId: _neighbor.id,
                  group: _neighbor.group,
                  transactionId: res.transactionId,
                  description: res.description
                })
              );
            });

            await Promise.all(promises);

            const pushNotificationPromises: Array<Promise<void>> = [];
            neighbors.forEach(_neighbor => {
              const index = this.neighbors.findIndex(__neighbor => __neighbor.id === _neighbor.id);
              if (index !== -1) {
                this.neighbors[index]._debt = false;
                if (this.neighbors[index].email) {
                  pushNotificationPromises.push(
                    this.#mobile.sendPushNotification({
                      topicId: `${TOPIC_SUBSCRIPTION.USER_SECURITY_INVOICE}${this.neighbors[index].email}`,
                      title: this.#translate.get('SECURITY_GROUP.USER_INVOICE_NOTIFICATION.TITLE'),
                      body: this.#translate.get('SECURITY_GROUP.USER_INVOICE_NOTIFICATION.BODY')
                    })
                  );
                }
              }
            });

            await Promise.all(pushNotificationPromises);

            this.refresh();
          }
        } catch (error) {
          this.#log.error({
            fileName: 'neighbors.component',
            functionName: 'openRegisterPaymentPopup',
            param: error
          });
          this.#toast.danger();
        } finally {
          this.loading = false;
        }
      }
    );
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
    this.lotSearch = '';
    this.nameSearch = '';
    this.surnameSearch = '';
    this.filterDebts.forEach(_debt => {
      _debt.selected = true;
    });
    this.activatedFilters = 0;
    this.refresh();
  }

  onSort(property: string) {
    this.order = this.order === 'desc' || this.orderBy !== property ? 'asc' : 'desc';
    this.orderBy = property;
  }

  refresh() {
    this.neighbors = [...this.neighbors];
  }

  async export() {
    try {
      if (this.csvLoading || this.loading || !this.neighbors || this.neighbors.length === 0 || !this.isConfig) {
        return;
      }

      this.csvLoading = true;

      const items = this.#filter(this.neighbors);

      const fileName = this.#translate.get('SECURITY_GROUP.CSV_FILE_NAME');
      const model = {
        lot: this.#translate.get('CORE.FORM.FIELD.LOT'),
        name: this.#translate.get('CORE.FORM.FIELD.NAME'),
        surname: this.#translate.get('CORE.FORM.FIELD.SURNAME'),
        _debt: this.#translate.get('SECURITY_GROUP.FILTER.DEBT.TITLE')
      };

      if (ENV.mobile) {
        const csv = this.#exportToCSV.getCSV({ items, model });
        await this.#mobile.downloadFile({ data: csv, name: fileName });
      } else {
        this.#exportToCSV.download({ items, model, fileName });
      }
    } catch (error) {
      this.#log.error({
        fileName: 'security-group.component',
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

  #filter(items: Array<INeighborCard>): Array<INeighborCard> {
    let _items = this.#searchPipe.transform(items, this.search, this.searchKeys);
    _items = this.#searchPipe.transform(items, this.lotSearch, 'lot');
    _items = this.#searchPipe.transform(items, this.nameSearch, 'name');
    _items = this.#searchPipe.transform(items, this.surnameSearch, 'surname');
    _items = this.#filterPipe.transform(_items, '_debt', this.filterDebts);
    _items = this.#orderByPipe.transform(_items, this.order, this.orderBy);
    return _items;
  }

  #isSecurityGroupAdmin(data: { group: number; currentUser: IUser | null }): boolean {
    if (!data || !data.group || !data.currentUser) {
      return false;
    }

    if (data.currentUser.roles.includes(USER_ROLE.ADMIN)) {
      return true;
    }

    switch (this.group) {
      case 1:
        return data.currentUser.roles.includes(USER_ROLE.SECURITY_GROUP_1);
      case 2:
        return data.currentUser.roles.includes(USER_ROLE.SECURITY_GROUP_2);
      case 3:
        return data.currentUser.roles.includes(USER_ROLE.SECURITY_GROUP_3);
      case 4:
        return data.currentUser.roles.includes(USER_ROLE.SECURITY_GROUP_4);
      case 5:
        return data.currentUser.roles.includes(USER_ROLE.SECURITY_GROUP_5);
      case 6:
        return data.currentUser.roles.includes(USER_ROLE.SECURITY_GROUP_6);
      default:
        return false;
    }
  }
}
