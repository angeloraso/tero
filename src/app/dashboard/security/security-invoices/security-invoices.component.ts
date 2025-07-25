import { DatePipe } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { PATH as APP_PATH } from '@app/app.routing';
import { SharedModules } from '@app/shared';
import {
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
import { PopupComponent } from '@components/popup';
import { MONTHS } from '@core/constants';
import { ISecurityInvoice } from '@core/model';
import { MobileService, SecurityService, UsersService } from '@core/services';
import { PATH as DASHBOARD_PATH } from '@dashboard/dashboard.routing';
import { ENV } from '@env/environment';
import { PATH as HOME_PATH } from '@home/home.routing';
import { HomeService } from '@home/home.service';

interface ISecurityInvoiceRow extends ISecurityInvoice {
  _date: string;
}

@Component({
  selector: 'tero-security-invoices',
  templateUrl: './security-invoices.html',
  styleUrls: ['./security-invoices.css'],
  imports: SharedModules
})
export class SecurityInvoicesComponent implements OnInit {
  readonly #router = inject(BizyRouterService);
  readonly #datePipe = inject(DatePipe);
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
  readonly #popup = inject(BizyPopupService);
  readonly #home = inject(HomeService);
  readonly #device = inject(BizyDeviceService);

  loading = false;
  csvLoading = false;
  isConfig = false;
  isSecurity = false;
  invoices: Array<ISecurityInvoiceRow> = [];
  search: string | number = '';
  searchKeys = ['_date', 'group'];
  order: 'asc' | 'desc' = 'desc';
  orderBy = '_date';
  isDesktop = this.#device.isDesktop();
  filterGroups: Array<{ id: number | boolean; value: number | string; selected: boolean }> = [];
  filterTimestamp: { min: number | null; max: number | null } = { min: null, max: null };
  activatedFilters: number = 0;
  viewDate: number = Date.now();
  currentDate: string = this.#getCurrentDate(this.viewDate);

  async ngOnInit() {
    try {
      this.loading = true;
      this.#home.hideTabs();
      const [security, isConfig, isSecurity] = await Promise.all([
        this.#securityService.getSecurity(),
        this.#usersService.isConfig(),
        this.#usersService.isSecurity()
      ]);

      this.isConfig = isConfig;
      this.isSecurity = isSecurity;

      const groups = new Set<number>();

      this.invoices =
        security && security.invoices
          ? security.invoices.map(_invoice => {
              if (_invoice.group) {
                groups.add(Number(_invoice.group));
              }
              return {
                ..._invoice,
                _date: this.#datePipe.transform(_invoice.timestamp, 'yyyy/MM/dd HH:mm')!
              };
            })
          : [];

      const date = this.#getMonthBounds(this.viewDate);
      this.filterTimestamp = { min: date.start, max: date.end };

      this.filterGroups = Array.from(groups).map(_group => {
        return { id: _group, value: _group, selected: true };
      });
    } catch (error) {
      this.#log.error({
        fileName: 'security-invoices.component',
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

  deleteInvoice(invoice: ISecurityInvoiceRow) {
    if (!invoice || this.loading || (!this.isConfig && !this.isSecurity)) {
      return;
    }

    this.#popup.open<boolean>(
      {
        component: PopupComponent,
        data: {
          title: this.#translate.get('SECURITY.SECURITY_INVOICES.DELETE_POPUP.TITLE'),
          msg: `${this.#translate.get('SECURITY.SECURITY_INVOICES.DELETE_POPUP.MSG')}: ${this.#translate.get('CORE.FORM.FIELD.GROUP')} ${invoice.group} - ${invoice._date}`
        }
      },
      async res => {
        try {
          if (res) {
            this.loading = true;
            await this.#securityService.deleteGroupInvoice(invoice);
            const index = this.invoices.findIndex(_invoice => _invoice.group === invoice.group && _invoice.timestamp === invoice.timestamp);
            if (index !== -1) {
              this.invoices.splice(index, 1);
              this.refresh();
            }
          }
        } catch (error) {
          this.#log.error({
            fileName: 'security-invoices.component',
            functionName: 'deleteInvoice',
            param: error
          });
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
    this.filterGroups.forEach(_group => {
      _group.selected = true;
    });
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

  previousDate() {
    this.viewDate = this.#subtractOneMonth(this.viewDate);
    this.currentDate = this.#getCurrentDate(this.viewDate);
    const date = this.#getMonthBounds(this.viewDate);
    this.filterTimestamp = { min: date.start, max: date.end };
  }

  nextDate() {
    this.viewDate = this.#addOneMonth(this.viewDate);
    this.currentDate = this.#getCurrentDate(this.viewDate);
    const date = this.#getMonthBounds(this.viewDate);
    this.filterTimestamp = { min: date.start, max: date.end };
  }

  async export() {
    try {
      if (this.csvLoading || this.loading || !this.invoices || this.invoices.length === 0) {
        return;
      }

      this.csvLoading = true;

      const items = this.#filter(this.invoices);

      const fileName = this.#translate.get('SECURITY.SECURITY_INVOICES.CSV_FILE_NAME');
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
        fileName: 'security-invoices.component',
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

  #addOneMonth(timestamp: number) {
    const date = new Date(timestamp);
    const currentDay = date.getDate();
    date.setMonth(date.getMonth() + 1);
    // Handle cases like Jan 31 -> Feb 28/29
    if (date.getDate() < currentDay) {
      // Set to last day of previous month if the day overflowed
      date.setDate(0);
    }

    return date.getTime();
  }

  #subtractOneMonth(timestamp: number) {
    const date = new Date(timestamp);
    const currentDay = date.getDate();
    date.setMonth(date.getMonth() - 1);
    // Handle overflow (e.g., March 31 -> February 28/29)
    if (date.getDate() < currentDay) {
      date.setDate(0); // Set to the last day of the previous month
    }

    return date.getTime();
  }

  #getCurrentDate(timestamp: number): string {
    const date = new Date(timestamp);
    return `${this.#translate.get('CORE.MONTH.' + MONTHS[date.getMonth()])} - ${date.getFullYear()}`;
  }

  #getMonthBounds = (timestamp: number) => {
    const date = new Date(timestamp);
    const y = date.getFullYear();
    const m = date.getMonth();

    const start = new Date(y, m, 1, 0, 0, 0, 0).getTime();
    const end = new Date(y, m + 1, 0, 23, 59, 59, 999).getTime();

    return { start, end };
  };

  #filter(items: Array<ISecurityInvoiceRow>): Array<ISecurityInvoiceRow> {
    let _items = this.#searchPipe.transform(items, this.search, this.searchKeys);
    _items = this.#filterPipe.transform(_items, 'group', this.filterGroups);
    _items = this.#orderByPipe.transform(_items, this.order, this.orderBy);
    return _items;
  }
}
