import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BizyModule } from './bizy.module';
import { ComponentsModule } from './components/components.module';

@NgModule({
  exports: [CommonModule, FormsModule, ReactiveFormsModule, ComponentsModule, BizyModule]
})
export class SharedModule {}
