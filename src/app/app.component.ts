import { Component, OnInit, inject } from '@angular/core';
import { AuthService } from '@auth/auth.service';
import {
  BizyLogService,
  BizyPopupService,
  BizyRouterService,
  BizyToastService
} from '@bizy/services';
import { ROOT_PATHS } from '@core/constants';
import { ERROR } from '@core/model';
import { DatabaseService, MobileService, UsersService } from '@core/services';
import { PATH } from './app.routing';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class AppComponent implements OnInit {
  readonly #mobile = inject(MobileService);
  readonly #auth = inject(AuthService);
  readonly #log = inject(BizyLogService);
  readonly #toast = inject(BizyToastService);
  readonly #database = inject(DatabaseService);
  readonly #popup = inject(BizyPopupService);
  readonly #usersService = inject(UsersService);
  readonly #router = inject(BizyRouterService);

  async ngOnInit() {
    try {
      if (this.#mobile.isMobile()) {
        await this.#mobile.init();
        this.#mobile.backButton$.subscribe(() => {
          if (this.#popup.openedPopups() > 0) {
            this.#popup.closeAll();
          } else if (ROOT_PATHS.includes(this.#router.getURL())) {
            this.#mobile.exit();
          } else {
            this.#router.goBack();
          }
        });

        this.#mobile.hideSplash();
      }

      this.#auth.signedIn$.subscribe(async signedIn => {
        if (!signedIn) {
          this.#database.destroy();
          this.#router.goTo({ path: `/${PATH.AUTH}` });
        } else {
          try {
            await this.#usersService.getCurrentUser();
          } catch (error: any) {
            this.#log.error({
              fileName: 'app.component',
              functionName: 'getCurrentUser',
              param: error
            });

            if (error && error.message === ERROR.ITEM_NOT_FOUND) {
              await this.#usersService.postUser();
            } else {
              this.#toast.danger();
            }
          }

          if (this.#router.getURL() === `/${PATH.AUTH}`) {
            this.#router.goTo({ path: `/${PATH.HOME}` });
          }
        }
      });
    } catch (error: any) {
      this.#log.error({
        fileName: 'app.component',
        functionName: 'ngOnInit',
        param: error
      });
      this.#toast.danger();
    }
  }
}
