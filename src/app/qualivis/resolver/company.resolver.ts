import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';

import { CompanyService } from '../services';

@Injectable()
export class CompanyResolver implements Resolve<any> {
  constructor(
    private companyService: CompanyService
  ) { }

  resolve(): Observable<any> {
    return Observable.of(this.companyService.get(false));
  }
}
