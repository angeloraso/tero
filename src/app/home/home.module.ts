import { NgModule } from '@angular/core';
import { SharedModule } from '@shared/shared.module';
import { HomeRoutingModule } from './home.routing';

@NgModule({
  imports: [SharedModule, HomeRoutingModule],
  declarations: [HomeRoutingModule.COMPONENTS]
})
export class HomeModule {}
