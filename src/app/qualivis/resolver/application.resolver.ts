import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { Observable } from 'rxjs/Observable';

import { ApplicationService } from '../services/application.service';
import { ActivatedRouteSnapshot } from '@angular/router/src/router_state';

@Injectable()
export class ApplicationResolver implements Resolve<any> {
  constructor(
    private applicationService: ApplicationService
  ) { }

  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const { queryParams: { id } } = route;
    return this.applicationService.fetch(id);
  }
}
