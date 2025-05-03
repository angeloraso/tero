import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { PATH as APP_PATH } from '@app/app.routing';
import { SharedModules } from '@app/shared';
import { AuthService } from '@auth/auth.service';
import {
  BIZY_TAG_TYPE,
  BizyFormComponent,
  BizyLogService,
  BizyPopupService,
  BizyRouterService,
  BizyTabsModule,
  BizyToastService,
  BizyTranslateService
} from '@bizy/core';
import { PopupComponent } from '@components/popup';
import { LONG_TEXT_MAX_LENGTH, NAME_MAX_LENGTH, NAME_MIN_LENGTH, PHONE_MAX_LENGTH, PHONE_MIN_LENGTH } from '@core/constants';
import { IEcommerceProduct, IUser } from '@core/model';
import { EcommerceService, UsersService } from '@core/services';
import { PATH as DASHBOARD_PATH } from '@dashboard/dashboard.routing';
import { EcommerceTagsPopupComponent } from '@dashboard/ecommerce/components';
import { PATH as HOME_PATH } from '@home/home.routing';
import { HomeService } from '@home/home.service';

@Component({
  selector: 'tero-edit-ecommerce-product',
  templateUrl: './edit-ecommerce-product.html',
  styleUrls: ['./edit-ecommerce-product.css'],
  imports: [...SharedModules, BizyTabsModule]
})
export class EditEcommerceProductComponent implements OnInit {
  @ViewChild(BizyFormComponent) formComponent: BizyFormComponent | null = null;
  readonly #ecommerceService = inject(EcommerceService);
  readonly #usersService = inject(UsersService);
  readonly #auth = inject(AuthService);
  readonly #router = inject(BizyRouterService);
  readonly #activatedRoute = inject(ActivatedRoute);
  readonly #toast = inject(BizyToastService);
  readonly #log = inject(BizyLogService);
  readonly #home = inject(HomeService);
  readonly #fb = inject(FormBuilder);
  readonly #popup = inject(BizyPopupService);
  readonly #translate = inject(BizyTranslateService);

  loading: boolean = false;
  tags: Array<string> = [];
  currentUser: IUser | null = null;
  checkPrice: boolean = false;
  selectedTab: 'product' | 'contact' = 'product';
  product: IEcommerceProduct | null = null;
  productId: string | null = null;

  readonly BIZY_TAG_TYPE = BIZY_TAG_TYPE;
  readonly NAME_MIN_LENGTH = NAME_MIN_LENGTH;
  readonly NAME_MAX_LENGTH = NAME_MAX_LENGTH;
  readonly PHONE_MIN_LENGTH = PHONE_MIN_LENGTH;
  readonly PHONE_MAX_LENGTH = PHONE_MAX_LENGTH;
  readonly LONG_TEXT_MAX_LENGTH = LONG_TEXT_MAX_LENGTH;
  readonly DESCRIPTION_LENGTH = 1024;

  readonly #form = this.#fb.group({
    productName: [null, [Validators.minLength(NAME_MIN_LENGTH), Validators.maxLength(NAME_MAX_LENGTH), Validators.required]],
    productDescription: [null, [Validators.maxLength(LONG_TEXT_MAX_LENGTH)]],
    productPrice: [null, [Validators.required]],
    productTags: [null, [Validators.required]],
    contactName: [null, [Validators.minLength(NAME_MIN_LENGTH), Validators.maxLength(NAME_MAX_LENGTH), Validators.required]],
    contactPhone: [null, [Validators.minLength(this.PHONE_MIN_LENGTH), Validators.maxLength(this.PHONE_MAX_LENGTH), Validators.required]],
    contactAliasCBU: [null]
  });

  async ngOnInit() {
    try {
      this.loading = true;
      this.#home.hideTabs();

      this.productId = this.#router.getId(this.#activatedRoute, 'productId');
      if (!this.productId) {
        this.goBack();
        return;
      }

      const [currentUser, product, isConfig] = await Promise.all([
        this.#usersService.getCurrentUser(),
        this.#ecommerceService.getProduct(this.productId),
        this.#usersService.isConfig()
      ]);

      if (
        !currentUser ||
        !product ||
        (product.accountId && product.accountId !== this.#auth.getId() && !isConfig) ||
        (product.accountEmail && product.accountEmail !== this.#auth.getEmail() && !isConfig)
      ) {
        this.goBack();
        return;
      }

      this.currentUser = currentUser;
      this.product = product;

      if (this.product.productName) {
        this.productName.setValue(this.product.productName);
      }

      if (this.product.description) {
        this.productDescription.setValue(this.product.description);
      }

      if (this.product.price) {
        this.productPrice.setValue(this.product.price);
      }

      setTimeout(() => {
        this.checkPrice = !this.product || !this.product.price;
        this.onCheckPrice();
      }, 1);

      if (this.product.tags) {
        this.productTags.setValue(this.product.tags);
      }

      if (this.product.contactName) {
        this.contactName.setValue(this.product.contactName);
      }

      if (this.product.phones && this.product.phones[0]) {
        this.contactPhone.setValue(this.product.phones[0].number);
      }

      if (this.product.aliasCBU) {
        this.contactAliasCBU.setValue(this.product.aliasCBU);
      }
    } catch (error) {
      this.#log.error({
        fileName: 'edit-ecommerce-product.component',
        functionName: 'ngOnInit',
        param: error
      });
      this.#toast.danger();
    } finally {
      this.loading = false;
    }
  }

  get productName() {
    return this.#form.get('productName') as FormControl;
  }

  get productDescription() {
    return this.#form.get('productDescription') as FormControl;
  }

  get productPrice() {
    return this.#form.get('productPrice') as FormControl;
  }

  get productTags() {
    return this.#form.get('productTags') as FormControl<Array<string> | null>;
  }

  get contactName() {
    return this.#form.get('contactName') as FormControl;
  }

  get contactPhone() {
    return this.#form.get('contactPhone') as FormControl;
  }

  get contactAliasCBU() {
    return this.#form.get('contactAliasCBU') as FormControl;
  }

  deleteProduct = () => {
    if (!this.product || this.loading) {
      return;
    }

    this.#popup.open<boolean>(
      {
        component: PopupComponent,
        data: {
          title: this.#translate.get('ECOMMERCE.EDIT_ECOMMERCE_PRODUCT.DELETE_POPUP.TITLE'),
          msg: `${this.#translate.get('ECOMMERCE.EDIT_ECOMMERCE_PRODUCT.DELETE_POPUP.MSG')}: ${this.product.productName}`
        }
      },
      async res => {
        try {
          if (res && this.product) {
            this.loading = true;
            await this.#ecommerceService.deleteProduct(this.product);
            this.goBack();
          }
        } catch (error) {
          this.#log.error({
            fileName: 'edit-ecommerce-product.component',
            functionName: 'deleteContact',
            param: error
          });
          this.#toast.danger();
        } finally {
          this.loading = false;
        }
      }
    );
  };

  onCheckPrice() {
    if (this.checkPrice) {
      this.productPrice.setValidators([]);
      this.productPrice.updateValueAndValidity();
    } else {
      this.productPrice.setValidators([Validators.required]);
      this.productPrice.updateValueAndValidity();
    }
  }

  openTagsPopup() {
    if (this.loading) {
      return;
    }

    this.#popup.open<Array<string>>(
      {
        component: EcommerceTagsPopupComponent,
        fullScreen: true,
        data: { tags: this.productTags.value }
      },
      async tags => {
        try {
          if (tags) {
            if (tags.length > 0) {
              this.productTags.setValue(tags);
            } else {
              this.productTags.setValue(null);
            }
          }
        } catch (error) {
          this.#log.error({
            fileName: 'edit-ecommerce-product.component',
            functionName: 'openTagsPopup',
            param: error
          });
          this.#toast.danger();
        }
      }
    );
  }

  goBack() {
    this.#router.goBack({ path: `/${APP_PATH.HOME}/${HOME_PATH.DASHBOARD}/${DASHBOARD_PATH.ECOMMERCE}` });
  }

  async save() {
    try {
      if (this.#form.invalid || this.loading || !this.product) {
        this.formComponent?.setTouched();

        if (this.productName.invalid || this.productPrice.invalid || this.productTags.invalid) {
          this.selectedTab = 'product';
        } else {
          this.selectedTab = 'contact';
        }

        return;
      }

      this.loading = true;

      const product = {
        ...this.product,
        productName: this.productName.value ? this.productName.value.trim() : '',
        contactName: this.contactName.value ? this.contactName.value.trim() : '',
        description: this.productDescription.value ? this.productDescription.value.trim() : '',
        pictures: [],
        aliasCBU: this.contactAliasCBU.value ? this.contactAliasCBU.value.trim() : '',
        price: !this.checkPrice && (this.productPrice.value || this.productPrice.value === 0) ? Number(this.productPrice.value) : null,
        phones: [{ number: this.contactPhone.value ? this.contactPhone.value.trim() : '', description: '' }],
        tags: this.productTags.value ?? []
      };

      await this.#ecommerceService.putProduct(product);

      if (this.currentUser && !this.currentUser.name && product.contactName) {
        await this.#usersService.putUser({ ...this.currentUser, name: product.contactName });
      }

      if (this.currentUser && !this.currentUser.phone && product.phones[0] && product.phones[0].number) {
        await this.#usersService.putUser({ ...this.currentUser, phone: product.phones[0].number });
      }

      if (this.currentUser && !this.currentUser.aliasCBU && product.contactName) {
        await this.#usersService.putUser({ ...this.currentUser, name: product.contactName });
      }

      this.goBack();
    } catch (error) {
      this.#log.error({
        fileName: 'edit-ecommerce-product.component',
        functionName: 'save',
        param: error
      });
      this.#toast.danger();
    } finally {
      this.loading = false;
    }
  }
}
