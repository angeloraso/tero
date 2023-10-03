import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'tero-confirm-alert',
  templateUrl: 'confirm-alert.html',
  styleUrls: ['confirm-alert.css']
})
export class ConfirmAlertComponent {
  _title: string = '';
  _msg: string = '';

  constructor(
    @Inject(MatDialogRef) private dialog: MatDialogRef<ConfirmAlertComponent>,
    @Inject(MAT_DIALOG_DATA) private data: { title: string; msg: string }
  ) {
    if (this.data && this.data.title) {
      this._title = this.data.title;
    }

    if (this.data && this.data.msg) {
      this._msg = this.data.msg;
    }
  }

  cancel() {
    this.dialog.close(false);
  }

  confirm() {
    this.dialog.close(true);
  }
}
