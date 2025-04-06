import { ChangeDetectionStrategy, Component, Inject, OnInit } from '@angular/core';
import { SharedModules } from '@app/shared';
import { BIZY_TAG_TYPE, BizyPopupService } from '@bizy/core';
import { IContactRating } from '@core/model';
@Component({
  selector: 'tero-rating-history-popup',
  templateUrl: 'rating-history-popup.html',
  styleUrls: ['rating-history-popup.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: SharedModules
})
export class RatingHistoryPopupComponent implements OnInit {
  rating: Array<IContactRating> = [];

  readonly BIZY_TAG_TYPE = BIZY_TAG_TYPE;

  constructor(@Inject(BizyPopupService) private popup: BizyPopupService) {}

  ngOnInit() {
    const data = this.popup.getData<{ rating: Array<IContactRating> }>();

    if (!data.rating || data.rating.length === 0) {
      this.popup.close();
      return;
    }

    this.rating = data.rating;
  }
}
