import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MENU_OPTIONS, MENU_OPTION_ID } from '@core/constants';
import { RouterService, ViewportService } from '@core/services';
import { PATH as HOME_PATH } from '@home/home.routing';
import { Observable, Subscription } from 'rxjs';
import { IMenuOption } from './model';
import { SideMenuService } from './side-menu.service';

@Component({
  selector: 'side-menu',
  templateUrl: './side-menu.html',
  styleUrls: ['./side-menu.css']
})
export class SideMenuComponent implements OnInit, OnDestroy {
  options: Array<IMenuOption> = [];
  private _subscription = new Subscription();
  opened$: Observable<boolean>;

  paths = new Map<MENU_OPTION_ID, string>([
    [MENU_OPTION_ID.DASHBOARD, HOME_PATH.DASHBOARD],
    [MENU_OPTION_ID.NEIGHBORHOOD, HOME_PATH.NEIGHBORHOOD],
    [MENU_OPTION_ID.MAP, HOME_PATH.NEIGHBORHOOD]
  ]);

  constructor(
    @Inject(SideMenuService) private sideMenu: SideMenuService,
    @Inject(RouterService) private router: RouterService,
    @Inject(ViewportService) private viewport: ViewportService
  ) {
    this.opened$ = this.sideMenu.open$;
    this._subscription.add(
      this.viewport.sizeChange$.subscribe(size => {
        this.sideMenu.setOpen(size.width >= 768);
      })
    );
  }

  ngOnInit() {
    this.options = MENU_OPTIONS;

    for (let i = 0; i < this.options.length; i++) {
      if (this.router.getURL().indexOf(this.paths.get(this.options[i].id)!) !== -1) {
        this.options[i].active = true;
        break;
      }
    }
  }

  showOption(option: IMenuOption) {
    this.options.forEach(option => {
      option.active = false;
    });
    option.active = true;

    this.sideMenu.setOption(option);
  }

  ngOnDestroy() {
    this._subscription.unsubscribe();
  }
}
