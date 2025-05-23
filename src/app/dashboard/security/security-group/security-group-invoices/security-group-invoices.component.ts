import { DatePipe } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PATH as APP_PATH } from '@app/app.routing';
import { SharedModules } from '@app/shared';
import {
  BizyDeviceService,
  BizyExportToCSVService,
  BizyLogService,
  BizyOrderByPipe,
  BizyPopupService,
  BizyRouterService,
  BizySearchPipe,
  BizyToastService,
  BizyTranslateService
} from '@bizy/core';
import { PopupComponent } from '@components/popup';
import { ISecurityNeighborInvoice, IUser, USER_ROLE } from '@core/model';
import { MobileService, NeighborsService, SecurityService, UsersService } from '@core/services';
import { PATH as DASHBOARD_PATH } from '@dashboard/dashboard.routing';
import { ENV } from '@env/environment';
import { PATH as HOME_PATH } from '@home/home.routing';
import { HomeService } from '@home/home.service';
interface ISecurityInvoiceRow extends ISecurityNeighborInvoice {
  _date: string;
  _neighborName: string;
}

@Component({
  selector: 'tero-security-group-invoices',
  templateUrl: './security-group-invoices.html',
  styleUrls: ['./security-group-invoices.css'],
  imports: SharedModules
})
export class SecurityGroupInvoicesComponent implements OnInit {
  readonly #router = inject(BizyRouterService);
  readonly #activatedRoute = inject(ActivatedRoute);
  readonly #datePipe = inject(DatePipe);
  readonly #securityService = inject(SecurityService);
  readonly #log = inject(BizyLogService);
  readonly #toast = inject(BizyToastService);
  readonly #translate = inject(BizyTranslateService);
  readonly #mobile = inject(MobileService);
  readonly #exportToCSV = inject(BizyExportToCSVService);
  readonly #searchPipe = inject(BizySearchPipe);
  readonly #orderByPipe = inject(BizyOrderByPipe);
  readonly #usersService = inject(UsersService);
  readonly #neighborsService = inject(NeighborsService);
  readonly #popup = inject(BizyPopupService);
  readonly #home = inject(HomeService);
  readonly #device = inject(BizyDeviceService);

  group: number | null = null;
  loading = false;
  csvLoading = false;
  isConfig = false;
  isSecurityGroupAdmin: boolean = false;
  invoices: Array<ISecurityInvoiceRow> = [];
  search: string | number = '';
  nameSearch: string = '';
  searchKeys = ['_neighborName', '_date', 'group'];
  order: 'asc' | 'desc' = 'desc';
  orderBy = '_date';
  isDesktop = this.#device.isDesktop();
  activatedFilters: number = 0;

  async ngOnInit() {
    try {
      this.loading = true;
      this.#home.hideTabs();
      this.group = Number(this.#router.getId(this.#activatedRoute, 'group'));
      if (!this.group) {
        this.goBack();
        return;
      }

      const [security, neighbors, currentUser, isConfig] = await Promise.all([
        this.#securityService.getSecurity(),
        this.#neighborsService.getNeighbors(),
        this.#usersService.getCurrentUser(),
        this.#usersService.isConfig()
      ]);

      this.isConfig = isConfig;
      this.isSecurityGroupAdmin = this.#isSecurityGroupAdmin({ group: this.group, currentUser });

      this.invoices =
        security && security.neighborInvoices
          ? security.neighborInvoices
              .filter(_invoice => _invoice.group === this.group)
              .map(_invoice => {
                const _neighbor = neighbors.find(_neighbor => _neighbor.id === _invoice.neighborId);
                const _neighborName = _neighbor ? `${_neighbor.name}${_neighbor.surname ? ' ' + _neighbor.surname : ''}` : '';
                return {
                  ..._invoice,
                  _neighborName,
                  _date: this.#datePipe.transform(_invoice.timestamp, 'yyyy/MM/dd HH:mm')!
                };
              })
          : [];
    } catch (error) {
      this.#log.error({
        fileName: 'security-group-invoices.component',
        functionName: 'ngOnInit',
        param: error
      });
      this.#toast.danger();
    } finally {
      this.loading = false;
    }
  }

  goBack() {
    this.#router.goBack({
      path: `/${APP_PATH.HOME}/${HOME_PATH.DASHBOARD}/${DASHBOARD_PATH.SECURITY}/${this.group}`
    });
  }

  deleteInvoice(invoice: ISecurityInvoiceRow) {
    if (!invoice || this.loading || !this.isConfig || !this.isSecurityGroupAdmin) {
      return;
    }

    this.#popup.open<boolean>(
      {
        component: PopupComponent,
        data: {
          title: this.#translate.get('SECURITY_GROUP.DELETE_POPUP.TITLE'),
          msg: `${this.#translate.get('SECURITY_GROUP.DELETE_POPUP.MSG')}: ${this.#translate.get('CORE.FORM.FIELD.GROUP')} ${invoice._neighborName} - ${invoice._date}`
        }
      },
      async res => {
        try {
          if (res) {
            this.loading = true;
            await this.#securityService.deleteNeighborInvoice(invoice);
            const index = this.invoices.findIndex(_invoice => _invoice.group === invoice.group && _invoice.timestamp === invoice.timestamp);
            if (index !== -1) {
              this.invoices.splice(index, 1);
              this.refresh();
            }
          }
        } catch (error) {
          this.#log.error({
            fileName: 'security-group-invoices.component',
            functionName: 'deleteInvoice',
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
    this.activatedFilters = 0;
    this.refresh();
  }

  onSort(property: string) {
    this.orderBy = property;
    this.order = this.order === 'asc' ? 'desc' : 'asc';
  }

  refresh() {
    this.invoices = [...this.invoices];
  }

  async export() {
    try {
      if (this.csvLoading || this.loading || !this.invoices || this.invoices.length === 0 || !this.isConfig) {
        return;
      }

      this.csvLoading = true;

      const items = this.#filter(this.invoices);

      const fileName = this.#translate.get('SECURITY_GROUP.SECURITY_GROUP_INVOICES.CSV_FILE_NAME');
      const model = {
        _date: this.#translate.get('CORE.FORM.FIELD.DATE'),
        group: this.#translate.get('CORE.FORM.FIELD.GROUP')
      };

      if (ENV.mobile) {
        const csv = this.#exportToCSV.getCSV({ items, model });
        await this.#mobile.downloadFile({ data: csv, name: fileName });
      } else {
        this.#exportToCSV.download({ items, model, fileName });
      }
    } catch (error) {
      this.#log.error({
        fileName: 'security-group-invoices.component',
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

  #filter(items: Array<ISecurityInvoiceRow>): Array<ISecurityInvoiceRow> {
    let _items = this.#searchPipe.transform(items, this.search, this.searchKeys);
    _items = this.#searchPipe.transform(items, this.nameSearch, 'name');
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
