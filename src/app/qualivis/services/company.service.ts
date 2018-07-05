import { Injectable, EventEmitter } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';

import { APIUrls } from '../../shared/constants';
import { ApplicationService } from './application.service';

@Injectable()
export class CompanyService {
  store = new EventEmitter<any>();
  private data: any;
  constructor(
    private http: HttpClient,
    private applicationService: ApplicationService
  ) {
    this.applicationService.store.subscribe(
      res => {
        const { company } = res;
        if (!!company) {
          this.store.next(company); // Update all Company Service subscriber
        }
      }
    );
  }

  get(isForcedDispatch = false) {
    const company = this.applicationService.get('company', isForcedDispatch);

    return !!company && this.filterData(company);
  }

  save(data) {
    return this.applicationService
      .save('company', data)
      .map(
        res => {
          this.applicationService.set('company', data); // Update application data
          return res;
        }
      );
  }

  filterData(company) {
    const {
      address,
      employeeNumber,
      glInsurance,
      plInsurance,
      wcInsurance,
      eoInsurance,
      jointCommission,
      name,
      socialMedia,
      taxId,
      website
    } = company;

    return {
      address,
      employeeNumber,
      glInsurance: { ...glInsurance, ...this.parseDateFields(glInsurance)},
      plInsurance: { ...plInsurance, ...this.parseDateFields(plInsurance)},
      wcInsurance: { ...wcInsurance, ...this.parseDateFields(wcInsurance)},
      eoInsurance: { ...eoInsurance, ...this.parseDateFields(eoInsurance)},
      jointCommission : { ...jointCommission, ...this.parseDateFields(jointCommission)},
      name,
      socialMedia,
      taxId,
      website
    };
  }

  parseDateFields(fields: any) {
    const { expirationDate, effectiveDate } = fields;
    return {
      expirationDate: expirationDate ? new Date(expirationDate) : null,
      effectiveDate: effectiveDate ? new Date(effectiveDate) : null
    };
  }
}
