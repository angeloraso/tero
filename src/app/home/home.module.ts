import { NgModule } from '@angular/core';
import { SharedModule } from '@shared/shared.module';
import { HomeRoutingModule } from './home.routing';
import { HomeService } from './home.service';

@NgModule({
  imports: [SharedModule, HomeRoutingModule],
  declarations: HomeRoutingModule.COMPONENTS,
  providers: [HomeService]
})
export class HomeModule {}
