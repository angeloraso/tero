import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable()
export class HomeService {
  #title = new BehaviorSubject<string>('');

  get title(): Observable<string> {
    return this.#title.asObservable();
  }

  updateTitle(title: string) {
    setTimeout(() => {
      this.#title.next(title);
    });
  }
}
