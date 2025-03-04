import { Component, Inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BIZY_TAG_TYPE, BizyFilterPipe } from '@bizy/components';
import { BizyOrderByPipe, BizySearchPipe } from '@bizy/pipes';
import {
  BizyExportToCSVService,
  BizyLogService,
  BizyPopupService,
  BizyRouterService,
  BizyToastService,
  BizyTranslateService
} from '@bizy/services';
import { INeighbor, IUser, USER_ROLE } from '@core/model';
import { MobileService, NeighborsService, SecurityService, UsersService } from '@core/services';
import { PATH as DASHBOARD_PATH } from '@dashboard/dashboard.routing';
import { PATH as HOME_PATH } from '@home/home.routing';
import { RegisterPaymentPopupComponent } from './components';
import { PATH } from './security-group.routing';

interface INeighborCard extends INeighbor {
  _debt: boolean;
}

@Component({
    selector: 'tero-security-group',
    templateUrl: './security-group.html',
    styleUrls: ['./security-group.css'],
    standalone: false
})
export class SecurityGroupComponent implements OnInit {
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
  isMobile = true;
  filterDebts: Array<{ id: boolean; value: string; selected: boolean }> = [];
  activatedFilters: number = 0;
  isSecurityGroupAdmin: boolean = false;
  isConfig: boolean = false;
  contributors: number = 0;

  readonly BIZY_TAG_TYPE = BIZY_TAG_TYPE;

  constructor(
    @Inject(BizyRouterService) private router: BizyRouterService,
    @Inject(ActivatedRoute) private activatedRoute: ActivatedRoute,
    @Inject(NeighborsService) private neighborsService: NeighborsService,
    @Inject(SecurityService) private securityService: SecurityService,
    @Inject(BizyLogService) private log: BizyLogService,
    @Inject(BizyToastService) private toast: BizyToastService,
    @Inject(BizyTranslateService) private translate: BizyTranslateService,
    @Inject(MobileService) private mobile: MobileService,
    @Inject(BizyExportToCSVService) private exportToCSV: BizyExportToCSVService,
    @Inject(BizySearchPipe) private bizySearchPipe: BizySearchPipe,
    @Inject(BizyOrderByPipe) private bizyOrderByPipe: BizyOrderByPipe,
    @Inject(BizyFilterPipe) private bizyFilterPipe: BizyFilterPipe,
    @Inject(UsersService) private usersService: UsersService,
    @Inject(BizyPopupService) private popup: BizyPopupService
  ) {
    this.isMobile = this.mobile.isMobile();
  }

  async ngOnInit() {
    try {
      this.loading = true;

      this.group = Number(this.router.getId(this.activatedRoute, 'group'));
      if (!this.group) {
        this.goBack();
        return;
      }

      const [neighbors, security, currentUser, isConfig] = await Promise.all([
        this.neighborsService.getNeighbors(),
        this.securityService.getSecurity(),
        this.usersService.getCurrentUser(),
        this.usersService.isConfig()
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
          value: this.translate.get('SECURITY_GROUP.FILTER.DEBT.DEBT'),
          selected: true
        },
        {
          id: false,
          value: this.translate.get('SECURITY_GROUP.FILTER.DEBT.NO_DEBT'),
          selected: true
        }
      ];
    } catch (error) {
      this.log.error({
        fileName: 'security-group.component',
        functionName: 'ngOnInit',
        param: error
      });
      this.toast.danger();
    } finally {
      this.loading = false;
    }
  }

  goBack() {
    this.router.goBack({ path: `/${HOME_PATH.DASHBOARD}/${DASHBOARD_PATH.SECURITY}` });
  }

  goToSecurityInvoices() {
    if (this.loading) {
      return;
    }

    this.router.goTo({ path: PATH.INVOICES });
  }

  async openRegisterPaymentPopup(neighbor: INeighborCard) {
    if (this.loading || !neighbor || !neighbor._debt || !this.isSecurityGroupAdmin) {
      return;
    }

    this.popup.open<{ transactionId: string }>(
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
                this.securityService.postNeighborInvoice({
                  neighborId: _neighbor.id,
                  group: _neighbor.group,
                  transactionId: res.transactionId
                })
              );
            });

            await Promise.all(promises);

            neighbors.forEach(_neighbor => {
              const index = this.neighbors.findIndex(__neighbor => __neighbor.id === _neighbor.id);
              if (index !== -1) {
                this.neighbors[index]._debt = false;
              }
            });

            this.refresh();
          }
        } catch (error) {
          this.log.error({
            fileName: 'neighbors.component',
            functionName: 'openRegisterPaymentPopup',
            param: error
          });
          this.toast.danger();
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
    this.orderBy = property;
    this.order = this.order === 'asc' ? 'desc' : 'asc';
  }

  refresh() {
    this.neighbors = [...this.neighbors];
  }

  async export() {
    try {
      if (
        this.csvLoading ||
        this.loading ||
        !this.neighbors ||
        this.neighbors.length === 0 ||
        !this.isConfig
      ) {
        return;
      }

      this.csvLoading = true;

      const items = this.#filter(this.neighbors);

      const fileName = this.translate.get('SECURITY_GROUP.CSV_FILE_NAME');
      const model = {
        lot: this.translate.get('CORE.FORM.FIELD.LOT'),
        name: this.translate.get('CORE.FORM.FIELD.NAME'),
        surname: this.translate.get('CORE.FORM.FIELD.SURNAME'),
        _debt: this.translate.get('SECURITY_GROUP.FILTER.DEBT.TITLE')
      };

      if (this.isMobile) {
        const csv = this.exportToCSV.getCSV({ items, model });
        await this.mobile.downloadFile({ data: csv, name: fileName });
      } else {
        this.exportToCSV.download({ items, model, fileName });
      }
    } catch (error) {
      this.log.error({
        fileName: 'security-group.component',
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

  #filter(items: Array<INeighborCard>): Array<INeighborCard> {
    let _items = this.bizySearchPipe.transform(items, this.search, this.searchKeys);
    _items = this.bizySearchPipe.transform(items, this.lotSearch, 'lot');
    _items = this.bizySearchPipe.transform(items, this.nameSearch, 'name');
    _items = this.bizySearchPipe.transform(items, this.surnameSearch, 'surname');
    _items = this.bizyFilterPipe.transform(_items, '_debt', this.filterDebts);
    _items = this.bizyOrderByPipe.transform(_items, this.order, this.orderBy);
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
