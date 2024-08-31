import { Component, Inject, OnInit } from '@angular/core';
import { BizyLogService, BizyRouterService } from '@bizy/services';
import { AuthService } from '@core/auth/auth.service';
import { ROOT_PATHS } from '@core/constants';
import { DatabaseService, MobileService, UserSettingsService } from '@core/services';
import { ENV } from '@env/environment';
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
    @Inject(DatabaseService) private database: DatabaseService,
    @Inject(UserSettingsService) private userSettingsService: UserSettingsService,
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
          if (ENV.mobile) {
            this.router.goTo({ path: `/${PATH.HOME}` });
          }
          await this.userSettingsService.postUserSettings();
        }
      });
    } catch (error) {
      this.log.error({
        fileName: 'app.component',
        functionName: 'ngOnInit',
        param: error
      });
    }
  }
}
