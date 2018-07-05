import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { of } from 'rxjs/observable/of';

import { AuthService } from '../../auth/services/auth.service';

@Injectable()
export class LoggedUserRoleResolver implements Resolve<any> {
  constructor(
    private authService: AuthService
  ) { }

  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    return of({ role: this.authService.isAdmin() ? 'admin' : 'user' });
  }
}
