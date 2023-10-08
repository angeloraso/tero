import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable()
export class HomeService {
  #title = new BehaviorSubject<string>('');
  #deleteFn = new BehaviorSubject<{ (): void } | null>(null);
  #hideBottomBar = new BehaviorSubject<boolean>(false);

  get title(): Observable<string> {
    return this.#title.asObservable();
  }

  get deleteFn(): Observable<{ (): void } | null> {
    return this.#deleteFn.asObservable();
  }

  get bottomBar(): Observable<boolean> {
    return this.#hideBottomBar.asObservable();
  }

  updateTitle(title: string) {
    setTimeout(() => {
      this.#title.next(title);
    });
  }

  setDeleteFn(fn: { (): void } | null) {
    this.#deleteFn.next(fn);
  }

  delete() {
    if (!this.#deleteFn.value) {
      return;
    }

    this.#deleteFn.value();
  }

  hideBottomBar(value: boolean) {
    this.#hideBottomBar.next(value);
  }
}
