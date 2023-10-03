import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'tero-show-hide-password',
  templateUrl: './show-hide-password.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ShowHidePasswordComponent {
  @Input() show: boolean = false;
  @Output() showChange = new EventEmitter<boolean>();

  toggle(): void {
    this.show = !this.show;
    this.showChange.emit(this.show);
  }
}
