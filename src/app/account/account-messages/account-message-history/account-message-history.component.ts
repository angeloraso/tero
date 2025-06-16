import { PATH as ACCOUNT_MESSAGES_PATH } from '@account/account-messages/account-messages.routing';
import { PATH as ACCOUNT_PATH } from '@account/account.routing';
import { Component, ElementRef, inject, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PATH as APP_PATH } from '@app/app.routing';
import { SharedModules } from '@app/shared';
import { BIZY_SKELETON_SHAPE, BizyLogService, BizyPopupService, BizyRouterService, BizyToastService, BizyTranslateService } from '@bizy/core';
import { PopupComponent } from '@components/popup';
import { AuthService } from '@core/auth/auth.service';
import { IAccountMessage, IUser } from '@core/model';
import { AccountMessagesService, UsersService } from '@core/services';
import { PATH as HOME_PATH } from '@home/home.routing';
import { HomeService } from '@home/home.service';
import { es } from './i18n';

@Component({
  selector: 'tero-account-message-history',
  templateUrl: './account-message-history.html',
  styleUrls: ['./account-message-history.css'],
  imports: SharedModules
})
export class AccountMessageHistoryComponent implements OnInit {
  @ViewChild('messageList', { read: ElementRef }) list: ElementRef | null = null;
  readonly #accountMessagesService = inject(AccountMessagesService);
  readonly #router = inject(BizyRouterService);
  readonly #activatedRoute = inject(ActivatedRoute);
  readonly #toast = inject(BizyToastService);
  readonly #log = inject(BizyLogService);
  readonly #home = inject(HomeService);
  readonly #translate = inject(BizyTranslateService);
  readonly #popup = inject(BizyPopupService);
  readonly #auth = inject(AuthService);
  readonly #usersService = inject(UsersService);

  loading: boolean = false;
  accountEmail = this.#auth.getEmail()!;
  currentUser: IUser | null = null;
  otherUser: IUser | null = null;
  messages: Array<IAccountMessage> = [];

  readonly BIZY_SKELETON_SHAPE = BIZY_SKELETON_SHAPE;

  async ngOnInit() {
    try {
      this.loading = true;
      this.#translate.loadTranslations(es);
      this.#home.hideTabs();
      const email = this.#router.getQueryParam(this.#activatedRoute, 'email');
      if (!email) {
        this.goBack();
        return;
      }

      const [currentUser, user, messages] = await Promise.all([
        this.#usersService.getCurrentUser(),
        this.#usersService.getUser(email),
        this.#accountMessagesService.getMessages()
      ]);

      if (!currentUser || !user || messages.length === 0) {
        this.goBack();
        return;
      }

      this.currentUser = currentUser;
      this.otherUser = user;
      this.messages = messages.filter(
        _message =>
          _message.from === currentUser.email ||
          _message.from === user.email ||
          _message.to.includes(currentUser.email) ||
          _message.to.includes(user.email)
      );

      const promises: Array<Promise<void>> = [];
      messages.forEach(_message => {
        if (!_message.read) {
          promises.push(this.#accountMessagesService.putMessage({ ..._message, read: true }));
        }
      });

      await Promise.all(promises);
    } catch (error) {
      this.#log.error({
        fileName: 'account-message-history.component',
        functionName: 'ngOnInit',
        param: error
      });
      this.#toast.danger();
    } finally {
      this.loading = false;
      setTimeout(() => {
        if (this.list) {
          this.list.nativeElement.scrollTo({
            top: this.list.nativeElement.scrollHeight
          });
        }
      });
    }
  }

  addAccountMessage() {
    if (this.loading || !this.otherUser) {
      return;
    }

    this.#router.goTo({
      path: `/${APP_PATH.HOME}/${HOME_PATH.ACCOUNT}/${ACCOUNT_PATH.ACCOUNT_MESSAGES}/${ACCOUNT_MESSAGES_PATH.ADD}`,
      params: { user: JSON.stringify(this.otherUser) }
    });
  }

  deleteMessage = (message: IAccountMessage) => {
    if (this.loading || !message || !this.currentUser || !this.otherUser) {
      return;
    }

    this.#popup.open<boolean>(
      {
        component: PopupComponent,
        data: {
          title: this.#translate.get('ACCOUNT_MESSAGE_HISTORY.DELETE_POPUP.TITLE'),
          msg: `${this.#translate.get('ACCOUNT_MESSAGE_HISTORY.DELETE_POPUP.MSG')}: ${message.title}`
        }
      },
      async res => {
        try {
          if (res && message) {
            this.loading = true;
            await this.#accountMessagesService.deleteMessage(message.id);
            const index = this.messages.findIndex(_message => _message.id === message.id);
            if (index !== -1) {
              this.messages.splice(index, 1);
            }
          }
        } catch (error) {
          this.#log.error({
            fileName: 'account-message-history.component',
            functionName: 'deleteMessage',
            param: error
          });
          this.#toast.danger();
        } finally {
          this.loading = false;
        }
      }
    );
  };

  goBack() {
    this.#router.goBack({ path: `/${APP_PATH.HOME}/${HOME_PATH.ACCOUNT}/${ACCOUNT_PATH.ACCOUNT_MESSAGES}` });
  }
}
