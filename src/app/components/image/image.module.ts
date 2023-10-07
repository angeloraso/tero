import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ImageComponent } from './image.component';

@NgModule({
  imports: [CommonModule],
  declarations: [ImageComponent],
  exports: [ImageComponent]
})
export class ImageModule {}
