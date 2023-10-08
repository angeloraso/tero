import { Component, Inject, OnInit } from '@angular/core';
import { ROOT_PATHS } from '@core/constants';
import { MobileService, PopupService, RouterService } from '@core/services';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class AppComponent implements OnInit {
  constructor(
    @Inject(MobileService) private mobile: MobileService,
    @Inject(RouterService) private router: RouterService,
    @Inject(PopupService) private popup: PopupService
  ) {}

  async ngOnInit() {
    try {
      await this.mobile.init();

      if (this.mobile.isMobile()) {
        this.mobile.backButton$.subscribe(() => {
          if (this.popup.thereAreOpenedPopups()) {
            this.popup.closeLast();
          } else if (ROOT_PATHS.includes(this.router.getURL())) {
            this.mobile.exit();
          } else {
            this.router.goBack();
          }
        });

        this.mobile.hideSplash();
      }
    } catch (error) {
      console.error(error);
    }
  }
}
