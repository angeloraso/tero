import { Component, Inject, OnInit } from '@angular/core';
import { PATH as APP_PATH } from '@app/app.routing';
import { AuthService } from '@auth/auth.service';
import { BIZY_TAG_TYPE } from '@bizy/components';
import { BizyOrderByPipe, BizySearchPipe } from '@bizy/pipes';
import {
  BizyCopyToClipboardService,
  BizyExportToCSVService,
  BizyLogService,
  BizyRouterService,
  BizyToastService,
  BizyTranslateService
} from '@bizy/services';
import { WHATSAPP_URL } from '@core/constants';
import { IEcommerceProduct } from '@core/model';
import { EcommerceService, MobileService, UsersService } from '@core/services';
import { PATH as DASHBOARD_PATH } from '@dashboard/dashboard.routing';
import { PATH as ECOMMERCE_PATH } from '@dashboard/ecommerce/ecommerce.routing';
import { PATH as HOME_PATH } from '@home/home.routing';

interface IEcommerceProductCard extends IEcommerceProduct {
  _phones: Array<string>;
}

@Component({
  selector: 'tero-ecommerce',
  templateUrl: './ecommerce.html',
  styleUrls: ['./ecommerce.css']
})
export class EcommerceComponent implements OnInit {
  loading = false;
  csvLoading = false;
  isNeighbor = false;
  isConfig = false;
  products: Array<IEcommerceProductCard> = [];
  search: string | number = '';
  searchKeys = ['name', 'tags', 'description', '_phones'];
  order: 'asc' | 'desc' = 'asc';
  orderBy = 'name';
  isMobile = true;
  filterTags: Array<{ id: string; value: string; selected: boolean }> = [];
  activatedFilters: number = 0;

  readonly BIZY_TAG_TYPE = BIZY_TAG_TYPE;

  constructor(
    @Inject(BizyRouterService) private router: BizyRouterService,
    @Inject(EcommerceService) private ecommerce: EcommerceService,
    @Inject(AuthService) private auth: AuthService,
    @Inject(BizyLogService) private log: BizyLogService,
    @Inject(BizyToastService) private toast: BizyToastService,
    @Inject(BizyTranslateService) private translate: BizyTranslateService,
    @Inject(MobileService) private mobile: MobileService,
    @Inject(BizyExportToCSVService) private exportToCSV: BizyExportToCSVService,
    @Inject(BizyCopyToClipboardService) private bizyToClipboard: BizyCopyToClipboardService,
    @Inject(BizySearchPipe) private bizySearchPipe: BizySearchPipe,
    @Inject(BizyOrderByPipe) private bizyOrderByPipe: BizyOrderByPipe,
    @Inject(UsersService) private usersService: UsersService
  ) {
    this.isMobile = this.mobile.isMobile();
  }

  async ngOnInit() {
    try {
      this.loading = true;
      const [products, isConfig, isNeighbor] = await Promise.all([
        this.ecommerce.getProducts(),
        this.usersService.isConfig(),
        this.usersService.isNeighbor()
      ]);

      this.isConfig = isConfig;
      this.isNeighbor = isNeighbor;

      const tags: Set<string> = new Set();

      this.products = products.map(_product => {
        _product.tags.forEach(_tag => {
          tags.add(_tag);
        });

        return {
          ..._product,
          _phones: _product.phones.map(_phone => _phone.number)
        };
      });
      this.filterTags = Array.from(tags).map(_tag => {
        return { id: _tag, value: _tag, selected: true };
      });
    } catch (error) {
      this.log.error({
        fileName: 'ecommerce.component',
        functionName: 'ngOnInit',
        param: error
      });
      this.toast.danger();
    } finally {
      this.loading = false;
    }
  }

  addEcommerceProduct() {
    if (!this.isNeighbor && !this.isConfig) {
      return;
    }

    this.router.goTo({
      path: `/${APP_PATH.HOME}/${HOME_PATH.DASHBOARD}/${DASHBOARD_PATH.ECOMMERCE}/${ECOMMERCE_PATH.ADD}`
    });
  }

  selectEcommerceProduct(product: IEcommerceProduct) {
    if (
      !product ||
      (!this.isNeighbor && !this.isConfig) ||
      product.accountId !== this.auth.getId()
    ) {
      return;
    }

    this.router.goTo({
      path: `/${APP_PATH.HOME}/${HOME_PATH.DASHBOARD}/${DASHBOARD_PATH.ECOMMERCE}/${product.id}`
    });
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
    this.filterTags.forEach(_tag => {
      _tag.selected = true;
    });
    this.activatedFilters = 0;
    this.refresh();
  }

  refresh() {
    this.products = [...this.products];
  }

  async copyPhone(phone: string) {
    try {
      await this.bizyToClipboard.copy(phone);
      this.toast.success();
    } catch (error) {
      this.log.error({
        fileName: 'ecommerce.component',
        functionName: 'copyPhone',
        param: error
      });
      this.toast.danger();
    }
  }

  async onCall(product: IEcommerceProduct) {
    try {
      if (!product.phones[0]) {
        return;
      }

      await this.mobile.call(product.phones[0].number);
    } catch (error) {
      this.log.error({
        fileName: 'products.component',
        functionName: 'onCall',
        param: error
      });
      this.toast.danger();
    }
  }

  async onShare(product: IEcommerceProduct) {
    try {
      if (!product) {
        return;
      }

      await this.mobile.share({
        dialogTitle: this.translate.get('ECOMMERCE.SHARE_PRODUCT'),
        title: product.productName,
        text: `${this.translate.get('CORE.FORM.FIELD.NAME')}: ${product.productName}
${this.translate.get('CORE.FORM.FIELD.PHONE')}: ${product.phones[0].number}
${this.translate.get('CORE.FORM.FIELD.TAG')}: ${product.tags.join(', ')}`
      });
    } catch (error) {
      this.log.error({
        fileName: 'ecommerce.component',
        functionName: 'onShare',
        param: error
      });
      this.toast.danger({
        title: 'Error',
        msg: this.translate.get('CORE.FORM.ERROR.SHARE')
      });
    }
  }

  onWhatsapp(product: IEcommerceProduct) {
    if (!product.phones[0]) {
      return;
    }

    window.open(`${WHATSAPP_URL}${product.phones[0].number}`, '_blank');
  }

  async export() {
    try {
      if (!this.products || this.products.length === 0) {
        return;
      }

      this.csvLoading = true;

      const items = this.#filter(this.products);

      const fileName = this.translate.get('ECOMMERCE.CSV_FILE_NAME');
      const model = {
        name: this.translate.get('CORE.FORM.FIELD.NAME'),
        _phones: this.translate.get('CORE.FORM.FIELD.PHONE'),
        tags: this.translate.get('CORE.FORM.FIELD.TAG')
      };

      if (this.isMobile) {
        const csv = this.exportToCSV.getCSV({ items, model });
        await this.mobile.downloadFile({ data: csv, name: fileName });
      } else {
        this.exportToCSV.download({ items, model, fileName });
      }
    } catch (error) {
      this.log.error({
        fileName: 'ecommerce.component',
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

  goBack() {
    this.router.goBack({ path: `/${HOME_PATH.DASHBOARD}` });
  }

  #filter(items: Array<IEcommerceProductCard>): Array<IEcommerceProductCard> {
    let _items = this.bizySearchPipe.transform(items, this.search, this.searchKeys);
    _items = this.bizyOrderByPipe.transform(_items, this.order, this.orderBy);
    return _items;
  }
}
