import { DatePipe } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { BizyFilterPipe } from '@bizy/components';
import { BizyOrderByPipe, BizySearchPipe } from '@bizy/pipes';
import {
  BizyExportToCSVService,
  BizyLogService,
  BizyPopupService,
  BizyRouterService,
  BizyToastService,
  BizyTranslateService
} from '@bizy/services';
import { ISecurityInvoice } from '@core/model';
import { MobileService, SecurityService, UsersService } from '@core/services';
import { PopupComponent } from '@shared/components';

interface ISecurityInvoiceRow extends ISecurityInvoice {
  _date: string;
}

@Component({
  selector: 'tero-security-invoices',
  templateUrl: './security-invoices.html',
  styleUrls: ['./security-invoices.css']
})
export class SecurityInvoicesComponent implements OnInit {
  loading = false;
  csvLoading = false;
  isConfig = false;
  isSecurity = false;
  invoices: Array<ISecurityInvoiceRow> = [];
  search: string | number = '';
  searchKeys = ['_date', 'group'];
  order: 'asc' | 'desc' = 'desc';
  orderBy = '_date';
  isMobile = true;
  filterGroups: Array<{ id: number | boolean; value: number | string; selected: boolean }> = [];
  activatedFilters: number = 0;

  constructor(
    @Inject(BizyRouterService) private router: BizyRouterService,
    @Inject(DatePipe) private datePipe: DatePipe,
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

      const [security, isConfig, isSecurity] = await Promise.all([
        this.securityService.getSecurity(),
        this.usersService.isConfig(),
        this.usersService.isSecurity()
      ]);

      this.isConfig = isConfig;
      this.isSecurity = isSecurity;

      const groups = new Set<number>();

      this.invoices =
        security && security.invoices
          ? security.invoices.map(_invoice => {
              if (_invoice.group) {
                groups.add(_invoice.group);
              }
              return {
                ..._invoice,
                _date: this.datePipe.transform(_invoice.timestamp, 'yyyy/MM/dd HH:mm')!
              };
            })
          : [];

      this.filterGroups = Array.from(groups).map(_group => {
        return { id: _group, value: _group, selected: true };
      });
    } catch (error) {
      this.log.error({
        fileName: 'security-invoices.component',
        functionName: 'ngOnInit',
        param: error
      });
      this.toast.danger();
    } finally {
      this.loading = false;
    }
  }

  goBack() {
    this.router.goBack();
  }

  deleteInvoice(invoice: ISecurityInvoiceRow) {
    if (!invoice || this.loading || !this.isConfig || !this.isSecurity) {
      return;
    }

    this.popup.open<boolean>(
      {
        component: PopupComponent,
        data: {
          title: this.translate.get('SECURITY.SECURITY_INVOICES.DELETE_POPUP.TITLE'),
          msg: `${this.translate.get('SECURITY.SECURITY_INVOICES.DELETE_POPUP.MSG')}: ${this.translate.get('CORE.FORM.FIELD.GROUP')} ${invoice.group} - ${invoice._date}`
        }
      },
      async res => {
        try {
          if (res) {
            this.loading = true;
            await this.securityService.deleteGroupInvoice(invoice);
            const index = this.invoices.findIndex(
              _invoice =>
                _invoice.group === invoice.group && _invoice.timestamp === invoice.timestamp
            );
            if (index !== -1) {
              this.invoices.splice(index, 1);
              this.refresh();
            }
          }
        } catch (error) {
          this.log.error({
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

  async export() {
    try {
      if (this.csvLoading || this.loading || !this.invoices || this.invoices.length === 0) {
        return;
      }

      this.csvLoading = true;

      const items = this.#filter(this.invoices);

      const fileName = this.translate.get('SECURITY.SECURITY_INVOICES.CSV_FILE_NAME');
      const model = {
        _date: this.translate.get('CORE.FORM.FIELD.DATE'),
        group: this.translate.get('CORE.FORM.FIELD.GROUP')
      };

      if (this.isMobile) {
        const csv = this.exportToCSV.getCSV({ items, model });
        await this.mobile.downloadFile({ data: csv, name: fileName });
      } else {
        this.exportToCSV.download({ items, model, fileName });
      }
    } catch (error) {
      this.log.error({
        fileName: 'security-invoices.component',
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

  #filter(items: Array<ISecurityInvoiceRow>): Array<ISecurityInvoiceRow> {
    let _items = this.bizySearchPipe.transform(items, this.search, this.searchKeys);
    _items = this.bizyFilterPipe.transform(_items, 'group', this.filterGroups);
    _items = this.bizyOrderByPipe.transform(_items, this.order, this.orderBy);
    return _items;
  }
}
