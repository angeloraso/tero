import { Component, Inject, OnInit } from '@angular/core';
import { BizyPopupService } from '@bizy/services';
@Component({
  selector: 'cauquen-popup',
  templateUrl: 'popup.html',
  styleUrls: ['popup.css']
})
export class PopupComponent implements OnInit {
  title: string = '';
  msg: string = '';
  constructor(@Inject(BizyPopupService) private popup: BizyPopupService) {}

  ngOnInit() {
    const data = this.popup.getData<{ title: string; msg: string }>();
    this.title = data.title;
    this.msg = data.msg;
  }

  close() {
    this.popup.close();
  }

  apply() {
    this.popup.close({ response: true });
  }
}
