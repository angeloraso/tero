import { inject, Injectable } from '@angular/core';
import { AuthService } from '@core/auth/auth.service';
import { ACCOUNT_MESSAGE_TAG, AccountMessage, ERROR, IAccountMessage } from '@core/model';
import { DatabaseService } from '@core/services';

@Injectable({ providedIn: 'root' })
export class AccountMessagesService {
  readonly #database = inject(DatabaseService);
  readonly #auth = inject(AuthService);

  getMessages = (): Promise<Array<IAccountMessage>> => {
    const accountEmail = this.#auth.getEmail();
    if (!accountEmail) {
      throw new Error(ERROR.AUTH_ERROR);
    }

    return this.#database.getAccountMessages(accountEmail);
  };

  postMessage = async (data: { title: string; body: string; emails: Array<string> }): Promise<void> => {
    const accountEmail = this.#auth.getEmail();
    if (!accountEmail) {
      throw new Error(ERROR.AUTH_ERROR);
    }

    if (!data || !data.title || !data.emails || data.emails.length === 0) {
      throw new Error(ERROR.REQUIRED_PROPERTIES);
    }

    const promises: Array<Promise<void>> = [];

    promises.push(
      this.#database.postAccountMessage({
        accountEmail,
        message: new AccountMessage({
          from: accountEmail,
          to: data.emails,
          read: true,
          archived: false,
          tag: ACCOUNT_MESSAGE_TAG.STANDARD,
          title: data.title,
          body: data.body || null
        })
      })
    );

    data.emails.forEach(_email => {
      promises.push(
        this.#database.postAccountMessage({
          accountEmail: _email,
          message: new AccountMessage({
            from: accountEmail,
            to: [_email],
            read: false,
            archived: false,
            tag: ACCOUNT_MESSAGE_TAG.STANDARD,
            title: data.title,
            body: data.body || null
          })
        })
      );
    });

    await Promise.all(promises);
  };

  putMessage = (message: IAccountMessage): Promise<void> => {
    const accountEmail = this.#auth.getEmail();
    if (!accountEmail) {
      throw new Error(ERROR.AUTH_ERROR);
    }

    return this.#database.putAccountMessage({
      accountEmail,
      message: {
        id: message.id,
        from: message.from,
        to: message.to,
        read: message.read,
        archived: message.archived,
        tag: message.tag,
        title: message.title,
        body: message.body,
        created: Number(message.created) || Date.now()
      }
    });
  };

  deleteMessage = (messageId: string): Promise<void> => {
    const accountEmail = this.#auth.getEmail();
    if (!accountEmail) {
      throw new Error(ERROR.AUTH_ERROR);
    }

    return this.#database.deleteAccountMessage({ accountEmail, id: messageId });
  };
}
