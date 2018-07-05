import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { of } from 'rxjs/observable/of';
import { _throw } from 'rxjs/observable/throw';

import { AuthService } from '../services/auth.service';

@Injectable()
export class ResetPasswordResolver implements Resolve<any> {
  constructor(
    private authService: AuthService
  ) { }

  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const { params: { passwordKey }, url: [{ path }] } = route;
    return this.authService.checkResetPasswordToken({ reset_password_key: passwordKey })
      .map((res) => {
        const errKey = 'err';
        const messageKey = 'message';
        const { [errKey]: err, [messageKey]: resMessage } = res;
        let message;
        if (err) {
          const { [messageKey]: errMessage } = err;
          message = errMessage;
        } else {
          message = resMessage;
        }
        return { isTokenValid: !!err ? false : true, reset_password_key: passwordKey, message: message };
      });
  }
}
