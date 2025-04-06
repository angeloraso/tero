import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class HomeService {
  #tabs = signal(true);

  tabs = this.#tabs.asReadonly();

  showTabs() {
    this.#tabs.set(true);
  }

  hideTabs() {
    this.#tabs.set(false);
  }
}
