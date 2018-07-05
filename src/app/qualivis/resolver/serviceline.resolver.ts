import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { Observable } from 'rxjs/Observable';

import { ServiceLineService } from '../services/serviceline.service';

@Injectable()
export class ServiceLineResolver implements Resolve<any> {
  constructor(
    private serviceLineService: ServiceLineService
  ) { }

  resolve(): Observable<any> {
    return this.serviceLineService.fetch();
  }
}
