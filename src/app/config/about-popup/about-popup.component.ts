import { AfterViewInit, ChangeDetectorRef, Component, Inject } from '@angular/core';
import { BizyLogService, BizyPopupService, BizyUserAgentService } from '@bizy/services';
import pkg from '../../../../package.json';

@Component({
  selector: 'caquen-about-popup',
  templateUrl: 'about-popup.html',
  styleUrls: ['about-popup.css']
})
export class AboutPopupComponent implements AfterViewInit {
  readonly DESCRIPTION: string = pkg.description;
  readonly VERSION: string = pkg.version;
  USER_AGENT: string = '';
  loading: boolean = true;

  constructor(
    @Inject(BizyUserAgentService) public userAgent: BizyUserAgentService,
    @Inject(BizyLogService) private log: BizyLogService,
    @Inject(ChangeDetectorRef) private ref: ChangeDetectorRef,
    @Inject(BizyPopupService) private popup: BizyPopupService
  ) {}

  async ngAfterViewInit() {
    try {
      this.loading = true;
      this.USER_AGENT = await this.userAgent.get();
    } catch (error) {
      this.log.error({
        fileName: 'about-popup.component',
        functionName: 'ngOnInit',
        param: error
      });
    } finally {
      this.loading = false;
      this.ref.detectChanges();
    }
  }

  close() {
    this.popup.close();
  }
}
