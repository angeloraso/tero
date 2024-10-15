import { Component, Inject, OnInit } from '@angular/core';
import { BizyLogService, BizyRouterService, BizyToastService } from '@bizy/services';
import { AuthService } from '@core/auth/auth.service';
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
  constructor(
    @Inject(MobileService) private mobile: MobileService,
    @Inject(AuthService) private auth: AuthService,
    @Inject(BizyLogService) private log: BizyLogService,
    @Inject(BizyToastService) private toast: BizyToastService,
    @Inject(DatabaseService) private database: DatabaseService,
    @Inject(UsersService) private usersService: UsersService,
    @Inject(BizyRouterService) private router: BizyRouterService
  ) {}

  async ngOnInit() {
    try {
      if (this.mobile.isMobile()) {
        await this.mobile.init();
        this.mobile.backButton$.subscribe(() => {
          if (ROOT_PATHS.includes(this.router.getURL())) {
            this.mobile.exit();
          } else {
            this.router.goBack();
          }
        });

        this.mobile.hideSplash();
      }

      this.auth.signedIn$.subscribe(async signedIn => {
        if (!signedIn) {
          this.database.destroy();
          this.router.goTo({ path: `/${PATH.AUTH}` });
        } else {
          try {
            await this.usersService.getCurrentUser();
          } catch (error: any) {
            this.log.error({
              fileName: 'app.component',
              functionName: 'getCurrentUser',
              param: error
            });

            if (error && error.message === ERROR.ITEM_NOT_FOUND) {
              await this.usersService.postUser();
            } else {
              this.toast.danger();
            }
          }

          if (this.router.getURL() === `/${PATH.AUTH}`) {
            this.router.goTo({ path: `/${PATH.HOME}` });
          }
        }
      });
    } catch (error: any) {
      this.log.error({
        fileName: 'app.component',
        functionName: 'ngOnInit',
        param: error
      });
      this.toast.danger();
    }
  }
}
