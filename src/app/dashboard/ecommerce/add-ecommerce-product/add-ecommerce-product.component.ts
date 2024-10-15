import { Component, Inject, OnInit } from '@angular/core';
import { BizyLogService, BizyRouterService, BizyToastService } from '@bizy/services';
import { AuthService } from '@core/auth/auth.service';
import { IPhone } from '@core/model';
import { EcommerceService } from '@core/services';

@Component({
  selector: 'tero-add-ecommerce-product',
  templateUrl: './add-ecommerce-product.html',
  styleUrls: ['./add-ecommerce-product.css']
})
export class AddEcommerceProductComponent implements OnInit {
  loading: boolean = false;
  tags: Array<string> = [];

  constructor(
    @Inject(EcommerceService) private ecommerce: EcommerceService,
    @Inject(AuthService) private auth: AuthService,
    @Inject(BizyRouterService) private router: BizyRouterService,
    @Inject(BizyToastService) private toast: BizyToastService,
    @Inject(BizyLogService) private log: BizyLogService
  ) {}

  async ngOnInit() {
    try {
      this.loading = true;
      this.tags = await this.ecommerce.getTags();
    } catch (error) {
      this.log.error({
        fileName: 'add-ecommerce-product.component',
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

  async save(product: {
    name: string;
    price: number;
    description: string;
    pictures: Array<string>;
    phones: Array<IPhone>;
    tags: Array<string>;
  }) {
    try {
      if (!product || this.loading) {
        return;
      }

      this.loading = true;
      const accountId = await this.auth.getId();
      if (!accountId) {
        throw new Error();
      }

      await this.ecommerce.postProduct({ ...product, accountId });
      this.goBack();
    } catch (error) {
      this.log.error({
        fileName: 'add-ecommerce-product.component',
        functionName: 'save',
        param: error
      });
      this.toast.danger();
    } finally {
      this.loading = false;
    }
  }
}
