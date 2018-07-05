import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { map, filter } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { AppService } from '../../shared/index';
import { LOGIN, ADMIN_DASHBORAD, APPLICATIONS, CHANGE_PASSWORD, APPLICATION_RESET, ADMIN_USERS } from '../../shared/constants/index';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private router: Router,
    private authService: AuthService,
    private appService: AppService
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    this.appService.loader('start');
    const { queryParams: { id } } = route;
    const adminAccessDirectPage = [ADMIN_DASHBORAD.URL, APPLICATIONS.URL, CHANGE_PASSWORD.URL, APPLICATION_RESET.URL, ADMIN_USERS.URL];
    return (
      this.authService
        .isLoggedIn()
        .pipe(
          filter(hasSession => !!state.url),
          map(
            hasSession => {
              if (!hasSession) {
                this.router.navigate([LOGIN.URL]);
                this.appService.loader('stop');
                return false;
              }

              if (this.authService.isAdmin() && !id && adminAccessDirectPage.indexOf(state.url) === -1) {
                this.router.navigate([ADMIN_DASHBORAD.URL]);
                return false;
              }

              return true;
            }
          )
        )
    );
  }
}
