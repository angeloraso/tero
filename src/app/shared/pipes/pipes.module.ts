import { NgModule } from '@angular/core';
import { EpochToDatePipe } from './epochToDate.pipe';

const PIPES = [EpochToDatePipe];
@NgModule({
  declarations: PIPES,
  exports: PIPES
})
export class PipesModule {}
