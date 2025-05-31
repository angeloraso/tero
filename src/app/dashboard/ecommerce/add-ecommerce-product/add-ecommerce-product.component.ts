import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
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
import { LONG_TEXT_MAX_LENGTH, NAME_MAX_LENGTH, NAME_MIN_LENGTH, PHONE_MAX_LENGTH, PHONE_MIN_LENGTH, TOPIC_SUBSCRIPTION } from '@core/constants';
import { IUser } from '@core/model';
import { EcommerceService, MobileService, UsersService } from '@core/services';
import { PATH as DASHBOARD_PATH } from '@dashboard/dashboard.routing';
import { EcommerceTagsPopupComponent } from '@dashboard/ecommerce/components';
import { PATH as HOME_PATH } from '@home/home.routing';
import { HomeService } from '@home/home.service';

@Component({
  selector: 'tero-add-ecommerce-product',
  templateUrl: './add-ecommerce-product.html',
  styleUrls: ['./add-ecommerce-product.css'],
  imports: [...SharedModules, BizyTabsModule]
})
export class AddEcommerceProductComponent implements OnInit {
  @ViewChild(BizyFormComponent) formComponent: BizyFormComponent | null = null;
  readonly #ecommerceService = inject(EcommerceService);
  readonly #usersService = inject(UsersService);
  readonly #auth = inject(AuthService);
  readonly #router = inject(BizyRouterService);
  readonly #toast = inject(BizyToastService);
  readonly #log = inject(BizyLogService);
  readonly #home = inject(HomeService);
  readonly #fb = inject(FormBuilder);
  readonly #popup = inject(BizyPopupService);
  readonly #mobile = inject(MobileService);
  readonly #translate = inject(BizyTranslateService);

  loading: boolean = false;
  tags: Array<string> = [];
  currentUser: IUser | null = null;
  checkPrice: boolean = false;
  selectedTab: 'product' | 'contact' = 'product';

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

      const currentUser = await this.#usersService.getCurrentUser();
      if (!currentUser) {
        this.goBack();
        return;
      }

      this.currentUser = currentUser;

      if (this.currentUser.name) {
        this.contactName.setValue(this.currentUser.name);
      }

      if (this.currentUser.phone) {
        this.contactPhone.setValue(this.currentUser.phone);
      }

      if (this.currentUser.aliasCBU) {
        this.contactAliasCBU.setValue(this.currentUser.aliasCBU);
      }
    } catch (error) {
      this.#log.error({
        fileName: 'add-ecommerce-product.component',
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

  onCheckPrice() {
    if (this.checkPrice) {
      this.productPrice.disable();
      this.productPrice.setValidators([]);
      this.productPrice.updateValueAndValidity();
    } else {
      this.productPrice.enable();
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
            fileName: 'add-ecommerce-product.component',
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
      if (this.#form.invalid || this.loading) {
        if (this.productName.invalid || this.productPrice.invalid || this.productTags.invalid) {
          this.selectedTab = 'product';
        } else {
          this.selectedTab = 'contact';
        }

        setTimeout(() => {
          this.formComponent?.setTouched();
        }, 1);
        return;
      }

      this.loading = true;
      const accountEmail = this.#auth.getEmail();
      if (!accountEmail) {
        throw new Error();
      }

      const product = {
        accountEmail,
        productName: this.productName.value ? this.productName.value.trim() : '',
        contactName: this.contactName.value ? this.contactName.value.trim() : '',
        description: this.productDescription.value ? this.productDescription.value.trim() : '',
        pictures: [],
        aliasCBU: this.contactAliasCBU.value ? this.contactAliasCBU.value.trim() : '',
        price: !this.checkPrice && (this.productPrice.value || this.productPrice.value === 0) ? Number(this.productPrice.value) : null,
        phones: [{ number: this.contactPhone.value ? this.contactPhone.value.trim() : '', description: '' }],
        tags: this.productTags.value ?? []
      };

      await this.#ecommerceService.postProduct(product);

      await this.#mobile.sendPushNotification({
        topicId: TOPIC_SUBSCRIPTION.NEW_ECOMMERCE_PRODUCT,
        title: this.#translate.get('ECOMMERCE.NEW_ECOMMERCE_PRODUCT_NOTIFICATION.TITLE'),
        body: `${this.#translate.get('ECOMMERCE.NEW_ECOMMERCE_PRODUCT_NOTIFICATION.BODY')}: ${product.productName}${product.price ? ' ($' + product.price + ')' : ''}`
      });

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
        fileName: 'add-ecommerce-product.component',
        functionName: 'save',
        param: error
      });
      this.#toast.danger();
    } finally {
      this.loading = false;
    }
  }
}
