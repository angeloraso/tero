import { Component, Input } from '@angular/core';

@Component({
  selector: 'tero-title',
  templateUrl: 'title.html',
  styleUrls: ['title.css']
})
export class TitleComponent {
  @Input() title: string = '';
}
