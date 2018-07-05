import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { Observable } from 'rxjs/Observable';

import { FormsService } from '../services';

@Injectable()
export class FormsResolver implements Resolve<any> {
  constructor(
    private formsService: FormsService
  ) { }

  resolve(): Observable<any> {
    return Observable.of(this.formsService.get());
  }
}
