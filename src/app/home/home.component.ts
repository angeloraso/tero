import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { PATH as APP_PATH } from '@app/app.routing';
import { SharedModules } from '@app/shared';
import { AuthService } from '@auth/auth.service';
import {
  BizyLogService,
  BizyRouterService,
  BizySidebarComponent,
  BizySidebarOptionComponent,
  BizyStorageService,
  BizyTabComponent,
  BizyTabsComponent,
  BizyToastService
} from '@bizy/core';
import { LOGO_PATH } from '@core/constants';
import { PATH as HOME_PATH } from '@home/home.routing';
import pkg from 'package.json';
import { Subscription } from 'rxjs';
import { HomeService } from './home.service';

interface IOption {
  icon: string;
  label: string;
  path: string;
  selected: boolean;
}
@Component({
  selector: 'tero-home',
  templateUrl: './home.html',
  styleUrls: ['./home.css'],
  imports: [...SharedModules, BizySidebarComponent, BizySidebarOptionComponent, BizyTabsComponent, BizyTabComponent, RouterOutlet]
})
export class HomeComponent implements OnInit, OnDestroy {
  readonly #log = inject(BizyLogService);
  readonly #toast = inject(BizyToastService);
  readonly #router = inject(BizyRouterService);
  readonly #storage = inject(BizyStorageService);
  readonly #auth = inject(AuthService);
  readonly #home = inject(HomeService);

  showTabs = this.#home.tabs;
  loading: boolean = false;
  closedSidebar: boolean = false;
  profilePic: string = '';
  email: string = '';
  options: Array<IOption> = [
    {
      path: `/${APP_PATH.HOME}/${HOME_PATH.NEIGHBORS}`,
      label: 'CORE.MENU.NEIGHBORS',
      icon: 'fa-solid fa-users',
      selected: false
    },
    {
      path: `/${APP_PATH.HOME}/${HOME_PATH.NEIGHBORHOOD}`,
      label: 'CORE.MENU.NEIGHBORHOOD',
      icon: 'fa-solid fa-map',
      selected: false
    },
    {
      path: `/${APP_PATH.HOME}/${HOME_PATH.DASHBOARD}`,
      label: 'CORE.MENU.DASHBOARD',
      icon: 'fa-solid fa-table-columns',
      selected: false
    },
    {
      path: `/${APP_PATH.HOME}/${HOME_PATH.CONTACTS}`,
      label: 'CORE.MENU.CONTACTS',
      icon: 'fa-solid fa-address-book',
      selected: false
    },
    {
      path: `/${APP_PATH.HOME}/${HOME_PATH.CONFIG}`,
      label: 'CORE.MENU.CONFIG',
      icon: 'fa-solid fa-gears',
      selected: false
    }
  ];

  #subscription = new Subscription();
  readonly #CLOSED_SIDEBAR = 'CLOSED_SIDEBAR';
  readonly LOGO_PATH = LOGO_PATH;
  readonly DESCRIPTION: string = pkg.description;

  async ngOnInit() {
    try {
      this.loading = true;
      this.closedSidebar = this.#storage.get<boolean>(this.#CLOSED_SIDEBAR) ?? true;

      const email = this.#auth.getEmail();
      if (email) {
        this.email = email;
      }

      const option = this.#getURLOption(this.options, this.#router.getURL());
      if (option) {
        option.selected = true;
      }

      this.#subscription.add(
        this.#router.transitionsEnd$.subscribe(() => {
          const option = this.#getURLOption(this.options, this.#router.getURL());
          if (option) {
            option.selected = true;
            this.onSelect(option);
          }
        })
      );

      const profilePic = await this.#auth.getProfilePicture();
      if (profilePic) {
        this.profilePic = profilePic;
      }
    } catch (error) {
      this.#log.error({
        fileName: 'home.component',
        functionName: 'ngOnInit',
        param: error
      });
      this.#toast.danger();
    } finally {
      this.loading = false;
    }
  }

  onSelect(option: IOption) {
    if (!option) {
      return;
    }

    if (option.path) {
      this.goTo(option.path);
    }
  }

  onToggle() {
    this.#storage.set(this.#CLOSED_SIDEBAR, this.closedSidebar);
  }

  goTo(path: string) {
    this.#router.goTo({ path });
  }

  #getURLOption = (options: Array<IOption>, path: string): IOption | null => {
    let urlOption: IOption | null = null;
    options.forEach(_option => {
      if (_option && _option.path === path) {
        urlOption = _option;
        return;
      }
    });

    return urlOption;
  };

  ngOnDestroy() {
    this.#subscription.unsubscribe();
  }
}
