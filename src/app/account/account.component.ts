import {
  AboutPopupComponent,
  UserAliasCBUPopupComponent,
  UserLotPopupComponent,
  UserNamePopupComponent,
  UserPhonePopupComponent
} from '@account/components';
import { Component, inject, OnInit } from '@angular/core';
import { SharedModules } from '@app/shared';
import { AuthService } from '@auth/auth.service';
import {
  BIZY_SKELETON_SHAPE,
  BIZY_TAG_TYPE,
  BizyLogService,
  BizyPopupService,
  BizyRouterService,
  BizyToastService,
  BizyTranslateService
} from '@bizy/core';
import { PopupComponent } from '@components/popup';
import { LOGO_PATH } from '@core/constants';
import { IAccountMessage, IUser, USER_STATE } from '@core/model';
import {
  AccountMessagesService,
  ContactsService,
  EcommerceService,
  GarbageTruckService,
  MobileService,
  NeighborsService,
  SecurityService,
  TopicsService,
  UsersService
} from '@core/services';
import { ENV } from '@env/environment';
import { HomeService } from '@home/home.service';
import { PATH } from './account.routing';
import { es } from './i18n';

@Component({
  selector: 'tero-account',
  templateUrl: './account.html',
  styleUrls: ['./account.css'],
  imports: SharedModules
})
export class AccountComponent implements OnInit {
  readonly #router = inject(BizyRouterService);
  readonly #popup = inject(BizyPopupService);
  readonly #auth = inject(AuthService);
  readonly #log = inject(BizyLogService);
  readonly #toast = inject(BizyToastService);
  readonly #translate = inject(BizyTranslateService);
  readonly #usersService = inject(UsersService);
  readonly #accountMessagesService = inject(AccountMessagesService);
  readonly #home = inject(HomeService);
  readonly #mobile = inject(MobileService);
  readonly #neighborsService = inject(NeighborsService);
  readonly #garbageTruckService = inject(GarbageTruckService);
  readonly #contactsService = inject(ContactsService);
  readonly #securityService = inject(SecurityService);
  readonly #ecommerceService = inject(EcommerceService);
  readonly #topicsService = inject(TopicsService);

  readonly LOGO_PATH = LOGO_PATH;
  readonly BIZY_TAG_TYPE = BIZY_TAG_TYPE;
  readonly USER_STATE = USER_STATE;
  readonly DEFAULT_USER_ID = '00000000000000';
  readonly BIZY_SKELETON_SHAPE = BIZY_SKELETON_SHAPE;

  loading: boolean = false;
  isMobile: boolean = ENV.mobile;
  isAdmin: boolean = false;
  isConfig: boolean = false;
  isNeighbor: boolean = false;
  profilePic: string | null = null;
  name: string = '';
  email: string = '';
  users: Array<IUser> = [];
  pendingUsers: Array<IUser> = [];
  currentUser: IUser | null = null;
  newMessages: Array<IAccountMessage> = [];

  async ngOnInit() {
    try {
      this.loading = true;
      this.#home.showTabs();
      this.#translate.loadTranslations(es);
      this.name = this.#auth.getName() ?? '';
      this.email = this.#auth.getEmail() ?? '';

      const [profilePic, currentUser, isAdmin, isConfig, isNeighbor, messages] = await Promise.all([
        this.#auth.getProfilePicture(),
        this.#usersService.getCurrentUser(),
        this.#usersService.isAdmin(),
        this.#usersService.isConfig(),
        this.#usersService.isNeighbor(),
        this.#accountMessagesService.getMessages()
      ]);

      this.profilePic = profilePic;

      this.currentUser = currentUser;

      this.isAdmin = isAdmin;

      this.isConfig = isConfig;

      this.isNeighbor = isNeighbor;

      this.newMessages = messages.filter(_message => !_message.read);

      if (this.isConfig) {
        this.users = await this.#usersService.getUsers();
        this.pendingUsers = this.users.filter(_user => _user.status === USER_STATE.PENDING);
      }
    } catch (error) {
      this.#log.error({
        fileName: 'account.component',
        functionName: 'ngOnInit',
        param: error
      });
      this.#toast.danger();
    } finally {
      this.loading = false;
    }
  }

  openAboutPopup(): void {
    this.#popup.open({ component: AboutPopupComponent });
  }

  openUserNamePopup(): void {
    if (!this.currentUser) {
      return;
    }

    this.#popup.open<string>(
      {
        component: UserNamePopupComponent,
        data: { name: this.currentUser.name }
      },
      async name => {
        try {
          if (name && this.currentUser) {
            this.loading = true;
            await this.#usersService.putUser({ ...this.currentUser, name });
            this.currentUser.name = name;
          }
        } catch (error) {
          this.#log.error({
            fileName: 'account.component',
            functionName: 'openUserNamePopup',
            param: error
          });
          this.#toast.danger();
        } finally {
          this.loading = false;
        }
      }
    );
  }

  openUserPhonePopup(): void {
    this.#popup.open<string>(
      {
        component: UserPhonePopupComponent,
        data: { phone: this.currentUser?.phone || null }
      },
      async phone => {
        try {
          if (phone && this.currentUser) {
            this.loading = true;
            await this.#usersService.putUser({ ...this.currentUser, phone });
            this.currentUser.phone = phone;
          }
        } catch (error) {
          this.#log.error({
            fileName: 'account.component',
            functionName: 'openUserPhonePopup',
            param: error
          });
          this.#toast.danger();
        } finally {
          this.loading = false;
        }
      }
    );
  }

  openUserLotPopup(): void {
    this.#popup.open<number>(
      {
        component: UserLotPopupComponent,
        data: { lot: this.currentUser?.lot || null }
      },
      async lot => {
        try {
          if (lot && this.currentUser) {
            this.loading = true;
            await this.#usersService.putUser({ ...this.currentUser, lot });
            this.currentUser.lot = lot;
          }
        } catch (error) {
          this.#log.error({
            fileName: 'account.component',
            functionName: 'openUserLotPopup',
            param: error
          });
          this.#toast.danger();
        } finally {
          this.loading = false;
        }
      }
    );
  }

  openUserAliasCBUPopup(): void {
    this.#popup.open<string>(
      {
        component: UserAliasCBUPopupComponent,
        data: { aliasCBU: this.currentUser?.aliasCBU || null }
      },
      async aliasCBU => {
        try {
          if (aliasCBU && this.currentUser) {
            this.loading = true;
            await this.#usersService.putUser({ ...this.currentUser, aliasCBU });
            this.currentUser.aliasCBU = aliasCBU;
          }
        } catch (error) {
          this.#log.error({
            fileName: 'account.component',
            functionName: 'openUserAliasCBUPopup',
            param: error
          });
          this.#toast.danger();
        } finally {
          this.loading = false;
        }
      }
    );
  }

  goToUsers(): void {
    if (this.loading || !this.isConfig) {
      return;
    }

    this.#router.goTo({ path: PATH.USERS });
  }

  goToNotificationSettings() {
    if (this.loading) {
      return;
    }

    this.#router.goTo({ path: PATH.NOTIFICATION_SETTINGS });
  }

  goToMessages() {
    if (this.loading) {
      return;
    }

    this.#router.goTo({ path: PATH.ACCOUNT_MESSAGES });
  }

  async onBackup() {
    try {
      if (this.loading || ENV.mobile || !this.isAdmin) {
        return;
      }

      this.loading = true;

      function downloadJSON(data: unknown, filename = 'data.json') {
        const jsonString = JSON.stringify(data, null, 2); // pretty-print with 2-space indent
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a); // Required for Firefox
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url); // Clean up
      }

      const [neighbors, garbageRecords, contacts, contactTags, securityData, users, ecommerceProductos, ecommerceTags, topics] = await Promise.all([
        this.#neighborsService.getNeighbors(),
        this.#garbageTruckService.getRecords(),
        this.#contactsService.getContacts(),
        this.#contactsService.getTags(),
        this.#securityService.getSecurity(),
        this.#usersService.getUsers(),
        this.#ecommerceService.getProducts(),
        this.#ecommerceService.getTags(),
        this.#topicsService.getTopics()
      ]);

      const timestamp = Date.now();
      const neighborsFileName = `tero_neighbors-${timestamp}`;
      const garbageFileName = `tero_garbage_records-${timestamp}`;
      const contactsFileName = `tero_contacts-${timestamp}`;
      const contactTagsFileName = `tero_contacts_tags-${timestamp}`;
      const securityDataFileName = `tero_security_data-${timestamp}`;
      const usersFileName = `tero_users-${timestamp}`;
      const ecommerceProductsFileName = `tero_ecommerce_products-${timestamp}`;
      const ecommerceTagsFileName = `tero_ecommerce_tags-${timestamp}`;
      const topicsFileName = `tero_topics-${timestamp}`;

      downloadJSON(neighbors, neighborsFileName);
      downloadJSON(garbageRecords, garbageFileName);
      downloadJSON(contacts, contactsFileName);
      downloadJSON(contactTags, contactTagsFileName);
      downloadJSON(securityData, securityDataFileName);
      downloadJSON(users, usersFileName);
      downloadJSON(ecommerceProductos, ecommerceProductsFileName);
      downloadJSON(ecommerceTags, ecommerceTagsFileName);
      downloadJSON(topics, topicsFileName);
    } catch (error) {
      this.#log.error({
        fileName: 'account.component',
        functionName: 'onBackup',
        param: error
      });
      this.#toast.danger();
    } finally {
      this.loading = false;
    }
  }

  onSignOut(): void {
    if (this.loading) {
      return;
    }

    this.#popup.open<boolean>(
      {
        component: PopupComponent,
        data: {
          title: this.#translate.get('ACCOUNT.SIGN_OUT_POPUP.TITLE'),
          msg: `${this.#translate.get('ACCOUNT.SIGN_OUT_POPUP.MSG')}: ${this.#auth.getEmail()}`
        }
      },
      async res => {
        if (res) {
          try {
            this.loading = true;
            if (this.currentUser && this.currentUser.topicSubscriptions && this.currentUser.topicSubscriptions.length > 0) {
              const promises: Array<Promise<void>> = [];
              this.currentUser.topicSubscriptions.forEach(_topicSubscription => {
                promises.push(this.#mobile.unsubscribeFromTopic(_topicSubscription));
              });

              await Promise.all(promises);
            }

            await this.#auth.signOut();
          } catch (error) {
            this.#log.error({
              fileName: 'account.component',
              functionName: 'openUserLotPopup',
              param: error
            });
            this.#toast.danger();
            this.#router.reload(true);
          } finally {
            this.loading = false;
          }
        }
      }
    );
  }
}
