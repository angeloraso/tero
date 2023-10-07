import { Component, Inject } from '@angular/core';
import { HomeService } from '@home/home.service';

@Component({
  selector: 'tero-dashboard',
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class DashboardComponent {
  constructor(@Inject(HomeService) private home: HomeService) {
    this.home.updateTitle('DASHBOARD.TITLE');
  }
}
