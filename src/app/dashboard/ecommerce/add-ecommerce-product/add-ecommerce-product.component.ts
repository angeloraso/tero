import { Component, Inject, OnInit } from '@angular/core';
import { PATH as APP_PATH } from '@app/app.routing';
import { SharedModules } from '@app/shared';
import { AuthService } from '@auth/auth.service';
import { BizyLogService, BizyRouterService, BizyToastService } from '@bizy/core';
import { IPhone, IUser } from '@core/model';
import { EcommerceService, UsersService } from '@core/services';
import { PATH as DASHBOARD_PATH } from '@dashboard/dashboard.routing';
import { EcommerceProductFormComponent } from '@dashboard/ecommerce/components';
import { PATH as HOME_PATH } from '@home/home.routing';
import { HomeService } from '@home/home.service';

@Component({
    selector: 'tero-add-ecommerce-product',
    templateUrl: './add-ecommerce-product.html',
    styleUrls: ['./add-ecommerce-product.css'],
    imports: [...SharedModules, EcommerceProductFormComponent]
})
export class AddEcommerceProductComponent implements OnInit {
  loading: boolean = false;
  tags: Array<string> = [];
  currentUser: IUser | null = null;

  constructor(
    @Inject(EcommerceService) private ecommerceService: EcommerceService,
    @Inject(UsersService) private usersService: UsersService,
    @Inject(AuthService) private auth: AuthService,
    @Inject(BizyRouterService) private router: BizyRouterService,
    @Inject(BizyToastService) private toast: BizyToastService,
    @Inject(BizyLogService) private log: BizyLogService,
    @Inject(HomeService) private home: HomeService
  ) {}

  async ngOnInit() {
    try {
      this.loading = true;
      this.home.hideTabs();
      const [tags, currentUser] = await Promise.all([
        this.ecommerceService.getTags(),
        this.usersService.getCurrentUser()
      ]);

      this.tags = tags || [];
      this.currentUser = currentUser || null;
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
    this.router.goBack({ path: `/${APP_PATH.HOME}/${HOME_PATH.DASHBOARD}/${DASHBOARD_PATH.ECOMMERCE}` });
  }

  async save(product: {
    productName: string;
    contactName: string;
    price: number | null;
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

      await this.ecommerceService.postProduct({ ...product, accountId });

      if (
        this.currentUser &&
        !this.currentUser.phone &&
        product.phones[0] &&
        product.phones[0].number
      ) {
        await this.usersService.putUser({ ...this.currentUser, phone: product.phones[0].number });
      }

      if (this.currentUser && !this.currentUser.name && product.contactName) {
        await this.usersService.putUser({ ...this.currentUser, name: product.contactName });
      }

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
