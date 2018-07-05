import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd, NavigationExtras, NavigationCancel } from '@angular/router';

import { AppService } from '../../../shared/app.service';
import { DashboardService } from '../../services';
import { APPLICATIONS, ADMIN_DASHBORAD, APPLICATION_RESET, LOGGED_USER_INFO_ACTION, ADMIN_USERS } from '../../../shared/constants';
import { parseUrl } from '../../../shared/utils';
import { StoreService } from '../../../shared';

@Component({
  selector: 'app-admin-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss']
})
export class LayoutComponent implements OnInit, OnDestroy {

  public routes = {
    'dashboard': ADMIN_DASHBORAD.URL,
    'applications': APPLICATIONS.URL,
    'application-reset': APPLICATION_RESET.URL,
    'adminUsers': ADMIN_USERS.URL
  };
  public role: String;
  public userName: String;
  public pathName = '';
  public subscriber: any;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private appService: AppService,
    private dashboardService: DashboardService,
    private ref: ChangeDetectorRef,
    private storeService: StoreService
  ) { }

  ngOnInit() {
    this.appService.loader('stop');
    this.pathName = parseUrl(this.router.url);
    const userInfo = this.storeService.getState(LOGGED_USER_INFO_ACTION);
    if (!!userInfo) {
      this.setUserInfo(userInfo);
    }

    this.router.events
      .filter(event => event instanceof NavigationEnd || event instanceof NavigationCancel)
      .subscribe(
        evt => {
          const dynamicKey = 'urlAfterRedirects';
          const { [dynamicKey]: urlAfterRedirects } = evt;

          if (urlAfterRedirects) {
            const urlTree = this.router.parseUrl(urlAfterRedirects);
            this.pathName = '/' + urlTree.root.children.primary.segments.map(it => it.path).join('/');
          }
          this.appService.loader('stop');
        }
      );

    this.subscriber = this.dashboardService.state.subscribe(
      res => {
        if (!res) {
          return;
        }
        const key = LOGGED_USER_INFO_ACTION;
        const { [key]: user } = res;
        if (res && res[key]) {
          this.setUserInfo(user);
          this.ref.detectChanges();
        }
      }
    );
  }
  /**
   * @description
   * Call redirectTo util function to redirect page
   * @param {String} path Path to redirect
   */
  redirectTo(path): void {
    const { id } = this.route.snapshot.queryParams;
    const navigationExtras: NavigationExtras = {
      queryParams: { id }
    };
    this.router.navigate([path], navigationExtras);
  }

  /**
   * @description
   * Set initial user information
   * @param {Object} user User infoirmation
   */
  setUserInfo(user) {
    if (user) {
      const { role, email } = user;
      this.role = role;
      this.userName = email;
    }
  }

  ngOnDestroy() {
    this.ref.detach();
    this.subscriber.unsubscribe();
  }
}
