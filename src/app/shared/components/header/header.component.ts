import { Component, OnInit, OnDestroy, ChangeDetectorRef, Input } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd, NavigationExtras } from '@angular/router';
import { LocationStrategy } from '@angular/common';
import { AuthService } from '../../../auth/services/auth.service';
import { AppService } from '../../../shared/app.service';
// import { UserService, DashboardService, ApplicationService } from '../../../qualivis/services';

import {
  APP_LOGO,
  CONTACT_INFO,
  AGENCY,
  EXISTING_AGENCY_INFO,
  FORMS,
  UPLOAD_DOCS,
  REVIEW,
  CHANGE_USERNAME,
  CHANGE_PASSWORD,
  ADMIN_DASHBORAD,
  APPLICATIONS,
  COMPANY,
  THANKS,
  APPLICATION_RESET,
  ADMIN_USERS
} from '../../../shared/constants';
import { findRouteURL } from '../../../shared/utils/index';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  @Input() role: any;
  @Input() userName: any;

  public appLogo = APP_LOGO;
  public routes = {
    'user': CHANGE_USERNAME.URL,
    'password': CHANGE_PASSWORD.URL,
    'applicationReset': APPLICATION_RESET.URL,
    'adminUsers': ADMIN_USERS.URL
  };
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private appService: AppService,
    private authService: AuthService
  ) { }

  ngOnInit() { }

  logout() {
    this.appService.loader('start');
    this.authService
      .logOut()
      .subscribe((res) => {
        this.appService.loader('stop');
      },
      (err) => {
        this.appService.loader('stop');
      });
  }

  redirectTo(path = ''): void {
    if (!path) {
      path = this.role !== 'user' ? ADMIN_DASHBORAD.URL : EXISTING_AGENCY_INFO.URL;
    }
    const { id } = this.route.snapshot.queryParams;
    const navigationExtras: NavigationExtras = {
      queryParams: { 'id': id }
    };
    this.router.navigate([path]);
  }
}
