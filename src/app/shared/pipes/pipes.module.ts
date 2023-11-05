import { NgModule } from '@angular/core';
import { EpochToDatePipe } from './epochToDate.pipe';
import { SearchPipe } from './search/search.pipe';

const PIPES = [EpochToDatePipe, SearchPipe];
@NgModule({
  declarations: PIPES,
  exports: PIPES
})
export class PipesModule {}
