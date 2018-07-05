import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { of } from 'rxjs/observable/of';

import { AuthService } from '../services/auth.service';
import { AppService } from '../../shared/app.service';

@Injectable()
export class VerificationResolver implements Resolve<any> {
  constructor(
    private authService: AuthService,
    private appService: AppService
  ) {
    this.appService.loader('start');
  }

  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const { params: { verificationKey }, url: [{ path }]} = route;
    const isEmail = path.indexOf('email') !== -1 ? true : false;
    const token = this.authService.getToken();
    this.appService.loader('start');
    return of({ verificationKey, isEmail, isLoggedIn: !!token });
  }
}
