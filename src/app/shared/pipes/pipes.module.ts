import { NgModule } from '@angular/core';
import { EpochToDatePipe } from './epochToDate.pipe';
import { OrderAlphabeticallyPipe } from './orderAlphabetically.pipe';
import { SearchPipe } from './search/search.pipe';

const PIPES = [EpochToDatePipe, SearchPipe, OrderAlphabeticallyPipe];
@NgModule({
  declarations: PIPES,
  exports: PIPES
})
export class PipesModule {}
