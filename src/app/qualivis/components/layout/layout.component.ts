import { Component, OnInit, OnDestroy, AfterViewInit, ChangeDetectorRef, ElementRef } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd, NavigationExtras, NavigationCancel } from '@angular/router';
import { LocationStrategy } from '@angular/common';
import { AuthService } from '../../../auth/services/auth.service';
import { AppService } from '../../../shared/app.service';
import { UserService, ApplicationService, AgencyService } from '../../services';
import { ScrollToService, ScrollToConfigOptions, ScrollToOffsetMap } from '@nicky-lenaers/ngx-scroll-to';

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
  LOGGED_USER_INFO_ACTION,
  APPLICATION_DATA_ACTION,
  APPROVE_APPLICATION_ACTION
} from '../../../shared/constants';
import { parseUrl } from '../../../shared/utils/index';
import { StoreService } from '../../../shared/index';

@Component({
  selector: 'app-qualivis-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss']
})
export class LayoutComponent implements OnInit, OnDestroy, AfterViewInit {

  public pathName = '';
  public userName = '';
  public applicationParam = '';
  public appLogo = APP_LOGO;
  public filledForms = {};
  public agencyName = '';
  public role = '';
  public isExistingAgency: String = '';
  public routes = {
    'contact-info': CONTACT_INFO.URL,
    'background': AGENCY.URL,
    'demographics': COMPANY.URL,
    'info': EXISTING_AGENCY_INFO.URL,
    'forms': FORMS.URL,
    'upload-docs': UPLOAD_DOCS.URL,
    'review': REVIEW.URL,
    'change-username': CHANGE_USERNAME.URL,
    'change-password': CHANGE_PASSWORD.URL,
    'admin-dashboard': ADMIN_DASHBORAD.URL,
    'applications': APPLICATIONS.URL,
    'thanks': THANKS.URL
  };
  public showAdminNavigation = false;
  public storeSubscriber: any;
  public noApplicationDataFound = true;
  public routeSubscriber: any;
  public docsToReplace = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private location: LocationStrategy,
    private ref: ChangeDetectorRef,
    private authService: AuthService,
    private appService: AppService,
    private agencyService: AgencyService,
    private userService: UserService,
    private applicationService: ApplicationService,
    private storeService: StoreService,
    private _scrollToService: ScrollToService,
    private element: ElementRef
  ) { }

  ngOnInit() {
    this.appService.loader('stop');
    this.pathName = parseUrl(this.router.url);
    const userInfo = this.storeService.getState(LOGGED_USER_INFO_ACTION);
    if (!!userInfo) {
      this.setUserInfo(userInfo);
    }

    const applicationInfo = this.storeService.getState(APPLICATION_DATA_ACTION);
    if (applicationInfo) {
      this.setViewScope(applicationInfo);
    }

    // Activate tab on route change
    this.routeSubscriber = this.router.events
      .filter(event => event instanceof NavigationEnd || event instanceof NavigationCancel)
      .subscribe(
        evt => {
          const dynamicKey = 'urlAfterRedirects';
          const { [dynamicKey]: urlAfterRedirects } = evt;
          if (urlAfterRedirects) {
            const urlTree = this.router.parseUrl(urlAfterRedirects);
            const urlWithoutParams = '/' + urlTree.root.children['primary'].segments.map(it => it.path).join('/');
            this.pathName = urlWithoutParams;
            this.ref.detectChanges();
          }
          window.scrollTo(0, 0);
          this.appService.loader('stop');
        }
      );

    this.storeSubscriber = this.storeService.state.subscribe(
      action => {
        const { type, payload } = action;
        switch (type) {
          case LOGGED_USER_INFO_ACTION:
            if (payload) {
              this.setUserInfo(payload);
            }
            break;
          case APPLICATION_DATA_ACTION:
            if (Object.keys(payload).length > 0) {
              this.setViewScope(payload);
              this.noApplicationDataFound = false;
            }
            break;
          default:
            break;
        }
        this.ref.detectChanges();
      }
    );
  }

  ngAfterViewInit() {
    this.scrollPage();
  }

  ngOnDestroy() {
    this.ref.detach();
    this.storeSubscriber.unsubscribe();
    this.routeSubscriber.unsubscribe();
  }

  logOut() {
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

  getDocuSignUrl(): void {
    const applicationId  = this.route.snapshot.queryParams['id'];
    this.appService.loader('start');
    this.agencyService
      .getDocuSignUrl(applicationId)
      .subscribe((res: any) => {
        window.location.href = res.signingUrl;
      },
      (err) => {
        this.appService.loader('stop');
        this.appService.showToaster(true, err.message);
      });
  }

  redirectTo(path, idName): void {
    if (this.role === 'user') {
        // Get application info while admin review
        const { id } = this.route.snapshot.queryParams;
        const navigationExtras: NavigationExtras = {
          queryParams: { 'id': id }
        };
        this.router.navigate([path], id ? navigationExtras : {});
    } else {
      this.scrollPage(idName);
    }
  }

  checkIsReplaceDoc(doc) {
    return doc.isReplaced;
  }

  setErrorsOnTab(data) {
      let docsToReplace = false;
      for (const key in data.uploadDocs ) {
        if (Array.isArray(data.uploadDocs[key])) {
          if (data.uploadDocs[key].filter(this.checkIsReplaceDoc).length > 0) {
            docsToReplace = true;
            break;
          }
        }
      }
      this.docsToReplace = docsToReplace;
  }
  setViewScope(data) {
    const { filledForms, isExistingAgency } = data;
    this.filledForms = filledForms;
    this.agencyName = this.applicationService.getAgencyName();
    this.isExistingAgency = isExistingAgency;
    this.setErrorsOnTab(data);
    this.ref.detectChanges();
  }

  scrollPage(targetId = '') {
    if (this.pathName !== this.routes.review) {
      return;
    }
    const selectedForm = this.element.nativeElement.querySelector('.review section');
    const target = !targetId ? `#${selectedForm.id}` : targetId;
    const offset = -`${selectedForm.offsetTop}`;
    this._scrollToService.scrollTo({ target, offset });
  }

  setUserInfo(userInfo) {
    const { role, email } = userInfo;
    this.role = role;
    this.userName = email;
  }
}
