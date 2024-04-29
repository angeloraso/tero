import { Component, Inject, OnInit } from '@angular/core';
import { BizyRouterService } from '@bizy/services';
import { AuthService } from '@core/auth/auth.service';
import { ROOT_PATHS } from '@core/constants';
import { DatabaseService, MobileService } from '@core/services';
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
    @Inject(DatabaseService) private database: DatabaseService,
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

      this.auth.signedIn$.subscribe(signedIn => {
        if (!signedIn) {
          this.database.destroy();
          this.router.goTo({ path: `/${PATH.AUTH}` });
        } else {
          this.router.goTo({ path: `/${PATH.HOME}` });
        }
      });
    } catch (error) {
      console.error(error);
    }
  }
}
