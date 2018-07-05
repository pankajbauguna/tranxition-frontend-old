import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';
import { Observable } from 'rxjs/Observable';

import { DashboardService } from '../services/dashboard.service';

@Injectable()
export class ApplicationsResolver implements Resolve<any> {
  constructor(
    private dashboardService: DashboardService
  ) { }

  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const { queryParams: { status } } = route;
    return this.dashboardService.fetchApplications({ status: status ? status : 'all' });
  }
}
