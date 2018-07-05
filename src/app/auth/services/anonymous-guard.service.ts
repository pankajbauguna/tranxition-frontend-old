import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { map } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { AppService } from '../../shared/index';

@Injectable()
export class AnonymousGuardService implements CanActivate {
  constructor(
    private router: Router,
    private authService: AuthService,
    private appService: AppService
  ) { }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    this.appService.loader('start');

    return (
      this.authService
        .isLoggedIn()
        .pipe(
          map(hasSession => {
            this.appService.loader('stop');
            if (!hasSession) {
              return true;
            }
            //this.router.navigate([DASHBORAD.URL]);
            return false;
          })
        )
    );
  }
}
