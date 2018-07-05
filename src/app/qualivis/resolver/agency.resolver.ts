import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { Observable } from 'rxjs/Observable';

import { AgencyService } from '../services';

@Injectable()
export class AgencyResolver implements Resolve<any> {
  constructor(
    private agencyService: AgencyService
  ) { }

  resolve(): Observable<any> {
    return Observable.of(this.agencyService.get(true));
  }
}
