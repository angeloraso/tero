import { NgModule } from '@angular/core';
import { SharedModule } from '@shared/shared.module';
import { SideMenuRoutingModule } from './side-menu.routing';
@NgModule({
  imports: [SharedModule, SideMenuRoutingModule],
  declarations: [SideMenuRoutingModule.COMPONENTS]
})
export class SideMenuModule {}
