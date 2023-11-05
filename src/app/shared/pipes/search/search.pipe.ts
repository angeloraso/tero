import { Pipe, PipeTransform } from '@angular/core';
import Fuse from 'fuse.js';
import { FuseOptions, IFuseOptions } from './search.model';
@Pipe({
  name: 'teroSearch'
})
export class SearchPipe<T> implements PipeTransform {
  fuseOptions?: IFuseOptions;
  fuse?: Fuse<any>;
  elements?: Array<T>;

  transform(
    items: Array<T>,
    search: string,
    keys: Array<string>,
    options?: IFuseOptions
  ): Array<T> {
    if (!search || search.length === 0) {
      return items;
    }

    this.fuseOptions = new FuseOptions(options!, keys);
    this.fuse = new Fuse(items, this.fuseOptions);

    const fuseResult = this.fuse.search(search);
    // Get each fuse result item
    return fuseResult.map(match => match.item as T);
  }
}
