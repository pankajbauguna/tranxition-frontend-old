import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { Observable } from 'rxjs/Observable';

import { DashboardService } from '../services/dashboard.service';

@Injectable()
export class DashboardResolver implements Resolve<any> {
  constructor(
    private dashboardService: DashboardService
  ) { }

  resolve(): Observable<any> {
    return this.dashboardService.fetch();
  }
}
