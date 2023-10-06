import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { PATH as APP_PATH } from '@app/app.routing';
import { MENU_OPTIONS, MENU_OPTION_ID } from '@core/constants';
import { RouterService } from '@core/services';
import { PATH as HOME_PATH } from '@home/home.routing';
import { IMenuOption } from '@menu/model';
import { PATH as SIDE_MENU_PATH } from '@menu/side-menu.routing';
import { SideMenuService } from '@menu/side-menu.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'home',
  templateUrl: './home.html',
  styleUrls: ['./home.css']
})
export class HomeComponent implements OnInit, OnDestroy {
  private subscription = new Subscription();
  showBottomBar = true;
  sideMenuIsOpen: boolean = false;
  options: Array<IMenuOption> = [];
  selectedIndex: number = 0;

  paths = new Map<MENU_OPTION_ID, string>([
    [MENU_OPTION_ID.DASHBOARD, HOME_PATH.DASHBOARD],
    [MENU_OPTION_ID.NEIGHBORHOOD, HOME_PATH.NEIGHBORHOOD]
  ]);

  constructor(
    @Inject(RouterService) private router: RouterService,
    @Inject(SideMenuService) private sideMenu: SideMenuService
  ) {}

  ngOnInit() {
    this.options = MENU_OPTIONS;

    this.selectedIndex = this.options.findIndex(
      _option => this.router.getURL().indexOf(this.paths.get(_option.id)!) !== -1
    );

    this.subscription.add(
      this.sideMenu.open$.subscribe(opened => {
        this.sideMenuIsOpen = opened;
      })
    );

    this.subscription.add(
      this.sideMenu.option$.subscribe(option => {
        this.selectedIndex = this.options.findIndex(_option => _option.id === option.id);
        this.goTo(option);
      })
    );
  }

  showOption(event: MatTabChangeEvent) {
    if (this.sideMenuIsOpen) {
      return;
    }

    this.selectedIndex = event.index;

    const option = this.options[event.index];

    this.goTo(option);
  }

  goTo(option: IMenuOption) {
    this.router.goTo({
      path: `/${APP_PATH.MENU}/${SIDE_MENU_PATH.HOME}/${HOME_PATH.TABS}/${this.paths.get(
        option.id
      )}`
    });
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
