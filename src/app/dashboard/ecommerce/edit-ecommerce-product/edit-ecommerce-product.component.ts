import { Component, Inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  BizyLogService,
  BizyPopupService,
  BizyRouterService,
  BizyToastService,
  BizyTranslateService
} from '@bizy/services';
import { IEcommerceProduct, IPhone } from '@core/model';
import { EcommerceService } from '@core/services';
import { PATH as DASHBOARD_PATH } from '@dashboard/dashboard.routing';
import { PATH as HOME_PATH } from '@home/home.routing';
import { PopupComponent } from '@shared/components';
@Component({
  selector: 'tero-edit-ecommerce-product',
  templateUrl: './edit-ecommerce-product.html',
  styleUrls: ['./edit-ecommerce-product.css']
})
export class EditEcommerceProductComponent implements OnInit {
  product: IEcommerceProduct | null = null;
  productId: string | null = null;
  tags: Array<string> = [];
  loading = false;

  constructor(
    @Inject(BizyPopupService) private popup: BizyPopupService,
    @Inject(EcommerceService) private ecommerceService: EcommerceService,
    @Inject(BizyRouterService) private router: BizyRouterService,
    @Inject(ActivatedRoute) private activatedRoute: ActivatedRoute,
    @Inject(BizyLogService) private log: BizyLogService,
    @Inject(BizyToastService) private toast: BizyToastService,
    @Inject(BizyTranslateService) private translate: BizyTranslateService
  ) {}

  async ngOnInit() {
    try {
      this.loading = true;
      this.productId = this.router.getId(this.activatedRoute, 'productId');
      if (!this.productId) {
        this.goBack();
        return;
      }

      const [product, tags] = await Promise.all([
        this.ecommerceService.getProduct(this.productId),
        this.ecommerceService.getTags()
      ]);

      this.product = product;
      this.tags = tags;
    } catch (error) {
      this.log.error({
        fileName: 'edit-ecommerce-product.component',
        functionName: 'ngOnInit',
        param: error
      });
      this.toast.danger();
    } finally {
      this.loading = false;
    }
  }

  deleteEcommerceProduct = () => {
    if (!this.product || this.loading) {
      return;
    }

    this.popup.open<boolean>(
      {
        component: PopupComponent,
        data: {
          title: this.translate.get('ECOMMERCE.EDIT_ECOMMERCE_PRODUCT.DELETE_POPUP.TITLE'),
          msg: `${this.translate.get('ECOMMERCE.EDIT_ECOMMERCE_PRODUCT.DELETE_POPUP.MSG')}: ${this.product.productName}`
        }
      },
      async res => {
        try {
          if (res && this.product) {
            this.loading = true;
            await this.ecommerceService.deleteProduct(this.product);
            this.goBack();
          }
        } catch (error) {
          this.log.error({
            fileName: 'edit-ecommerce-product.component',
            functionName: 'deleteContact',
            param: error
          });
          this.toast.danger();
        } finally {
          this.loading = false;
        }
      }
    );
  };

  goBack() {
    this.router.goBack({ path: `/${HOME_PATH.DASHBOARD}/${DASHBOARD_PATH.ECOMMERCE}` });
  }

  async save(product: {
    productName: string;
    contactName: string;
    description: string;
    price: number | null;
    pictures: Array<string>;
    phones: Array<IPhone>;
    tags: Array<string>;
  }) {
    try {
      if (!product) {
        return;
      }

      this.loading = true;
      await this.ecommerceService.putProduct({
        ...this.product!,
        ...product
      });
      this.goBack();
    } catch (error) {
      this.log.error({
        fileName: 'edit-ecommerce-product.component',
        functionName: 'save',
        param: error
      });
      this.toast.danger();
    } finally {
      this.loading = false;
    }
  }
}
