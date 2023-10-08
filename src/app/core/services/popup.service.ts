import { Injectable } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Injectable()
export class PopupService {
  #popups = new Set<MatDialogRef<unknown>>();

  add(popup: MatDialogRef<unknown>): void {
    this.#popups.add(popup);
  }

  delete(popup: MatDialogRef<unknown>): void {
    this.#popups.delete(popup);
  }

  thereAreOpenedPopups(): boolean {
    return this.#popups.size > 0;
  }

  closeAll(): void {
    const popups = Array.from(this.#popups);
    popups.forEach(_popup => {
      _popup.close();
    });
    this.#popups.clear();
  }

  closeLast() {
    if (this.#popups.size === 0) {
      return;
    }

    const popups = Array.from(this.#popups);

    popups[popups.length - 1].close();
    this.#popups.delete(popups[popups.length - 1]);
  }
}
