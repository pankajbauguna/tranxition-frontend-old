import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { Observable } from 'rxjs/Observable';

import { SpecialityService } from '../services/speciality.service';

@Injectable()
export class SpecialityResolver implements Resolve<any> {
  constructor(
    private specialityService: SpecialityService
  ) { }

  resolve(): Observable<any> {
    return this.specialityService.fetch();
  }
}
