import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, NavigationExtras } from '@angular/router';

import { CONTACT_INFO, APIUrls } from '../../../../shared/constants';
import { AuthService } from '../../../../auth/services';
import { UserService, ApplicationService} from '../../../services';

@Component({
  selector: 'app-info',
  templateUrl: './info.component.html',
  styleUrls: ['./info.component.scss'],
})
export class InfoComponent implements OnInit {
  public downloadPath = APIUrls.DOWNLOAD_HOST;
  public role;
  public applicationStatus: any;
  public isReplaceDocument;
  public showActionBtn = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private applicationService: ApplicationService,
    private authService: AuthService
  ) { }

  ngOnInit() {
    this.route.data.subscribe(
      ({ userRole: { role } }) => {
        this.applicationStatus = this.applicationService.get('filledForms')['applicationStatus'];
        this.isReplaceDocument = this.applicationService.get('filledForms')['isReplaceDocument'];
        this.role = role;
      }
    );
    this.showActionBtn = this.role === 'user' && this.applicationStatus !== 'pending';
  }

  redirectTo(isNext) {
    this.router.navigate([CONTACT_INFO.URL]);
  }

  saveExit() {
    this.authService.logOut().subscribe();
  }
}
