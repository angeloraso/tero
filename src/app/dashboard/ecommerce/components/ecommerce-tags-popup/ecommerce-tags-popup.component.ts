import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { SharedModules } from '@app/shared';
import { BizyFilterPipe, BizyLogService, BizyPopupService, BizyToastService } from '@bizy/core';
import { EcommerceService } from '@core/services';
@Component({
  selector: 'tero-ecommerce-tags-popup',
  templateUrl: 'ecommerce-tags-popup.html',
  styleUrls: ['ecommerce-tags-popup.css'],
  imports: SharedModules
})
export class EcommerceTagsPopupComponent implements OnInit {
  readonly #popup = inject(BizyPopupService);
  readonly #ecommerceService = inject(EcommerceService);
  readonly #ref = inject(ChangeDetectorRef);
  readonly #log = inject(BizyLogService);
  readonly #toast = inject(BizyToastService);
  readonly #filterPipe = inject(BizyFilterPipe);

  tags: Array<{ value: string; selected: boolean }> = [];
  loading: boolean = false;
  search: string | number = '';
  searchKeys = ['value'];
  order: 'asc' | 'desc' = 'asc';
  orderBy = 'value';
  activatedFilters: number = 0;
  selectedTags: number = 0;

  readonly MAX_LIMIT: number = 3;

  async ngOnInit() {
    try {
      this.loading = true;
      this.tags.length = 0;
      const tags = await this.#ecommerceService.getTags();
      tags.forEach(_tag => {
        this.tags.push({
          value: _tag,
          selected: false
        });
      });

      const data = this.#popup.getData<{ tags: Array<string> }>();
      if (data && data.tags) {
        this.tags.forEach(_tag => {
          _tag.selected = data.tags.includes(_tag.value);
        });
      }

      this.selectedTags = this.#filterPipe.transform(this.tags, 'selected', true).length;
    } catch (error) {
      this.#log.error({
        fileName: 'ecommerce-tags-popup.component',
        functionName: 'ngOnInit',
        param: error
      });
      this.#toast.danger();
    } finally {
      this.loading = false;
      this.#ref.detectChanges();
    }
  }

  checkFilters(activated: boolean) {
    if (activated) {
      this.activatedFilters++;
    } else if (this.activatedFilters > 0) {
      this.activatedFilters--;
    }
  }

  onSort() {
    this.order = this.order === 'asc' ? 'desc' : 'asc';
  }

  onRemoveFilters() {
    this.search = '';
    this.activatedFilters = 0;
    this.refresh();
  }

  refresh() {
    this.tags = [...this.tags];
  }

  selectTag(tag: { value: string; selected: boolean }) {
    tag.selected = !tag.selected;
    this.selectedTags = this.#filterPipe.transform(this.tags, 'selected', true).length;
    this.refresh();
  }

  apply() {
    if (this.selectedTags > this.MAX_LIMIT) {
      return;
    }

    this.#popup.close({ response: this.tags.filter(_tag => _tag.selected).map(_tag => _tag.value) });
  }

  close() {
    this.#popup.close();
  }
}
